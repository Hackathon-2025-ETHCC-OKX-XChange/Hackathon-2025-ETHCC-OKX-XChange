import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { NGO_REGISTRY, NGO_REGISTRY_ABI } from '../config/abis';
import { NGO } from '../types';

export function useNGORegistry() {
  const { isConnected } = useAccount();
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all NGO addresses
  const { data: ngoAddresses, isLoading: addressesLoading } = useReadContract({
    address: NGO_REGISTRY,
    abi: NGO_REGISTRY_ABI,
    functionName: 'getAllNGOs',
    query: {
      enabled: isConnected,
    },
  });

  useEffect(() => {
    if (!ngoAddresses || addressesLoading) {
      setLoading(addressesLoading);
      return;
    }

    // For now, return sample NGOs since we know the addresses from deployment
    const sampleNGOs: NGO[] = [
      {
        id: '0x1234567890123456789012345678901234567890',
        name: 'Education For All',
        description: 'Providing quality education to underprivileged children worldwide through innovative digital learning platforms and community-based programs.',
        website: 'https://educationforall.org',
        logoURI: '/ngo-logos/education-for-all-logo.png',
        walletAddress: '0x1234567890123456789012345678901234567890',
        causes: ['Education', 'Technology', 'Children'],
        metadataURI: 'ipfs://educationforall',
        isVerified: true,
        totalStakers: BigInt(0),
        totalStaked: BigInt(0),
        totalYieldGenerated: BigInt(0),
        registrationDate: Date.now(),
      },
      {
        id: '0x2345678901234567890123456789012345678901',
        name: 'Clean Water Initiative',
        description: 'Bringing clean and safe drinking water to communities in need through sustainable water purification systems and infrastructure development.',
        website: 'https://cleanwaterinitiative.org',
        logoURI: '/ngo-logos/clean-water-initiative-logo.png',
        walletAddress: '0x2345678901234567890123456789012345678901',
        causes: ['Environment', 'Health', 'Water'],
        metadataURI: 'ipfs://cleanwater',
        isVerified: true,
        totalStakers: BigInt(0),
        totalStaked: BigInt(0),
        totalYieldGenerated: BigInt(0),
        registrationDate: Date.now(),
      },
      {
        id: '0x3456789012345678901234567890123456789012',
        name: 'HealthCare Access',
        description: 'Ensuring equitable access to healthcare services in underserved communities through mobile clinics and telemedicine solutions.',
        website: 'https://healthcareaccess.org',
        logoURI: '/ngo-logos/healthcare-access-logo.png',
        walletAddress: '0x3456789012345678901234567890123456789012',
        causes: ['Health', 'Technology', 'Community'],
        metadataURI: 'ipfs://healthcareaccess',
        isVerified: true,
        totalStakers: BigInt(0),
        totalStaked: BigInt(0),
        totalYieldGenerated: BigInt(0),
        registrationDate: Date.now(),
      },
    ];

    setNgos(sampleNGOs);
    setLoading(false);
  }, [ngoAddresses, addressesLoading]);

  return {
    ngos,
    loading,
    refetch: () => {
      // Implement refetch logic if needed
    },
  };
}

export function useNGODetails(ngoAddress: string) {
  const { isConnected } = useAccount();

  const { data: ngoData, isLoading } = useReadContract({
    address: NGO_REGISTRY,
    abi: NGO_REGISTRY_ABI,
    functionName: 'getNGO',
    args: [ngoAddress as `0x${string}`],
    query: {
      enabled: isConnected && !!ngoAddress,
    },
  });

  return {
    ngo: ngoData,
    loading: isLoading,
  };
}