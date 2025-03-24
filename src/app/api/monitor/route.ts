import { NextResponse } from 'next/server';
import { chains, ENVIO_URL, INDEXER_URL, ENVIO_QUERY, INDEXER_QUERY, ALERT_THRESHOLD, getRpcUrl } from '@/config';
import { BlockInfo, EnvioResponse, IndexerResponse } from '@/types';
import { calculateSyncStatus } from '@/utils';
import { createPublicClient, http } from 'viem';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function sendSlackAlert(chainName: string, syncStatus: any) {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.log('No Slack webhook URL configured, skipping alert');
      return;
    }
    
    console.log(`Sending Slack alert for ${chainName}`);
    
    await fetch(process.env.SLACK_WEBHOOK_URL, {
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

    console.log(`Successfully sent Slack alert for ${chainName}`);
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

async function getLatestBlock(chainId: string) {
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
}

export async function GET() {
  try {
    if (!ENVIO_URL || !INDEXER_URL) {
      throw new Error('Missing required environment variables: ENVIO_URL or INDEXER_URL');
    }

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

    if (!envioData?.data?.chain_metadata || !indexerData?.data?.eventsRegistry) {
      throw new Error('Invalid response format from GraphQL endpoints');
    }

    // Get latest blocks from RPC endpoints
    const rpcBlocks = await Promise.all(chains.map(chain => getLatestBlock(chain.id)));

    const envioBlocks = new Map(
      envioData.data.chain_metadata.map(({ chain_id, latest_processed_block }: { chain_id: string | number; latest_processed_block: string }) => 
        [chain_id.toString(), parseInt(latest_processed_block, 10) || 0]
      )
    );

    const indexerBlocks = new Map(
      indexerData.data.eventsRegistry.map(({ chainId, blockNumber }: { chainId: string; blockNumber: string }) => 
        [chainId.toString(), parseInt(blockNumber, 10) || 0]
      )
    );

    for (let i = 0; i < chains.length; i++) {
      const chain = chains[i];
      const chainId = chain.id;
      const blockInfo: BlockInfo = {
        chainId,
        rpcBlock: rpcBlocks[i] || 0,
        envioBlock: envioBlocks.get(chainId) as number || 0,
        indexerBlock: indexerBlocks.get(chainId) as number || 0,
        loading: false
      };

      const syncStatus = calculateSyncStatus(blockInfo);
      const needsAlert = Object.values(syncStatus).some(
        percentage => percentage < (100 - ALERT_THRESHOLD)
      );

      if (needsAlert) {
        await sendSlackAlert(chain.name, syncStatus);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error in monitoring task:', error);
    return NextResponse.json({ error: 'Monitoring task failed' }, { status: 500 });
  }
}