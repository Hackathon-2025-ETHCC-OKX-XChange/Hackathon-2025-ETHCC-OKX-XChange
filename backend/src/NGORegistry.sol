// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract NGORegistry is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct NGO {
        string name;
        string description;
        string website;
        string logoURI;
        address walletAddress;
        bool isVerified;
        bool isActive;
        uint256 totalYieldReceived;
        uint256 activeStakers;
        string[] causes;
        uint256 reputationScore;
        uint256 registrationTime;
        string metadataHash;
    }

    struct CauseDeviation {
        bool isFlagged;
        string reason;
        uint256 timestamp;
        address reporter;
    }

    mapping(address => NGO) public ngos;
    mapping(address => CauseDeviation) public causeDeviations;
    mapping(address => bool) public hasRegistered;
    address[] public ngoAddresses;
    uint256 public totalNGOs;
    uint256 public minReputationScore = 70;
    uint256 public maxReputationScore = 100;

    event NGORegistered(address indexed ngoAddress, string name, string[] causes, uint256 registrationTime);
    event NGOVerified(address indexed ngoAddress, bool isVerified);
    event NGOUpdated(address indexed ngoAddress, string name, string[] causes);
    event CauseDeviationFlagged(address indexed ngoAddress, string reason, address reporter, uint256 timestamp);
    event ReputationScoreUpdated(address indexed ngoAddress, uint256 newScore, uint256 oldScore);

    error NGOAlreadyRegistered();
    error InvalidNGOAddress();
    error InvalidName();
    error InvalidWebsite();
    error EmptyCauses();
    error NGOAlreadyVerified();
    error NGONotRegistered();
    error InvalidReputationScore();
    error NotAuthorized();

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function registerNGO(
        string calldata _name,
        string calldata _description,
        string calldata _website,
        string calldata _logoURI,
        address _walletAddress,
        string[] calldata _causes,
        string calldata _metadataHash
    ) external whenNotPaused nonReentrant {
        if (hasRegistered[_walletAddress]) revert NGOAlreadyRegistered();
        if (_walletAddress == address(0)) revert InvalidNGOAddress();
        if (bytes(_name).length == 0) revert InvalidName();
        if (bytes(_website).length == 0) revert InvalidWebsite();
        if (_causes.length == 0) revert EmptyCauses();

        NGO storage newNGO = ngos[_walletAddress];
        newNGO.name = _name;
        newNGO.description = _description;
        newNGO.website = _website;
        newNGO.logoURI = _logoURI;
        newNGO.walletAddress = _walletAddress;
        newNGO.isVerified = false;
        newNGO.isActive = true;
        newNGO.totalYieldReceived = 0;
        newNGO.activeStakers = 0;
        newNGO.reputationScore = minReputationScore;
        newNGO.registrationTime = block.timestamp;
        newNGO.metadataHash = _metadataHash;
        for (uint256 i = 0; i < _causes.length; i++) {
            newNGO.causes.push(_causes[i]);
        }

        ngoAddresses.push(_walletAddress);
        hasRegistered[_walletAddress] = true;
        totalNGOs++;

        emit NGORegistered(_walletAddress, _name, _causes, block.timestamp);
    }

    function verifyNGO(address _ngoAddress) external onlyRole(VERIFIER_ROLE) {
        if (!hasRegistered[_ngoAddress]) revert NGONotRegistered();
        if (ngos[_ngoAddress].isVerified) revert NGOAlreadyVerified();
        ngos[_ngoAddress].isVerified = true;
        emit NGOVerified(_ngoAddress, true);
    }

    function updateNGOInfo(
        address _ngoAddress,
        string calldata _name,
        string calldata _description,
        string calldata _website,
        string calldata _logoURI,
        string[] calldata _causes,
        string calldata _metadataHash
    ) external whenNotPaused nonReentrant {
        if (!hasRegistered[_ngoAddress]) revert NGONotRegistered();
        if (msg.sender != _ngoAddress && !hasRole(ADMIN_ROLE, msg.sender)) revert NotAuthorized();
        if (bytes(_name).length == 0) revert InvalidName();
        if (bytes(_website).length == 0) revert InvalidWebsite();
        if (_causes.length == 0) revert EmptyCauses();

        NGO storage ngo = ngos[_ngoAddress];
        ngo.name = _name;
        ngo.description = _description;
        ngo.website = _website;
        ngo.logoURI = _logoURI;
        ngo.metadataHash = _metadataHash;
        delete ngo.causes;
        for (uint256 i = 0; i < _causes.length; i++) {
            ngo.causes.push(_causes[i]);
        }
        emit NGOUpdated(_ngoAddress, _name, _causes);
    }

    function flagCauseDeviation(address _ngoAddress, string calldata _reason) external onlyRole(VERIFIER_ROLE) {
        if (!hasRegistered[_ngoAddress]) revert NGONotRegistered();
        causeDeviations[_ngoAddress] = CauseDeviation({
            isFlagged: true,
            reason: _reason,
            timestamp: block.timestamp,
            reporter: msg.sender
        });
        emit CauseDeviationFlagged(_ngoAddress, _reason, msg.sender, block.timestamp);
    }

    function updateReputationScore(address _ngoAddress, uint256 _newScore) external onlyRole(VERIFIER_ROLE) {
        if (!hasRegistered[_ngoAddress]) revert NGONotRegistered();
        if (_newScore < minReputationScore || _newScore > maxReputationScore) revert InvalidReputationScore();
        NGO storage ngo = ngos[_ngoAddress];
        uint256 oldScore = ngo.reputationScore;
        ngo.reputationScore = _newScore;
        emit ReputationScoreUpdated(_ngoAddress, _newScore, oldScore);
    }

    function getNGO(address _ngoAddress) external view returns (NGO memory) { return ngos[_ngoAddress]; }
    function getAllNGOs() external view returns (address[] memory) { return ngoAddresses; }
    function getNGOsByVerification(bool _verified) external view returns (address[] memory) {
        uint256 count;
        for (uint256 i = 0; i < ngoAddresses.length; i++) if (ngos[ngoAddresses[i]].isVerified == _verified) count++;
        address[] memory filtered = new address[](count);
        uint256 idx;
        for (uint256 i = 0; i < ngoAddresses.length; i++) if (ngos[ngoAddresses[i]].isVerified == _verified) filtered[idx++] = ngoAddresses[i];
        return filtered;
    }
    function isVerifiedAndActive(address _ngoAddress) external view returns (bool) { return ngos[_ngoAddress].isVerified && ngos[_ngoAddress].isActive; }

    function updateStakerCount(address _ngoAddress, bool _increment) external whenNotPaused {
        if (!hasRegistered[_ngoAddress]) revert NGONotRegistered();
        if (_increment) ngos[_ngoAddress].activeStakers++; else if (ngos[_ngoAddress].activeStakers > 0) ngos[_ngoAddress].activeStakers--;
    }

    function updateYieldReceived(address _ngoAddress, uint256 _amount) external whenNotPaused {
        if (!hasRegistered[_ngoAddress]) revert NGONotRegistered();
        ngos[_ngoAddress].totalYieldReceived += _amount;
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
    function setMinReputationScore(uint256 _newMin) external onlyRole(ADMIN_ROLE) { minReputationScore = _newMin; }
    function setMaxReputationScore(uint256 _newMax) external onlyRole(ADMIN_ROLE) { maxReputationScore = _newMax; }
}
