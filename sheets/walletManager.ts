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
} from "./utils/sheetUtils";
import { initializeWalletConnect } from "./utils/walletConnectUtils";
import { monitorDAppConnections } from "./utils/sessionUtils";
import { logEvent as logEventToSheet } from "./utils/logUtils";

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
    // Authenticate with the service account
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
    const authClient = await auth.getClient();

    // List all files the service account has access to (filter to only Google Sheets)
    const response = await drive.files.list({
      // @ts-ignore
      auth: authClient,
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name, owners)",
    });

    // Use type assertion to resolve the data property error
    const responseData = response as unknown as {
      data: { files: Array<{ id: string; name: string }> };
    };
    const files = responseData.data.files;

    if (!files || files.length === 0) {
      console.log("No accessible spreadsheets found.");
      return [];
    }

    console.log(`Found ${files.length} accessible spreadsheets:`);
    return files;
  } catch (error: unknown) {
    console.error("Error getting accessible sheets:", error);
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
    console.log(`Initializing wallet agent for sheet: ${sheetId}`);

    // Initialize SheetClient
    const sheetClient = new SheetClient(sheetId);

    // Create a wrapped logEvent function that uses the sheet client
    const logEvent = (message: string) => logEventToSheet(sheetClient, message);

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
    await initializeSheets(sheetClient, logEvent);

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

    // TODO: Deploy agent

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
