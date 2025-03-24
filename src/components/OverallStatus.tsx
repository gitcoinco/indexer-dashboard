import React from 'react';
import { BlockInfo } from '../types';
import { calculateSyncStatus } from '../utils';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface OverallStatusProps {
  blockInfos: Record<string, BlockInfo>;
  lastUpdated: string;
  refreshInterval: number;
}

export function OverallStatus({ blockInfos, lastUpdated, refreshInterval }: OverallStatusProps) {
  const statuses = Object.values(blockInfos).map(info => calculateSyncStatus(info));
  const totalSyncs = statuses.length * 3; // 3 sync types per chain
  const healthySyncs = statuses.reduce((acc, status) => {
    return acc + Object.values(status).filter(sync => sync >= 98).length;
  }, 0);

  const overallHealth = (healthySyncs / totalSyncs) * 100;
  const isHealthy = overallHealth >= 98;

  return (
    <div className={`p-6 rounded-lg ${isHealthy ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} flex items-center justify-between shadow-sm`}>
      <div className="flex items-center space-x-4">
        {isHealthy ? (
          <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-red-500 dark:text-red-400" />
        )}
        <div>
          <h2 className="text-xl font-semibold dark:text-white">
            {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {healthySyncs} of {totalSyncs} sync points healthy
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Updated every <strong className="text-gray-700 dark:text-gray-300">{refreshInterval / 1000}s</strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated <strong className="text-gray-700 dark:text-gray-300">{lastUpdated}</strong>
        </p>
      </div>
    </div>
  );
}