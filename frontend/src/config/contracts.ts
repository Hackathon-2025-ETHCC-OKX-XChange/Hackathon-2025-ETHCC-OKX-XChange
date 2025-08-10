// Contract addresses for X Layer Mainnet deployment
export const CONTRACT_ADDRESSES = {
  // Core protocol contracts (X Layer Mainnet - Chain ID 196)
  NGO_REGISTRY: '0x771a3e012eD22FEc509668593Cb12AA677C41Dbd',
  MOCK_YIELD_VAULT: '0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1',
  MORPH_IMPACT_STAKING: '0x1340faD914A325AE274a4FDF168a528429907e35',
  YIELD_DISTRIBUTOR: '0xC1c3837ca85886AC13672b48E54aa827e643926e',

  // Token addresses for X Layer Mainnet
  TOKENS: {
    USDC: '0xa2dCeE55cD951D809C0762574ed4016E31E18419', // MockUSDC (6 decimals)
    WETH: '0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282', // MockWETH (18 decimals)
  }
} as const;

// Export individual addresses for convenience
export const NGO_REGISTRY = CONTRACT_ADDRESSES.NGO_REGISTRY;
export const STAKING_CONTRACT = CONTRACT_ADDRESSES.MORPH_IMPACT_STAKING;
export const YIELD_VAULT = CONTRACT_ADDRESSES.MOCK_YIELD_VAULT;
export const YIELD_DISTRIBUTOR = CONTRACT_ADDRESSES.YIELD_DISTRIBUTOR;
export const MOCK_USDC = CONTRACT_ADDRESSES.TOKENS.USDC;
export const MOCK_WETH = CONTRACT_ADDRESSES.TOKENS.WETH;

// Sample NGO addresses (deployed during contract deployment)
export const SAMPLE_NGOS = {
  EDUCATION_FOR_ALL: '0x1234567890123456789012345678901234567890',
  CLEAN_WATER_INITIATIVE: '0x2345678901234567890123456789012345678901',
  HEALTHCARE_ACCESS: '0x3456789012345678901234567890123456789012',
} as const;

// Chain configuration
export const X_LAYER_MAINNET = {
  id: 196,
  name: 'X Layer Mainnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: { name: 'OKLink Explorer', url: 'https://www.oklink.com/xlayer' },
  },
} as const;

// Token configurations
export const SUPPORTED_TOKENS = [
  {
    address: MOCK_USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/tokens/usdc.png', // Add token logos to public/tokens/
    isStablecoin: true,
  },
  {
    address: MOCK_WETH,
    symbol: 'WETH',
    name: 'Wrapped ETH',
    decimals: 18,
    logo: '/tokens/weth.png',
    isStablecoin: false,
  }
] as const;

// Staking configuration
export const STAKING_CONFIG = {
  LOCK_PERIODS: [
    { months: 6, seconds: 6 * 30 * 24 * 60 * 60, label: '6 Months' },
    { months: 12, seconds: 12 * 30 * 24 * 60 * 60, label: '1 Year' },
    { months: 24, seconds: 24 * 30 * 24 * 60 * 60, label: '2 Years' },
  ],
  YIELD_CONTRIBUTION_RATES: [50, 75, 100],
  DEFAULT_YIELD_RATE: 75,
  DEFAULT_LOCK_PERIOD: 12,
} as const;

// Explorer URLs for transactions
export const getExplorerUrl = (type: 'tx' | 'address', hash: string) => {
  const baseUrl = 'https://www.oklink.com/xlayer';
  return type === 'tx' ? `${baseUrl}/tx/${hash}` : `${baseUrl}/address/${hash}`;
};