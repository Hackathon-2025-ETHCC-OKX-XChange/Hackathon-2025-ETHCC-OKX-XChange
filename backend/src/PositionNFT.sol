// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "solmate/tokens/ERC721.sol";
import {Owned} from "solmate/auth/Owned.sol";

contract PositionNFT is ERC721, Owned {
    uint256 public nextId;
    string public baseURI;

    struct PositionMeta {
        uint256 ngoId;
        uint256 startTs;
        uint256 endTs;
        uint256 allocationBps; // 5000, 7500, 10000
        address asset;
        uint256 shares; // strategy shares
    }

    mapping(uint256 => PositionMeta) public positionById;

    constructor(string memory _name, string memory _symbol, string memory _baseURI)
        ERC721(_name, _symbol)
        Owned(msg.sender)
    {
        baseURI = _baseURI;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, _toString(id)));
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function mint(address to, PositionMeta memory meta) external onlyOwner returns (uint256 id) {
        id = ++nextId;
        _safeMint(to, id);
        positionById[id] = meta;
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 id) internal view {
        // placeholder for transfer restrictions if needed
        from; to; id;
    }
}
