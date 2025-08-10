import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define X Layer Mainnet chain
export const xLayerMainnet = defineChain({
  id: 196,
  name: 'X Layer Mainnet',
  nativeCurrency: {
    name: 'OKB',
    symbol: 'OKB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://xlayerrpc.okx.com']
    },
  },
  blockExplorers: {
    default: {
      name: 'OKLink X Layer Explorer',
      url: 'https://www.oklink.com/xlayer',
      apiUrl: 'https://www.oklink.com/api/v5/explorer'
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 47416,
    },
  },
});

export const config = getDefaultConfig({
  appName: 'X-Change - Change the world on X Layer',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id',
  chains: [xLayerMainnet],
  ssr: true,
});
