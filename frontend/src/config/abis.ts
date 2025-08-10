// Contract addresses
export const NGO_REGISTRY = '0x771a3e012eD22FEc509668593Cb12AA677C41Dbd';
export const STAKING_CONTRACT = '0x1340faD914A325AE274a4FDF168a528429907e35';
export const YIELD_VAULT = '0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1';
export const YIELD_DISTRIBUTOR = '0xC1c3837ca85886AC13672b48E54aa827e643926e';
export const MOCK_USDC = '0xa2dCeE55cD951D809C0762574ed4016E31E18419';
export const MOCK_WETH = '0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282';

// Contract ABIs for interaction with deployed contracts

export const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const NGO_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "string", "name": "_website", "type": "string"},
      {"internalType": "string", "name": "_logoURI", "type": "string"},
      {"internalType": "address", "name": "_walletAddress", "type": "address"},
      {"internalType": "string[]", "name": "_causes", "type": "string[]"},
      {"internalType": "string", "name": "_metadataURI", "type": "string"}
    ],
    "name": "registerNGO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_ngoAddress", "type": "address"}],
    "name": "verifyNGO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_ngoAddress", "type": "address"}],
    "name": "getNGO",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "website", "type": "string"},
          {"internalType": "string", "name": "logoURI", "type": "string"},
          {"internalType": "address", "name": "walletAddress", "type": "address"},
          {"internalType": "string[]", "name": "causes", "type": "string[]"},
          {"internalType": "string", "name": "metadataURI", "type": "string"},
          {"internalType": "bool", "name": "isVerified", "type": "bool"},
          {"internalType": "uint256", "name": "registrationDate", "type": "uint256"}
        ],
        "internalType": "struct NGORegistry.NGOInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllNGOs",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_ngoAddress", "type": "address"}],
    "name": "isVerified",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const STAKING_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_ngo", "type": "address"},
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "uint256", "name": "_lockPeriod", "type": "uint256"},
      {"internalType": "uint256", "name": "_yieldContributionRate", "type": "uint256"}
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_stakeId", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserStakes",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_stakeId", "type": "uint256"}],
    "name": "getStake",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "staker", "type": "address"},
          {"internalType": "address", "name": "ngo", "type": "address"},
          {"internalType": "address", "name": "token", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "lockPeriod", "type": "uint256"},
          {"internalType": "uint256", "name": "yieldContributionRate", "type": "uint256"},
          {"internalType": "uint256", "name": "startTime", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "internalType": "struct MorphImpactStaking.Stake",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_token", "type": "address"}],
    "name": "isSupportedToken",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedTokens",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const YIELD_VAULT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_token", "type": "address"}],
    "name": "getAPY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedTokens",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const YIELD_DISTRIBUTOR_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_ngo", "type": "address"}],
    "name": "getTotalYieldForNGO",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_ngo", "type": "address"}],
    "name": "getPendingYieldForNGO",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;