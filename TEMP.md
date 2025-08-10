## OKX ETHCC Hackathon — Context & Action Plan (TEMP)

### Project snapshot
- **Goal**: DeFi platform where donors stake assets and route yield to NGOs (50/75/100%).
- **Stack**: Frontend (Next.js + wagmi/RainbowKit), Backend (Foundry/Solidity), Network (X Layer).
- **Core contracts**: `NGORegistry`, `MockYieldVault`, `MorphImpactStaking`, `YieldDistributor`, `PositionNFT`.

### Current state
- **Backend**
  - Tests: 41 passing (unit + realistic E2E). Vault prefunded in tests to avoid underflow.
  - Deployment
    - Script: `backend/script/DeployCore.s.sol` (core deploy only).
    - Broadcast (Mainnet/196):
      - `NGORegistry`: 0x522dAcDf83024D6158f5d84421508deAeC3E40F3
      - `MockYieldVault`: 0x7c40e4101540bF0187f3E22934cf01a255cDADf3
      - `MorphImpactStaking`: 0xfC9572Cf3c528918dafbAa6F9b1D1E7dE62d0cBB
      - `YieldDistributor`: 0x5368b928eFD703f060834252E8Dffe0Ad5151b7c
    - Record: `backend/broadcast/DeployCore.s.sol/196/run-latest.json`
    - Addresses doc: `backend/DEPLOYMENT-ADDRESSES.md` updated.
  - Env: `backend/.env.example`, `backend/env.sample` (local `.env` exists, not committed).
- **Frontend**
  - Migrating to Next.js; integration with contracts not completed.

### Recent work
- Reverted unintended `backend/` changes to prior known-good state.
- Fixed test underflows by prefunding vault in tests.
- Added realistic E2E test suite `NGORealisticFlows.t.sol`.
- Added deployment script and deployed to X Layer Mainnet (legacy gas).
- Created env templates and deployment addresses doc.

### Gaps / risks
- Core deploy script does NOT deploy mock tokens or example NGOs (by design).
- No post-deploy configuration yet (token whitelist/APYs/liquidity).
- Frontend not wired to deployed addresses; no E2E UI flow on-chain.
- X Layer RPC lacks EIP-1559; use `--legacy` gas.

### Action plan (handoff)
1. Dev/fork configuration script
   - Add `backend/script/ConfigureDev.s.sol` to:
     - Deploy `MockERC20` USDC/WETH.
     - Vault: add supported tokens + set APY (USDC 10%, WETH 8%), pre-fund vault.
     - Staking: whitelist tokens, add supported tokens.
     - Register and verify 1–2 example NGOs; seed metadata.
2. Prod configuration script
   - Add `backend/script/ConfigureProd.s.sol` to:
     - Whitelist real token addresses (no mock deployments) and set APYs.
     - Skip NGO registration (handled via dApp/governance); optionally set distributor tokens.
3. Contract verification
   - Verify all deployed contracts on X Layer explorer and add links to `DEPLOYMENT-ADDRESSES.md`.
4. Frontend integration
   - Add addresses/ABIs to `frontend/src/wagmi.ts` (or config module).
   - Implement NGO list, staking form, yield claim/unstake flows; network switch to X Layer.
5. Testnet run
   - Broadcast configure scripts on Testnet (195), update addresses doc (testnet section).
   - Run an end-to-end manual flow and record.
6. CI/quality
   - Add CI jobs for `forge build`/`forge test`.
   - Prettier/Solhint optional.

### How to run (quick refs)
- Tests: `cd backend && forge test -vv`
- Dry-run mainnet fork: `forge script script/DeployCore.s.sol:DeployCore --fork-url https://xlayer.drpc.org -vvv`
- Broadcast mainnet (legacy): `forge script script/DeployCore.s.sol:DeployCore --rpc-url https://xlayer.drpc.org --broadcast --legacy --gas-price 1000000000 -vv`

### Files of interest
- `backend/src/*.sol`
- `backend/test/*.sol`
- `backend/script/DeployCore.s.sol`
- `backend/DEPLOYMENT-ADDRESSES.md`
- `backend/.env.example`, `backend/env.sample`
