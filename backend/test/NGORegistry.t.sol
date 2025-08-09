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
        (string memory name, , , , address wallet, bool isVerified, bool isActive, , , , uint256 rep, , ) = registry.getNGO(ngoAddr);
        assertEq(name, "Save Earth");
        assertEq(wallet, ngoAddr);
        assertFalse(isVerified);
        assertTrue(isActive);
        assertEq(rep, 70);

        // verify
        registry.verifyNGO(ngoAddr);
        (, , , , , isVerified, , , , , , , ) = registry.getNGO(ngoAddr);
        assertTrue(isVerified);

        // update info
        string[] memory causes2 = new string[](1);
        causes2[0] = "Water";
        registry.updateNGOInfo(ngoAddr, "New Name", "newdesc", "https://new", "ipfs://new", causes2, "ipfs://meta2");
        (name, , , , , , , , , , , , ) = registry.getNGO(ngoAddr);
        assertEq(name, "New Name");
    }
}
