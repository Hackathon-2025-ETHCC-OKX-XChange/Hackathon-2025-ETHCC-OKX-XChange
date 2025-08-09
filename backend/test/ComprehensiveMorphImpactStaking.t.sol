// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MorphImpactStaking} from "../src/MorphImpactStaking.sol";
import {NGORegistry} from "../src/NGORegistry.sol";
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

contract ComprehensiveMorphImpactStakingTest is Test {
    MorphImpactStaking public staking;
    NGORegistry public registry;
    MockYieldVault public vault;
    MockERC20 public token;

    address public owner = address(this);
    address public user1 = address(0x1111);
    address public user2 = address(0x2222);
    address public ngo1 = address(0x3333);
    address public ngo2 = address(0x4444);
    address public verifier = address(0x5555);

    string[] public causes = ["Education", "Healthcare"];
    uint256 public constant INITIAL_BALANCE = 10000 * 10**18;
    uint256 public constant STAKE_AMOUNT = 1000 * 10**18;
    uint256 public constant LOCK_PERIOD_180D = 180 days; // 6 months minimum
    uint256 public constant LOCK_PERIOD_365D = 365 days; // 12 months
    uint256 public constant LOCK_PERIOD_730D = 730 days; // 24 months maximum
    uint256 public constant YIELD_CONTRIBUTION_50 = 5000; // 50%
    uint256 public constant YIELD_CONTRIBUTION_75 = 7500; // 75%
    uint256 public constant YIELD_CONTRIBUTION_100 = 10000; // 100%

    function setUp() public {
        registry = new NGORegistry();
        vault = new MockYieldVault(owner);
        token = new MockERC20("Test Token", "TEST");
        staking = new MorphImpactStaking(owner, address(registry), address(vault));

        registry.grantRole(registry.VERIFIER_ROLE(), verifier);

        // Setup vault and staking
        vault.addSupportedToken(address(token), 1000); // 10% APY
        staking.setTokenWhitelist(address(token), true);
        staking.addSupportedToken(address(token));

        // Fund users and vault
        token.mint(user1, INITIAL_BALANCE);
        token.mint(user2, INITIAL_BALANCE);
        token.mint(address(vault), 100000 * 10**18); // Fund vault for yield payouts

        // Setup NGOs
        vm.startPrank(ngo1);
        registry.registerNGO(
            "NGO 1",
            "Description 1",
            "https://ngo1.org",
            "ipfs://logo1",
            ngo1,
            causes,
            "ipfs://metadata1"
        );
        vm.stopPrank();

        vm.startPrank(ngo2);
        registry.registerNGO(
            "NGO 2",
            "Description 2",
            "https://ngo2.org",
            "ipfs://logo2",
            ngo2,
            causes,
            "ipfs://metadata2"
        );
        vm.stopPrank();

        // Verify NGOs
        vm.prank(verifier);
        registry.verifyNGO(ngo1);

        vm.prank(verifier);
        registry.verifyNGO(ngo2);
    }

    function test_InitialSetup() public {
        assertTrue(staking.isSupportedToken(address(token)));
        assertTrue(registry.isVerifiedAndActive(ngo1));
        assertTrue(registry.isVerifiedAndActive(ngo2));
    }

    function test_BasicStake() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();

        // Verify stake was recorded
        assertEq(staking.totalStaked(address(token)), STAKE_AMOUNT);
        assertEq(staking.getTotalStakedForNGO(ngo1, address(token)), STAKE_AMOUNT);

        // Check stake details
        MorphImpactStaking.StakeInfo memory stakeInfo = staking.getUserStake(user1, ngo1, address(token));
        assertEq(stakeInfo.amount, STAKE_AMOUNT);
        assertEq(stakeInfo.lockUntil, block.timestamp + LOCK_PERIOD_180D);
        assertEq(stakeInfo.yieldContributionRate, YIELD_CONTRIBUTION_75);
        assertTrue(stakeInfo.isActive);
    }

    function test_RevertIf_UnsupportedToken() public {
        address unsupportedToken = address(0x9999);

        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.UnsupportedToken.selector);
        staking.stake(
            ngo1,
            unsupportedToken,
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();
    }

    function test_RevertIf_InvalidNGO() public {
        address invalidNGO = address(0x6666);

        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.InvalidNGO.selector);
        staking.stake(
            invalidNGO,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();
    }

    function test_RevertIf_InvalidAmount() public {
        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.InvalidAmount.selector);
        staking.stake(
            ngo1,
            address(token),
            0,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();
    }

    function test_RevertIf_InvalidLockPeriod() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        // Too short
        vm.expectRevert(MorphImpactStaking.InvalidLockPeriod.selector);
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            90 days, // Less than 180 days
            YIELD_CONTRIBUTION_75
        );

        // Too long
        vm.expectRevert(MorphImpactStaking.InvalidLockPeriod.selector);
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            800 days, // More than 730 days
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();
    }

    function test_RevertIf_InvalidYieldContribution() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        // Too low
        vm.expectRevert(MorphImpactStaking.InvalidYieldContribution.selector);
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            4000 // Less than 50%
        );

        // Too high
        vm.expectRevert(MorphImpactStaking.InvalidYieldContribution.selector);
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            11000 // More than 100%
        );
        vm.stopPrank();
    }

    function test_AddToExistingStake() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT * 2);

        // First stake
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );

        uint256 firstLockUntil = block.timestamp + LOCK_PERIOD_180D;

        // Advance time partially
        vm.warp(block.timestamp + 30 days);

        // Second stake to same NGO with longer lock period should extend lock
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_365D, // Longer than remaining time
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();

        MorphImpactStaking.StakeInfo memory stakeInfo = staking.getUserStake(user1, ngo1, address(token));
        assertEq(stakeInfo.amount, STAKE_AMOUNT * 2);
        // Lock should be extended to current time + LOCK_PERIOD_365D
        assertGt(stakeInfo.lockUntil, firstLockUntil);
        assertEq(stakeInfo.lockUntil, block.timestamp + LOCK_PERIOD_365D);
    }

    function test_RevertIf_AddToExistingStakeWithDifferentYieldRate() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT * 2);

        // First stake with 75% contribution
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );

        // Second stake with different contribution rate should fail
        vm.expectRevert(MorphImpactStaking.InvalidYieldContribution.selector);
        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_50 // Different rate
        );
        vm.stopPrank();
    }

    function test_StakeMultipleNGOs() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT * 2);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );

        staking.stake(
            ngo2,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_50
        );
        vm.stopPrank();

        assertEq(staking.totalStaked(address(token)), STAKE_AMOUNT * 2);
        assertEq(staking.getTotalStakedForNGO(ngo1, address(token)), STAKE_AMOUNT);
        assertEq(staking.getTotalStakedForNGO(ngo2, address(token)), STAKE_AMOUNT);
    }

    function test_YieldClaim_100PercentToNGO() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_100
        );
        vm.stopPrank();

        // Advance time to generate yield
        vm.warp(block.timestamp + 30 days);

        uint256 ngoBalanceBefore = token.balanceOf(ngo1);
        uint256 userBalanceBefore = token.balanceOf(user1);

        vm.prank(user1);
        staking.claimYield(ngo1, address(token));

        // With 100% contribution, all yield should go to NGO
        assertGt(token.balanceOf(ngo1), ngoBalanceBefore);
        assertEq(token.balanceOf(user1), userBalanceBefore); // User gets no yield
    }

    function test_YieldClaim_75PercentToNGO() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();

        // Advance time to generate yield
        vm.warp(block.timestamp + 30 days);

        uint256 ngoBalanceBefore = token.balanceOf(ngo1);
        uint256 userBalanceBefore = token.balanceOf(user1);

        vm.prank(user1);
        staking.claimYield(ngo1, address(token));

        // Both NGO and user should receive yield
        assertGt(token.balanceOf(ngo1), ngoBalanceBefore);
        assertGt(token.balanceOf(user1), userBalanceBefore);

        // NGO should get approximately 3x more than user (75% vs 25%)
        uint256 ngoYield = token.balanceOf(ngo1) - ngoBalanceBefore;
        uint256 userYield = token.balanceOf(user1) - userBalanceBefore;
        assertApproxEqAbs(ngoYield, userYield * 3, userYield / 10); // Allow 10% tolerance
    }

    function test_YieldClaim_50PercentToNGO() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_50
        );
        vm.stopPrank();

        // Advance time to generate yield
        vm.warp(block.timestamp + 30 days);

        uint256 ngoBalanceBefore = token.balanceOf(ngo1);
        uint256 userBalanceBefore = token.balanceOf(user1);

        vm.prank(user1);
        staking.claimYield(ngo1, address(token));

        // Both should receive approximately equal yield
        uint256 ngoYield = token.balanceOf(ngo1) - ngoBalanceBefore;
        uint256 userYield = token.balanceOf(user1) - userBalanceBefore;
        assertApproxEqAbs(ngoYield, userYield, userYield / 20); // Allow 5% tolerance
    }

    function test_Unstake_AfterLockPeriod() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();

        // Try to unstake before lock period - should fail
        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.StakeStillLocked.selector);
        staking.unstake(ngo1, address(token), 0);
        vm.stopPrank();

        // Advance past lock period
        vm.warp(block.timestamp + LOCK_PERIOD_180D + 1);

        uint256 initialBalance = token.balanceOf(user1);

        vm.prank(user1);
        staking.unstake(ngo1, address(token), 0);

        // User should get their principal back plus any remaining yield
        assertGe(token.balanceOf(user1), initialBalance + STAKE_AMOUNT);

        // Stake should be deactivated
        MorphImpactStaking.StakeInfo memory stakeInfo = staking.getUserStake(user1, ngo1, address(token));
        assertFalse(stakeInfo.isActive);
        assertEq(staking.totalStaked(address(token)), 0);
    }

    function test_PartialUnstake() public {
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);

        staking.stake(
            ngo1,
            address(token),
            STAKE_AMOUNT,
            LOCK_PERIOD_180D,
            YIELD_CONTRIBUTION_75
        );
        vm.stopPrank();

        // Advance past lock period
        vm.warp(block.timestamp + LOCK_PERIOD_180D + 1);

        uint256 partialAmount = STAKE_AMOUNT / 2;

        vm.prank(user1);
        staking.unstake(ngo1, address(token), partialAmount);

        // Should still have remaining stake
        MorphImpactStaking.StakeInfo memory stakeInfo = staking.getUserStake(user1, ngo1, address(token));
        assertEq(stakeInfo.amount, STAKE_AMOUNT - partialAmount);
        assertTrue(stakeInfo.isActive);
        assertEq(staking.totalStaked(address(token)), STAKE_AMOUNT - partialAmount);
    }

    function test_RevertIf_NoActiveStake() public {
        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.NoActiveStake.selector);
        staking.unstake(ngo1, address(token), STAKE_AMOUNT);
        vm.stopPrank();
    }

    function test_ComplexMultiUserMultiNGOScenario() public {
        // User1 stakes for NGO1 (long lock) and NGO2 (short lock)
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT * 2);
        staking.stake(ngo1, address(token), STAKE_AMOUNT, LOCK_PERIOD_730D, YIELD_CONTRIBUTION_100);
        staking.stake(ngo2, address(token), STAKE_AMOUNT, LOCK_PERIOD_180D, YIELD_CONTRIBUTION_50);
        vm.stopPrank();

        // User2 stakes for NGO1
        vm.startPrank(user2);
        token.approve(address(staking), STAKE_AMOUNT);
        staking.stake(ngo1, address(token), STAKE_AMOUNT, LOCK_PERIOD_365D, YIELD_CONTRIBUTION_75);
        vm.stopPrank();

        // Verify total stakes
        assertEq(staking.getTotalStakedForNGO(ngo1, address(token)), STAKE_AMOUNT * 2);
        assertEq(staking.getTotalStakedForNGO(ngo2, address(token)), STAKE_AMOUNT);
        assertEq(staking.totalStaked(address(token)), STAKE_AMOUNT * 3);

        // Advance and claim yields
        vm.warp(block.timestamp + 30 days);

        uint256 ngo1BalanceBefore = token.balanceOf(ngo1);
        uint256 ngo2BalanceBefore = token.balanceOf(ngo2);

        vm.prank(user1);
        staking.claimYield(ngo1, address(token));

        vm.prank(user1);
        staking.claimYield(ngo2, address(token));

        vm.prank(user2);
        staking.claimYield(ngo1, address(token));

        // Both NGOs should have received yields
        assertGt(token.balanceOf(ngo1), ngo1BalanceBefore);
        assertGt(token.balanceOf(ngo2), ngo2BalanceBefore);

        // User1 can unstake from NGO2 after 180 days
        vm.warp(block.timestamp + LOCK_PERIOD_180D);
        vm.prank(user1);
        staking.unstake(ngo2, address(token), 0);

        // But not from NGO1 yet (730 day lock)
        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.StakeStillLocked.selector);
        staking.unstake(ngo1, address(token), 0);
        vm.stopPrank();
    }

    function test_PauseUnpause() public {
        // Pause contract
        staking.pause();

        // Should not be able to stake when paused
        vm.startPrank(user1);
        token.approve(address(staking), STAKE_AMOUNT);
        vm.expectRevert();
        staking.stake(ngo1, address(token), STAKE_AMOUNT, LOCK_PERIOD_180D, YIELD_CONTRIBUTION_75);
        vm.stopPrank();

        // Unpause
        staking.unpause();

        // Should work after unpause
        vm.startPrank(user1);
        staking.stake(ngo1, address(token), STAKE_AMOUNT, LOCK_PERIOD_180D, YIELD_CONTRIBUTION_75);
        vm.stopPrank();
    }
}