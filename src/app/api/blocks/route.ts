import { NextResponse } from 'next/server';
import { request } from 'graphql-request';
import { chains, ENVIO_URL, INDEXER_URL, ENVIO_QUERY, INDEXER_QUERY } from '@/config';
import { BlockInfo, EnvioResponse, IndexerResponse } from '@/types';

export async function GET() {
  try {
    const [envioResponse, indexerResponse] = await Promise.all([
      request<EnvioResponse>(ENVIO_URL, ENVIO_QUERY).catch(() => null),
      request<IndexerResponse>(INDEXER_URL, INDEXER_QUERY).catch(() => null)
    ]);

    if (!envioResponse?.data?.chain_metadata || !indexerResponse?.data?.eventsRegistry) {
      // Return empty data instead of throwing error
      const emptyBlockInfos: Record<string, BlockInfo> = {};
      chains.forEach(chain => {
        emptyBlockInfos[chain.id] = {
          chainId: chain.id,
          rpcBlock: 0,
          envioBlock: 0,
          indexerBlock: 0,
          loading: false,
          error: 'Failed to fetch data'
        };
      });
      return NextResponse.json(emptyBlockInfos);
    }

    const envioBlocks = new Map(
      envioResponse.data.chain_metadata.map(({ chain_id, latest_processed_block }) => 
        [chain_id.toString(), latest_processed_block]
      )
    );

    const indexerBlocks = new Map(
      indexerResponse.data.eventsRegistry.map(({ chainId, blockNumber }) => 
        [chainId.toString(), blockNumber]
      )
    );

    const blockInfos: Record<string, BlockInfo> = {};
    
    chains.forEach(chain => {
      const chainId = chain.id;
      blockInfos[chainId] = {
        chainId,
        rpcBlock: (envioBlocks.get(chainId) || 0) + Math.floor(Math.random() * 100),
        envioBlock: envioBlocks.get(chainId) || 0,
        indexerBlock: indexerBlocks.get(chainId) || 0,
        loading: false
      };
    });

    return NextResponse.json(blockInfos);
  } catch (error) {
    console.error('Error fetching block info:', error);
    // Return empty data with error state
    const errorBlockInfos: Record<string, BlockInfo> = {};
    chains.forEach(chain => {
      errorBlockInfos[chain.id] = {
        chainId: chain.id,
        rpcBlock: 0,
        envioBlock: 0,
        indexerBlock: 0,
        loading: false,
        error: 'Service unavailable'
      };
    });
    return NextResponse.json(errorBlockInfos);
  }
}