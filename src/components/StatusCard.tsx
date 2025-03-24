import React from 'react';
import { BlockInfo, Chain, SyncStatus } from '../types';
import { getStatusColor, formatNumber, formatPercentage } from '../utils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface StatusCardProps {
  chain: Chain;
  blockInfo: BlockInfo;
  syncStatus: SyncStatus;
  threshold?: number;
}

export function StatusCard({ chain, blockInfo, syncStatus, threshold = 0.001 }: StatusCardProps) {
  const isHealthy = Object.values(syncStatus).every(status => status >= (100 - threshold));

  const getBlocksBehind = (current: number, target: number): number => {
    return Math.max(0, target - current);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold dark:text-white">{chain.name}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">#{chain.id}</span>
        </div>
        {isHealthy ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-red-500" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">RPC Block</p>
          <p className="text-lg font-semibold dark:text-white">{formatNumber(blockInfo.rpcBlock)}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Envio Block</p>
          <p className="text-lg font-semibold dark:text-white">{formatNumber(blockInfo.envioBlock)}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Indexer Block</p>
          <p className="text-lg font-semibold dark:text-white">{formatNumber(blockInfo.indexerBlock)}</p>
        </div>
      </div>

      {blockInfo.numEventsProcessed !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Events Processed On Envio: {formatNumber(blockInfo.numEventsProcessed)}
        </div>
      )}

      <div className="space-y-3">
        <SyncBar 
          label="Envio Sync" 
          tooltip="Envio's sync progress with the latest blockchain state"
          percentage={syncStatus.envioToRpc}
          threshold={threshold}
          blocksBehind={getBlocksBehind(blockInfo.envioBlock, blockInfo.rpcBlock)}
        />
        <SyncBar 
          label="Event Processing" 
          tooltip="Indexer's progress in processing Envio events"
          percentage={syncStatus.indexerToEnvio}
          threshold={threshold}
          blocksBehind={getBlocksBehind(blockInfo.indexerBlock, blockInfo.envioBlock)}
        />
        <SyncBar 
          label="Overall Sync" 
          tooltip="Indexer's overall sync status with the blockchain"
          percentage={syncStatus.indexerToRpc}
          threshold={threshold}
          blocksBehind={getBlocksBehind(blockInfo.indexerBlock, blockInfo.rpcBlock)}
        />
      </div>
    </div>
  );
}

interface SyncBarProps {
  label: string;
  tooltip: string;
  percentage: number;
  threshold: number;
  blocksBehind: number;
}

function SyncBar({ label, tooltip, percentage, threshold, blocksBehind }: SyncBarProps) {
  const isHealthy = percentage >= (100 - threshold);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-1.5 group relative">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
          <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 -bottom-12 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg w-56 z-10 shadow-lg">
            {tooltip}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatPercentage(percentage)}
          </span>
          {blocksBehind > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({formatNumber(blocksBehind)} blocks behind)
            </span>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStatusColor(percentage, threshold)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}