# OKX ETHCC Hackathon - Deployment Addresses

## Network: X Layer Testnet
- **Chain ID**: 195
- **RPC URL**: `https://xlayertestrpc.okx.com`
- **Explorer**: `https://www.okx.com/xlayer-test/explorer`

## Deployed Contracts

### Core Protocol Contracts
- **NGORegistry**: `0x522dAcDf83024D6158f5d84421508deAeC3E40F3`
- **MockYieldVault**: `0x7c40e4101540bF0187f3E22934cf01a255cDADf3`
- **MorphImpactStaking**: `0xfC9572Cf3c528918dafbAa6F9b1D1E7dE62d0cBB`
- **YieldDistributor**: `0x5368b928eFD703f060834252E8Dffe0Ad5151b7c`

### Mock/Token Addresses (if applicable)
- **USDC (Test/Mock)**: `0x0000000000000000000000000000000000000000`  // TBD
- **WETH (Test/Mock)**: `0x0000000000000000000000000000000000000000`  // TBD

## Registered NGOs (example placeholders)

### Verified NGOs
1. **Education For All**
   - Address: `0x0000000000000000000000000000000000000000`
   - Description: Providing quality education to underprivileged children worldwide
   - Website: `https://educationforall.org`
   - Causes: Education, Technology, Children
   - Status: ✅ Verified

2. **Clean Water Initiative**
   - Address: `0x0000000000000000000000000000000000000000`
   - Description: Bringing clean water to communities in need
   - Website: `https://cleanwaterinitiative.org`
   - Causes: Environment, Health, Water
   - Status: ✅ Verified

## Token Configuration (intended)

### Supported Tokens (Vault APY targets)
- **USDC**: 10% APY
- **WETH**: 8% APY

### Initial Liquidity Setup (intended)
- **USDC**: 50,000 USDC in vault
- **WETH**: 50 WETH in vault

## Deployment Details
- **Deployer**: `0x3A76F9c1c5037FA94271e13f70080E99beCeE5dF`
- **Gas Price**: `1 gwei (legacy)`
- **Estimated Total Gas Used**: `~7,144,131`
- **Estimated Total Cost**: `~0.007144131 OKB`
- **Broadcast Record**: `backend/broadcast/DeployCore.s.sol/196/run-latest.json`

## How to Deploy

1. Export your private key and RPC:
   - `export PRIVATE_KEY=0x...`
   - `export RPC=https://xlayertestrpc.okx.com`
2. Broadcast deployment:
   - `forge script script/DeployCore.s.sol:DeployCore --rpc-url $RPC --broadcast -vv`
3. Update this file with the emitted addresses from the script logs and explorer links.
4. Configure supported tokens and APYs post-deploy via owner calls.

## Contract Verification
- After deployment, verify contracts on the explorer and add links here.
