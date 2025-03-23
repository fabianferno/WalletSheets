import { SheetClient } from "./sheets.api";
import * as dotenv from "dotenv";
import { google } from "googleapis";
import { generateWallet, setUpBlockchainListeners } from "./utils/walletUtils";
import {
  initializeSheets,
  storeWalletAddress,
  storeSheetOwnerEmail,
  getSheetOwnerEmail,
  addTransactionToSheet as addTxToSheet,
  updatePendingTransactionsSheet,
  forceUpdatePendingTransactions,
  checkStuckTransactions,
  monitorChatSheet,
  initializeWalletExplorer,
  WALLET_EXPLORER_SHEET,
} from "./utils/sheetUtils";
import { initializeWalletConnect } from "./utils/walletConnectUtils";
import { monitorDAppConnections } from "./utils/sessionUtils";
import { ethers } from "ethers";
import {
  initializePortfolioSheet,
  updatePortfolioData,
  schedulePortfolioUpdates,
} from "./utils/portfolioUtils";

// Load environment variables
dotenv.config();

// Service account credentials
const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./credentials.json";

// Initialize the Google Sheets API
const sheets = google.sheets("v4");
const drive = google.drive("v3");

/**
 * Get all sheets accessible by the service account
 */
async function getAccessibleSheets() {
  try {
    console.log(
      "🔍 Getting accessible sheets using credentials from:",
      CREDENTIALS_PATH
    );
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    console.log("⚙️ Creating Drive API client...");
    const drive = google.drive({ version: "v3", auth });

    console.log("📡 Making Drive API request to list files...");
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name, owners)",
    });

    console.log(
      `✅ Drive API response received. Found ${
        response.data.files?.length || 0
      } sheets.`
    );

    if (!response.data.files) {
      console.log("❌ No files found or response.data.files is undefined.");
      return [];
    }

    return response.data.files.map((file) => ({
      id: file.id!,
      name: file.name!,
      owner: file.owners?.[0]?.emailAddress || "unknown",
    }));
  } catch (error: unknown) {
    console.error("❌ Error in getAccessibleSheets:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    return [];
  }
}

/**
 * Get the owner email for a specific sheet
 */
async function getSheetOwnerEmailFromDrive(sheetId: string) {
  try {
    // Authenticate with the service account
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const authClient = await auth.getClient();

    // Get file metadata
    const response = await drive.files.get({
      // @ts-ignore
      auth: authClient,
      fileId: sheetId,
      fields: "owners",
    });

    // Use type assertion to fix the data property error
    const responseData = response as unknown as {
      data: {
        owners?: Array<{ emailAddress: string }>;
      };
    };

    if (responseData.data.owners && responseData.data.owners.length > 0) {
      return responseData.data.owners[0].emailAddress;
    }

    return null;
  } catch (error: unknown) {
    console.error(`Error getting owner for sheet ${sheetId}:`, error);
    return null;
  }
}

/**
 * Initialize a wallet agent for a specific sheet
 */
