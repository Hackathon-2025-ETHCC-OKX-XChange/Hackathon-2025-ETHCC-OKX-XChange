// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockYieldVault} from "../src/MockYieldVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public immutable decimals = 18;
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    constructor(string memory _n, string memory _s) { name = _n; symbol = _s; }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "allowance");
        allowance[from][msg.sender] = allowed - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
}

contract MockYieldVaultTest is Test {
    MockYieldVault public vault;
    MockERC20 public token;

    address public owner = address(this);
    address public user1 = address(0x1111);
    address public user2 = address(0x2222);

    uint256 public constant INITIAL_BALANCE = 10000 * 10**18;
    uint256 public constant APY = 1000; // 10% APY

    function setUp() public {
        vault = new MockYieldVault(owner);
        token = new MockERC20("Test Token", "TEST");
        vault.addSupportedToken(address(token), APY);

        // Fund users and vault
        token.mint(user1, INITIAL_BALANCE);
        token.mint(user2, INITIAL_BALANCE);
        token.mint(address(vault), 100000 * 10**18); // Fund vault for yield payouts
    }

    function test_AddSupportedToken() public {
        MockERC20 newToken = new MockERC20("New Token", "NEW");

        vault.addSupportedToken(address(newToken), 2000);

        assertTrue(vault.isSupportedToken(address(newToken)));
        assertEq(vault.getAPY(address(newToken)), 2000);
    }

    function test_RevertIf_TokenAlreadySupported() public {
        vm.expectRevert("already supported");
        vault.addSupportedToken(address(token), APY);
    }

    function test_UpdateAPY() public {
        vault.updateAPY(address(token), 1500);
        assertEq(vault.getAPY(address(token)), 1500);
    }

    function test_RevertIf_UnsupportedTokenAPYUpdate() public {
        address unsupportedToken = address(0x9999);
        vm.expectRevert("unsupported");
        vault.updateAPY(unsupportedToken, 1500);
    }

    function test_Deposit() public {
        uint256 depositAmount = 1000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        vault.deposit(address(token), depositAmount);
        vm.stopPrank();

        (uint256 amount, uint256 depositTime, uint256 lastYieldClaim) =
            vault.deposits(user1, address(token));

        assertEq(amount, depositAmount);
        assertEq(depositTime, block.timestamp);
        assertEq(lastYieldClaim, block.timestamp);
        assertEq(vault.getTotalDeposits(address(token)), depositAmount);
    }

    function test_RevertIf_UnsupportedTokenDeposit() public {
        address unsupportedToken = address(0x9999);

        vm.startPrank(user1);
        vm.expectRevert("unsupported");
        vault.deposit(unsupportedToken, 1000 * 10**18);
        vm.stopPrank();
    }

    function test_RevertIf_ZeroAmountDeposit() public {
        vm.startPrank(user1);
        vm.expectRevert("zero amount");
        vault.deposit(address(token), 0);
        vm.stopPrank();
    }

    function test_Withdraw() public {
        uint256 depositAmount = 1000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        vault.deposit(address(token), depositAmount);

        uint256 withdrawAmount = 500 * 10**18;
        vault.withdraw(address(token), withdrawAmount);
        vm.stopPrank();

        (uint256 amount, ,) = vault.deposits(user1, address(token));
        assertEq(amount, depositAmount - withdrawAmount);
        assertEq(vault.getTotalDeposits(address(token)), depositAmount - withdrawAmount);
    }

    function test_RevertIf_InsufficientBalance() public {
        uint256 depositAmount = 1000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        vault.deposit(address(token), depositAmount);

        vm.expectRevert("insufficient");
        vault.withdraw(address(token), depositAmount + 1);
        vm.stopPrank();
    }

    function test_CalculateYield() public {
        uint256 depositAmount = 1000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        vault.deposit(address(token), depositAmount);

        // Advance time by 1 year
        vm.warp(block.timestamp + 365 days);

        uint256 yield = vault.calculateYield(user1, address(token));
        uint256 expectedYield = (depositAmount * APY) / 10000; // 10% of 1000 = 100

        assertApproxEqAbs(yield, expectedYield, 1);
        vm.stopPrank();
    }

    function test_ClaimYield() public {
        uint256 depositAmount = 1000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        vault.deposit(address(token), depositAmount);

        // Advance time by 6 months
        vm.warp(block.timestamp + 180 days);

        uint256 initialBalance = token.balanceOf(user1);
        vault.claimYield(address(token));

        uint256 finalBalance = token.balanceOf(user1);
        uint256 yieldEarned = finalBalance - initialBalance;

        uint256 expectedYield = (depositAmount * APY * 180 days) / (10000 * 365 days);
        assertApproxEqAbs(yieldEarned, expectedYield, 1);

        (uint256 amount, , uint256 lastYieldClaim) = vault.deposits(user1, address(token));
        assertEq(amount, depositAmount);
        assertEq(lastYieldClaim, block.timestamp);
        vm.stopPrank();
    }

    function test_RevertIf_NoDepositForYieldClaim() public {
        vm.startPrank(user1);
        vm.expectRevert("no deposit");
        vault.claimYield(address(token));
        vm.stopPrank();
    }

    function test_MultipleDeposits() public {
        uint256 deposit1 = 1000 * 10**18;
        uint256 deposit2 = 2000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), deposit1 + deposit2);

        vault.deposit(address(token), deposit1);

        vm.warp(block.timestamp + 30 days);
        vault.deposit(address(token), deposit2);

        vm.warp(block.timestamp + 30 days);

        uint256 yield = vault.calculateYield(user1, address(token));
        // Calculate yield for combined deposits: 3000 tokens for 30 days after second deposit
        uint256 expectedYield = ((deposit1 + deposit2) * APY * 30 days) / (10000 * 365 days);

        assertApproxEqAbs(yield, expectedYield, 1);
        vm.stopPrank();
    }

    function test_MultipleUsers() public {
        uint256 deposit1 = 1000 * 10**18;
        uint256 deposit2 = 2000 * 10**18;

        vm.startPrank(user1);
        token.approve(address(vault), deposit1);
        vault.deposit(address(token), deposit1);
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(vault), deposit2);
        vault.deposit(address(token), deposit2);
        vm.stopPrank();

        assertEq(vault.getTotalDeposits(address(token)), deposit1 + deposit2);

        vm.warp(block.timestamp + 365 days);

        uint256 yield1 = vault.calculateYield(user1, address(token));
        uint256 yield2 = vault.calculateYield(user2, address(token));

        uint256 expectedYield1 = (deposit1 * APY) / 10000;
        uint256 expectedYield2 = (deposit2 * APY) / 10000;

        assertApproxEqAbs(yield1, expectedYield1, 1);
        assertApproxEqAbs(yield2, expectedYield2, 1);
    }

    function test_GetSupportedTokens() public {
        address[] memory supportedTokens = vault.getSupportedTokens();
        assertEq(supportedTokens.length, 1);
        assertEq(supportedTokens[0], address(token));

        MockERC20 newToken = new MockERC20("New Token", "NEW");
        vault.addSupportedToken(address(newToken), 2000);

        supportedTokens = vault.getSupportedTokens();
        assertEq(supportedTokens.length, 2);
    }
}