// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Mock WETH - Wrapped ETH for testing
/// @notice Fully functional WETH implementation with deposit/withdraw capabilities
contract MockWETH is ERC20 {
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    constructor() ERC20("Wrapped Ether", "WETH") {}

    /// @notice Deposit ETH to get WETH
    function deposit() public payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw ETH by burning WETH
    /// @param wad Amount of WETH to withdraw
    function withdraw(uint256 wad) public {
        require(balanceOf(msg.sender) >= wad, "Insufficient WETH balance");
        _burn(msg.sender, wad);
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    /// @notice Mint WETH for testing purposes
    /// @param to Address to mint to
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Allow contract to receive ETH
    receive() external payable {
        deposit();
    }

    fallback() external payable {
        deposit();
    }
}