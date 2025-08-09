// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NGORegistry {
    struct NGO {
        string name;
        string metadataURI;
        address beneficiary;
        bool approved;
    }

    event NGOCreated(uint256 indexed ngoId, string name, address beneficiary);
    event NGOUpdated(uint256 indexed ngoId);
    event NGOApproved(uint256 indexed ngoId, bool approved);

    address public admin;
    NGO[] private ngos;

    modifier onlyAdmin() {
        require(msg.sender == admin, 'not admin');
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createNGO(string calldata name, string calldata metadataURI, address beneficiary) external onlyAdmin returns (uint256) {
        require(beneficiary != address(0), 'zero beneficiary');
        ngos.push(NGO({ name: name, metadataURI: metadataURI, beneficiary: beneficiary, approved: false }));
        uint256 ngoId = ngos.length - 1;
        emit NGOCreated(ngoId, name, beneficiary);
        return ngoId;
    }

    function setApproval(uint256 ngoId, bool approved) external onlyAdmin {
        require(ngoId < ngos.length, 'invalid id');
        ngos[ngoId].approved = approved;
        emit NGOApproved(ngoId, approved);
    }

    function updateNGO(uint256 ngoId, string calldata name, string calldata metadataURI, address beneficiary) external onlyAdmin {
        require(ngoId < ngos.length, 'invalid id');
        require(beneficiary != address(0), 'zero beneficiary');
        NGO storage ngo = ngos[ngoId];
        ngo.name = name;
        ngo.metadataURI = metadataURI;
        ngo.beneficiary = beneficiary;
        emit NGOUpdated(ngoId);
    }

    function getNGO(uint256 ngoId) external view returns (NGO memory) {
        require(ngoId < ngos.length, 'invalid id');
        return ngos[ngoId];
    }

    function ngoCount() external view returns (uint256) {
        return ngos.length;
    }
}
