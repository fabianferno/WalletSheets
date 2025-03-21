# Ethereum Wallet Portfolio Tracker for Google Sheets

This tool allows you to track Ethereum wallet balances and transaction history in Google Sheets, creating a simple portfolio dashboard.

## Setup Instructions

### 1. Google Sheets Setup

First, create a Google Sheet with the following structure:

1. A sheet named "Settings" with:
   - Cell A4 labeled "Set up wallet here", and the wallet address in column C (cell C4)
   - Cell A5 labeled "Your name", and your name in column C (cell C5)

2. Two additional sheets:
   - "Hold Wallet" - Will display token balances
   - "Spot Wallet" - Will display transaction history

### 2. Authentication Setup

Follow the instructions in CREDENTIALS_SETUP.md to set up Google API credentials.

### 3. Environment Configuration

Edit the `.env` file with your Google Sheet ID:

```
GOOGLE_SHEET_ID=your_google_sheet_id_here
# Optional: Add your Etherscan API key for better rate limits
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 4. Install Dependencies

```bash
yarn install
```

### 5. Run the Portfolio Tracker

```bash
yarn update-portfolio
```

This will fetch:
- Token balances from the specified wallet address into the "Hold Wallet" sheet 
- Transaction history into the "Spot Wallet" sheet

### 6. Schedule Automatic Updates

For automatic updates, set up a cron job or scheduled task to run the script regularly:

```bash
# Example cron job to update every hour
0 * * * * cd /path/to/sheet/tracker && yarn update-portfolio
```

## Features

- **Token Balances**: Displays all ERC-20 tokens and native ETH balance
- **Transaction History**: Shows all ETH transactions, method name, and status
- **USD Values**: Includes USD values for tokens where pricing is available

## Troubleshooting

- Ensure the wallet address is correct and has activity
- Check that your Google API credentials have write access to the sheet
- Verify that the sheet names match exactly: "Settings", "Hold Wallet", and "Spot Wallet"
- For rate limit issues, consider adding an Etherscan API key

## License

MIT 