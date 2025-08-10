import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Heart, Coins, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useNGORegistry } from '../hooks/useNGORegistry';
import { NGOCard } from '../components/ngo/NGOCard';
import { PriceTicker } from '../components/ticker/PriceTicker';

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const { ngos, loading } = useNGORegistry();

  const verifiedNGOs = ngos.filter(ngo => ngo.isVerified);
  const featuredNGOs = verifiedNGOs.slice(0, 3);

  const stats = {
    totalValueLocked: 0, // Calculate from actual data
    verifiedNGOs: verifiedNGOs.length,
    yieldGenerated: 0, // Calculate from actual data
    totalStakers: ngos.reduce((sum, ngo) => sum + Number(ngo.totalStakers), 0),
  };

  return (
    <>
      <Head>
        <title>X-Change - Change the world on X Layer</title>
        <meta
          name="description"
          content="X-Change: Support NGOs through yield staking on X Layer. Keep your principal, fund impact. Built for OKX ETHCC Hackathon."
        />
      </Head>

      {/* Price Ticker */}
      <PriceTicker />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
              X-Change
              <span className="block text-5xl md:text-6xl mt-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Revolutionize Donations
              </span>
            </h1>

            <div className="max-w-3xl mx-auto mb-8 space-y-6">
              <p className="text-2xl font-bold text-white">
                Fueling Impacts with DeFi, Change the world on X Layer
              </p>

              <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                Stake tokens for causes you care about, assign yield to NGOs, <br />
                and get your principal back after lock-in ends
              </p>
            </div>

            {/* Platform Stats */}
            <div className="mb-8">
              <div className="inline-flex items-center space-x-8 bg-white/15 backdrop-blur-sm rounded-xl px-8 py-4 border border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">${stats.totalValueLocked.toLocaleString()}</div>
                  <div className="text-sm text-white/80">Total Staked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.verifiedNGOs}</div>
                  <div className="text-sm text-white/80">Verified NGOs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">${stats.yieldGenerated.toLocaleString()}</div>
                  <div className="text-sm text-white/80">Yield Generated</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <>
                  <Link
                    href="/discover"
                    className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
                  >
                    Discover NGOs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/swap"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors text-lg"
                  >
                    Swap Tokens (OKX DEX)
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/register-ngo"
                    className="inline-flex items-center px-8 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors text-lg border border-white/30"
                  >
                    Register Your NGO
                  </Link>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <ConnectButton />
                  <p className="text-sm text-white/80 mt-2">Connect to X Layer Mainnet to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured NGOs */}
      {featuredNGOs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured NGOs</h2>
              <p className="text-lg text-gray-600">
                Support verified organizations making a real difference
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredNGOs.map((ngo) => (
                <NGOCard key={ngo.id} ngo={ngo} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/discover"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                View All NGOs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A revolutionary approach to charitable giving that benefits everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-600 text-sm">
                Connect to X Layer Mainne
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose NGO</h3>
              <p className="text-gray-600 text-sm">
                Browse verified NGOs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Stake Tokens</h3>
              <p className="text-gray-600 text-sm">
                Lock USDC/WETH for 6-24 months
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Yield Generated</h3>
              <p className="text-gray-600 text-sm">
                Earn yield, share with NGOs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-white">5</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Principal Back</h3>
              <p className="text-gray-600 text-sm">
                Retrieve full amount after lock
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <p className="text-lg text-gray-600">
              Real impact, measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="card p-8 text-center">
              <Coins className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                ${stats.totalValueLocked.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Value Locked</p>
            </div>

            <div className="card p-8 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.verifiedNGOs}</h3>
              <p className="text-gray-600">Verified NGOs</p>
            </div>

            <div className="card p-8 text-center">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                ${stats.yieldGenerated.toLocaleString()}
              </h3>
              <p className="text-gray-600">Yield Generated</p>
            </div>

            <div className="card p-8 text-center">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalStakers}</h3>
              <p className="text-gray-600">Active Stakers</p>
            </div>
          </div>
        </div>
      </section>

      {/* X Layer Contracts */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Deployed on X Layer Mainnet</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              All contracts verified and transparent. Native OKB gas token.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Network Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                Network Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Chain ID:</span>
                  <span className="font-mono bg-black/20 px-2 py-1 rounded">196</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Native Token:</span>
                  <span className="font-bold text-orange-400">OKB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">RPC:</span>
                  <code className="text-xs bg-black/20 px-2 py-1 rounded">xlayerrpc.okx.com</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Explorer:</span>
                  <a
                    href="https://www.oklink.com/xlayer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-xs"
                  >
                    oklink.com/xlayer ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Core Contracts */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Core Contracts</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">NGO Registry:</span>
                  <a
                    href="https://www.oklink.com/xlayer/address/0x771a3e012eD22FEc509668593Cb12AA677C41Dbd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-mono"
                  >
                    0x771a...1Dbd ↗
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Staking:</span>
                  <a
                    href="https://www.oklink.com/xlayer/address/0x1340faD914A325AE274a4FDF168a528429907e35"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-mono"
                  >
                    0x1340...7e35 ↗
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Yield Vault:</span>
                  <a
                    href="https://www.oklink.com/xlayer/address/0x9123F2c69f1990DdA4a1588c89e49E1B39eE25b1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-mono"
                  >
                    0x9123...25b1 ↗
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Distributor:</span>
                  <a
                    href="https://www.oklink.com/xlayer/address/0xC1c3837ca85886AC13672b48E54aa827e643926e"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-mono"
                  >
                    0xC1c3...926e ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Token Contracts */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Mock Tokens</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">MockUSDC (6 decimals):</span>
                  <a
                    href="https://www.oklink.com/xlayer/address/0xa2dCeE55cD951D809C0762574ed4016E31E18419"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono"
                  >
                    0xa2dC...8419 ↗
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">MockWETH (18 decimals):</span>
                  <a
                    href="https://www.oklink.com/xlayer/address/0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-mono"
                  >
                    0x9411...3282 ↗
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="font-medium mb-2">Sample NGOs Registered:</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <div>• Education For All (0x1234...7890)</div>
                  <div>• Clean Water Initiative (0x2345...8901)</div>
                  <div>• HealthCare Access (0x3456...9012)</div>
                </div>
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Platform Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Contract Verification</span>
                  <span className="flex items-center text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    All Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Token Deployment</span>
                  <span className="flex items-center text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">NGO Registration</span>
                  <span className="flex items-center text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    3 Sample NGOs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Staking Ready</span>
                  <span className="flex items-center text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Fully Operational
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <a
                  href="https://www.oklink.com/xlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  View All on OKLink Explorer ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;