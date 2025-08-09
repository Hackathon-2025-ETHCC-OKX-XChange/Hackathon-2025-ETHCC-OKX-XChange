// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "openzeppelin-contracts/contracts/utils/Pausable.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {NGORegistry} from "./NGORegistry.sol";
import {MockYieldVault} from "./MockYieldVault.sol";

contract MorphImpactStaking is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct StakeInfo {
        uint256 amount;
        uint256 lockUntil;
        uint256 yieldContributionRate; // bps: 5000/7500/10000
        uint256 totalYieldGenerated;
        uint256 totalYieldToNGO;
        bool isActive;
        uint256 stakeTime;
        uint256 lastYieldUpdate;
    }

    struct UserStake {
        mapping(address => mapping(address => StakeInfo)) stakes; // token => NGO => info
        mapping(address => address[]) stakedNGOs; // token => NGOs
        mapping(address => mapping(address => bool)) hasStake; // token => NGO => bool
    }

    NGORegistry public ngoRegistry;
    MockYieldVault public yieldVault;

    mapping(address => UserStake) internal userStakes;
    mapping(address => uint256) public totalStaked; // token => total staked
    mapping(address => mapping(address => uint256)) public totalStakedForNGO; // token => NGO => amount
    mapping(address => mapping(address => uint256)) public totalYieldToNGO; // token => NGO => yield

    uint256 public constant MIN_YIELD_CONTRIBUTION = 5000; // 50%
    uint256 public constant MAX_YIELD_CONTRIBUTION = 10000; // 100%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_LOCK_PERIOD = 180 days; // align with 6 months
    uint256 public constant MAX_LOCK_PERIOD = 730 days; // ~24 months

    address[] public supportedTokens;
    mapping(address => bool) public isSupportedToken;

    event Staked(address indexed user, address indexed ngo, address indexed token, uint256 amount, uint256 lockPeriod, uint256 yieldContributionRate);
    event Unstaked(address indexed user, address indexed ngo, address indexed token, uint256 amount, uint256 yieldToUser, uint256 yieldToNGO);
    event YieldDistributed(address indexed user, address indexed ngo, address indexed token, uint256 yieldToUser, uint256 yieldToNGO);
    event TokenSupportAdded(address indexed token);
    event TokenSupportRemoved(address indexed token);

    error UnsupportedToken();
    error InvalidNGO();
    error InvalidAmount();
    error InvalidLockPeriod();
    error InvalidYieldContribution();
    error StakeStillLocked();
    error NoActiveStake();
    error InsufficientBalance();
    error InvalidAddress();

    constructor(address _owner, address _ngoRegistry, address _yieldVault) Ownable(_owner) {
        if (_ngoRegistry == address(0) || _yieldVault == address(0)) revert InvalidAddress();
        ngoRegistry = NGORegistry(_ngoRegistry);
        yieldVault = MockYieldVault(_yieldVault);
    }

    function addSupportedToken(address _token) external onlyOwner {
        if (_token == address(0)) revert InvalidAddress();
        if (isSupportedToken[_token]) revert UnsupportedToken();
        isSupportedToken[_token] = true;
        supportedTokens.push(_token);
        emit TokenSupportAdded(_token);
    }

    function removeSupportedToken(address _token) external onlyOwner {
        if (!isSupportedToken[_token]) revert UnsupportedToken();
        isSupportedToken[_token] = false;
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == _token) {
                supportedTokens[i] = supportedTokens[supportedTokens.length - 1];
                supportedTokens.pop();
                break;
            }
        }
        emit TokenSupportRemoved(_token);
    }

    function stake(address _ngo, address _token, uint256 _amount, uint256 _lockPeriod, uint256 _yieldContributionRate) external nonReentrant whenNotPaused {
        if (!isSupportedToken[_token]) revert UnsupportedToken();
        if (!ngoRegistry.isVerifiedAndActive(_ngo)) revert InvalidNGO();
        if (_amount == 0) revert InvalidAmount();
        if (_lockPeriod < MIN_LOCK_PERIOD || _lockPeriod > MAX_LOCK_PERIOD) revert InvalidLockPeriod();
        if (_yieldContributionRate < MIN_YIELD_CONTRIBUTION || _yieldContributionRate > MAX_YIELD_CONTRIBUTION) revert InvalidYieldContribution();

        UserStake storage userStake = userStakes[msg.sender];
        StakeInfo storage stakeInfo = userStake.stakes[_token][_ngo];

        if (stakeInfo.isActive) {
            stakeInfo.amount += _amount;
            stakeInfo.lockUntil = block.timestamp + _lockPeriod;
        } else {
            stakeInfo.amount = _amount;
            stakeInfo.lockUntil = block.timestamp + _lockPeriod;
            stakeInfo.yieldContributionRate = _yieldContributionRate;
            stakeInfo.totalYieldGenerated = 0;
            stakeInfo.totalYieldToNGO = 0;
            stakeInfo.isActive = true;
            stakeInfo.stakeTime = block.timestamp;
            stakeInfo.lastYieldUpdate = block.timestamp;
            userStake.stakedNGOs[_token].push(_ngo);
            userStake.hasStake[_token][_ngo] = true;
            ngoRegistry.updateStakerCount(_ngo, true);
        }

        totalStaked[_token] += _amount;
        totalStakedForNGO[_token][_ngo] += _amount;

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(_token).approve(address(yieldVault), _amount);
        yieldVault.deposit(_token, _amount);

        emit Staked(msg.sender, _ngo, _token, _amount, _lockPeriod, _yieldContributionRate);
    }

    function unstake(address _ngo, address _token, uint256 _amount) external nonReentrant whenNotPaused {
        UserStake storage userStake = userStakes[msg.sender];
        StakeInfo storage stakeInfo = userStake.stakes[_token][_ngo];
        if (!stakeInfo.isActive) revert NoActiveStake();
        if (block.timestamp < stakeInfo.lockUntil) revert StakeStillLocked();

        uint256 unstakeAmount = _amount == 0 ? stakeInfo.amount : _amount;
        if (stakeInfo.amount < unstakeAmount) revert InsufficientBalance();

        (uint256 yieldToUser, uint256 yieldToNGO) = _calculateAndAccrueYield(msg.sender, _ngo, _token);

        yieldVault.claimYield(_token);
        yieldVault.withdraw(_token, unstakeAmount);

        stakeInfo.amount -= unstakeAmount;
        if (stakeInfo.amount == 0) {
            stakeInfo.isActive = false;
            _removeNGOFromUserList(msg.sender, _token, _ngo);
            ngoRegistry.updateStakerCount(_ngo, false);
        }
        totalStaked[_token] -= unstakeAmount;
        totalStakedForNGO[_token][_ngo] -= unstakeAmount;

        if (yieldToNGO > 0) {
            IERC20(_token).safeTransfer(_ngo, yieldToNGO);
            totalYieldToNGO[_token][_ngo] += yieldToNGO;
            ngoRegistry.updateYieldReceived(_ngo, yieldToNGO);
        }
        if (yieldToUser > 0) {
            IERC20(_token).safeTransfer(msg.sender, yieldToUser);
        }
        IERC20(_token).safeTransfer(msg.sender, unstakeAmount);

        emit Unstaked(msg.sender, _ngo, _token, unstakeAmount, yieldToUser, yieldToNGO);
    }

    function claimYield(address _ngo, address _token) external nonReentrant whenNotPaused {
        UserStake storage userStake = userStakes[msg.sender];
        StakeInfo storage stakeInfo = userStake.stakes[_token][_ngo];
        if (!stakeInfo.isActive) revert NoActiveStake();
        (uint256 yieldToUser, uint256 yieldToNGO) = _calculateAndAccrueYield(msg.sender, _ngo, _token);
        yieldVault.claimYield(_token);
        if (yieldToNGO > 0) {
            IERC20(_token).safeTransfer(_ngo, yieldToNGO);
            totalYieldToNGO[_token][_ngo] += yieldToNGO;
            ngoRegistry.updateYieldReceived(_ngo, yieldToNGO);
        }
        if (yieldToUser > 0) {
            IERC20(_token).safeTransfer(msg.sender, yieldToUser);
        }
        emit YieldDistributed(msg.sender, _ngo, _token, yieldToUser, yieldToNGO);
    }

    function _calculateAndAccrueYield(address _user, address _ngo, address _token) internal returns (uint256 yieldToUser, uint256 yieldToNGO) {
        StakeInfo storage stakeInfo = userStakes[_user].stakes[_token][_ngo];
        if (stakeInfo.amount == 0 || stakeInfo.lastYieldUpdate == 0) return (0, 0);
        uint256 timeElapsed = block.timestamp - stakeInfo.lastYieldUpdate;
        if (timeElapsed == 0) return (0, 0);
        uint256 apy = yieldVault.getAPY(_token);
        if (apy == 0) return (0, 0);
        uint256 yearlyYield = (stakeInfo.amount * apy) / BASIS_POINTS;
        uint256 yieldAmt = (yearlyYield * timeElapsed) / 365 days;
        yieldToNGO = (yieldAmt * stakeInfo.yieldContributionRate) / BASIS_POINTS;
        yieldToUser = yieldAmt - yieldToNGO;
        stakeInfo.totalYieldGenerated += yieldAmt;
        stakeInfo.totalYieldToNGO += yieldToNGO;
        stakeInfo.lastYieldUpdate = block.timestamp;
    }

    function getUserStake(address _user, address _ngo, address _token) external view returns (StakeInfo memory) {
        return userStakes[_user].stakes[_token][_ngo];
    }
    function getUserStakedNGOs(address _user, address _token) external view returns (address[] memory) { return userStakes[_user].stakedNGOs[_token]; }
    function getTotalStakedForNGO(address _ngo, address _token) external view returns (uint256) { return totalStakedForNGO[_token][_ngo]; }
    function getTotalYieldForNGO(address _ngo, address _token) external view returns (uint256) { return totalYieldToNGO[_token][_ngo]; }
    function getSupportedTokens() external view returns (address[] memory) { return supportedTokens; }

    function _removeNGOFromUserList(address _user, address _token, address _ngo) internal {
        address[] storage ngos = userStakes[_user].stakedNGOs[_token];
        for (uint256 i = 0; i < ngos.length; i++) {
            if (ngos[i] == _ngo) {
                ngos[i] = ngos[ngos.length - 1];
                ngos.pop();
                break;
            }
        }
        userStakes[_user].hasStake[_token][_ngo] = false;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
