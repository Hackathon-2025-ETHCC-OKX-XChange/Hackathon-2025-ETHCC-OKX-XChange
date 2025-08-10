import { useState, useEffect, useCallback } from 'react';
import { okxDexService, TokenPrice } from '../services/okxDexApi';

interface UseTokenPricesReturn {
  prices: TokenPrice[];
  isLoading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
  lastUpdated: number | null;
}

export function useTokenPrices(refreshInterval: number = 30000): UseTokenPricesReturn {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tokenPrices = await okxDexService.getAllTokenPrices();
      setPrices(tokenPrices);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Failed to fetch token prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return {
    prices,
    isLoading,
    error,
    refreshPrices: fetchPrices,
    lastUpdated,
  };
}