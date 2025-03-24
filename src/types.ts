export interface Chain {
  id: string;
  name: string;
  rpcUrl: string;
}

export interface BlockInfo {
  chainId: string;
  rpcBlock: number;
  envioBlock: number;
  indexerBlock: number;
  numEventsProcessed?: number;
  loading: boolean;
  error?: string;
}

export interface SyncStatus {
  envioToRpc: number;
  indexerToEnvio: number;
  indexerToRpc: number;
}

export interface EnvioResponse {
  data: {
    chain_metadata: Array<{
      latest_processed_block: number;
      chain_id: number | string;
      num_events_processed: number;
    }>;
  };
}

export interface IndexerResponse {
  data: {
    eventsRegistry: Array<{
      chainId: string;
      blockNumber: number | string;
    }>;
  };
}