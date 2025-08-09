// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DonationVault} from "../src/DonationVault.sol";
import {NGORegistry} from "../src/NGORegistry.sol";
import {IStrategy} from "../src/IStrategy.sol";
import {FixedRateStrategy} from "../src/FixedRateStrategy.sol";

contract DonationVaultTest is Test {
    DonationVault vault;
    NGORegistry registry;
    FixedRateStrategy strategy;

    function setUp() public {
        registry = new NGORegistry();
        strategy = new FixedRateStrategy();
        vault = new DonationVault(registry, IStrategy(address(strategy)));

        registry.createNGO("Test NGO", "ipfs://ngo", address(0xCAFE));
        registry.setApproval(0, true);
    }

    function testDepositAndMaturityFlows() public {
        DonationVault.DepositInput memory input = DonationVault.DepositInput({
            ngoId: 0,
            asset: address(0xEEE),
            amount: 100 ether,
            termMonths: 6,
            allocationBps: 10000
        });

        uint256 pid = vault.deposit(input);
        (address owner,, uint256 startTs, uint256 endTs, uint256 alloc,,,) = vault.position(pid);
        assertEq(owner, address(this));
        assertEq(alloc, 10000);
        assertGt(endTs, startTs);

        // Fast-forward to maturity
        vm.warp(endTs + 1);

        uint256 ngoAmount = vault.claimNGO(pid);
        assertGt(ngoAmount, 0);
        uint256 principal = vault.withdrawPrincipal(pid);
        assertEq(principal, input.amount);
    }
}
