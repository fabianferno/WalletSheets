import { google } from "googleapis";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the Google Sheets API
const drive = google.drive("v3");

/**
 * Get all sheets accessible by the service account
 */
async function getAccessibleSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"
      ),
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
      credentials: JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"
      ),
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

    // Initialize sheets
    console.log(`📊 Initializing agent for ${sheetId}...`);

    // If the owner email is not in the settings, get it from the Drive API
    const emailownerEmailFromDrive = await getSheetOwnerEmailFromDrive(sheetId);

    // TODO: Call agent deploy

    logEvent("Agent initialized successfully!");

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
