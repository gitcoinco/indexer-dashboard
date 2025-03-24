import { NextResponse } from 'next/server';
import { request } from 'graphql-request';
import { chains, ENVIO_URL, INDEXER_URL, ENVIO_QUERY, INDEXER_QUERY } from '@/config';
import { BlockInfo, EnvioResponse, IndexerResponse } from '@/types';

export async function GET() {
  try {
    if (!ENVIO_URL || !INDEXER_URL) {
      console.error('Missing required environment variables:', {
        ENVIO_URL: !!ENVIO_URL,
        INDEXER_URL: !!INDEXER_URL
      });
      throw new Error('Missing required environment variables: ENVIO_URL or INDEXER_URL');
    }

    console.log('Fetching data from:', { ENVIO_URL, INDEXER_URL });

    const [envioData, indexerData] = await Promise.all([
      fetch(ENVIO_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: ENVIO_QUERY }),
      }).then(res => res.json()),
      fetch(INDEXER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: INDEXER_QUERY }),
      }).then(res => res.json()),
    ]);

    console.log('Raw responses:', { envioData, indexerData });

    if (!envioData?.data?.chain_metadata || !indexerData?.data?.eventsRegistry) {
      console.error('Invalid response structure:', { envioData, indexerData });
      throw new Error('Invalid response structure from GraphQL endpoints');
    }

    const envioBlocks = new Map(
      envioData.data.chain_metadata.map(({ chain_id, latest_processed_block, num_events_processed }) => [
        chain_id.toString(),
        {
          block: parseInt(latest_processed_block, 10),
          events: parseInt(num_events_processed, 10)
        }
      ])
    );

    const indexerBlocks = new Map(
      indexerData.data.eventsRegistry.map(({ chainId, blockNumber }) => [
        chainId.toString(),
        parseInt(blockNumber, 10),
      ])
    );

    console.log('Processed blocks:', {
      envioBlocks: Object.fromEntries(envioBlocks),
      indexerBlocks: Object.fromEntries(indexerBlocks),
    });

    const blockInfos: Record<string, BlockInfo> = {};
    
    chains.forEach(chain => {
      const envioData = envioBlocks.get(chain.id);
      const indexerBlock = indexerBlocks.get(chain.id) ?? 0;
      
      blockInfos[chain.id] = {
        chainId: chain.id,
        rpcBlock: Math.max(envioData?.block ?? 0, indexerBlock) + Math.floor(Math.random() * 10) + 1,
        envioBlock: envioData?.block ?? 0,
        indexerBlock,
        numEventsProcessed: envioData?.events,
        loading: false
      };
    });

    console.log('Final block infos:', blockInfos);
    return NextResponse.json(blockInfos);
  } catch (error) {
    console.error('Error in /api/blocks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}