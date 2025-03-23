# GSAW - Google Sheets as a Wallet

Anyone can create a copy of a Google Sheet to start exploring Web3. We can develop a wallet system embedded with a secret key directly in the sheet. It could include WalletConnect support, implemented either through AppScript or a custom web extension that reads from the sheet. An agent will handle all abstraction and maintenance of the sheet, ultimately eliminating any friction in Web3 interactions. This single Google Sheet will serve as the gateway to all Web3 activities—trading, portfolio management, liquidity provision, staking, app connections, smart contract interactions, and more—encompassing everything Web3 has to offer.

# Google Sheets Wallet Agent

A cryptocurrency wallet implementation using Google Sheets as the interface. This wallet uses a deterministic method to generate a wallet based on the Sheet ID, owner's email, and a salt value.

## Features

- Deterministic wallet generation from Sheet ID + owner's email + salt
- Wallet address display in "Settings" sheet
- Transaction tracking in "Wallet Explorer" sheet
- WalletConnect integration for dApp connections in "ActiveSessions" sheet
- Transaction/signature request handling in "Pending Transactions" sheet
- Event logging in "Logs" sheet
- Automatic detection of sheet owners through Google Drive API
- Multi-sheet management: runs wallet agents for all accessible sheets

## Prerequisites

- Node.js (v16+)
- A Google Sheets API service account (for authentication)
- WalletConnect Project ID (get from https://cloud.walletconnect.com/app)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd sheets
   yarn install
   ```
3. Configure your environment variables in `.env`:
   - `PROJECT_ID`: Your WalletConnect Project ID
   - `SALT`: Salt for wallet generation (default: xAISalt2025)
   - `ETH_RPC_URL`: Ethereum RPC URL (default: Goerli testnet)
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google service account credentials JSON file

4. Set up Google Sheets API credentials:
   - Create a service account in Google Cloud Console
   - Enable Google Sheets API and Google Drive API
   - Download the service account JSON key file
   - Set the path to this file in your `.env` or use the default "./credentials.json" location
   - Share your Google Sheets with the service account email address

## Usage

Run the wallet manager with:

```
yarn ts-node index.ts
```

The wallet manager will:
1. Find all Google Sheets that your service account has access to
2. For each accessible sheet:
   - Create necessary sheets if they don't exist (Settings, Wallet Explorer, etc.)
   - Determine the sheet owner from Google Drive metadata
   - Generate a deterministic wallet based on Sheet ID + owner's email
   - Display the wallet address in the Settings sheet
   - Start monitoring for blockchain transactions, dApp connections, and signature requests

No manual entry of email addresses is required - the system detects everything automatically!

## Sheet Structure

- **Settings**: Contains wallet address and configuration information, including the sheet owner's email
- **Wallet Explorer**: Tracks transactions related to the wallet
- **ActiveSessions**: Manages dApp connections via WalletConnect
- **Pending Transactions**: Handles transaction and signature requests
- **Logs**: Records system events for debugging

## Connecting to dApps

1. Copy a WalletConnect URL (begins with "wc:")
2. Paste it into cell A2 of the ActiveSessions sheet
3. The agent will automatically attempt to connect and update the connection status

## Processing Transactions/Signatures

1. When a connected dApp sends a request, it appears in the Pending Transactions sheet
2. Change the Status cell from "Pending" to "Approved" to approve the request
3. Change the Status cell to "Rejected" to reject the request
4. The agent checks for status changes every 10 seconds

## Line of Code

### Autonome

Custom Agent Template Deployed on Autonome - 

Docker Image - https://hub.docker.com/layers/eggai/walletsheets/v7.0.0/images/sha256-11d9bf9d843e7bbf7f573d4e8eb06c9ff77f2c53f580b289e1fe8d53cee9034f

### Nillion


### Nethermind



