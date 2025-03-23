import express, { Request, Response } from "express";
import dotenv, { config } from "dotenv";
import axios from "axios";
import cors from "cors";
import { google } from "googleapis";
import { base64EncodeEnv } from "./utils";

// Load environment variables
dotenv.config();

// Initialize the Google Sheets API
const drive = google.drive("v3");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const templateId = "15bb11d0-3d35-4f87-9f26-cd3cb713f2a2";

// Middleware
app.use(express.json());
app.use(cors());

// Interface for the request body
interface DeployAgentRequest {
  sheetId: string;
  ownerEmail: string;
}

// Interface for the response from Autonome
interface AutonomeResponse {
  app?: {
    id: string;
  };
  error?: string;
}

// Authenticate with the service account
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.readonly",
  ],
});

/**
 * Get the owner email for a specific sheet
 */
async function getSheetOwnerEmailFromDrive(sheetId: string) {
  try {
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
 * Get all sheets accessible by the service account
 */
async function getAccessibleSheets() {
  try {
    const drive = google.drive({ version: "v3", auth });

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
 * Deploy an agent to Autonome
 */
async function deployAgent(requestBody: {
  name: string;
  config: string;
  creationMethod: number;
  envList: Record<string, string>;
  templateId: string;
}): Promise<{
  success: boolean;
  appId?: string;
  appUrl?: string;
  error?: string;
  details?: any;
}> {
  try {
    // Get authentication and endpoint info from environment variables
    const autonomeJwt = process.env.AUTONOME_JWT_TOKEN;
    const autonomeRpc = process.env.AUTONOME_RPC_ENDPOINT;

    if (!autonomeJwt || !autonomeRpc) {
      console.error("Missing Autonome configuration in server environment");
      return {
        success: false,
        error: "Missing Autonome configuration in server environment",
      };
    }

    // Make request to Autonome service
    const response = await axios.post(autonomeRpc, requestBody, {
      headers: {
        Authorization: `Bearer ${autonomeJwt}`,
        "Content-Type": "application/json",
      },
    });

    console.log("response", response.data);
    // Handle the response
    if (response.data?.app?.id) {
      const appUrl = `https://dev.autonome.fun/autonome/${response.data.app.id}/details`;
      console.log(
        `Agent "${requestBody.name}" successfully deployed at: ${appUrl}`
      );

      // TODO: Make a POST request to the app ${appUrl}/set-url to the chatURL inside the agent

      return {
        success: true,
        appId: response.data.app.id,
        appUrl: response.data.app.endpoints.apiUrl,
      };
    } else {
      // Unexpected response format
      console.error(
        "Unexpected response format from Autonome service:",
        response.data
      );

      return {
        success: false,
        error: "Unexpected response from Autonome service",
      };
    }
  } catch (error: any) {
    console.error("Error deploying agent:", error.message);

    // Extract the error message from the Autonome service if available
    const autonomeError = error.response?.data?.error || error.message;

    return {
      success: false,
      error: "Failed to deploy agent",
      details: autonomeError,
    };
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
          // If the owner email is not in the settings, get it from the Drive API
          const ownerEmail =
            (await getSheetOwnerEmailFromDrive(sheet.id)) ||
            "fabianferno@gmail.com";

          const agentConfig = getAgentConfig(sheet.id, ownerEmail);

          const result = await deployAgent(agentConfig);
          console.log("result", result);

          if (result.success) {
            initializedSheets.add(sheet.id);
            newInitializedCount++;
            console.log(
              `Deployed wallet agent for sheet: ${sheet.name} (${sheet.id})`
            );

            // TODO: Make a POST request to the app ${appUrl}/set-url to the chatURL inside the agent
            let health: any;
            do {
              try {
                health = await axios.get(`${result.appUrl}/health`, {});
                console.log("Waiting for agent to be ready...");
              } catch (error) {
                console.log("Agent is not ready yet...");
                await new Promise((resolve) => setTimeout(resolve, 10000));
                health = { status: 404 };
              }
            } while (health.status !== 200);
            console.log("Agent is ready");

            // TODO: Make a POST request to the app ${appUrl}/set-url to the chatURL inside the agent
            await axios.post(`${result.appUrl}/set-url`, {
              url: `${process.env.CHAT_URL}`,
              apiKey: "apikey",
            });
            console.log("Chat URL set");
          } else {
            console.error(
              `Failed to deploy agent for sheet: ${sheet.name} (${sheet.id}): ${result.error}`
            );
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

function getAgentConfig(sheetId: string, ownerEmail: string) {
  const name = `${ownerEmail.slice(0, 2)}-${sheetId.slice(0, 3)}`;

  const envList: Record<string, string> = {
    SHEET_ID: sheetId,
    GMAIL: ownerEmail,
    NAME: name,
    NILAI_API_URL: process.env.NILAI_API_URL || "",
    NILAI_API_KEY: process.env.NILAI_API_KEY || "",
    TAVILY_API_KEY: process.env.TAVILY_API_KEY || "",
    NILLION_ORG_DID: process.env.NILLION_ORG_DID || "",
    NILLION_ORG_SECRET_KEY: process.env.NILLION_ORG_SECRET_KEY || "",
    PROJECT_ID: process.env.PROJECT_ID || "",
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || "",
    CRYPTO_PANIC_API_KEY: process.env.CRYPTO_PANIC_API_KEY || "",
    SUPAVEC_API_KEY: process.env.SUPAVEC_API_KEY || "",
    NILLION_CHAT_SCHEMA_ID: process.env.NILLION_CHAT_SCHEMA_ID || "",
    NILLION_USER_SCHEMA_ID: process.env.NILLION_USER_SCHEMA_ID || "",
    NILLION_TRADES_SCHEMA_ID: process.env.NILLION_TRADES_SCHEMA_ID || "",
    ARBISCAN_KEY: process.env.ARBISCAN_KEY || "",
    LANGCHAIN_TRACING: "true",
  };

  const data = {
    name,
    config: "",
    creationMethod: 2,
    envList: base64EncodeEnv(envList),
    templateId,
  };

  return data;
}

runAllWalletAgents();

/**
 * Deploy an agent to Autonome
 */
app.post("/deploy-agent", async (req: Request, res: Response) => {
  try {
    const { sheetId, ownerEmail } = req.body as DeployAgentRequest;

    const agentConfig = getAgentConfig(sheetId, ownerEmail);

    const result: any = await deployAgent(agentConfig);

    if (result.success) {
      return res.status(200).json({
        success: true,
        name,
        appUrl: result.app.endpoints.apiUrl,
        apiKey: "apikey",
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        details: result.details,
      });
    }
  } catch (error: any) {
    console.error("Error in deploy-agent endpoint:", error.message);
    return res.status(500).json({
      success: false,
      error: "Server error processing request",
    });
  }
});

/**
 * Health check endpoint
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
