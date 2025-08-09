// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "openzeppelin-contracts/contracts/utils/Pausable.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {NGORegistry} from "./NGORegistry.sol";
import {MorphImpactStaking} from "./MorphImpactStaking.sol";

contract YieldDistributor is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS = 10000;

    struct DistributionRound {
        uint256 roundNumber;
        uint256 totalYieldDistributed;
        uint256 distributionTime;
        uint256 stakersCount;
        mapping(address => uint256) yieldPerToken;
        mapping(address => mapping(address => uint256)) yieldPerNGO; // token => ngo => amount
    }

    struct UserYieldInfo {
        uint256 lastClaimRound;
        mapping(address => uint256) unclaimedYield; // token => amount
    }

    NGORegistry public ngoRegistry;
    MorphImpactStaking public stakingContract;

    mapping(address => UserYieldInfo) public userYieldInfo;
    mapping(uint256 => DistributionRound) public distributionRounds;
    mapping(address => bool) public authorizedDistributors;

    uint256 public currentRound;
    uint256 public distributionInterval = 7 days;
    uint256 public lastDistributionTime;
    uint256 public minDistributionAmount = 0.001 ether;

    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    event DistributionInitiated(uint256 indexed round, uint256 timestamp, address indexed distributor);
    event YieldDistributed(address indexed token, address indexed ngo, uint256 amount, uint256 indexed round);
    event UserYieldClaimed(address indexed user, address indexed token, uint256 amount, uint256 indexed round);
    event DistributionIntervalUpdated(uint256 newInterval);
    event MinDistributionAmountUpdated(uint256 newAmount);
    event AuthorizedDistributorUpdated(address indexed distributor, bool authorized);
    event TokenSupportUpdated(address indexed token, bool supported);

    error InvalidAddress();
    error InvalidAmount();
    error DistributionTooFrequent();
    error NoYieldToDistribute();
    error UnauthorizedDistributor();
    error InvalidInterval();
    error TokenNotSupported();
    error RoundNotCompleted();
    error NoUnclaimedYield();

    constructor(address _owner, address _ngoRegistry, address _stakingContract) Ownable(_owner) {
        if (_ngoRegistry == address(0) || _stakingContract == address(0)) revert InvalidAddress();
        ngoRegistry = NGORegistry(_ngoRegistry);
        stakingContract = MorphImpactStaking(_stakingContract);
        authorizedDistributors[msg.sender] = true;
        lastDistributionTime = block.timestamp;
    }

    function setAuthorizedDistributor(address _distributor, bool _authorized) external onlyOwner {
        if (_distributor == address(0)) revert InvalidAddress();
        authorizedDistributors[_distributor] = _authorized;
        emit AuthorizedDistributorUpdated(_distributor, _authorized);
    }

    function setDistributionInterval(uint256 _newInterval) external onlyOwner {
        if (_newInterval < 1 hours) revert InvalidInterval();
        distributionInterval = _newInterval;
        emit DistributionIntervalUpdated(_newInterval);
    }

    function setMinDistributionAmount(uint256 _newAmount) external onlyOwner {
        minDistributionAmount = _newAmount;
        emit MinDistributionAmountUpdated(_newAmount);
    }

    function setTokenSupport(address _token, bool _supported) external onlyOwner {
        if (_token == address(0)) revert InvalidAddress();
        supportedTokens[_token] = _supported;
        if (_supported) {
            bool exists;
            for (uint256 i = 0; i < tokenList.length; i++) if (tokenList[i] == _token) { exists = true; break; }
            if (!exists) tokenList.push(_token);
        } else {
            for (uint256 i = 0; i < tokenList.length; i++) if (tokenList[i] == _token) { tokenList[i] = tokenList[tokenList.length - 1]; tokenList.pop(); break; }
        }
        emit TokenSupportUpdated(_token, _supported);
    }

    function initiateDistribution() external nonReentrant whenNotPaused {
        if (!authorizedDistributors[msg.sender] && block.timestamp < lastDistributionTime + distributionInterval) revert DistributionTooFrequent();
        currentRound++;
        DistributionRound storage round = distributionRounds[currentRound];
        round.roundNumber = currentRound;
        round.distributionTime = block.timestamp;

        uint256 totalYieldThisRound;
        uint256 activeStakers;
        for (uint256 i = 0; i < tokenList.length; i++) {
            address token = tokenList[i];
            if (!supportedTokens[token]) continue;
            uint256 tokenYield = _distributeTokenYield(token, round);
            round.yieldPerToken[token] = tokenYield;
            totalYieldThisRound += tokenYield;
            if (tokenYield > 0) activeStakers++;
        }
        round.totalYieldDistributed = totalYieldThisRound;
        round.stakersCount = activeStakers;
        lastDistributionTime = block.timestamp;
        emit DistributionInitiated(currentRound, block.timestamp, msg.sender);
    }

    function _distributeTokenYield(address _token, DistributionRound storage _round) internal returns (uint256) {
        address[] memory verifiedNGOs = ngoRegistry.getNGOsByVerification(true);
        if (verifiedNGOs.length == 0) return 0;
        uint256 totalTokenYield;
        for (uint256 i = 0; i < verifiedNGOs.length; i++) {
            address ngo = verifiedNGOs[i];
            uint256 stakedForNGO = stakingContract.getTotalStakedForNGO(ngo, _token);
            if (stakedForNGO == 0) continue;
            uint256 ngoYield = _calculateNGOYield(_token, ngo, stakedForNGO);
            if (ngoYield < minDistributionAmount) continue;
            _round.yieldPerNGO[_token][ngo] = ngoYield;
            totalTokenYield += ngoYield;
            emit YieldDistributed(_token, ngo, ngoYield, currentRound);
        }
        return totalTokenYield;
    }

    function _calculateNGOYield(address _token, address _ngo, uint256 _stakedAmount) internal view returns (uint256) {
        uint256 totalStaked = stakingContract.totalStaked(_token);
        if (totalStaked == 0) return 0;
        uint256 apy = 500; // 5% mock
        uint256 timeElapsed = block.timestamp - lastDistributionTime;
        uint256 ngoShare = (_stakedAmount * BASIS_POINTS) / totalStaked;
        uint256 yieldPool = (totalStaked * apy * timeElapsed) / (BASIS_POINTS * 365 days);
        return (yieldPool * ngoShare) / BASIS_POINTS;
    }

    function claimUserYield(address _token) external nonReentrant whenNotPaused {
        if (!supportedTokens[_token]) revert TokenNotSupported();
        UserYieldInfo storage userInfo = userYieldInfo[msg.sender];
        uint256 unclaimedAmount = userInfo.unclaimedYield[_token];
        if (unclaimedAmount == 0) revert NoUnclaimedYield();
        userInfo.unclaimedYield[_token] = 0;
        userInfo.lastClaimRound = currentRound;
        IERC20(_token).safeTransfer(msg.sender, unclaimedAmount);
        emit UserYieldClaimed(msg.sender, _token, unclaimedAmount, currentRound);
    }

    function getDistributionStatus() external view returns (bool canDistribute, uint256 timeUntilNextDistribution, uint256 totalSupportedTokens) {
        canDistribute = block.timestamp >= lastDistributionTime + distributionInterval;
        if (block.timestamp < lastDistributionTime + distributionInterval) timeUntilNextDistribution = (lastDistributionTime + distributionInterval) - block.timestamp; else timeUntilNextDistribution = 0;
        totalSupportedTokens = tokenList.length;
    }

    function getSupportedTokens() external view returns (address[] memory) { return tokenList; }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
