# OKX ETHCC Hackathon - Deployment Addresses

## Network: X Layer Mainnet
- **Chain ID**: 196
- **RPC URL**: `https://rpc.xlayer.tech`
- **Explorer**: `https://explorer.xlayer.tech`

## Deployed Contracts

### Mock Token Contracts
- **MockUSDC**: `0xa2dCeE55cD951D809C0762574ed4016E31E18419` ✅ [Verified](https://www.oklink.com/xlayer/address/0xa2dCeE55cD951D809C0762574ed4016E31E18419)
- **MockWETH**: `0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282` ✅ [Verified](https://www.oklink.com/xlayer/address/0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282)

### Core Protocol Contracts
- **NGORegistry**: `0x771a3e012eD22FEc509668593Cb12AA677C41Dbd` ✅ [Verified](https://www.oklink.com/xlayer/address/0x771a3e012eD22FEc509668593Cb12AA677C41Dbd)
- **MockYieldVault**: `0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1` ✅ [Verified](https://www.oklink.com/xlayer/address/0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1)
- **MorphImpactStaking**: `0x1340faD914A325AE274a4FDF168a528429907e35` ✅ [Verified](https://www.oklink.com/xlayer/address/0x1340faD914A325AE274a4FDF168a528429907e35)
- **YieldDistributor**: `0xC1c3837ca85886AC13672b48E54aa827e643926e` ✅ [Verified](https://www.oklink.com/xlayer/address/0xC1c3837ca85886AC13672b48E54aa827e643926e)

## Registered NGOs

### Verified NGOs
1. **Education For All**
   - Address: `0x1234567890123456789012345678901234567890`
   - Description: Providing quality education to underprivileged children worldwide through innovative digital learning platforms and community-based programs.
   - Website: `https://educationforall.org`
   - Causes: Education, Technology, Children
   - Status: ✅ Verified

2. **Clean Water Initiative**
   - Address: `0x2345678901234567890123456789012345678901`
   - Description: Bringing clean and safe drinking water to communities in need through sustainable water purification systems and infrastructure development.
   - Website: `https://cleanwaterinitiative.org`
   - Causes: Environment, Health, Water
   - Status: ✅ Verified

3. **HealthCare Access**
   - Address: `0x3456789012345678901234567890123456789012`
   - Description: Ensuring equitable access to healthcare services in underserved communities through mobile clinics and telemedicine solutions.
   - Website: `https://healthcareaccess.org`
   - Causes: Health, Technology, Community
   - Status: ✅ Verified

## Token Configuration

### Supported Tokens with APYs (Configured)
- **USDC**: 10% APY ✅ Configured
- **WETH**: 8% APY ✅ Configured

### Initial Liquidity Setup (Completed)
- **USDC**: 50,000 USDC in vault ✅ Funded
- **WETH**: 50 WETH in vault ✅ Funded

### Token Whitelisting (Completed)
- **USDC**: ✅ Whitelisted in staking contract
- **WETH**: ✅ Whitelisted in staking contract

## Deployment Details
- **Deployer**: `0x3A76F9c1c5037FA94271e13f70080E99beCeE5dF`
- **Gas Price**: `1 gwei (legacy)`
- **Estimated Total Gas Used**: `~11,954,473`
- **Estimated Total Cost**: `~0.011954473 ETH`
- **Broadcast Record**: `backend/broadcast/DeployCore.s.sol/196/run-latest.json`
- **Deployment Date**: August 10, 2025
- **Network**: X Layer Mainnet

## How to Deploy

1. Export your private key and RPC:
   - `export PRIVATE_KEY=0x...`
   - `export RPC=https://rpc.xlayer.tech`
2. Broadcast deployment:
   - `forge script script/DeployCore.s.sol:DeployCore --rpc-url $RPC --broadcast --legacy --gas-price 1000000000 -vv`
3. All configuration is handled automatically in the deployment script.

## Contract Verification ✅ COMPLETED
- **Verification Method**: OKLink API with Foundry
- **Verifier Used**: `oklink` with URL `https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER`
- **All contracts successfully verified** with source code visible on OKLink explorer
- **Explorer Base URL**: https://www.oklink.com/xlayer/address/

### Verification Details:
- MockUSDC: Verified with no constructor args
- MockWETH: Verified with no constructor args
- NGORegistry: Verified with no constructor args
- MockYieldVault: Verified with constructor args (deployer address)
- MorphImpactStaking: Verified with constructor args (deployer, registry, vault addresses)
- YieldDistributor: Verified with constructor args (deployer, registry, staking addresses)
