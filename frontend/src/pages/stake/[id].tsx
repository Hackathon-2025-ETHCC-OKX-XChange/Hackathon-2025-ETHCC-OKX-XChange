import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits, formatUnits } from 'viem';
import {
  ArrowLeft, Info, TrendingUp, Clock, Coins,
  CheckCircle, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useNGORegistry } from '../../hooks/useNGORegistry';
import { STAKING_CONTRACT, STAKING_CONTRACT_ABI, ERC20_ABI, MOCK_USDC, MOCK_WETH } from '../../config/abis';
import { STAKING_CONFIG, SUPPORTED_TOKENS } from '../../config/contracts';

const StakePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useAccount();
  const { ngos } = useNGORegistry();

  // Form state
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(STAKING_CONFIG.DEFAULT_LOCK_PERIOD);
  const [yieldContribution, setYieldContribution] = useState(STAKING_CONFIG.DEFAULT_YIELD_RATE);
  const [currentStep, setCurrentStep] = useState(1); // 1: Setup, 2: Approve, 3: Stake
  const [txHashes, setTxHashes] = useState<{ approve?: `0x${string}`, stake?: `0x${string}` }>({});

  const ngo = ngos.find(n => n.id === id);

  // Token balance using ERC20 balanceOf
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Token allowance
  const amountInWei = amount ? parseUnits(amount, selectedToken.decimals) : BigInt(0);
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && amountInWei > 0 ? [address, STAKING_CONTRACT] : undefined,
    query: { enabled: !!address && amountInWei > 0 },
  });

  // Contract writes
  const { writeContract: approveToken, isPending: isApproving } = useWriteContract();
  const { writeContract: stakeTokens, isPending: isStaking } = useWriteContract();

  // Transaction receipts
  const { isLoading: isApprovalTxLoading, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: txHashes.approve
  });
  const { isLoading: isStakeTxLoading, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: txHashes.stake
  });

  const needsApproval = allowance !== undefined && amountInWei > 0 && allowance < amountInWei;
  const hasBalance = tokenBalance !== undefined && tokenBalance >= amountInWei;

  // Calculate estimates
  const lockPeriodConfig = STAKING_CONFIG.LOCK_PERIODS.find(p => p.months === lockPeriod);
  const estimatedAPY = selectedToken.symbol === 'USDC' ? 10 : 8; // Mock APY
  const estimatedYield = amount ?
    (parseFloat(amount) * estimatedAPY / 100 * lockPeriod / 12) : 0;
  const yieldToNGO = estimatedYield * yieldContribution / 100;
  const yieldToUser = estimatedYield - yieldToNGO;

  // Handle approval
  const handleApprove = async () => {
    if (!hasBalance || !amountInWei) return;

    try {
      const result = await approveToken({
        address: selectedToken.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [STAKING_CONTRACT, amountInWei],
      });
      setTxHashes(prev => ({ ...prev, approve: result }));
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed. Please try again.');
    }
  };

  // Handle staking
  const handleStake = async () => {
    if (!ngo || !lockPeriodConfig || !hasBalance || !amountInWei) return;

    try {
      const result = await stakeTokens({
        address: STAKING_CONTRACT,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'stake',
        args: [
          ngo.id as `0x${string}`,
          selectedToken.address,
          amountInWei,
          BigInt(lockPeriodConfig.seconds),
          BigInt(yieldContribution * 100), // Convert percentage to basis points
        ],
      });
      setTxHashes(prev => ({ ...prev, stake: result }));
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed. Please try again.');
    }
  };

  // Update step based on transaction status
  useEffect(() => {
    if (needsApproval && !isApprovalSuccess) {
      setCurrentStep(2);
    } else if (isApprovalSuccess || !needsApproval) {
      setCurrentStep(3);
    }
  }, [needsApproval, isApprovalSuccess]);

  // Redirect to portfolio on success
  useEffect(() => {
    if (isStakeSuccess && txHashes.stake) {
      setTimeout(() => {
        router.push('/portfolio');
      }, 3000);
    }
  }, [isStakeSuccess, txHashes.stake, router]);

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Stake for NGO - Connect Wallet</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Stake for Impact</h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to stake tokens and support NGOs
            </p>
            <ConnectButton />
          </div>
        </div>
      </>
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
              The NGO you're trying to support doesn't exist.
            </p>
            <Link href="/discover" className="btn-primary">
              Discover NGOs
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isStakeSuccess && txHashes.stake) {
    return (
      <>
        <Head>
          <title>Staking Successful!</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Staking Successful!</h1>
            <p className="text-xl text-gray-600 mb-8">
              You've successfully staked {amount} {selectedToken.symbol} for {ngo.name}!
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Stake Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount Staked:</span>
                  <span className="font-medium">{amount} {selectedToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lock Period:</span>
                  <span className="font-medium">{lockPeriod} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Yield to NGO:</span>
                  <span className="font-medium text-green-600">{yieldContribution}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Yield to NGO:</span>
                  <span className="font-medium text-green-600">
                    {yieldToNGO.toFixed(4)} {selectedToken.symbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://www.oklink.com/xlayer/tx/${txHashes.stake}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center"
              >
                View Transaction
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <Link href="/portfolio" className="btn-primary">
                View Portfolio
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Redirecting to your portfolio in a few seconds...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Stake for {ngo.name} - NGO Impact Platform</title>
        <meta name="description" content={`Support ${ngo.name} by staking your tokens to generate yield for their mission`} />
      </Head>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/ngo/${ngo.id}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to NGO Details
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Staking Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Stake for {ngo.name}
                  </h1>
                  <p className="text-gray-600">
                    Support {ngo.name}'s mission by staking your tokens to generate yield
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-center space-x-4">
                    {[
                      { id: 1, title: 'Setup' },
                      { id: 2, title: 'Approve' },
                      { id: 3, title: 'Stake' },
                    ].map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                          currentStep >= step.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.id}
                        </div>
                        <span className={`ml-2 text-sm ${
                          currentStep >= step.id ? 'text-primary-600 font-medium' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </span>
                        {index < 2 && (
                          <div className={`w-8 h-1 mx-3 ${
                            currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Token
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {SUPPORTED_TOKENS.map((token) => (
                      <button
                        key={token.address}
                        onClick={() => setSelectedToken(token)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedToken.address === token.address
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{token.symbol}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{token.symbol}</div>
                            <div className="text-sm text-gray-600">{token.name}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {tokenBalance !== undefined && (
                    <p className="text-sm text-gray-600 mt-2">
                      Balance: {formatUnits(tokenBalance, selectedToken.decimals)} {selectedToken.symbol}
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stake Amoun
                  </label>
                  <div className="relative">
                    <inpu
                      type="number"
                      step={selectedToken.symbol === 'USDC' ? '0.01' : '0.0001'}
                      min="0"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Enter ${selectedToken.symbol} amount`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500">{selectedToken.symbol}</span>
                    </div>
                  </div>

                  {tokenBalance !== undefined && (
                    <div className="flex justify-between mt-2">
                      <div></div>
                      <button
                        onClick={() => setAmount(formatUnits(tokenBalance, selectedToken.decimals))}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Use Max
                      </button>
                    </div>
                  )}

                  {amount && !hasBalance && (
                    <p className="text-sm text-red-600 mt-1">Insufficient balance</p>
                  )}
                </div>

                {/* Lock Period */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Lock Period
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {STAKING_CONFIG.LOCK_PERIODS.map((period) => (
                      <button
                        key={period.months}
                        onClick={() => setLockPeriod(period.months)}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          lockPeriod === period.months
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{period.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yield Contribution Slider */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Yield Contribution to NGO: {yieldContribution}%
                  </label>
                  <div className="px-3">
                    <inpu
                      type="range"
                      min="50"
                      max="100"
                      step="25"
                      value={yieldContribution}
                      onChange={(e) => setYieldContribution(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    You keep {100 - yieldContribution}% of the yield, {yieldContribution}% goes to the NGO
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {currentStep === 2 && needsApproval && (
                    <button
                      onClick={handleApprove}
                      disabled={!hasBalance || !amount || isApproving || isApprovalTxLoading}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        hasBalance && amount && !isApproving && !isApprovalTxLoading
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isApproving || isApprovalTxLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isApproving ? 'Approving...' : 'Confirming...'}
                        </div>
                      ) : (
                        `Approve ${selectedToken.symbol}`
                      )}
                    </button>
                  )}

                  {(currentStep === 3 || (!needsApproval && currentStep === 1)) && (
                    <button
                      onClick={handleStake}
                      disabled={!hasBalance || !amount || needsApproval || isStaking || isStakeTxLoading}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        hasBalance && amount && !needsApproval && !isStaking && !isStakeTxLoading
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isStaking || isStakeTxLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isStaking ? 'Staking...' : 'Confirming...'}
                        </div>
                      ) : (
                        'Confirm Stake'
                      )}
                    </button>
                  )}
                </div>

                {/* Warnings */}
                {!hasBalance && amount && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Insufficient Balance</h4>
                      <p className="text-sm text-red-700 mt-1">
                        You need at least {amount} {selectedToken.symbol} to stake this amount.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* NGO Info */}
              <div className="card p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={ngo.logoURI}
                    alt={ngo.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{ngo.name}</h3>
                    {ngo.isVerified && (
                      <span className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {ngo.description}
                </p>
                <Link
                  href={`/ngo/${ngo.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View Full Details →
                </Link>
              </div>

              {/* Estimation Summary */}
              {amount && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Yield Estimation
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stake Amount:</span>
                      <span className="font-medium">{amount} {selectedToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lock Period:</span>
                      <span className="font-medium">{lockPeriod} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated APY:</span>
                      <span className="font-medium">{estimatedAPY}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Yield:</span>
                      <span className="font-medium">{estimatedYield.toFixed(4)} {selectedToken.symbol}</span>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex justify-between">
                      <span className="text-green-600">To NGO ({yieldContribution}%):</span>
                      <span className="font-medium text-green-600">
                        {yieldToNGO.toFixed(4)} {selectedToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">To You ({100 - yieldContribution}%):</span>
                      <span className="font-medium text-blue-600">
                        {yieldToUser.toFixed(4)} {selectedToken.symbol}
                      </span>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">You Get Back:</span>
                      <span className="text-gray-900">
                        {(parseFloat(amount) + yieldToUser).toFixed(4)} {selectedToken.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-blue-700">
                        This is an estimate based on current APY rates. Actual yields may vary.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lock Period Info */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Staking Terms
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Lock Period:</p>
                    <p className="font-medium">{lockPeriod} months</p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Early Withdrawal:</p>
                    <p className="font-medium text-red-600">Not allowed</p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Yield Distribution:</p>
                    <p className="font-medium">Monthly to NGO</p>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-1">Principal Return:</p>
                    <p className="font-medium text-green-600">100% guaranteed</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-yellow-700">
                      Your tokens will be locked for the selected period. Plan accordingly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StakePage;