# Blockchain Indexer Status Dashboard

A real-time dashboard for monitoring blockchain indexer synchronization status across multiple networks. This application tracks and displays the sync status between RPC nodes, Envio indexer, and the main indexer.

## Features

- Real-time monitoring of blockchain sync status
- Support for multiple networks (Ethereum, Polygon, Arbitrum, etc.)
- Dark/light mode theme support
- Event processing tracking
- Auto-refresh every 30 seconds
- Responsive design for all screen sizes
- Detailed sync status visualization
- RPC endpoint configuration via environment variables

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- GraphQL (with graphql-request)
- Lucide React for icons

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see Configuration section)
4. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# GraphQL Endpoints
NEXT_PUBLIC_ENVIO_URL=https://indexer.hyperindex.xyz/a5d76f2/v1/graphql
NEXT_PUBLIC_INDEXER_URL=https://beta.indexer.gitcoin.co/v1/graphql

# RPC URLs (customize as needed)
NEXT_PUBLIC_ETH_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://mainnet.optimism.io
# ... Add other chain RPC URLs as needed

# Alert Configuration
NEXT_PUBLIC_ALERT_THRESHOLD=15 # Percentage difference that triggers alerts
```

## Architecture

### Frontend Components

- **StatusCard**: Displays individual chain status
  - Block numbers (RPC, Envio, Indexer)
  - Sync percentages
  - Events processed
  - RPC endpoint information

- **OverallStatus**: Shows system-wide health status
  - Aggregate sync status
  - Quick view of all chains
  - Last update timestamp

### API Routes

- **/api/blocks**: Fetches and aggregates blockchain data
  - Combines data from Envio and Indexer
  - Calculates sync percentages
  - Provides unified response to frontend

- **/api/monitor**: Handles monitoring and alerts
  - Periodic health checks
  - Sync status verification
  - Alert triggering based on thresholds

### Data Flow

1. Frontend initiates request to `/api/blocks`
2. API fetches data from:
   - Envio GraphQL endpoint
   - Indexer GraphQL endpoint
3. Data is processed and sync status calculated
4. Frontend updates UI with new data
5. Process repeats every 30 seconds

## Adding New Chains

Add new chains to the `chainConfigs` object in `src/config.ts`:

```typescript
export const chainConfigs = {
  '1': { 
    name: 'Ethereum',
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || 'https://eth.llamarpc.com'
  },
  // Add new chain:
  '56': { 
    name: 'BNB Chain',
    rpcUrl: process.env.NEXT_PUBLIC_BNB_RPC_URL || 'https://bsc-dataseed.binance.org'
  }
};
```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Run production server
- `npm run lint`: Run ESLint

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── blocks/
│   │   └── monitor/
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── StatusCard.tsx
│   └── OverallStatus.tsx
├── config.ts
├── types.ts
└── utils.ts
```

## Monitoring and Alerts

The system monitors:
- Block sync status
- Event processing
- Network health
- RPC endpoint availability

Alert thresholds:
- Default: 15% difference triggers alerts
- Configurable via `NEXT_PUBLIC_ALERT_THRESHOLD`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and feature requests, please open an issue on the repository.