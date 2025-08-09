// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract MockYieldVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct DepositInfo {
        uint256 amount;
        uint256 depositTime;
        uint256 lastYieldClaim;
    }

    mapping(address => mapping(address => DepositInfo)) public deposits;
    mapping(address => uint256) public totalDeposits;
    mapping(address => uint256) public mockAPY; // basis points

    address[] public supportedTokens;
    mapping(address => bool) public isSupportedToken;

    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant BASIS_POINTS = 10000;

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event YieldClaimed(address indexed user, address indexed token, uint256 yield);
    event TokenSupportAdded(address indexed token, uint256 apy);
    event APYUpdated(address indexed token, uint256 newAPY);

    constructor(address _owner) Ownable(_owner) {}

    function addSupportedToken(address _token, uint256 _apy) external onlyOwner {
        require(!isSupportedToken[_token], "already supported");
        require(_token != address(0), "zero token");
        isSupportedToken[_token] = true;
        mockAPY[_token] = _apy;
        supportedTokens.push(_token);
        emit TokenSupportAdded(_token, _apy);
    }

    function updateAPY(address _token, uint256 _newAPY) external onlyOwner {
        require(isSupportedToken[_token], "unsupported");
        mockAPY[_token] = _newAPY;
        emit APYUpdated(_token, _newAPY);
    }

    function deposit(address _token, uint256 _amount) external nonReentrant {
        require(isSupportedToken[_token], "unsupported");
        require(_amount > 0, "zero amount");
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        DepositInfo storage info = deposits[msg.sender][_token];
        if (info.amount == 0) {
            info.depositTime = block.timestamp;
            info.lastYieldClaim = block.timestamp;
        }
        info.amount += _amount;
        totalDeposits[_token] += _amount;
        emit Deposit(msg.sender, _token, _amount);
    }

    function withdraw(address _token, uint256 _amount) external nonReentrant {
        require(isSupportedToken[_token], "unsupported");
        require(_amount > 0, "zero amount");
        DepositInfo storage info = deposits[msg.sender][_token];
        require(info.amount >= _amount, "insufficient");
        // attempt yield claim first
        _claimYieldInternal(msg.sender, _token);
        info.amount -= _amount;
        totalDeposits[_token] -= _amount;
        if (info.amount == 0) {
            info.depositTime = 0;
            info.lastYieldClaim = 0;
        }
        IERC20(_token).safeTransfer(msg.sender, _amount);
        emit Withdraw(msg.sender, _token, _amount);
    }

    function claimYield(address _token) external nonReentrant {
        _claimYieldInternal(msg.sender, _token);
    }

    function _claimYieldInternal(address _user, address _token) internal {
        require(isSupportedToken[_token], "unsupported");
        DepositInfo storage info = deposits[_user][_token];
        require(info.amount > 0, "no deposit");
        uint256 yieldAmount = calculateYield(_user, _token);
        if (yieldAmount == 0) return;
        info.lastYieldClaim = block.timestamp;
        // simulate yield by transferring from owner balance (requires pre-funded)
        IERC20(_token).safeTransfer(_user, yieldAmount);
        emit YieldClaimed(_user, _token, yieldAmount);
    }

    function calculateYield(address _user, address _token) public view returns (uint256) {
        if (!isSupportedToken[_token]) return 0;
        DepositInfo memory info = deposits[_user][_token];
        if (info.amount == 0) return 0;
        uint256 timeElapsed = block.timestamp - info.lastYieldClaim;
        if (timeElapsed == 0) return 0;
        uint256 yearlyYield = (info.amount * mockAPY[_token]) / BASIS_POINTS;
        return (yearlyYield * timeElapsed) / SECONDS_PER_YEAR;
    }

    function getSupportedTokens() external view returns (address[] memory) { return supportedTokens; }
    function getAPY(address _token) external view returns (uint256) { return isSupportedToken[_token] ? mockAPY[_token] : 0; }
    function getTotalDeposits(address _token) external view returns (uint256) { return totalDeposits[_token]; }
}
