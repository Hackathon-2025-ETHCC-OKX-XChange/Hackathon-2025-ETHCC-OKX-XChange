// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2 as console} from "forge-std/console2.sol";

import {NGORegistry} from "../src/NGORegistry.sol";
import {MockYieldVault} from "../src/MockYieldVault.sol";
import {MorphImpactStaking} from "../src/MorphImpactStaking.sol";
import {YieldDistributor} from "../src/YieldDistributor.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {MockWETH} from "../src/MockWETH.sol";

/// Deploys complete protocol with tokens, contracts, and sample NGOs on target network.
/// Usage:
///   PRIVATE_KEY=0x... forge script script/DeployCore.s.sol:DeployCore --rpc-url $RPC --broadcast --legacy -vv
contract DeployCore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Mock Tokens
        MockUSDC usdc = new MockUSDC();
        MockWETH weth = new MockWETH();
        console.log("MockUSDC deployed at:", address(usdc));
        console.log("MockWETH deployed at:", address(weth));

        // Deploy Core Contracts
        NGORegistry registry = new NGORegistry();
        MockYieldVault vault = new MockYieldVault(deployer);
        MorphImpactStaking staking = new MorphImpactStaking(deployer, address(registry), address(vault));
        YieldDistributor distributor = new YieldDistributor(deployer, address(registry), address(staking));

        console.log("Deployer:", deployer);
        console.log("NGORegistry:", address(registry));
        console.log("MockYieldVault:", address(vault));
        console.log("MorphImpactStaking:", address(staking));
        console.log("YieldDistributor:", address(distributor));

        // Configure Vault with tokens and APYs
        vault.addSupportedToken(address(usdc), 1000); // 10% APY
        vault.addSupportedToken(address(weth), 800);  // 8% APY

        // Whitelist tokens in staking contract first
        staking.setTokenWhitelist(address(usdc), true);
        staking.setTokenWhitelist(address(weth), true);

        // Configure Staking with supported tokens
        staking.addSupportedToken(address(usdc));
        staking.addSupportedToken(address(weth));

        // Grant verifier role to deployer
        registry.grantRole(registry.VERIFIER_ROLE(), deployer);

        // Mint tokens for testing
        usdc.mint(deployer, 10000 * 10**6); // 10k USDC
        weth.mint(deployer, 100 * 10**18);  // 100 WETH

        // Fund vault with liquidity
        usdc.transfer(address(vault), 50000 * 10**6); // 50k USDC
        weth.transfer(address(vault), 50 * 10**18);   // 50 WETH

        // Create sample NGOs
        _createSampleNGOs(registry);

        vm.stopBroadcast();
    }

    function _createSampleNGOs(NGORegistry registry) internal {
        // Education For All NGO
        string[] memory causes1 = new string[](3);
        causes1[0] = "Education";
        causes1[1] = "Technology";
        causes1[2] = "Children";

        address ngo1 = address(0x1234567890123456789012345678901234567890);
        registry.registerNGO(
            "Education For All",
            "Providing quality education to underprivileged children worldwide through innovative digital learning platforms and community-based programs.",
            "https://educationforall.org",
            "https://via.placeholder.com/150/667eea/ffffff?text=EFA",
            ngo1,
            causes1,
            "ipfs://educationforall"
        );
        registry.verifyNGO(ngo1);
        console.log("Education For All NGO:", ngo1);

        // Clean Water Initiative NGO
        string[] memory causes2 = new string[](3);
        causes2[0] = "Environment";
        causes2[1] = "Health";
        causes2[2] = "Water";

        address ngo2 = address(0x2345678901234567890123456789012345678901);
        registry.registerNGO(
            "Clean Water Initiative",
            "Bringing clean and safe drinking water to communities in need through sustainable water purification systems and infrastructure development.",
            "https://cleanwaterinitiative.org",
            "https://via.placeholder.com/150/764ba2/ffffff?text=CWI",
            ngo2,
            causes2,
            "ipfs://cleanwater"
        );
        registry.verifyNGO(ngo2);
        console.log("Clean Water Initiative NGO:", ngo2);

        // HealthCare Access NGO
        string[] memory causes3 = new string[](3);
        causes3[0] = "Health";
        causes3[1] = "Technology";
        causes3[2] = "Community";

        address ngo3 = address(0x3456789012345678901234567890123456789012);
        registry.registerNGO(
            "HealthCare Access",
            "Ensuring equitable access to healthcare services in underserved communities through mobile clinics and telemedicine solutions.",
            "https://healthcareaccess.org",
            "https://via.placeholder.com/150/f093fb/ffffff?text=HCA",
            ngo3,
            causes3,
            "ipfs://healthcareaccess"
        );
        registry.verifyNGO(ngo3);
        console.log("HealthCare Access NGO:", ngo3);
    }
}
