// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Mock USDC - USD Coin for testing
/// @notice Mock implementation of USDC with 6 decimals
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }

    /// @notice USDC has 6 decimals
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mint USDC for testing purposes
    /// @param to Address to mint to
    /// @param amount Amount to mint (in 6 decimal format)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}