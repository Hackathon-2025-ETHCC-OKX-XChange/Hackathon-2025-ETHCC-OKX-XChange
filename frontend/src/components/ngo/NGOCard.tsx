import Link from 'next/link';
import { NGO } from '../../types';
import { CheckCircle, Users, TrendingUp } from 'lucide-react';

interface NGOCardProps {
  ngo: NGO;
}

export function NGOCard({ ngo }: NGOCardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* NGO Image */}
      <div className="h-48 relative">
        <img
          src={ngo.logoURI}
          alt={ngo.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/400x200/6366f1/ffffff?text=${encodeURIComponent(ngo.name.slice(0, 3))}`;
          }}
        />
        <div className="absolute top-4 right-4">
          {ngo.isVerified && (
            <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* NGO Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{ngo.name}</h3>

        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{ngo.description}</p>

        {/* Causes */}
        <div className="flex flex-wrap gap-1 mb-4">
          {ngo.causes.slice(0, 3).map((cause) => (
            <span
              key={cause}
              className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
            >
              {cause}
            </span>
          ))}
          {ngo.causes.length > 3 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              +{ngo.causes.length - 3} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-500">Stakers</span>
              <p className="font-semibold text-gray-900">{Number(ngo.totalStakers)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-500">Yield Generated</span>
              <p className="font-semibold text-gray-900">
                ${Number(ngo.totalYieldGenerated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* NGO Address */}
        <div className="text-xs text-gray-500 mb-4">
          <span className="font-medium">Address:</span> {formatAddress(ngo.walletAddress)}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            href={`/ngo/${ngo.id}`}
            className="flex-1 btn-secondary text-center py-2 text-sm"
          >
            View Details
          </Link>
          <Link
            href={`/stake/${ngo.id}`}
            className="flex-1 btn-primary text-center py-2 text-sm"
          >
            Stake Now
          </Link>
        </div>

        {/* Website Link */}
        {ngo.website && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <a
              href={ngo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
            >
              Visit Website →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}