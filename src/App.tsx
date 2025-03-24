import React, { useState, useEffect } from 'react';
import { request } from 'graphql-request';
import { chains, REFRESH_INTERVAL, ALERT_THRESHOLD, ENVIO_URL, INDEXER_URL, ENVIO_QUERY, INDEXER_QUERY } from './config';
import { BlockInfo, EnvioResponse, IndexerResponse } from './types';
import { StatusCard } from './components/StatusCard';
import { OverallStatus } from './components/OverallStatus';
import { calculateSyncStatus } from './utils';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [blockInfos, setBlockInfos] = useState<Record<string, BlockInfo>>({});
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDark).toString());
  };

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const fetchBlockInfo = async () => {
    try {
      // Fetch data from all sources in parallel
      const [envioData, indexerData] = await Promise.all([
        request<EnvioResponse>(ENVIO_URL, ENVIO_QUERY),
        request<IndexerResponse>(INDEXER_URL, INDEXER_QUERY)
      ]);

      if (!envioData?.data?.chain_metadata || !indexerData?.data?.eventsRegistry) {
        throw new Error('Invalid response format from GraphQL endpoints');
      }

      // Create a map of chain IDs to block numbers for each source
      const envioBlocks = new Map(
        envioData.data.chain_metadata.map(({ chain_id, latest_processed_block }) => 
          [chain_id.toString(), latest_processed_block]
        )
      );

      const indexerBlocks = new Map(
        indexerData.data.eventsRegistry.map(({ chainId, blockNumber }) => 
          [chainId.toString(), blockNumber]
        )
      );

      // Update block info for each chain
      const newBlockInfos: Record<string, BlockInfo> = {};
      
      chains.forEach(chain => {
        const chainId = chain.id;
        const blockInfo: BlockInfo = {
          chainId,
          // Mock RPC block number as slightly higher than Envio block
          rpcBlock: (envioBlocks.get(chainId) || 0) + Math.floor(Math.random() * 100),
          envioBlock: envioBlocks.get(chainId) || 0,
          indexerBlock: indexerBlocks.get(chainId) || 0,
          loading: false
        };

        const syncStatus = calculateSyncStatus(blockInfo);
        const needsAlert = Object.values(syncStatus).some(
          percentage => percentage < (100 - ALERT_THRESHOLD)
        );

        if (needsAlert && import.meta.env.VITE_SLACK_WEBHOOK_URL) {
          sendSlackAlert(chain.name, syncStatus);
        }

        newBlockInfos[chainId] = blockInfo;
      });

      setBlockInfos(newBlockInfos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching block info:', error);
      setLoading(false);
    }
  };

  const sendSlackAlert = async (chainName: string, syncStatus: any) => {
    try {
      if (!import.meta.env.VITE_SLACK_WEBHOOK_URL) return;
      
      await fetch(import.meta.env.VITE_SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 Alert: Sync issues detected for ${chainName}\n` +
            `Envio → RPC: ${syncStatus.envioToRpc.toFixed(2)}%\n` +
            `Indexer → Envio: ${syncStatus.indexerToEnvio.toFixed(2)}%\n` +
            `Indexer → RPC: ${syncStatus.indexerToRpc.toFixed(2)}%`
        })
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  };

  useEffect(() => {
    fetchBlockInfo();
    const interval = setInterval(fetchBlockInfo, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blockchain Indexer Status</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleDarkMode}
            >
              {isDark ? (
                <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <OverallStatus blockInfos={blockInfos} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {chains.map(chain => {
            const blockInfo = blockInfos[chain.id] || {
              chainId: chain.id,
              rpcBlock: 0,
              envioBlock: 0,
              indexerBlock: 0,
              loading: true
            };

            return (
              <StatusCard
                key={chain.id}
                chain={chain}
                blockInfo={blockInfo}
                syncStatus={calculateSyncStatus(blockInfo)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;