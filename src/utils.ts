import { BlockInfo, SyncStatus } from './types';

export function calculateSyncStatus(blockInfo: BlockInfo): SyncStatus {
  const { rpcBlock, envioBlock, indexerBlock } = blockInfo;

  // Return 0 if target block is 0 to avoid division by zero
  const calculatePercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    // Use more precise calculation to handle small differences
    const difference = target - current;
    const percentage = ((target - difference) / target) * 100;
    return Math.max(0, Math.min(100, percentage)); // Ensure result is between 0 and 100
  };

  return {
    envioToRpc: calculatePercentage(envioBlock, rpcBlock),
    indexerToEnvio: calculatePercentage(indexerBlock, envioBlock),
    indexerToRpc: calculatePercentage(indexerBlock, rpcBlock)
  };
}

export function getStatusColor(percentage: number, threshold: number): string {
  if (percentage >= (100 - threshold)) return 'bg-green-500';
  if (percentage >= 90) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString();
}

export function formatPercentage(percentage: number): string {
  // Show more decimal places for high percentages
  if (percentage > 99.99) {
    return `${percentage.toFixed(6)}%`;
  }
  return `${percentage.toFixed(2)}%`;
}