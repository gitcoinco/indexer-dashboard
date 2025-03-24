'use client';

import { useEffect, useState } from 'react';
import { BlockInfo } from '@/types';
import { StatusCard } from '@/components/StatusCard';
import { OverallStatus } from '@/components/OverallStatus';
import { Sun, Moon, Link, Heart } from 'lucide-react';
import { calculateSyncStatus } from '@/utils';
import { chains, ENVIO_URL, INDEXER_URL, REFRESH_INTERVAL } from '@/config';

export default function Home() {
  const [blockInfos, setBlockInfos] = useState<Record<string, BlockInfo>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(new Date().toLocaleTimeString());
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/blocks');
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
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gitcoin Indexer Status</h1>
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
        </div>

        <OverallStatus blockInfos={blockInfos} lastUpdated={lastUpdated} />

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