export const REFRESH_INTERVAL = 5000; // 5 seconds
export const ALERT_THRESHOLD = 15; // 15% difference triggers alert

export const ENVIO_URL = 'https://indexer.hyperindex.xyz/a5d76f2/v1/graphql';
export const INDEXER_URL = 'https://beta.indexer.gitcoin.co/v1/graphql';

export const ENVIO_QUERY = /* GraphQL */ `
  {
    chain_metadata {
      latest_processed_block
      chain_id
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

const chainConfigs: Record<number, { name: string }> = {
  1: { name: 'Ethereum' },
  10: { name: 'Optimism' },
  42: { name: 'Lukso' },
  100: { name: 'Gnosis' },
  137: { name: 'Polygon' },
  250: { name: 'Fantom' },
  295: { name: 'Hedera' },
  324: { name: 'zkSync Era' },
  1088: { name: 'Metis' },
  1329: { name: 'Sei' },
  8453: { name: 'Base' },
  11155111: { name: 'Sepolia' },
  42161: { name: 'Arbitrum' },
  42220: { name: 'Celo' },
  43114: { name: 'Avalanche' },
  534352: { name: 'Scroll' }
};

export const chains = Object.entries(chainConfigs).map(([chainId, config]) => ({
  id: chainId,
  name: config.name
}));