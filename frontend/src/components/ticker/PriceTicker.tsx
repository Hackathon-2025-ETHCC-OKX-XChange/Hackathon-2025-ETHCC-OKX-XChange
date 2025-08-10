import React from 'react';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface PriceItemProps {
  symbol: string;
  price: number;
  change24h: number;
  changePercentage24h: number;
  isOKXNative?: boolean;
}

const PriceItem: React.FC<PriceItemProps> = ({
  symbol,
  price,
  change24h,
  changePercentage24h,
  isOKXNative = false
}) => {
  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };

  const formatChange = (change: number) => {
    const formatted = Math.abs(change).toFixed(2);
    return `${isPositive ? '+' : isNegative ? '-' : ''}${formatted}%`;
  };

  return (
    <div className="flex items-center space-x-2 px-4 whitespace-nowrap">
      <span className="font-semibold text-gray-900 min-w-[50px]">{symbol}</span>
      <span className="text-gray-700 min-w-[80px] text-right">${formatPrice(price)}</span>
      <div className={`flex items-center space-x-1 text-sm min-w-[70px] ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
      }`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : isNegative ? (
          <TrendingDown className="w-3 h-3" />
        ) : (
          <Minus className="w-3 h-3" />
        )}
        <span>{formatChange(changePercentage24h)}</span>
      </div>
    </div>
  );
};

interface PriceTickerProps {
  className?: string;
  speed?: number; // Duration in seconds for one complete scroll
}

export const PriceTicker: React.FC<PriceTickerProps> = ({
  className = '',
  speed = 60
}) => {
  const { prices, isLoading, error, lastUpdated } = useTokenPrices(60000); // Refresh every 60s (reduced frequency)

  if (error) {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-3 ${className}`}>
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load price data: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = Date.now();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 overflow-hidden ${className}`}>
      <div className="relative">
        {/* Status indicator */}
        <div className="absolute top-2 right-4 z-10 flex items-center space-x-2 text-xs text-gray-500">
          {isLoading && (
            <RefreshCw className="w-3 h-3 animate-spin" />
          )}
          <span>OKX DEX</span>
          {lastUpdated && (
            <span>• {formatLastUpdated()}</span>
          )}
        </div>

        {/* Scrolling content */}
        <div className="flex animate-marquee">
          {/* First set of prices */}
          <div className="flex items-center py-3 space-x-0">
            {prices.map((token, index) => (
              <PriceItem
                key={`first-${token.symbol}-${index}`}
                symbol={token.symbol}
                price={token.price}
                change24h={token.change24h}
                changePercentage24h={token.changePercentage24h}
                isOKXNative={token.symbol === 'OKB'}
              />
            ))}
          </div>

          {/* Duplicate set for seamless scrolling */}
          <div className="flex items-center py-3 space-x-0">
            {prices.map((token, index) => (
              <PriceItem
                key={`second-${token.symbol}-${index}`}
                symbol={token.symbol}
                price={token.price}
                change24h={token.change24h}
                changePercentage24h={token.changePercentage24h}
                isOKXNative={token.symbol === 'OKB'}
              />
            ))}
          </div>
        </div>

        {/* Loading state overlay */}
        {isLoading && prices.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="flex items-center space-x-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading live prices from OKX DEX...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};