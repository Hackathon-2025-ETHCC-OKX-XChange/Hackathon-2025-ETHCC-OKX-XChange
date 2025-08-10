// Core types for the NGO staking platform

export interface NGO {
  id: string; // NGO wallet address
  name: string;
  description: string;
  website: string;
  logoURI: string;
  walletAddress: `0x${string}`;
  causes: string[];
  metadataURI: string;
  isVerified: boolean;
  totalStakers: bigint;
  totalStaked: bigint;
  totalYieldGenerated: bigint;
  registrationDate: number; // timestamp
}

export interface Stake {
  id: string; // stake ID from contract
  staker: `0x${string}`;
  ngo: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  lockPeriod: bigint; // in seconds
  yieldContributionRate: bigint; // percentage (50, 75, 100)
  startTime: bigint; // timestamp
  isActive: boolean;
  estimatedYield?: bigint;
}

export interface Token {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  isStablecoin: boolean;
}

export interface StakingFormData {
  ngoId: `0x${string}`;
  token: `0x${string}`;
  amount: string;
  lockPeriodMonths: number;
  yieldContributionRate: number;
}

export interface NGORegistrationData {
  name: string;
  description: string;
  website: string;
  logoURI: string;
  walletAddress: `0x${string}`;
  causes: string[];
  metadataURI: string;
  // Additional fields for registration form
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  documents?: {
    registrationCertificate?: File;
    taxExemptStatus?: File;
    additionalDocs?: File[];
  };
}

export interface UserPortfolio {
  totalValueLocked: bigint;
  totalYieldGenerated: bigint;
  activeStakesCount: number;
  activeStakes: Stake[];
  completedStakes: Stake[];
  supportedNGOs: string[]; // NGO addresses
}

export interface YieldDistribution {
  ngo: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
  distributionId: string;
}

export interface TransactionStatus {
  hash?: `0x${string}`;
  status: 'idle' | 'pending' | 'success' | 'error';
  error?: string;
}

export interface StakingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  txHash?: `0x${string}`;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// UI component props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Contract interaction types
export interface ContractReadConfig {
  address: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
  enabled?: boolean;
}

export interface ContractWriteConfig {
  address: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// Utility types
export type Address = `0x${string}`;
export type Hash = `0x${string}`;

// Enums
export enum StakeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
}

export enum NGOStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum TransactionType {
  STAKE = 'stake',
  WITHDRAW = 'withdraw',
  REGISTER_NGO = 'register_ngo',
  APPROVE_TOKEN = 'approve_token',
}

// Constants
export const CAUSES = [
  'Education',
  'Health',
  'Environment',
  'Technology',
  'Children',
  'Water',
  'Community',
  'Human Rights',
  'Disaster Relief',
  'Poverty Alleviation',
  'Animal Welfare',
  'Mental Health',
] as const;

export type Cause = typeof CAUSES[number];