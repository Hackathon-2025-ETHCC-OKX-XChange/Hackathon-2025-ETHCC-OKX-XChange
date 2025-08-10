import { NextPage } from 'next';
import Head from 'next/head';
import { useState, useMemo } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNGORegistry } from '../hooks/useNGORegistry';
import { NGOCard } from '../components/ngo/NGOCard';
import { CAUSES } from '../types';

const Discover: NextPage = () => {
  const { isConnected } = useAccount();
  const { ngos, loading } = useNGORegistry();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCause, setSelectedCause] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and search NGOs
  const filteredNGOs = useMemo(() => {
    return ngos.filter(ngo => {
      const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ngo.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCause = !selectedCause || ngo.causes.includes(selectedCause);

      const matchesVerification = !verifiedOnly || ngo.isVerified;

      return matchesSearch && matchesCause && matchesVerification;
    });
  }, [ngos, searchTerm, selectedCause, verifiedOnly]);

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Discover - Connect Wallet | X-Change</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Discover NGOs</h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to browse and support verified NGOs
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
          <title>Discover | X-Change - Change the world on X Layer</title>
          <meta name="description" content="Browse verified NGOs to support through yield staking on X Layer" />
        </Head>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover NGOs</h1>
            <p className="text-xl text-gray-600">
              Browse verified organizations and start making an impact through yield staking
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <inpu
                  type="text"
                  placeholder="Search NGOs by name or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Cause Filter */}
              <div className="lg:w-64">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={selectedCause}
                  onChange={(e) => setSelectedCause(e.target.value)}
                >
                  <option value="">All Causes</option>
                  {CAUSES.map(cause => (
                    <option key={cause} value={cause}>{cause}</option>
                  ))}
                </select>
              </div>

              {/* Verification Filter */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified-only"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <label htmlFor="verified-only" className="text-sm font-medium text-gray-700">
                  Verified Only
                </label>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Search: &ldquo;{searchTerm}&rdquo;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCause && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Cause: {selectedCause}
                  <button
                    onClick={() => setSelectedCause('')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {verifiedOnly && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Verified Only
                  <button
                    onClick={() => setVerifiedOnly(false)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-gray-600">
              {loading ? (
                <span>Loading NGOs...</span>
              ) : (
                <span>
                  Showing {filteredNGOs.length} of {ngos.length} NGOs
                  {filteredNGOs.length !== ngos.length && ' (filtered)'}
                </span>
              )}
            </div>

            {!loading && filteredNGOs.length > 0 && (
              <div className="text-sm text-gray-500">
                {filteredNGOs.filter(ngo => ngo.isVerified).length} verified organizations
              </div>
            )}
          </div>

          {/* NGOs Grid/List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded px-2 flex-1"></div>
                    <div className="h-6 bg-gray-200 rounded px-2 flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNGOs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No NGOs Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters to find NGOs.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCause('');
                  setVerifiedOnly(false);
                }}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredNGOs.map((ngo) => (
                <div key={ngo.id} className={viewMode === 'list' ? 'max-w-4xl' : ''}>
                  <NGOCard ngo={ngo} />
                </div>
              ))}
            </div>
          )}

          {/* Load More (if needed for pagination) */}
          {!loading && filteredNGOs.length > 0 && filteredNGOs.length < ngos.length && (
            <div className="text-center mt-12">
              <button className="btn-secondary">
                Load More NGOs
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Discover;