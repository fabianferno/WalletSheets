# Google Sheets Wallet Agent

A cryptocurrency wallet implementation using Google Sheets as the interface. This directory contains the agent that manages the wallet functionality across multiple Google Sheets.

## Features

- Manages wallet functionality for multiple Google Sheets
- Automatically detects and initializes sheets the service account has access to
- Generates deterministic wallets based on sheet ID and owner email
- Supports WalletConnect for dApp integrations
- Transaction monitoring and approval through the sheet interface

## Quick Start

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables in `.env`:
```
PROJECT_ID=your_walletconnect_project_id
SALT=your_custom_salt_or_leave_default
ETH_RPC_URL=https://rpc.ankr.com/eth_goerli
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

3. Run the wallet manager:
```bash
yarn ts-node index.ts
```

The agent will automatically:
- Find all Google Sheets shared with your service account
- Extract owner information for each sheet
- Initialize wallet functionality in each sheet
- Start monitoring for transactions and dApp connections

## Directory Structure

- `index.ts` - Entry point for running the wallet manager
- `walletManager.ts` - Main manager that initializes agents for each sheet
- `utils/` - Utility functions organized by domain:
  - `walletUtils.ts` - Wallet generation and blockchain interactions
  - `sheetUtils.ts` - Google Sheets operations
  - `walletConnectUtils.ts` - WalletConnect integration
  - `sessionUtils.ts` - dApp session management
  - `logUtils.ts` - Logging utilities

## Google Sheets API Client

This project also includes a TypeScript client for interacting with the Google Sheets API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create Google Cloud Project and enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API
   - Create credentials (Service Account or API Key)
   - Download the JSON credentials file

3. Build the TypeScript code:
```bash
npm run build
```

## Usage

```typescript
import { SheetClient } from './scripts/sheets.api';

// Initialize with sheet ID and optional credentials file
const client = new SheetClient('your-sheet-id', 'path/to/credentials.json');

// Or initialize with URL
const client = new SheetClient('https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0');

// Example usage
async function example() {
  // Get all values from a sheet
  const values = await client.getSheetValues('Sheet1');
  console.log(values);
  
  // Get a specific cell
  const cell = await client.getCellValue('Sheet1', 1, 'A');
  console.log(cell);
  
  // Get a column
  const column = await client.getColumn('Sheet1', 'B');
  console.log(column);
  
  // Append rows
  await client.appendRows('Sheet1', [
    ['John', 'Doe', 30],
    ['Jane', 'Smith', 25]
  ]);
}

example().catch(console.error);
```

## Available Methods

The client provides numerous methods for working with spreadsheets:

- **Reading Data**:
  - `getSheetValues(sheetName)` - Get all values from a sheet
  - `getRange(range)` - Get values from a specific range
  - `getCellValue(sheetName, row, column)` - Get a specific cell value
  - `getColumn(sheetName, column)` - Get an entire column
  - `getRow(sheetName, row)` - Get an entire row
  
- **Writing Data**:
  - `setCellValue(sheetName, row, column, value)` - Set a value in a specific cell
  - `setRangeValues(range, values)` - Set values in a range
  - `appendRows(sheetName, rows)` - Append rows to a sheet
  - `clearRange(range)` - Clear a range of cells
  
- **Sheet Management**:
  - `createSheet(title)` - Create a new sheet (tab)
  - `deleteSheet(sheetId)` - Delete a sheet
  - `getAllSheets()` - Get all sheets in the spreadsheet
  - `getSheetIdByName(sheetName)` - Get the ID of a sheet by name
  
- **Rows and Columns**:
  - `insertRow(sheetId, rowIndex)` - Insert a row
  - `insertColumn(sheetId, columnIndex)` - Insert a column
  - `deleteRow(sheetId, rowIndex)` - Delete a row
  - `deleteColumn(sheetId, columnIndex)` - Delete a column
  
- **Formatting and Sorting**:
  - `formatRange(sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, format)` - Format a range
  - `sortRange(sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, sortColumnIndex, ascending)` - Sort a range
  
- **Search**:
  - `searchInSheet(sheetName, searchValue)` - Search for a value in a sheet

## Additional Features

### Ethereum Wallet Portfolio Tracker

This project now includes an Ethereum wallet tracker that:

1. Reads a wallet address from a "Settings" sheet
2. Displays token balances in a "Hold Wallet" sheet  
3. Shows transaction history in a "Spot Wallet" sheet

To set up the wallet tracker:

```bash
# Install required dependencies
yarn add ethers axios

# Create or update your .env file with:
# - GOOGLE_SHEET_ID: Your Google Sheet ID
# - ETHERSCAN_API_KEY: (Optional) For better rate limits
 

# Setting Up Google Sheets API Credentials

Follow these steps to set up credentials for the Google Sheets API:

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select "New Project"
3. Enter a project name and click "Create"

## 2. Enable the Google Sheets API

1. In your project, navigate to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and then click "Enable"

## 3. Create Service Account Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create credentials" and select "Service account"
3. Enter a name for your service account
4. Click "Create and continue"
5. For the role, select "Project" > "Editor" (or a more restricted role if preferred)
6. Click "Continue" and then "Done"

## 4. Generate and Download Service Account Key

1. In the Credentials page, click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" and click "Create"
5. A JSON file will be downloaded to your computer
6. Rename this file to `credentials.json` and place it in the root directory of this project

## 5. Share Your Google Sheet

1. For the service account to access your Google Sheet, you need to share the sheet with the service account email
2. Open your Google Sheet
3. Click the "Share" button in the top right
4. Enter the service account email (found in the `client_email` field of your credentials.json file)
5. Grant "Editor" access (or viewer if you only need read-only access)
6. Click "Share"

## 6. Update Your Code

In your code, reference the credentials file:

```typescript
// Initialize with sheet ID and credentials
const client = new SheetClient('your-sheet-id', './credentials.json');

// Or with a Google Sheets URL
const client = new SheetClient('https://docs.google.com/spreadsheets/d/your-sheet-id/edit', './credentials.json');
```

## Security Notes

- **NEVER commit your credentials.json file to version control**
- The file has been added to .gitignore to prevent accidental commits
- If you need to share your project, use environment variables or a secrets manager to store credentials
- Only grant the minimum necessary permissions to your service account 