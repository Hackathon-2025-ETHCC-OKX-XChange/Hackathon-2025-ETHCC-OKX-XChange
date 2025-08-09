// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NGORegistry} from "../src/NGORegistry.sol";

contract NGORegistryTest is Test {
    NGORegistry registry;

    function setUp() public {
        registry = new NGORegistry();
    }

    function testRegisterVerifyAndUpdateNGO() public {
        address ngoAddr = address(0xBEEF);
        string[] memory causes = new string[](2);
        causes[0] = "Education";
        causes[1] = "Health";

        registry.registerNGO("Save Earth", "desc", "https://site", "ipfs://logo", ngoAddr, causes, "ipfs://meta");
        // initially unverified
        NGORegistry.NGO memory ngo = registry.getNGO(ngoAddr);
        assertEq(ngo.name, "Save Earth");
        assertEq(ngo.walletAddress, ngoAddr);
        assertFalse(ngo.isVerified);
        assertTrue(ngo.isActive);
        assertEq(ngo.reputationScore, 70);

        // verify
        registry.verifyNGO(ngoAddr);
        ngo = registry.getNGO(ngoAddr);
        assertTrue(ngo.isVerified);

        // update info
        string[] memory causes2 = new string[](1);
        causes2[0] = "Water";
        registry.updateNGOInfo(ngoAddr, "New Name", "newdesc", "https://new", "ipfs://new", causes2, "ipfs://meta2");
        ngo = registry.getNGO(ngoAddr);
        assertEq(ngo.name, "New Name");
    }
}
