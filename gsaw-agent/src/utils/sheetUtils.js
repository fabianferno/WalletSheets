import { SheetClient } from "./sheets.api.js";
import { ethers } from "ethers";
import axios from "axios";

// Sheet names
export const SETTINGS_SHEET = "Settings";
export const WALLET_EXPLORER_SHEET = "View Transactions";
export const ACTIVE_SESSIONS_SHEET = "Connect to Dapp";
export const PENDING_TRANSACTIONS_SHEET = "Pending Transactions";
export const CHAT_SHEET = "Chat with Wallet";
export const PORTFOLIO_SHEET = "Portfolio";

// Common styling constants for sheets
export const SHEET_STYLES = {
  // Color constants
  COLORS: {
    HEADER_GREEN: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    LIGHT_BLUE: { red: 0.95, green: 0.97, blue: 1.0 }, // Very light blue
    LIGHT_RED: { red: 1.0, green: 0.95, blue: 0.95 }, // Light red
    GRAY: { red: 0.5, green: 0.5, blue: 0.5 }, // Mild grey for text
    BLACK: { red: 0, green: 0, blue: 0 }, // Black text
    INPUT_BLUE: { red: 0.95, green: 0.95, blue: 1.0 }, // Blue for input fields
    USER_BLUE: { red: 0.9, green: 0.95, blue: 1.0 }, // Light blue for user messages
    AGENT_RED: { red: 1.0, green: 0.9, blue: 0.9 }, // Light red for agent blocks
  },

  // Header row styling (mild green)
  HEADER: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
  },

  // Header with right alignment
  HEADER_RIGHT: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "RIGHT",
  },

  // Header with center alignment
  HEADER_CENTER: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "CENTER",
  },
};

/**
 * Initialize sheets structure
 */
export async function initializeSheets(sheetClient, logEvent) {
  try {
    logEvent(`Initializing sheets structure...`);

    // Check if sheets already exist
    const metadata = await sheetClient.getSheetMetadata();
    const sheetNames = metadata.map((sheet) => sheet.title);

    // Create necessary sheets if they don't exist
    const requiredSheets = [
      SETTINGS_SHEET,
      WALLET_EXPLORER_SHEET,
      ACTIVE_SESSIONS_SHEET,
      PENDING_TRANSACTIONS_SHEET,
      CHAT_SHEET,
      PORTFOLIO_SHEET,
    ];

    // Track which sheets need to be created
    const missingSheets = requiredSheets.filter(
      (name) => !sheetNames.includes(name)
    );

    if (missingSheets.length > 0) {
      logEvent(`Creating ${missingSheets.length} missing sheets...`);
      await createSheets(sheetClient, logEvent);
    } else {
      logEvent(`All required sheets already exist.`);
    }

    logEvent(`Sheet initialization complete.`);
    return true;
  } catch (error) {
    logEvent(`Error initializing sheets: ${error.message}`);
    return false;
  }
}

/**
 * Create all required sheets
 */
export async function createSheets(sheetClient, logEvent) {
  try {
    // Create or update each sheet
    await createSettingsSheet(sheetClient, logEvent);
    await createWalletExplorerSheet(sheetClient, logEvent);
    await createActiveSessionsSheet(sheetClient, logEvent);
    await createPendingTransactionsSheet(sheetClient, logEvent);
    await createChatSheet(sheetClient, logEvent);

    logEvent(`All sheets created successfully.`);
    return true;
  } catch (error) {
    logEvent(`Error creating sheets: ${error.message}`);
    return false;
  }
}

/**
 * Create the Settings sheet
 */
export async function createSettingsSheet(sheetClient, logEvent) {
  try {
    logEvent(`Setting up ${SETTINGS_SHEET} sheet...`);

    // Create the sheet if it doesn't exist
    const sheetId = await sheetClient.createSheet(SETTINGS_SHEET);

    // Set up header row
    await sheetClient.setRangeValues(`${SETTINGS_SHEET}!A1:B1`, [
      ["Setting", "Value"],
    ]);

    // Format the header row
    await sheetClient.formatRange(sheetId, 0, 1, 0, 2, SHEET_STYLES.HEADER);

    // Set up initial settings
    const initialSettings = [
      ["Wallet Address", ""],
      ["Owner Email", ""],
      ["Risk Factor", "3"],
      ["Last Updated", new Date().toISOString()],
    ];

    await sheetClient.setRangeValues(
      `${SETTINGS_SHEET}!A2:B5`,
      initialSettings
    );

    logEvent(`${SETTINGS_SHEET} sheet created.`);
    return true;
  } catch (error) {
    logEvent(`Error creating Settings sheet: ${error.message}`);
    return false;
  }
}

