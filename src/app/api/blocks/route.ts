import { NextResponse } from 'next/server';
import { request } from 'graphql-request';
import { chains, ENVIO_QUERY, INDEXER_QUERY, getRpcUrl, getEndpointUrls } from '@/config';
import { BlockInfo, EnvioResponse, IndexerResponse } from '@/types';
import { createPublicClient, http } from 'viem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try { 
    const url = new URL(req.url);
    const ENVIO_URL = url.searchParams.get('envio_url');
    const INDEXER_URL = url.searchParams.get('indexer_url');
    
    if (!ENVIO_URL || !INDEXER_URL) {
      console.error('Missing required environment variables:', {
        ENVIO_URL: !!ENVIO_URL,
        INDEXER_URL: !!INDEXER_URL
      });
      throw new Error('Missing required environment variables: ENVIO_URL or INDEXER_URL');
    }

    const getLatestBlock = async (chainId: string) => {
      const rpcUrl = getRpcUrl(chainId);
      if (!rpcUrl) {
        console.warn(`No RPC URL configured for chain ${chainId}`);
        return 0;
      }

      try {
        const client = createPublicClient({
          transport: http(rpcUrl)
        });
        const block = await client.getBlock({ blockTag: 'latest' });
        return Number(block.number);
      } catch (error) {
        console.error(`Failed to fetch block for chain ${chainId}:`, error);
        return 0;
      }
    };

    // Fetch data from both GraphQL endpoints
    const [envioResponse, indexerResponse] = await Promise.all([
      fetch(ENVIO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ENVIO_QUERY })
      }),
      fetch(INDEXER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: INDEXER_QUERY })
      })
    ]);

    if (!envioResponse.ok || !indexerResponse.ok) {
      throw new Error('Failed to fetch from GraphQL endpoints');
    }

    const [envioData, indexerData] = await Promise.all([
      envioResponse.json(),
      indexerResponse.json()
    ]);

    // Validate response structure
    if (!envioData?.data?.chain_metadata || !indexerData?.data?.eventsRegistry) {
      console.error('Invalid response structure:', { envioData, indexerData });
      throw new Error('Invalid response structure from GraphQL endpoints');
    }

    const rpcBlocks = await Promise.all(chains.map(chain => getLatestBlock(chain.id)));

    const envioBlocks = new Map(
      envioData.data.chain_metadata.map(({ chain_id, latest_processed_block, num_events_processed }: { chain_id: string | number; latest_processed_block: string; num_events_processed: string }) => [
        chain_id.toString(),
        {
          block: parseInt(latest_processed_block, 10) || 0,
          events: parseInt(num_events_processed, 10) || 0
        }
      ])
    );

    const indexerBlocks = new Map(
      indexerData.data.eventsRegistry.map(({ chainId, blockNumber }: { chainId: string; blockNumber: string }) => [
        chainId.toString(),
        parseInt(blockNumber, 10) || 0
      ])
    );

    const blockInfos: Record<string, BlockInfo> = {};
    
    chains.forEach((chain, index) => {
      const envioData = envioBlocks.get(chain.id) as { block: number; events: number };
      const indexerBlock = indexerBlocks.get(chain.id) as number;
      const rpcBlock = rpcBlocks[index];
      
      blockInfos[chain.id] = {
        chainId: chain.id,
        rpcBlock: rpcBlock || 0,
        envioBlock: envioData?.block || 0,
        indexerBlock,
        numEventsProcessed: envioData?.events,
        loading: false
      };
    });

    return NextResponse.json(blockInfos);
  } catch (error) {
    console.error('Error in /api/blocks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}