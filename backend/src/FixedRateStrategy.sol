// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IStrategy} from './IStrategy.sol';

contract FixedRateStrategy is IStrategy {
    // simple mock: 5% APR in ray (1e27) terms
    uint256 public constant APR_BPS = 500; // 5% annual rate (basis points)

    mapping(address => uint256) public totalSharesByAsset;
    mapping(address => uint256) public totalAssetsByAsset;

    function deposit(address asset, uint256 amount) external returns (uint256 sharesMinted) {
        require(amount > 0, 'zero amount');
        // 1:1 shares for simplicity
        totalAssetsByAsset[asset] += amount;
        totalSharesByAsset[asset] += amount;
        return amount;
    }

    function withdraw(address asset, uint256 shares) external returns (uint256 amountOut) {
        require(shares > 0, 'zero shares');
        require(totalSharesByAsset[asset] >= shares, 'insufficient shares');
        totalSharesByAsset[asset] -= shares;
        totalAssetsByAsset[asset] -= shares;
        return shares;
    }

    function previewYield(uint256 shares, uint256 startTs, uint256 endTs) external pure returns (uint256) {
        require(endTs >= startTs, 'bad period');
        uint256 dt = endTs - startTs; // seconds
        // APR to per-second in bps: shares * APR_BPS/10000 * (dt / secondsPerYear)
        uint256 secondsPerYear = 365 days;
        return (shares * APR_BPS * dt) / (10000 * secondsPerYear);
    }
}
