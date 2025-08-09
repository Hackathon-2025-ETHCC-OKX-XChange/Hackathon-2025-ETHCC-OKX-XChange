// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IStrategy} from './IStrategy.sol';
import {NGORegistry} from './NGORegistry.sol';

contract DonationVault {
    struct DepositInput {
        uint256 ngoId;
        address asset;
        uint256 amount;
        uint256 termMonths; // 6, 12, 24
        uint256 allocationBps; // 5000, 7500, 10000
    }

    struct PositionState {
        address owner;
        uint256 shares;
        uint256 startTs;
        uint256 endTs;
        uint256 allocationBps;
        uint256 ngoId;
        address asset;
        bool principalWithdrawn;
        bool ngoClaimed;
    }

    event Deposited(uint256 indexed positionId, address indexed owner, uint256 ngoId, uint256 amount, uint256 termMonths, uint256 allocationBps);
    event PrincipalWithdrawn(uint256 indexed positionId, address indexed owner, uint256 amount);
    event NGOClaimed(uint256 indexed positionId, uint256 amount);

    address public admin;
    NGORegistry public registry;
    IStrategy public strategy;

    PositionState[] internal positions;

    modifier onlyAdmin() { require(msg.sender == admin, 'not admin'); _; }

    constructor(NGORegistry _registry, IStrategy _strategy) {
        admin = msg.sender;
        registry = _registry;
        strategy = _strategy;
    }

    function deposit(DepositInput calldata input) external payable returns (uint256 positionId) {
        require(input.allocationBps == 5000 || input.allocationBps == 7500 || input.allocationBps == 10000, 'bad alloc');
        require(input.termMonths == 6 || input.termMonths == 12 || input.termMonths == 24, 'bad term');
        uint256 startTs = block.timestamp;
        uint256 endTs = startTs + input.termMonths * 30 days; // approximate months
        uint256 shares = strategy.deposit(input.asset, input.amount);

        positions.push(PositionState({
            owner: msg.sender,
            shares: shares,
            startTs: startTs,
            endTs: endTs,
            allocationBps: input.allocationBps,
            ngoId: input.ngoId,
            asset: input.asset,
            principalWithdrawn: false,
            ngoClaimed: false
        }));
        positionId = positions.length - 1;
        emit Deposited(positionId, msg.sender, input.ngoId, input.amount, input.termMonths, input.allocationBps);
    }

    function withdrawPrincipal(uint256 positionId) external returns (uint256 amount) {
        PositionState storage p = positions[positionId];
        require(msg.sender == p.owner, 'not owner');
        require(block.timestamp >= p.endTs, 'not matured');
        require(!p.principalWithdrawn, 'already');
        amount = strategy.withdraw(p.asset, p.shares);
        p.principalWithdrawn = true;
        emit PrincipalWithdrawn(positionId, msg.sender, amount);
    }

    function claimNGO(uint256 positionId) external returns (uint256 amount) {
        PositionState storage p = positions[positionId];
        require(block.timestamp >= p.endTs, 'not matured');
        require(!p.ngoClaimed, 'already');
        // Preview yield and allocate to NGO
        uint256 grossYield = strategy.previewYield(p.shares, p.startTs, p.endTs);
        amount = (grossYield * p.allocationBps) / 10000;
        p.ngoClaimed = true;
        emit NGOClaimed(positionId, amount);
    }

    function position(uint256 positionId) external view returns (PositionState memory) {
        return positions[positionId];
    }

    function positionCount() external view returns (uint256) {
        return positions.length;
    }
}
