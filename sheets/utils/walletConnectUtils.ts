import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Initialize WalletConnect
 */
export async function initializeWalletConnect(
  wallet: ethers.Wallet,
  logEvent: Function
) {
  try {
    logEvent(`[DEBUG] Starting WalletConnect initialization`);
    const projectId = process.env.PROJECT_ID || "your-project-id";
    logEvent(`[DEBUG] Using project ID: ${projectId}`);
    logEvent(`[DEBUG] Wallet address: ${wallet.address}`);

    // Check for valid project ID
    if (!projectId || projectId === "your-project-id") {
      logEvent(
        `[ERROR] Invalid or missing WalletConnect project ID. Please set the PROJECT_ID environment variable.`
      );
      logEvent(
        `[INFO] You can get a free project ID from https://cloud.walletconnect.com/app`
      );
    }

    const core = new Core({
      projectId: projectId,
      relayUrl: "wss://relay.walletconnect.com", // Explicitly set relay URL
    });
    logEvent(`[DEBUG] WalletConnect Core created successfully`);

    const metadata = {
      name: "Google Sheets Wallet",
      description: "Crypto wallet based on Google Sheets",
      url: "https://sheets.google.com",
      icons: ["https://www.google.com/images/about/sheets-icon.svg"],
    };
    logEvent(`[DEBUG] Using metadata: ${JSON.stringify(metadata)}`);

    try {
      logEvent(`[DEBUG] Initializing Web3Wallet with core`);
      const web3wallet = await Web3Wallet.init({
        core,
        metadata,
      });
      logEvent(`[DEBUG] Web3Wallet initialized successfully`);

      // Log active sessions
      try {
        const sessions = await web3wallet.getActiveSessions();
        const sessionCount = Object.keys(sessions).length;
        logEvent(`[DEBUG] Found ${sessionCount} active sessions`);

        if (sessionCount > 0) {
          Object.keys(sessions).forEach((topic) => {
            const session = sessions[topic];
            const peer = session?.peer?.metadata?.name || "Unknown dApp";
            logEvent(`[DEBUG] Active session with ${peer}, topic: ${topic}`);
          });
        }
      } catch (sessionsError) {
        logEvent(`[DEBUG] Error getting active sessions: ${sessionsError}`);
      }

      // Log wallet connection initialized
      logEvent("WalletConnect initialized successfully");
      return web3wallet;
    } catch (initError: unknown) {
      logEvent(
        `[DEBUG] Error in Web3Wallet.init: ${
          initError instanceof Error ? initError.message : String(initError)
        }`
      );
      if (initError instanceof Error && initError.stack) {
        logEvent(`[DEBUG] Error stack: ${initError.stack}`);
      }
      throw initError;
    }
  } catch (error: unknown) {
    logEvent(
      `[DEBUG] General error in initializeWalletConnect: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    if (error instanceof Error && error.stack) {
      logEvent(`[DEBUG] Error stack: ${error.stack}`);
    }
    logEvent(
      `Error initializing WalletConnect: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Connect to dApp using WalletConnect
 */
export async function connectToDApp(
  wcUrl: string,
  wallet: ethers.Wallet,
  web3wallet: any,
  connectionId: string,
  appendToActiveSessionsSheet: Function,
  updateConnectionStatus: Function,
  handleSessionRequest: Function,
  logEvent: Function
) {
  try {
    if (!web3wallet) {
      logEvent("WalletConnect not initialized");
      return;
    }

    const timestamp = new Date().toISOString();

    // Add connection to ActiveSessions sheet with "Connecting" status
    await appendToActiveSessionsSheet([
      [connectionId, "Connecting...", wcUrl, "Connecting", timestamp],
    ]);

    try {
      // Pair with the dApp
      const { uri, topic } = await web3wallet.core.pairing.pair({ uri: wcUrl });

      // Set up session proposal listener
      web3wallet.on("session_proposal", async (proposal: any) => {
        try {
          // Get dApp metadata
          const { proposer } = proposal;
          const dAppUrl = proposer.metadata.url || "Unknown";

          // Update dApp URL in sheet
          await updateConnectionStatus(connectionId, "Pending", dAppUrl);

          // Approve the session
          const namespaces = {
            eip155: {
              accounts: [`eip155:1:${wallet.address}`],
              methods: [
                "eth_sendTransaction",
                "eth_signTransaction",
                "eth_sign",
                "personal_sign",
                "eth_signTypedData",
              ],
              events: ["accountsChanged", "chainChanged"],
            },
          };

          const session = await web3wallet.approveSession({
            id: proposal.id,
            namespaces,
          });

          // Update connection status to "Connected"
          await updateConnectionStatus(connectionId, "Connected", dAppUrl);
          logEvent(`Connected to dApp: ${dAppUrl}`);

          // Set up session request listener
          web3wallet.on("session_request", async (event: any) => {
            await handleSessionRequest(
              event,
              wallet,
              connectionId,
              web3wallet,
              // Pass dummy functions since these will be provided by the actual implementation
              () => {}, // For sheetClient
              () => {}, // For addTransactionToSheet
              logEvent
            );
          });

          // Set up session delete listener
          web3wallet.on("session_delete", async (event: any) => {
            if (event.topic === session.topic) {
              await updateConnectionStatus(
                connectionId,
                "Disconnected",
                dAppUrl
              );
              logEvent(`Disconnected from dApp: ${dAppUrl}`);
            }
          });
        } catch (error: unknown) {
          await updateConnectionStatus(connectionId, "Failed");
          logEvent(
            `Error handling session proposal: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      });
    } catch (error: unknown) {
      await updateConnectionStatus(connectionId, "Failed");
      logEvent(
        `Error connecting to dApp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } catch (error: unknown) {
    logEvent(
      `Error in connectToDApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
