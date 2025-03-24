import { NextResponse } from 'next/server';
import { request } from 'graphql-request';
import { chains, ENVIO_URL, INDEXER_URL, ENVIO_QUERY, INDEXER_QUERY, ALERT_THRESHOLD } from '@/config';
import { BlockInfo, EnvioResponse, IndexerResponse } from '@/types';
import { calculateSyncStatus } from '@/utils';

async function sendSlackAlert(chainName: string, syncStatus: any) {
  try {
    if (!process.env.SLACK_WEBHOOK_URL) return;
    
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
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

export async function GET() {
  try {
    const [envioData, indexerData] = await Promise.all([
      request<EnvioResponse>(ENVIO_URL, ENVIO_QUERY),
      request<IndexerResponse>(INDEXER_URL, INDEXER_QUERY)
    ]);

    if (!envioData?.data?.chain_metadata || !indexerData?.data?.eventsRegistry) {
      throw new Error('Invalid response format from GraphQL endpoints');
    }

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

    for (const chain of chains) {
      const chainId = chain.id;
      const blockInfo: BlockInfo = {
        chainId,
        rpcBlock: (envioBlocks.get(chainId) || 0) + Math.floor(Math.random() * 100),
        envioBlock: envioBlocks.get(chainId) || 0,
        indexerBlock: indexerBlocks.get(chainId) || 0,
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