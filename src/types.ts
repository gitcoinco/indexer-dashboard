export interface Chain {
  id: string;
  name: string;
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

export interface ChainMetadata {
  chain_id: string | number;
  latest_processed_block: string;
  num_events_processed: string;
}

export interface EnvioResponse {
  data: {
    chain_metadata: ChainMetadata[];
  };
}

export interface EventRegistry {
  chainId: string;
  blockNumber: string;
}

export interface IndexerResponse {
  data: {
    eventsRegistry: EventRegistry[];
  };
}