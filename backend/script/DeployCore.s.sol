// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";

import {NGORegistry} from "../src/NGORegistry.sol";
import {MockYieldVault} from "../src/MockYieldVault.sol";
import {MorphImpactStaking} from "../src/MorphImpactStaking.sol";
import {YieldDistributor} from "../src/YieldDistributor.sol";

/// Deploys core protocol contracts on the target network.
/// Usage:
///   PRIVATE_KEY=0x... forge script script/DeployCore.s.sol:DeployCore --rpc-url $RPC --broadcast -vv
contract DeployCore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        NGORegistry registry = new NGORegistry();
        MockYieldVault vault = new MockYieldVault(deployer);
        MorphImpactStaking staking = new MorphImpactStaking(deployer, address(registry), address(vault));
        YieldDistributor distributor = new YieldDistributor(deployer, address(registry), address(staking));

        // Optional: configure distributor supported tokens later via owner functions
        // Optional: whitelist and add supported tokens on staking; set APYs on vault
        // These can be performed in a follow-up configure script or via cast calls

        vm.stopBroadcast();

        console.log("Deployer:", deployer);
        console.log("NGORegistry:", address(registry));
        console.log("MockYieldVault:", address(vault));
        console.log("MorphImpactStaking:", address(staking));
        console.log("YieldDistributor:", address(distributor));
    }
}
