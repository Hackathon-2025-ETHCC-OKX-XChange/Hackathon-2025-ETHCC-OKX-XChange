// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NGORegistry} from "../src/NGORegistry.sol";

contract NGORegistryTest is Test {
    NGORegistry registry;

    function setUp() public {
        registry = new NGORegistry();
    }

    function testCreateAndApproveNGO() public {
        uint256 ngoId = registry.createNGO("Save Earth", "ipfs://metadata", address(0xBEEF));
        assertEq(ngoId, 0);

        (string memory name,, address beneficiary, bool approved) = registry.getNGO(ngoId);
        assertEq(name, "Save Earth");
        assertEq(beneficiary, address(0xBEEF));
        assertFalse(approved);

        registry.setApproval(ngoId, true);
        (, , , approved) = registry.getNGO(ngoId);
        assertTrue(approved);
    }
}
