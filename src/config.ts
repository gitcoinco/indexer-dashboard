export const REFRESH_INTERVAL = 5000; // 5 seconds
export const ALERT_THRESHOLD = Number(process.env.NEXT_PUBLIC_ALERT_THRESHOLD) || 15;

export const ENVIO_URL = process.env.NEXT_PUBLIC_ENVIO_URL;
export const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL;
export const SLACK_WEBHOOK_URL = process.env.VITE_SLACK_WEBHOOK_URL;

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

export const chainConfigs = {
  '1': { 
    name: 'Ethereum',
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || 'https://eth.llamarpc.com'
  },
  '10': { 
    name: 'Optimism',
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io'
  },
  '42': { 
    name: 'LUKSO',
    rpcUrl: process.env.NEXT_PUBLIC_LUKSO_RPC_URL || 'https://rpc.lukso.gateway.fm'
  },
  '100': { 
    name: 'Gnosis',
    rpcUrl: process.env.NEXT_PUBLIC_GNOSIS_RPC_URL || 'https://rpc.gnosischain.com'
  },
  '137': { 
    name: 'Polygon',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com'
  },
  '250': { 
    name: 'Fantom',
    rpcUrl: process.env.NEXT_PUBLIC_FANTOM_RPC_URL || 'https://rpc.ftm.tools'
  },
  '295': { 
    name: 'Hedera',
    rpcUrl: process.env.NEXT_PUBLIC_HEDERA_RPC_URL || 'https://mainnet.hashio.io/api'
  },
  '324': { 
    name: 'zkSync Era',
    rpcUrl: process.env.NEXT_PUBLIC_ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io'
  },
  '1088': { 
    name: 'Metis',
    rpcUrl: process.env.NEXT_PUBLIC_METIS_RPC_URL || 'https://andromeda.metis.io/?owner=1088'
  },
  '1329': { 
    name: 'SEI',
    rpcUrl: process.env.NEXT_PUBLIC_SEI_RPC_URL || 'https://sei-rpc.polkachu.com'
  },
  '8453': { 
    name: 'Base',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
  },
  '11155111': { 
    name: 'Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'
  },
  '42161': { 
    name: 'Arbitrum',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc'
  },
  '42220': { 
    name: 'Celo',
    rpcUrl: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org'
  },
  '43114': { 
    name: 'Avalanche',
    rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc'
  },
  '534352': { 
    name: 'Scroll',
    rpcUrl: process.env.NEXT_PUBLIC_SCROLL_RPC_URL || 'https://rpc.scroll.io'
  }
} as const;

export const chains = Object.entries(chainConfigs).map(([id, config]) => ({
  id,
  name: config.name,
  rpcUrl: config.rpcUrl
}));