async function initializeWalletAgent(sheetId: string) {
  try {
    console.log(`🔄 Initializing wallet agent for sheet ${sheetId}...`);

    // Create a logger function for this specific sheet that only logs to console
    const logEvent = (message: string) => {
      console.log(`[Sheet ${sheetId}] ${message}`);
    };

    console.log(
      `🔑 Creating SheetClient with ID ${sheetId} and credentials from ${CREDENTIALS_PATH}...`
    );
    // Create the sheet client
    const sheetClient = new SheetClient(sheetId, CREDENTIALS_PATH);

    // Create a wrapped addTransactionToSheet function that uses the sheet client
    const addTransactionToSheet = (
      txHash: string,
      from: string,
      to: string,
      amount: string,
      timestamp: string,
      status: string
    ) => addTxToSheet(sheetClient, txHash, from, to, amount, timestamp, status);

    // Initialize sheets
    console.log(`📊 Initializing sheets for ${sheetId}...`);
    try {
      await initializeSheets(sheetClient, logEvent);
      console.log(`✅ Sheets initialized successfully for ${sheetId}`);

      // Force update of the Pending Transactions sheet to ensure it has approve/reject columns
      await updatePendingTransactionsSheet(sheetClient, logEvent);
    } catch (error) {
      console.error(`❌ Error initializing sheets for ${sheetId}:`, error);
      throw error;
    }

    // Try to get the owner email from the settings sheet first
    let ownerEmail = await getSheetOwnerEmail(sheetClient, logEvent);

    // If the owner email is not in the settings, get it from the Drive API
    if (!ownerEmail) {
      const emailFromDrive = await getSheetOwnerEmailFromDrive(sheetId);
      if (emailFromDrive) {
        ownerEmail = emailFromDrive;
        // Store the email in the settings
        await storeSheetOwnerEmail(sheetClient, ownerEmail, logEvent);
      } else {
        logEvent("Could not determine sheet owner email");
        return false;
      }
    }

    // Generate wallet
    const wallet = await generateWallet(sheetId, ownerEmail);

    // Store wallet address
    await storeWalletAddress(sheetClient, wallet.address, logEvent);

    // Set up provider for blockchain interactions
    const provider = new ethers.JsonRpcProvider(
      process.env.ETH_RPC_URL || "https://arbitrum-sepolia.drpc.org"
    );

    // Initialize Wallet Explorer with recent transactions
    await initializeWalletExplorer(
      sheetClient,
      wallet.address,
      provider,
      logEvent
    );

    // Initialize WalletConnect
    const web3wallet = await initializeWalletConnect(wallet, logEvent);

    // Set up blockchain listeners
    await setUpBlockchainListeners(wallet, logEvent, addTransactionToSheet);

    // Monitor for dApp connections
    await monitorDAppConnections(
      wallet,
      web3wallet,
      sheetClient,
      addTransactionToSheet,
      logEvent
    );

    // Set up periodic stuck transaction checker
    setupStuckTransactionChecker(sheetClient, wallet, logEvent);

    // Start monitoring the Chat sheet
    monitorChatSheet(sheetClient, logEvent);
    logEvent("Chat monitoring started");
    // NEW: Initialize enhanced portfolio dashboard
    try {
      logEvent("Initializing enhanced portfolio dashboard...");

      // Initialize portfolio sheet with enhanced UI
      await initializePortfolioSheet(sheetClient, logEvent);

      // Update portfolio data
      await updatePortfolioData(sheetClient, wallet, logEvent);

      // Schedule regular updates
      schedulePortfolioUpdates(sheetClient, wallet, logEvent, 30); // Update every 30 minutes

      logEvent("Enhanced portfolio dashboard initialized successfully!");
    } catch (portfolioError) {
      logEvent(
        `Warning: Could not initialize portfolio dashboard: ${portfolioError}`
      );
      console.error(
        `Portfolio initialization error for ${sheetId}:`,
        portfolioError
      );
      // Continue with the rest of the initialization even if portfolio fails
    }

    logEvent("Agent initialized successfully!");
    console.log(`Wallet Address for ${sheetId}: ${wallet.address}`);

    return true;
  } catch (error: unknown) {
    console.error(
      `Error initializing wallet agent for sheet ${sheetId}:`,
      error
    );
    return false;
  }
}

/**
 * Set up a periodic check for stuck transactions
 */
function setupStuckTransactionChecker(
  sheetClient: SheetClient,
  wallet: ethers.Wallet,
  logEvent: Function
) {
  // Create a provider
  const provider = new ethers.JsonRpcProvider(
    process.env.ETH_RPC_URL || "https://arbitrum-sepolia.drpc.org"
  );

  // Check immediately and then every 5 minutes
  const checkTransactions = async () => {
    try {
      // Check for and update stuck transactions
      await checkStuckTransactions(sheetClient, provider, logEvent);

      // Also check if the Wallet Explorer sheet needs to be initialized with transactions
      try {
        const values = await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);

        // If the sheet is empty (just the header row), initialize it with transactions
        if (values.length <= 1) {
          logEvent(
            "Wallet Explorer sheet is empty, initializing with transactions"
          );
          await initializeWalletExplorer(
            sheetClient,
            wallet.address,
            provider,
            logEvent
          );
        }
      } catch (error) {
        logEvent(`Error checking Wallet Explorer sheet: ${error}`);
      }
    } catch (error) {
      logEvent(`Error in transaction checker: ${error}`);
    }
  };

  // Run check immediately
  checkTransactions();

  // Then set up interval to check every 5 minutes
  return setInterval(checkTransactions, 5 * 60 * 1000);
}

