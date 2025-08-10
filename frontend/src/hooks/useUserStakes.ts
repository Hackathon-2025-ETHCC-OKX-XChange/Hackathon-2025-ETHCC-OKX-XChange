import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { STAKING_CONTRACT, STAKING_CONTRACT_ABI } from '../config/abis';
import { Stake } from '../types';

export function useUserStakes() {
  const { address, isConnected } = useAccount();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's stake IDs
  const { data: stakeIds, isLoading: stakeIdsLoading } = useReadContract({
    address: STAKING_CONTRACT,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'getUserStakes',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  useEffect(() => {
    if (!stakeIds || stakeIdsLoading) {
      setLoading(stakeIdsLoading);
      return;
    }

    // For demo purposes, create sample stakes
    const sampleStakes: Stake[] = [
      {
        id: '1',
        staker: address || '0x0000000000000000000000000000000000000000',
        ngo: '0x1234567890123456789012345678901234567890',
        token: '0xa2dCeE55cD951D809C0762574ed4016E31E18419', // MockUSDC
        amount: BigInt('1000000000'), // 1000 USDC (6 decimals)
        lockPeriod: BigInt(365 * 24 * 60 * 60), // 1 year in seconds
        yieldContributionRate: BigInt(75), // 75%
        startTime: BigInt(Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60), // 30 days ago
        isActive: true,
        estimatedYield: BigInt('100000000'), // 100 USDC estimated
      },
      {
        id: '2',
        staker: address || '0x0000000000000000000000000000000000000000',
        ngo: '0x2345678901234567890123456789012345678901',
        token: '0x94117FD7961b2DDd56725DfD5Ba2FcCFc56F3282', // MockWETH
        amount: BigInt('2000000000000000000'), // 2 WETH (18 decimals)
        lockPeriod: BigInt(180 * 24 * 60 * 60), // 6 months in seconds
        yieldContributionRate: BigInt(100), // 100%
        startTime: BigInt(Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60), // 60 days ago
        isActive: true,
        estimatedYield: BigInt('160000000000000000'), // 0.16 WETH estimated
      }
    ];

    setStakes(sampleStakes);
    setLoading(false);
  }, [stakeIds, stakeIdsLoading, address]);

  const activeStakes = stakes.filter(stake => stake.isActive);
  const completedStakes = stakes.filter(stake => !stake.isActive);

  const totalValueLocked = stakes.reduce((total, stake) => {
    if (stake.isActive) {
      // Convert to USD approximation (simplified)
      const isUSDC = stake.token.toLowerCase() === '0xa2dCeE55cD951D809C0762574ed4016E31E18419'.toLowerCase();
      const decimals = isUSDC ? 6 : 18;
      const price = isUSDC ? 1 : 2500; // Approximate ETH price
      const amount = Number(stake.amount) / Math.pow(10, decimals);
      return total + (amount * price);
    }
    return total;
  }, 0);

  const totalYieldGenerated = stakes.reduce((total, stake) => {
    if (stake.estimatedYield) {
      // Convert to USD approximation
      const isUSDC = stake.token.toLowerCase() === '0xa2dCeE55cD951D809C0762574ed4016E31E18419'.toLowerCase();
      const decimals = isUSDC ? 6 : 18;
      const price = isUSDC ? 1 : 2500;
      const yieldAmount = Number(stake.estimatedYield) / Math.pow(10, decimals);
      return total + (yieldAmount * price * Number(stake.yieldContributionRate) / 100);
    }
    return total;
  }, 0);

  return {
    stakes,
    activeStakes,
    completedStakes,
    loading,
    totalValueLocked,
    totalYieldGenerated,
    refetch: () => {
      // Implement refetch logic
    },
  };
}