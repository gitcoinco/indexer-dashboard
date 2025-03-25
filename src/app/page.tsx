'use client';

import { useEffect, useState } from 'react';
import { BlockInfo } from '@/types';
import { StatusCard } from '@/components/StatusCard';
import { OverallStatus } from '@/components/OverallStatus';
import { Sun, Moon, Link, Heart, Search, Clock, Share2, Save } from 'lucide-react';
import { calculateSyncStatus } from '@/utils';
import { chains, REFRESH_INTERVAL, getEndpointUrls } from '@/config';

export default function Home() {
  const [blockInfos, setBlockInfos] = useState<Record<string, BlockInfo>>({});
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [refreshInterval, setRefreshInterval] = useState(REFRESH_INTERVAL);
  const [threshold, setThreshold] = useState(0.001);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUrlInputs, setShowUrlInputs] = useState(false);
  const [customEnvioUrl, setCustomEnvioUrl] = useState('');
  const [customIndexerUrl, setCustomIndexerUrl] = useState('');
  const { ENVIO_URL, INDEXER_URL } = getEndpointUrls();

  useEffect(() => {
    setCustomEnvioUrl(ENVIO_URL || '');
    setCustomIndexerUrl(INDEXER_URL || '');
  }, [ENVIO_URL, INDEXER_URL]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDark).toString());
  };

  const copyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('envio_url', ENVIO_URL || '');
    url.searchParams.set('indexer_url', INDEXER_URL || '');
    navigator.clipboard.writeText(url.toString());
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  const updateUrls = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('envio_url', customEnvioUrl);
    url.searchParams.set('indexer_url', customIndexerUrl);
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { ENVIO_URL, INDEXER_URL } = getEndpointUrls();
        const response = await fetch(`/api/blocks?envio_url=${ENVIO_URL}&indexer_url=${INDEXER_URL}`);
        if (!response.ok) {
          throw new Error('Failed to fetch block info');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setBlockInfos(data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching block info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const hasIssues = (chainId: string) => {
    const blockInfo = blockInfos[chainId];
    if (!blockInfo) return false;
    const status = calculateSyncStatus(blockInfo);
    return Object.values(status).some(value => value < (100 - threshold));
  };

  const getPlaygroundUrl = (indexerUrl: string) => {
    const urlMappings = [
      {
        pattern: /^https:\/\/beta\.indexer\.gitcoin\.co\/v1\/graphql$/,
        replacement: "https://beta.indexer.gitcoin.co/console/api/api-explorer"
      },
      {
        pattern:
          /^https:\/\/indexer\.hyperindex\.xyz\/([a-zA-Z0-9]+)\/v1\/graphql$/,
        replacement:
          "https://envio.dev/app/gitcoinco/gitcoin-indexer/$1/playground",
      },
    ];

    for (const { pattern, replacement } of urlMappings) {
      if (pattern.test(indexerUrl)) {
        return indexerUrl.replace(pattern, replacement);
      }
    }

    return indexerUrl;
  };

  const sortedAndFilteredChains = [...chains]
    .filter(chain => {
      const searchTerm = filterText.toLowerCase();
      if (['issues','issue'].includes(searchTerm)) {
        return hasIssues(chain.id);
      }
      return chain.name.toLowerCase().includes(searchTerm) || chain.id.includes(searchTerm);
    })
    .sort((a, b) => {
      const aInfo = blockInfos[a.id];
      const bInfo = blockInfos[b.id];
      
      if (!aInfo || !bInfo) return 0;
      
      const aStatus = calculateSyncStatus(aInfo);
      const bStatus = calculateSyncStatus(bInfo);
      
      const aHealthy = Object.values(aStatus).every(status => status >= (100 - threshold));
      const bHealthy = Object.values(bStatus).every(status => status >= (100 - threshold));
      
      if (aHealthy === bHealthy) {
        return a.name.localeCompare(b.name);
      }
      
      return aHealthy ? 1 : -1;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blockchain Indexer Status</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUrlInputs(!showUrlInputs)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Link className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Edit URLs</span>
            </button>
            <button
              onClick={copyShareLink}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Share</span>
            </button>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Threshold:</span>
              <input
                type="number"
                min="0.000001"
                max="100"
                step="0.000001"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20 bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none"
                title="Set the threshold percentage for sync status (e.g., 0.001 means 99.999% sync required for healthy status)"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
            </div>
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

        {showUrlInputs && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Envio GraphQL URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customEnvioUrl}
                  onChange={(e) => setCustomEnvioUrl(e.target.value)}
                  placeholder="Enter Envio GraphQL URL"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Indexer GraphQL URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customIndexerUrl}
                  onChange={(e) => setCustomIndexerUrl(e.target.value)}
                  placeholder="Enter Indexer GraphQL URL"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={updateUrls}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Update URLs</span>
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Envio GraphQL:</span>
            </div>
            <a 
              href={ENVIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {ENVIO_URL}
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Indexer GraphQL:</span>
            </div>
            <a 
              href={INDEXER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {INDEXER_URL}
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Envio Playground:</span>
            </div>
            <a 
              href={getPlaygroundUrl(ENVIO_URL || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {getPlaygroundUrl(ENVIO_URL || '')}
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Link className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Indexer Playground:</span>
            </div>
            <a 
              href={getPlaygroundUrl(INDEXER_URL || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {getPlaygroundUrl(INDEXER_URL || '')}
            </a>
          </div>
        </div>

        <OverallStatus 
          blockInfos={blockInfos} 
          lastUpdated={lastUpdated} 
          refreshInterval={refreshInterval}
          threshold={threshold}
        />

        <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder='Filter chains by name, ID, or type "issues" to see problematic chains...'
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       transition-colors duration-200"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAndFilteredChains.map(chain => {
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
                threshold={threshold}
              />
            );
          })}
        </div>

        {sortedAndFilteredChains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No chains found matching your filter.</p>
          </div>
        )}

        {showShareModal && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Share link copied to clipboard!
          </div>
        )}

        <footer className="mt-16 pb-8 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>by the team who survived GG23 indexer monitoring</span>
          </div>
        </footer>
      </div>
    </div>
  );
}