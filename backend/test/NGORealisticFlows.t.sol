// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NGORegistry} from "../src/NGORegistry.sol";
import {MorphImpactStaking} from "../src/MorphImpactStaking.sol";
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

contract NGORealisticFlowsTest is Test {
    NGORegistry registry;
    MockYieldVault vault;
    MorphImpactStaking staking;
    MockERC20 usdc;
    MockERC20 weth;

    address admin = address(this);
    address verifier = address(0xA11CE);
    address ngo1 = address(0xBEEF);
    address ngo2 = address(0xCAFE);
    address user1 = address(0x1111);
    address user2 = address(0x2222);

    string[] causes;

    function setUp() public {
        registry = new NGORegistry();
        vault = new MockYieldVault(admin);
        staking = new MorphImpactStaking(admin, address(registry), address(vault));
        usdc = new MockERC20("MockUSDC", "mUSDC");
        weth = new MockERC20("MockWETH", "mWETH");

        // Roles
        registry.grantRole(registry.VERIFIER_ROLE(), verifier);

        // Setup causes
        causes = new string[](2);
        causes[0] = "Education";
        causes[1] = "Healthcare";

        // NGOs self-register
        vm.startPrank(ngo1);
        registry.registerNGO("NGO One", "Desc 1", "https://ngo1.org", "ipfs://logo1", ngo1, causes, "ipfs://meta1");
        vm.stopPrank();
        vm.startPrank(ngo2);
        registry.registerNGO("NGO Two", "Desc 2", "https://ngo2.org", "ipfs://logo2", ngo2, causes, "ipfs://meta2");
        vm.stopPrank();

        // Verify via verifier role
        vm.prank(verifier);
        registry.verifyNGO(ngo1);
        vm.prank(verifier);
        registry.verifyNGO(ngo2);

        // Vault and staking token setup
        vault.addSupportedToken(address(usdc), 1000); // 10% APY
        vault.addSupportedToken(address(weth), 800);  // 8% APY
        staking.setTokenWhitelist(address(usdc), true);
        staking.setTokenWhitelist(address(weth), true);
        staking.addSupportedToken(address(usdc));
        staking.addSupportedToken(address(weth));

        // Fund users and vault for yield
        usdc.mint(user1, 100_000 ether);
        weth.mint(user2, 5_000 ether);
        usdc.mint(address(vault), 1_000_000 ether);
        weth.mint(address(vault), 50_000 ether);
    }

    function test_RoleRestrictions() public {
        // Non-verifier cannot verify
        vm.expectRevert();
        registry.verifyNGO(address(0xDEAD));

        // Cannot verify twice
        vm.prank(verifier);
        vm.expectRevert();
        registry.verifyNGO(ngo1);
    }

    function test_RegistryPauseBlocksStakeAndUnstake() public {
        // Pause registry and attempt stake should revert due to updateStakerCount hook
        registry.pause();
        vm.startPrank(user1);
        usdc.approve(address(staking), 1000 ether);
        vm.expectRevert();
        staking.stake(ngo1, address(usdc), 1000 ether, 180 days, 7500);
        vm.stopPrank();

        // Unpause and stake works
        registry.unpause();
        vm.startPrank(user1);
        staking.stake(ngo1, address(usdc), 1000 ether, 180 days, 7500);
        vm.stopPrank();

        // Pause registry again blocks unstake due to hook on decrement
        registry.pause();
        vm.warp(block.timestamp + 181 days);
        vm.prank(user1);
        vm.expectRevert();
        staking.unstake(ngo1, address(usdc), 0);

        // Unpause and unstake succeeds
        registry.unpause();
        vm.prank(user1);
        staking.unstake(ngo1, address(usdc), 0);
    }

    function test_UpdateNGOInfo_FlagDeviation_ReputationUpdate_DoesNotBreakStaking() public {
        // User1 stakes to NGO1 (75% to NGO)
        vm.startPrank(user1);
        usdc.approve(address(staking), 10_000 ether);
        staking.stake(ngo1, address(usdc), 5_000 ether, 365 days, 7500);
        vm.stopPrank();

        // Update NGO info by NGO owner
        string[] memory newCauses = new string[](1);
        newCauses[0] = "Climate";
        vm.prank(ngo1);
        registry.updateNGOInfo(ngo1, "NGO One Updated", "New Desc", "https://ngo1-new.org", "ipfs://logo1-new", newCauses, "ipfs://meta1-new");

        // Verifier flags cause deviation and updates reputation
        vm.prank(verifier);
        registry.flagCauseDeviation(ngo1, "Off-track on declared cause");
        vm.prank(verifier);
        registry.updateReputationScore(ngo1, 85);

        // Claim yield after some time and verify NGO received funds
        uint256 ngoBefore = usdc.balanceOf(ngo1);
        uint256 userBefore = usdc.balanceOf(user1);
        vm.warp(block.timestamp + 45 days);
        vm.prank(user1);
        staking.claimYield(ngo1, address(usdc));
        assertGt(usdc.balanceOf(ngo1), ngoBefore);
        assertGt(usdc.balanceOf(user1), userBefore);

        // Unstake after lock
        vm.warp(block.timestamp + 320 days);
        uint256 userBeforeUnstake = usdc.balanceOf(user1);
        vm.prank(user1);
        staking.unstake(ngo1, address(usdc), 0);
        assertGe(usdc.balanceOf(user1), userBeforeUnstake + 5_000 ether);
    }

    function test_MultiToken_MultiUser_MultiNGO_EndToEnd() public {
        // User1 stakes USDC to NGO1 (50%) and NGO2 (100%)
        vm.startPrank(user1);
        usdc.approve(address(staking), 60_000 ether);
        staking.stake(ngo1, address(usdc), 20_000 ether, 180 days, 5000);
        staking.stake(ngo2, address(usdc), 10_000 ether, 365 days, 10000);
        vm.stopPrank();

        // User2 stakes WETH to NGO2 (75%)
        vm.startPrank(user2);
        weth.approve(address(staking), 5_000 ether);
        staking.stake(ngo2, address(weth), 3_000 ether, 365 days, 7500);
        vm.stopPrank();

        // After 30 days, claim some yields
        vm.warp(block.timestamp + 30 days);
        uint256 ngo1Before = usdc.balanceOf(ngo1);
        uint256 ngo2BeforeUSDC = usdc.balanceOf(ngo2);
        uint256 ngo2BeforeWETH = weth.balanceOf(ngo2);

        vm.prank(user1);
        staking.claimYield(ngo1, address(usdc));
        vm.prank(user1);
        staking.claimYield(ngo2, address(usdc));
        vm.prank(user2);
        staking.claimYield(ngo2, address(weth));

        assertGt(usdc.balanceOf(ngo1), ngo1Before);
        assertGt(usdc.balanceOf(ngo2), ngo2BeforeUSDC);
        assertGt(weth.balanceOf(ngo2), ngo2BeforeWETH);

        // Advance and perform unlocks
        vm.warp(block.timestamp + 180 days);
        vm.prank(user1);
        staking.unstake(ngo1, address(usdc), 0); // 180d lock completed

        // NGO2 positions still locked until 365 days
        vm.startPrank(user1);
        vm.expectRevert(MorphImpactStaking.StakeStillLocked.selector);
        staking.unstake(ngo2, address(usdc), 0);
        vm.stopPrank();

        // Finish 365 days and unstake both remaining positions
        vm.warp(block.timestamp + 190 days);
        vm.prank(user1);
        staking.unstake(ngo2, address(usdc), 0);
        vm.prank(user2);
        staking.unstake(ngo2, address(weth), 0);

        // Registry introspection
        address[] memory verified = registry.getNGOsByVerification(true);
        assertEq(verified.length, 2);
    }
}
