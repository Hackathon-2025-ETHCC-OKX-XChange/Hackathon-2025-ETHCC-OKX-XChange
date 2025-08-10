import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  CheckCircle, ExternalLink, Users, TrendingUp, Calendar,
  Globe, Heart, ArrowRight, Share2
} from 'lucide-react';
import { useNGORegistry } from '../../hooks/useNGORegistry';
import { formatDistanceToNow } from 'date-fns';

const NGODetails: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isConnected } = useAccount();
  const { ngos, loading } = useNGORegistry();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const ngo = ngos.find(n => n.id === id);

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ngo) {
    return (
      <>
        <Head>
          <title>NGO Not Found</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">NGO Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The NGO you&apos;re looking for doesn&apos;t exist or hasn&apos;t been verified yet.
            </p>
            <Link href="/discover" className="btn-primary">
              Discover Other NGOs
            </Link>
          </div>
        </div>
      </>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${ngo.name} on NGO Impact`,
          text: ngo.description,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Head>
        <title>{ngo.name} - NGO Impact Platform</title>
        <meta name="description" content={ngo.description} />
        <meta property="og:title" content={`Support ${ngo.name} on NGO Impact`} />
        <meta property="og:description" content={ngo.description} />
        <meta property="og:image" content={ngo.logoURI} />
      </Head>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero Section */}
          <div className="card overflow-hidden mb-8">
            <div className="h-64 md:h-80 relative">
              <img
                src={ngo.logoURI}
                alt={ngo.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/800x320/6366f1/ffffff?text=${encodeURIComponent(ngo.name.slice(0, 3))}`;
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-white">{ngo.name}</h1>
                      {ngo.isVerified && (
                        <span className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-white/90 text-sm">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Registered {formatDistanceToNow(new Date(ngo.registrationDate), { addSuffix: true })}
                      </span>
                      {ngo.website && (
                        <a
                          href={ngo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:text-white transition-colors"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleShare}
                      className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This NGO</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {showFullDescription ? ngo.description : `${ngo.description.slice(0, 300)}...`}
                  </p>
                  {ngo.description.length > 300 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary-600 hover:text-primary-700 font-medium mt-2"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>

              {/* Causes */}
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Focus Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {ngo.causes.map((cause) => (
                    <span
                      key={cause}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact Section */}
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Impact & Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{Number(ngo.totalStakers)}</div>
                    <div className="text-sm text-gray-600">Active Supporters</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      ${Number(ngo.totalYieldGenerated).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Yield Received</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      ${Number(ngo.totalStaked).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Value Staked</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {[
                    { action: 'New stake created', amount: '1,000 USDC', time: '2 days ago' },
                    { action: 'Yield distributed', amount: '50 USDC', time: '1 week ago' },
                    { action: 'New supporter joined', amount: '500 WETH', time: '2 weeks ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{activity.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Staking CTA */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Support This NGO</h3>
                <p className="text-gray-600 mb-6">
                  Stake your tokens to generate yield for {ngo.name}. You keep your principal and help fund their mission.
                </p>

                {isConnected ? (
                  <Link
                    href={`/stake/${ngo.id}`}
                    className="w-full btn-primary text-center flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Stake for This NGO
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                ) : (
                  <div className="text-center">
                    <ConnectButton />
                    <p className="text-sm text-gray-500 mt-2">Connect to start supporting</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Staking Options:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Lock periods: 6, 12, or 24 months</li>
                    <li>• Yield contribution: 50%, 75%, or 100%</li>
                    <li>• Supported tokens: USDC, WETH</li>
                  </ul>
                </div>
              </div>

              {/* NGO Information */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">NGO Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Wallet Address</p>
                    <p className="text-sm text-gray-900 font-mono break-all">{ngo.walletAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Registration Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(ngo.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verification Status</p>
                    <p className="text-sm">
                      {ngo.isVerified ? (
                        <span className="text-green-600 font-medium">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">⏳ Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                {ngo.website && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                      href={ngo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full text-center flex items-center justify-center"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </div>
                )}
              </div>

              {/* Similar NGOs */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Similar NGOs</h3>
                <div className="space-y-3">
                  {ngos
                    .filter(n => n.id !== ngo.id && n.causes.some(cause => ngo.causes.includes(cause)))
                    .slice(0, 2)
                    .map((similarNGO) => (
                      <Link
                        key={similarNGO.id}
                        href={`/ngo/${similarNGO.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={similarNGO.logoURI}
                            alt={similarNGO.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{similarNGO.name}</p>
                            <p className="text-xs text-gray-500">
                              {similarNGO.causes.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>

                <Link
                  href="/discover"
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-4"
                >
                  Discover More NGOs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NGODetails;