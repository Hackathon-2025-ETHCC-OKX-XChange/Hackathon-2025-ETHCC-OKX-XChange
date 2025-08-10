import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TrendingUp, Wallet, Clock, Heart, BarChart3, History, Award } from 'lucide-react';
import { useUserStakes } from '../hooks/useUserStakes';
import { useNGORegistry } from '../hooks/useNGORegistry';
import { StakeCard } from '../components/portfolio/StakeCard';

const Portfolio: NextPage = () => {
  const { address, isConnected } = useAccount();
  const { stakes, activeStakes, completedStakes, loading, totalValueLocked, totalYieldGenerated } = useUserStakes();
  const { ngos } = useNGORegistry();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'impact'>('active');

  // Get NGO name by address
  const getNGOName = (ngoAddress: string) => {
    const ngo = ngos.find(n => n.id.toLowerCase() === ngoAddress.toLowerCase());
    return ngo?.name || 'Unknown NGO';
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Portfolio - Connect Wallet</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Your Portfolio</h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to view your stakes and portfolio performance
            </p>
            <ConnectButton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Portfolio - NGO Impact Platform</title>
        <meta name="description" content="Track your stakes, yield generation, and impact on NGOs" />
      </Head>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Portfolio</h1>
            <p className="text-xl text-gray-600">
              Track your stakes, yield generation, and impac
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Portfolio Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Wallet className="h-12 w-12 text-primary-600" />
                    <span className="text-sm text-gray-500">USD Value</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    ${totalValueLocked.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-sm text-gray-600">Total Value Locked</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="h-12 w-12 text-green-600" />
                    <span className="text-sm text-gray-500">Yield</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    ${totalYieldGenerated.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-sm text-gray-600">Yield Generated for NGOs</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="h-12 w-12 text-blue-600" />
                    <span className="text-sm text-gray-500">Stakes</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {activeStakes.length}
                  </h3>
                  <p className="text-sm text-gray-600">Active Stakes</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Heart className="h-12 w-12 text-red-600" />
                    <span className="text-sm text-gray-500">Impact</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {new Set(stakes.map(s => s.ngo)).size}
                  </h3>
                  <p className="text-sm text-gray-600">NGOs Supported</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('active')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'active'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Active Stakes ({activeStakes.length})</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('completed')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'completed'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <History className="h-4 w-4" />
                        <span>Completed ({completedStakes.length})</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('impact')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'impact'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>Impact Report</span>
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'active' && (
                    <div>
                      {activeStakes.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Stakes</h3>
                          <p className="text-gray-600 mb-6">
                            Start supporting NGOs by staking your tokens
                          </p>
                          <Link href="/discover" className="btn-primary">
                            Discover NGOs
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {activeStakes.map((stake) => (
                            <StakeCard
                              key={stake.id}
                              stake={stake}
                              ngoName={getNGOName(stake.ngo)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'completed' && (
                    <div>
                      {completedStakes.length === 0 ? (
                        <div className="text-center py-12">
                          <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Stakes</h3>
                          <p className="text-gray-600">
                            Your completed stakes will appear here when lock periods end
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {completedStakes.map((stake) => (
                            <StakeCard
                              key={stake.id}
                              stake={stake}
                              ngoName={getNGOName(stake.ngo)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'impact' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-6 text-center">
                          <BarChart3 className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            ${totalYieldGenerated.toLocaleString()}
                          </h4>
                          <p className="text-sm text-gray-600">Total Impact Generated</p>
                        </div>
                        <div className="card p-6 text-center">
                          <Heart className="h-10 w-10 text-red-600 mx-auto mb-3" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {new Set(stakes.map(s => s.ngo)).size}
                          </h4>
                          <p className="text-sm text-gray-600">NGOs Supported</p>
                        </div>
                        <div className="card p-6 text-center">
                          <Award className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {stakes.length}
                          </h4>
                          <p className="text-sm text-gray-600">Total Stakes Made</p>
                        </div>
                      </div>

                      {/* NGO Impact Breakdown */}
                      {stakes.length > 0 && (
                        <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">NGO Impact Breakdown</h3>
                          <div className="space-y-4">
                            {Object.entries(
                              stakes.reduce((acc, stake) => {
                                const ngoName = getNGOName(stake.ngo);
                                if (!acc[ngoName]) {
                                  acc[ngoName] = { totalYield: 0, stakeCount: 0 };
                                }

                                if (stake.estimatedYield) {
                                  const isUSDC = stake.token.toLowerCase() === '0xa2dCeE55cD951D809C0762574ed4016E31E18419'.toLowerCase();
                                  const decimals = isUSDC ? 6 : 18;
                                  const price = isUSDC ? 1 : 2500;
                                  const yieldAmount = Number(stake.estimatedYield) / Math.pow(10, decimals);
                                  const yieldToNGO = yieldAmount * Number(stake.yieldContributionRate) / 100;
                                  acc[ngoName].totalYield += yieldToNGO * price;
                                }
                                acc[ngoName].stakeCount += 1;
                                return acc;
                              }, {} as Record<string, { totalYield: number; stakeCount: number }>)
                            ).map(([ngoName, data]) => (
                              <div key={ngoName} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <h4 className="font-medium text-gray-900">{ngoName}</h4>
                                  <p className="text-sm text-gray-600">{data.stakeCount} stake{data.stakeCount !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">
                                    ${data.totalYield.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-sm text-gray-600">Yield contributed</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/discover" className="btn-primary text-center">
                    Discover More NGOs
                  </Link>
                  <Link href="/register-ngo" className="btn-secondary text-center">
                    Register Your NGO
                  </Link>
                  <button className="btn-secondary">
                    Export Portfolio
                  </button>
                  <a
                    href="https://www.oklink.com/xlayer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-center"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Portfolio;