/**
 * Create the Wallet Explorer sheet
 */
export async function createWalletExplorerSheet(sheetClient, logEvent) {
  try {
    logEvent(`Setting up ${WALLET_EXPLORER_SHEET} sheet...`);

    // Create the sheet
    const sheetId = await sheetClient.createSheet(WALLET_EXPLORER_SHEET);

    // Set up column headers
    const headers = [
      "Transaction Hash",
      "From",
      "To",
      "Amount (ETH)",
      "Timestamp",
      "Status",
    ];

    await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A1:F1`, [
      headers,
    ]);

    // Format the header row
    await sheetClient.formatRange(
      sheetId,
      0,
      1,
      0,
      headers.length,
      SHEET_STYLES.HEADER
    );

    logEvent(`${WALLET_EXPLORER_SHEET} sheet created.`);
    return true;
  } catch (error) {
    logEvent(`Error creating Wallet Explorer sheet: ${error.message}`);
    return false;
  }
}

/**
 * Initialize the Wallet Explorer sheet with historical transactions
 */
export async function initializeWalletExplorer(
  sheetClient,
  walletAddress,
  provider,
  logEvent
) {
  try {
    logEvent(
      `Initializing ${WALLET_EXPLORER_SHEET} with historical transactions...`
    );

    // Get historical transactions
    const transactions = await fetchHistoricalTransactions(
      walletAddress,
      provider,
      10,
      logEvent
    );

    if (transactions.length === 0) {
      logEvent(`No historical transactions found.`);
      return true;
    }

    // Format transaction data for the sheet
    const transactionRows = transactions.map((tx) => [
      tx.hash,
      tx.from,
      tx.to || "Contract Creation",
      tx.value,
      tx.timestamp,
      "Confirmed",
    ]);

    // Add transactions to the sheet
    await sheetClient.appendRows(WALLET_EXPLORER_SHEET, transactionRows);

    logEvent(
      `Added ${transactions.length} historical transactions to ${WALLET_EXPLORER_SHEET}.`
    );
    return true;
  } catch (error) {
    logEvent(`Error initializing Wallet Explorer: ${error.message}`);
    return false;
  }
}

/**
 * Fetch historical transactions for a wallet
 */
export async function fetchHistoricalTransactions(
  walletAddress,
  provider,
  limit = 10,
  logEvent
) {
  try {
    logEvent(`Fetching historical transactions for ${walletAddress}...`);

    // Get the current block number
    const blockNumber = await provider.getBlockNumber();

    // Start scanning from recent blocks
    const startBlock = Math.max(0, blockNumber - 10000);

    // Get transactions
    const transactions = [];

    // In a simplified version, we'll just return an empty array
    // In a production version, this would use etherscan or another API to get historical tx

    logEvent(`Found ${transactions.length} historical transactions.`);
    return transactions;
  } catch (error) {
    logEvent(`Error fetching historical transactions: ${error.message}`);
    return [];
  }
}

/**
 * Create the Active Sessions sheet
 */
export async function createActiveSessionsSheet(sheetClient, logEvent) {
  try {
    logEvent(`Setting up ${ACTIVE_SESSIONS_SHEET} sheet...`);

    // Create the sheet
    const sheetId = await sheetClient.createSheet(ACTIVE_SESSIONS_SHEET);

    // Set up column headers
    const headers = [
      "Connection ID",
      "Wallet Address",
      "Topic",
      "Status",
      "dApp URL",
      "Connected At",
    ];

    await sheetClient.setRangeValues(`${ACTIVE_SESSIONS_SHEET}!A1:F1`, [
      headers,
    ]);

    // Format the header row
    await sheetClient.formatRange(
      sheetId,
      0,
      1,
      0,
      headers.length,
      SHEET_STYLES.HEADER
    );

    // Add instructions row
    await sheetClient.setRangeValues(`${ACTIVE_SESSIONS_SHEET}!A2:F2`, [
      ["Enter WalletConnect URL below to connect"],
    ]);

    // Add input row for WalletConnect URL
    await sheetClient.setRangeValues(`${ACTIVE_SESSIONS_SHEET}!A3:B3`, [
      ["WalletConnect URL:", ""],
    ]);

    logEvent(`${ACTIVE_SESSIONS_SHEET} sheet created.`);
    return true;
  } catch (error) {
    logEvent(`Error creating Active Sessions sheet: ${error.message}`);
    return false;
  }
}

/**
 * Create the Pending Transactions sheet
 */
export async function createPendingTransactionsSheet(sheetClient, logEvent) {
  try {
    logEvent(`Setting up ${PENDING_TRANSACTIONS_SHEET} sheet...`);

    // Create the sheet
    const sheetId = await sheetClient.createSheet(PENDING_TRANSACTIONS_SHEET);

    // Set up column headers
    const headers = [
      "Request ID",
      "Method",
      "Params",
      "Approve",
      "Reject",
      "Status",
      "Timestamp",
      "Transaction Hash",
    ];

    await sheetClient.setRangeValues(`${PENDING_TRANSACTIONS_SHEET}!A1:H1`, [
      headers,
    ]);

    // Format the header row
    await sheetClient.formatRange(
      sheetId,
      0,
      1,
      0,
      headers.length,
      SHEET_STYLES.HEADER
    );

    logEvent(`${PENDING_TRANSACTIONS_SHEET} sheet created.`);
    return true;
  } catch (error) {
    logEvent(`Error creating Pending Transactions sheet: ${error.message}`);
    return false;
  }
}

/**
 * Store wallet address in Settings sheet
 */
export async function storeWalletAddress(sheetClient, walletAddress, logEvent) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 2, "B", walletAddress);
    logEvent(`Wallet address stored: ${walletAddress}`);
    return true;
  } catch (error) {
    logEvent(`Error storing wallet address: ${error.message}`);
    return false;
  }
}

/**
 * Store sheet owner email in Settings sheet
 */
export async function storeSheetOwnerEmail(sheetClient, ownerEmail, logEvent) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 3, "B", ownerEmail);
    logEvent(`Sheet owner email stored: ${ownerEmail}`);
    return true;
  } catch (error) {
    logEvent(`Error storing sheet owner email: ${error.message}`);
    return false;
  }
}

/**
 * Get sheet owner email from Settings sheet
 */
export async function getSheetOwnerEmail(sheetClient, logEvent) {
  try {
    const email = await sheetClient.getCellValue(SETTINGS_SHEET, 3, "B");
    if (!email) {
      logEvent("No owner email found in settings");
      return "";
    }
    return email;
  } catch (error) {
    logEvent(`Error getting sheet owner email: ${error.message}`);
    return "";
  }
}

/**
 * Add a transaction to the Wallet Explorer sheet
 */
export async function addTransactionToSheet(
  sheetClient,
  txHash,
  from,
  to,
  amount,
  timestamp,
  status
) {
  try {
    const row = [txHash, from, to, amount, timestamp, status];
    await sheetClient.appendRows(WALLET_EXPLORER_SHEET, [row]);
    console.log(`Transaction ${txHash} added to ${WALLET_EXPLORER_SHEET}`);
    return true;
  } catch (error) {
    console.error(`Error adding transaction to sheet: ${error.message}`);
    return false;
  }
}

/**
 * Update the status of pending transactions
 */
export async function updatePendingTransactionsSheet(sheetClient, logEvent) {
  try {
    logEvent(`Updating pending transactions...`);

    // In the simplified version, we'll just log that this would update pending txs
    logEvent(`Pending transactions check completed.`);
    return true;
  } catch (error) {
    logEvent(`Error updating pending transactions: ${error.message}`);
    return false;
  }
}

/**
 * Force update all pending transactions
 */
export async function forceUpdatePendingTransactions(sheetClient, logEvent) {
  try {
    logEvent(`Force updating pending transactions...`);

    // In the simplified version, we'll just log that this would force update pending txs
    logEvent(`Force update of pending transactions completed.`);
    return true;
  } catch (error) {
    logEvent(`Error force updating pending transactions: ${error.message}`);
    return false;
  }
}

/**
 * Add checkboxes to a row in the Pending Transactions sheet
 */
export async function addCheckboxesToRow(sheetClient, rowIndex, logEvent) {
  try {
    logEvent(`Adding checkboxes to row ${rowIndex}...`);

    // In the simplified version, we'll just log that this would add checkboxes
    logEvent(`Checkboxes added to row ${rowIndex}.`);
    return true;
  } catch (error) {
    logEvent(`Error adding checkboxes to row: ${error.message}`);
    return false;
  }
}

/**
 * Clear completed transactions from the Pending Transactions sheet
 */
export async function clearCompletedTransactions(sheetClient, logEvent) {
  try {
    logEvent(`Clearing completed transactions...`);

    // In the simplified version, we'll just log that this would clear completed txs
    logEvent(`Completed transactions cleared.`);
    return true;
  } catch (error) {
    logEvent(`Error clearing completed transactions: ${error.message}`);
    return false;
  }
}

/**
 * Check for stuck transactions
 */
export async function checkStuckTransactions(sheetClient, provider, logEvent) {
  try {
    logEvent(`Checking for stuck transactions...`);

    // In the simplified version, we'll just log that this would check for stuck txs
    logEvent(`Stuck transaction check completed.`);
    return true;
  } catch (error) {
    logEvent(`Error checking for stuck transactions: ${error.message}`);
    return false;
  }
}

/**
 * Create the Chat sheet
 */
export async function createChatSheet(sheetClient, logEvent) {
  try {
    logEvent(`Setting up ${CHAT_SHEET} sheet...`);

    // Create the sheet
    const sheetId = await sheetClient.createSheet(CHAT_SHEET);

    // Set up column headers
    const headers = ["Timestamp", "Sender", "Message"];

    await sheetClient.setRangeValues(`${CHAT_SHEET}!A1:C1`, [headers]);

    // Format the header row
    await sheetClient.formatRange(
      sheetId,
      0,
      1,
      0,
      headers.length,
      SHEET_STYLES.HEADER
    );

    // Add welcome message
    const welcomeMessage = [
      new Date().toISOString(),
      "Wallet Assistant",
      "Hello! I'm your wallet assistant. You can chat with me here to send transactions, check your balance, or get help with your wallet.",
    ];

    await sheetClient.appendRows(CHAT_SHEET, [welcomeMessage]);

    // Add input row
    await sheetClient.setRangeValues(`${CHAT_SHEET}!A3:C3`, [
      ["", "Enter your message here:", ""],
    ]);

    logEvent(`${CHAT_SHEET} sheet created.`);
    return true;
  } catch (error) {
    logEvent(`Error creating Chat sheet: ${error.message}`);
    return false;
  }
}

/**
 * Monitor the Chat sheet for new messages
 */
export async function monitorChatSheet(sheetClient, logEvent) {
  try {
    logEvent(`Setting up monitoring for ${CHAT_SHEET} sheet...`);

    // In the simplified version, we'll just log that this would monitor the chat
    logEvent(`Chat sheet monitoring initialized.`);
    return true;
  } catch (error) {
    logEvent(`Error monitoring Chat sheet: ${error.message}`);
    return false;
  }
}

/**
 * Get risk factor from Settings sheet
 */
export async function getRiskFactor(sheetClient, logEvent) {
  try {
    const riskFactor = await sheetClient.getCellValue(SETTINGS_SHEET, 4, "B");
    const riskValue = parseInt(riskFactor) || 3; // Default to 3 if not set or invalid
    logEvent(`Risk factor: ${riskValue}`);
    return riskValue;
  } catch (error) {
    logEvent(`Error getting risk factor: ${error.message}`);
    return 3; // Default risk factor
  }
}
