// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NGORegistry} from "../src/NGORegistry.sol";
import {MorphImpactStaking} from "../src/MorphImpactStaking.sol";
import {MockYieldVault} from "../src/MockYieldVault.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public immutable decimals = 18;
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    constructor(string memory _n, string memory _s) { name = _n; symbol = _s; }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount; balanceOf[to] += amount; emit Transfer(msg.sender, to, amount); return true;
    }
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount; emit Approval(msg.sender, spender, amount); return true;
    }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender]; require(allowed >= amount, "allowance");
        allowance[from][msg.sender] = allowed - amount;
        balanceOf[from] -= amount; balanceOf[to] += amount; emit Transfer(from, to, amount); return true;
    }
    function mint(address to, uint256 amount) external { totalSupply += amount; balanceOf[to] += amount; emit Transfer(address(0), to, amount); }
}

contract MorphImpactStakingTest is Test {
    NGORegistry registry;
    MockYieldVault vault;
    MorphImpactStaking staking;
    MockERC20 mockUSDC;
    MockERC20 mockWETH;
    address ngo;

    function setUp() public {
        registry = new NGORegistry();
        vault = new MockYieldVault(address(this));
        staking = new MorphImpactStaking(address(this), address(registry), address(vault));
        mockUSDC = new MockERC20("MockUSDC", "mUSDC");
        mockWETH = new MockERC20("MockWETH", "mWETH");
        ngo = address(0xBEEF);

        // NGO setup
        string[] memory causes = new string[](1); causes[0] = "Education";
        registry.registerNGO("NGO", "desc", "https://site", "ipfs://logo", ngo, causes, "ipfs://meta");
        registry.verifyNGO(ngo);

        // Tokens whitelist & support only mUSDC, mWETH
        staking.setTokenWhitelist(address(mockUSDC), true);
        staking.setTokenWhitelist(address(mockWETH), true);
        staking.addSupportedToken(address(mockUSDC));
        staking.addSupportedToken(address(mockWETH));

        // Vault support tokens with APY
        vault.addSupportedToken(address(mockUSDC), 1000); // 10%
        vault.addSupportedToken(address(mockWETH), 800);  // 8%

        // Fund user and vault owner for simulated yields
        mockUSDC.mint(address(this), 1_000_000 ether);
        mockWETH.mint(address(this), 1_000 ether);
    }

    function testStakeClaimUnstake_USDC_100pctToNGO() public {
        uint256 amount = 1000 ether;
        mockUSDC.approve(address(staking), amount);
        staking.stake(ngo, address(mockUSDC), amount, 180 days, 10000);

        // advance 30 days
        vm.warp(block.timestamp + 30 days);
        staking.claimYield(ngo, address(mockUSDC));

        // advance to unlock and unstake
        vm.warp(block.timestamp + 180 days);
        staking.unstake(ngo, address(mockUSDC), 0);
    }

    function testStakeWith75pctToNGO_WETH() public {
        uint256 amount = 10 ether;
        mockWETH.approve(address(staking), amount);
        staking.stake(ngo, address(mockWETH), amount, 365 days, 7500);

        vm.warp(block.timestamp + 200 days);
        staking.claimYield(ngo, address(mockWETH));
        vm.warp(block.timestamp + 200 days);
        // may still be locked; advance to full year
        vm.warp(block.timestamp + 365 days);
        staking.unstake(ngo, address(mockWETH), 0);
    }

    function testRejectUnsupportedToken() public {
        MockERC20 other = new MockERC20("Other", "OTH");
        other.mint(address(this), 100 ether);
        vm.expectRevert();
        staking.stake(ngo, address(other), 1 ether, 180 days, 10000);
    }
}
