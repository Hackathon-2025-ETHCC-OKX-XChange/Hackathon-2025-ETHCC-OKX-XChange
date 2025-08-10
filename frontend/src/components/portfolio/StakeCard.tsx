import { Stake } from '../../types';
import { Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getExplorerUrl } from '../../config/contracts';

interface StakeCardProps {
  stake: Stake;
  ngoName?: string;
}

export function StakeCard({ stake, ngoName = 'Unknown NGO' }: StakeCardProps) {
  const isUSDC = stake.token.toLowerCase() === '0xa2dCeE55cD951D809C0762574ed4016E31E18419'.toLowerCase();
  const tokenSymbol = isUSDC ? 'USDC' : 'WETH';
  const decimals = isUSDC ? 6 : 18;

  const amount = Number(stake.amount) / Math.pow(10, decimals);
  const estimatedYield = stake.estimatedYield
    ? Number(stake.estimatedYield) / Math.pow(10, decimals)
    : 0;

  const startDate = new Date(Number(stake.startTime) * 1000);
  const endDate = new Date((Number(stake.startTime) + Number(stake.lockPeriod)) * 1000);
  const now = new Date();

  const isCompleted = now >= endDate;
  const timeRemaining = isCompleted ? 'Completed' : formatDistanceToNow(endDate, { addSuffix: true });

  const progress = Math.min((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime()) * 100, 100);

  const yieldToNGO = estimatedYield * Number(stake.yieldContributionRate) / 100;
  const yieldToUser = estimatedYield - yieldToNGO;

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{ngoName}</h3>
          <p className="text-sm text-gray-600">
            {amount.toLocaleString(undefined, {
              maximumFractionDigits: isUSDC ? 2 : 4
            })} {tokenSymbol}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isCompleted ? (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Completed
            </span>
          ) : (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Lock Period Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Yield Information */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Yield Contribution</p>
          <p className="text-sm font-semibold text-gray-900">
            {stake.yieldContributionRate.toString()}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Estimated Total Yield</p>
          <p className="text-sm font-semibold text-gray-900">
            {estimatedYield.toLocaleString(undefined, {
              maximumFractionDigits: isUSDC ? 2 : 4
            })} {tokenSymbol}
          </p>
        </div>
      </div>

      {/* Yield Breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Yield Distribution</span>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">To NGO ({stake.yieldContributionRate.toString()}%):</span>
            <span className="font-medium text-green-600">
              {yieldToNGO.toLocaleString(undefined, {
                maximumFractionDigits: isUSDC ? 2 : 4
              })} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To You ({100 - Number(stake.yieldContributionRate)}%):</span>
            <span className="font-medium text-blue-600">
              {yieldToUser.toLocaleString(undefined, {
                maximumFractionDigits: isUSDC ? 2 : 4
              })} {tokenSymbol}
            </span>
          </div>
        </div>
      </div>

      {/* Time Information */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>
            {isCompleted ? 'Completed' : `Unlocks ${timeRemaining}`}
          </span>
        </div>
        <span>
          Started {formatDistanceToNow(startDate, { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <a
          href={getExplorerUrl('address', stake.ngo)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 btn-secondary text-center py-2 text-sm flex items-center justify-center space-x-1"
        >
          <span>View NGO</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        {isCompleted ? (
          <button className="flex-1 btn-primary py-2 text-sm">
            Withdraw
          </button>
        ) : (
          <button
            disabled
            className="flex-1 bg-gray-100 text-gray-400 py-2 text-sm rounded-lg cursor-not-allowed"
          >
            Locked
          </button>
        )}
      </div>

      {/* Stake ID for reference */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Stake ID: #{stake.id}
        </p>
      </div>
    </div>
  );
}