import { http, createConfig } from 'wagmi'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets'
import { createPublicClient, defineChain } from 'viem'

export const xLayerTestnet = defineChain({
  id: 195,
  name: 'X Layer Testnet',
  network: 'xlayer-testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: [
      'https://xlayertestrpc.okx.com',
      'https://testrpc.xlayer.tech',
      'https://rpc.ankr.com/xlayer_testnet',
      'https://endpoints.omniatech.io/v1/xlayer/testnet/public',
      'https://xlayer-testnet.drpc.org'
    ] }
  },
  blockExplorers: {
    default: { name: 'OKX Explorer (Testnet)', url: 'https://www.oklink.com/xlayer-test' }
  }
})

const projectId = 'okx-ethcc-demo' // replace with WalletConnect ID if needed

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet]
  }
], { appName: 'OKX ETHCC', projectId })

export const wagmiConfig = createConfig({
  chains: [xLayerTestnet],
  connectors,
  transports: {
    [xLayerTestnet.id]: http(xLayerTestnet.rpcUrls.default.http[0])
  }
})

export const publicClient = createPublicClient({
  chain: xLayerTestnet,
  transport: http(xLayerTestnet.rpcUrls.default.http[0])
})
