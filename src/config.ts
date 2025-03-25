export const REFRESH_INTERVAL = 5000; // 5 seconds
export const ALERT_THRESHOLD = Number(process.env.NEXT_PUBLIC_ALERT_THRESHOLD) || 15;

// Get URLs from URL parameters if available, otherwise use environment variables
export const getEndpointUrls = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return {
      ENVIO_URL: process.env.NEXT_PUBLIC_ENVIO_URL,
      INDEXER_URL: process.env.NEXT_PUBLIC_INDEXER_URL
    };
  }

  // Client-side
  const params = new URLSearchParams(window.location.search);

  return {
    ENVIO_URL: params.get('envio_url') || process.env.NEXT_PUBLIC_ENVIO_URL,
    INDEXER_URL: params.get('indexer_url') || process.env.NEXT_PUBLIC_INDEXER_URL
  };
};

export const ENVIO_QUERY = /* GraphQL */ `
  query latestBlock {
    chain_metadata {
      chain_id
      latest_processed_block
      num_events_processed
    }
  }
`;

export const INDEXER_QUERY = /* GraphQL */ `
  {
    eventsRegistry {
      chainId
      blockNumber
    }
  }
`;

// Client-side chain configuration (no RPC URLs)
export const chainConfigs = {
  '1': { name: 'Ethereum' },
  '10': { name: 'Optimism' },
  '42': { name: 'LUKSO' },
  '100': { name: 'Gnosis' },
  '137': { name: 'Polygon' },
  '250': { name: 'Fantom' },
  '295': { name: 'Hedera' },
  '324': { name: 'zkSync Era' },
  '1088': { name: 'Metis' },
  '1329': { name: 'SEI' },
  '8453': { name: 'Base' },
  '11155111': { name: 'Sepolia' },
  '42161': { name: 'Arbitrum' },
  '42220': { name: 'Celo' },
  '43114': { name: 'Avalanche' },
  '534352': { name: 'Scroll' }
} as const;

// Server-side RPC configuration
export const getRpcUrl = (chainId: string): string => {
  const rpcUrls: Record<string, string> = {
    '1': process.env.ETH_RPC_URL || '',
    '10': process.env.OPTIMISM_RPC_URL || '',
    '42': process.env.LUKSO_RPC_URL || '',
    '100': process.env.GNOSIS_RPC_URL || '',
    '137': process.env.POLYGON_RPC_URL || '',
    '250': process.env.FANTOM_RPC_URL || '',
    '295': process.env.HEDERA_RPC_URL || '',
    '324': process.env.ZKSYNC_RPC_URL || '',
    '1088': process.env.METIS_RPC_URL || '',
    '1329': process.env.SEI_RPC_URL || '',
    '8453': process.env.BASE_RPC_URL || '',
    '11155111': process.env.SEPOLIA_RPC_URL || '',
    '42161': process.env.ARBITRUM_RPC_URL || '',
    '42220': process.env.CELO_RPC_URL || '',
    '43114': process.env.AVALANCHE_RPC_URL || '',
    '534352': process.env.SCROLL_RPC_URL || ''
  };
  return rpcUrls[chainId] || '';
};

export const chains = Object.entries(chainConfigs).map(([id, config]) => ({
  id,
  name: config.name
}));