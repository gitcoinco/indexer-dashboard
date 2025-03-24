# Blockchain Indexer Status Dashboard

A real-time dashboard for monitoring blockchain indexer synchronization status across multiple networks. This application tracks and displays the sync status between RPC nodes, Envio indexer, and the main indexer.

## Features

- Real-time monitoring of blockchain sync status
- Support for multiple networks
- Dark/light mode
- Slack alerts for sync issues
- Auto-refresh every 30 seconds

## Backend Architecture

The backend consists of two main components:

1. **API Routes** (`/api/blocks`):
   - Fetches data from Envio and Indexer GraphQL endpoints
   - Aggregates block numbers and sync status
   - Provides unified data to the frontend

2. **Monitoring Service** (`/api/monitor`):
   - Runs periodic checks (every 5 minutes)
   - Sends Slack alerts when sync issues are detected
   - Configurable alert thresholds

### How it Works

1. The backend fetches data from two GraphQL endpoints:
   - Envio: Provides latest processed block numbers
   - Indexer: Provides current indexed block numbers

2. Data is compared to calculate sync percentages:
   - Envio → RPC sync status
   - Indexer → Envio sync status
   - Indexer → RPC sync status

3. Alert monitoring checks if any sync percentage falls below the threshold (default: 85%)

## Setup Instructions

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file with:

```env
# GraphQL Endpoints
ENVIO_URL=https://your-envio-endpoint/graphql
INDEXER_URL=https://your-indexer-endpoint/graphql

# Slack Alerts (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# Alert Configuration
ALERT_THRESHOLD=15 # Percentage difference that triggers alerts
```

### 3. Running the Application

Development mode:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## Adding New Networks

1. Update the chain configuration in `src/config.ts`:

```typescript
const chainConfigs: Record<number, { name: string }> = {
  // Existing networks...
  
  // Add new network
  56: { name: 'BNB Chain' },
};
```

2. Ensure the network is supported by your Envio and Indexer endpoints

3. The dashboard will automatically display the new network

## Slack Alerts Setup

1. Create a Slack App in your workspace
   - Go to https://api.slack.com/apps
   - Click "Create New App"
   - Choose "From scratch"
   - Select your workspace

2. Add Incoming Webhooks
   - Navigate to "Incoming Webhooks"
   - Activate Incoming Webhooks
   - Click "Add New Webhook to Workspace"
   - Choose the channel for alerts

3. Copy the Webhook URL and add it to your `.env`:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
   ```

4. Alerts will be sent when:
   - Sync percentage drops below threshold
   - Services become unavailable
   - Network connectivity issues occur

## Alert Format

Slack alerts include:
- Chain name
- Current sync percentages
- Specific sync issues detected
- Timestamp

Example:
```
🚨 Alert: Sync issues detected for Ethereum
Envio → RPC: 82.5%
Indexer → Envio: 95.2%
Indexer → RPC: 78.9%
```

## Development Notes

- The frontend updates every 30 seconds
- Monitoring service runs every 5 minutes
- Alert threshold is configurable via `ALERT_THRESHOLD`
- Network errors are handled gracefully with fallback states