/**
 * Main function to run all wallet agents
 */
export async function runAllWalletAgents() {
  try {
    console.log("Starting Google Sheets Wallet Manager");

    // Keep track of sheets we've already initialized
    const initializedSheets = new Set<string>();

    // Function to check for and initialize new sheets
    const checkForNewSheets = async () => {
      // Get all accessible sheets
      const accessibleSheets = await getAccessibleSheets();

      if (accessibleSheets.length === 0) {
        console.log("No accessible sheets found.");
        return;
      }

      // Find sheets that haven't been initialized yet
      const newSheets = accessibleSheets.filter(
        (sheet) => !initializedSheets.has(sheet.id)
      );

      if (newSheets.length > 0) {
        console.log(`Found ${newSheets.length} new sheets to initialize.`);

        // Initialize a wallet agent for each new sheet
        let newInitializedCount = 0;
        for (const sheet of newSheets) {
          const initialized = await initializeWalletAgent(sheet.id);
          if (initialized) {
            initializedSheets.add(sheet.id);
            newInitializedCount++;
          }
        }

        console.log(
          `Successfully initialized ${newInitializedCount} new wallet agents out of ${newSheets.length} sheets.`
        );
      }
    };

    // Run the initial check for sheets
    await checkForNewSheets();

    // Set up interval to check for new sheets (every 5 minutes)
    const checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    setInterval(async () => {
      console.log("Checking for new sheets...");
      await checkForNewSheets();
    }, checkInterval);

    // Keep the process running with a heartbeat
    setInterval(() => {
      // Heartbeat
      console.log(`Wallet Manager heartbeat: ${new Date().toISOString()}`);
    }, 60000);

    console.log(
      `Wallet Manager running. Will check for new sheets every ${
        checkInterval / 60000
      } minutes.`
    );
  } catch (error: unknown) {
    console.error("Error running wallet agents:", error);
  }
}

/**
 * Manually force update pending transactions for a specific sheet
 * This can be called to fix sheets where checkboxes aren't showing up
 */
export async function fixPendingTransactions(sheetId: string) {
  try {
    console.log(`🛠️ Fixing pending transactions for sheet ${sheetId}...`);

    // Create a logger function for this specific sheet that only logs to console
    const logEvent = (message: string) => {
      console.log(`[Sheet ${sheetId}] ${message}`);
    };

    // Create the sheet client
    const sheetClient = new SheetClient(sheetId, CREDENTIALS_PATH);

    // Force update pending transactions
    await forceUpdatePendingTransactions(sheetClient, logEvent);

    console.log(`✅ Fixed pending transactions for sheet ${sheetId}`);
    return true;
  } catch (error: unknown) {
    console.error(
      `❌ Error fixing pending transactions for sheet ${sheetId}:`,
      error
    );
    return false;
  }
}

/**
 * Manually update portfolio for a specific sheet
 */
export async function updatePortfolio(sheetId: string) {
  try {
    console.log(`📊 Updating portfolio for sheet ${sheetId}...`);

    // Create a logger function for this specific sheet
    const logEvent = (message: string) => {
      console.log(`[Sheet ${sheetId}] ${message}`);
    };

    // Create the sheet client
    const sheetClient = new SheetClient(sheetId, CREDENTIALS_PATH);

    // Get the owner email
    const ownerEmail = await getSheetOwnerEmail(sheetClient, logEvent);
    if (!ownerEmail) {
      console.error("Could not determine sheet owner email");
      return false;
    }

    // Generate the same wallet
    const wallet = await generateWallet(sheetId, ownerEmail);

    // Initialize portfolio sheet if it doesn't exist
    await initializePortfolioSheet(sheetClient, logEvent);

    // Update portfolio data
    await updatePortfolioData(sheetClient, wallet, logEvent);

    console.log(`✅ Updated portfolio for sheet ${sheetId}`);
    return true;
  } catch (error: unknown) {
    console.error(`❌ Error updating portfolio for sheet ${sheetId}:`, error);
    return false;
  }
}

// If run directly
if (require.main === module) {
  runAllWalletAgents()
    .then(() => {
      console.log("Wallet Manager started successfully");
    })
    .catch((error: unknown) => {
      console.error("Failed to start Wallet Manager:", error);
      process.exit(1);
    });
}
