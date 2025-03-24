import React from 'react';
import { BlockInfo, Chain, SyncStatus } from '../types';
import { getStatusColor, formatNumber, formatPercentage } from '../utils';
import { AlertTriangle, CheckCircle, Link } from 'lucide-react';

interface StatusCardProps {
  chain: Chain;
  blockInfo: BlockInfo;
  syncStatus: SyncStatus;
}

export function StatusCard({ chain, blockInfo, syncStatus }: StatusCardProps) {
  const isHealthy = Object.values(syncStatus).every(status => status >= 98);

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

      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
        <Link className="w-4 h-4" />
        <span className="truncate" title={chain.rpcUrl}>{chain.rpcUrl}</span>
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
        <SyncBar label="Envio → RPC" percentage={syncStatus.envioToRpc} />
        <SyncBar label="Indexer → Envio" percentage={syncStatus.indexerToEnvio} />
        <SyncBar label="Indexer → RPC" percentage={syncStatus.indexerToRpc} />
      </div>
    </div>
  );
}

function SyncBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium dark:text-white">{formatPercentage(percentage)}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStatusColor(percentage)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}