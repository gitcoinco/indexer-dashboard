import { BlockInfo, SyncStatus } from './types';

export function calculateSyncStatus(blockInfo: BlockInfo): SyncStatus {
  const envioToRpc = calculatePercentage(blockInfo.envioBlock, blockInfo.rpcBlock);
  const indexerToEnvio = calculatePercentage(blockInfo.indexerBlock, blockInfo.envioBlock);
  const indexerToRpc = calculatePercentage(blockInfo.indexerBlock, blockInfo.rpcBlock);

  return {
    envioToRpc,
    indexerToEnvio,
    indexerToRpc
  };
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return (current / target) * 100;
}

export function getStatusColor(percentage: number): string {
  if (percentage >= 98) return 'bg-green-500';
  if (percentage >= 90) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString();
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}