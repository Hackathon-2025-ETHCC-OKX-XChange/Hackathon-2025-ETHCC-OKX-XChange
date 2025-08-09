// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IStrategy {
    function deposit(address asset, uint256 amount) external returns (uint256 sharesMinted);
    function withdraw(address asset, uint256 shares) external returns (uint256 amountOut);
    function previewYield(uint256 shares, uint256 startTs, uint256 endTs) external view returns (uint256);
}
