import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { ACTIVE_SESSIONS_SHEET } from "./sheetUtils";
import { SheetClient } from "../sheets.api";

// Load environment variables
dotenv.config();

/**
 * Initialize WalletConnect
 */
export async function initializeWalletConnect(wallet: ethers.Wallet) {
  try {
    const projectId = process.env.PROJECT_ID;

    // Validate project ID
    if (!projectId || projectId === "your-project-id") {
      const error =
        "PROJECT_ID environment variable is not set. Please set it in your .env file.";

      throw new Error(error);
    }

    // Initialize Core with explicit options
    const core = new Core({
      projectId,
      relayUrl: "wss://relay.walletconnect.com",
      logger: "debug", // Enable debug logging
    });

    const metadata = {
      name: "Google Sheets Wallet",
      description: "Crypto wallet based on Google Sheets",
      url: "https://sheets.google.com",
      icons: ["https://www.google.com/images/about/sheets-icon.svg"],
    };

    try {
      const web3wallet = await Web3Wallet.init({
        core,
        metadata,
      });

      // Log active sessions
      try {
        const sessions = await web3wallet.getActiveSessions();
        const sessionCount = Object.keys(sessions).length;

        if (sessionCount > 0) {
          Object.keys(sessions).forEach((topic) => {
            const session = sessions[topic];
            const peer = session?.peer?.metadata?.name || "Unknown dApp";
          });
        }
      } catch (sessionsError) {
        console.error(
          `[DEBUG] Error getting active sessions: ${sessionsError}`
        );
      }

      return web3wallet;
    } catch (initError: unknown) {
      console.error(
        `[DEBUG] Error in Web3Wallet.init: ${
          initError instanceof Error ? initError.message : String(initError)
        }`
      );
      if (initError instanceof Error && initError.stack) {
        console.error(`[DEBUG] Error stack: ${initError.stack}`);
      }
      throw initError;
    }
  } catch (error: unknown) {
    console.error(
      `[DEBUG] General error in initializeWalletConnect: ${
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
  logEvent: Function,
  sheetClient: SheetClient
) {
  try {
    logEvent(`[DEBUG] Starting connection process for URI: ${wcUrl}`);

    if (!web3wallet) {
      logEvent("WalletConnect not initialized");
      await updateConnectionStatus(connectionId, "Failed");
      return;
    }

    const timestamp = new Date().toISOString();

    // Add connection to ActiveSessions sheet with "Connecting" status
    await appendToActiveSessionsSheet([
      [connectionId, "Connecting...", wcUrl, "Connecting", timestamp],
    ]);

    try {
      // Check URL format
      if (!wcUrl.startsWith("wc:")) {
        throw new Error(
          "Invalid WalletConnect URL format. Must start with 'wc:'"
        );
      }

      // Check if URL has expired
      const [wcProtocol, wcParams] = wcUrl.split("?");
      if (wcParams) {
        const params = new URLSearchParams(wcParams);
        const expiryTimestamp = params.get("expiryTimestamp");
        if (expiryTimestamp) {
          const expiry = parseInt(expiryTimestamp) * 1000; // Convert to milliseconds
          const now = Date.now();
          if (now > expiry) {
            throw new Error(
              "WalletConnect URL has expired. Please get a fresh URL from the dApp."
            );
          }
        }
      }

      // Pair with the dApp
      logEvent(`[DEBUG] Attempting to pair with dApp`);
      const { uri, topic } = await web3wallet.core.pairing.pair({ uri: wcUrl });

      // Set up session proposal listener
      web3wallet.on("session_proposal", async (proposal: any) => {
        try {
          logEvent(`[DEBUG] Received session proposal. ID: ${proposal.id}`);

          // Get dApp metadata
          let dAppUrl = "Unknown";
          let dAppName = "Unknown";

          if (
            proposal.params &&
            proposal.params.proposer &&
            proposal.params.proposer.metadata
          ) {
            const { metadata } = proposal.params.proposer;
            dAppUrl = metadata.url || "Unknown";
            dAppName = metadata.name || "Unknown";
          } else if (proposal.proposer && proposal.proposer.metadata) {
            const { metadata } = proposal.proposer;
            dAppUrl = metadata.url || "Unknown";
            dAppName = metadata.name || "Unknown";
          }

          logEvent(
            `[DEBUG] dApp metadata - Name: ${dAppName}, URL: ${dAppUrl}`
          );

          // Update dApp URL in sheet
          await updateConnectionStatus(connectionId, "Pending", dAppUrl);

          // Format the wallet address according to CAIP-10 for WalletConnect v2
          const formattedAddress = wallet.address.startsWith("0x")
            ? wallet.address
            : `0x${wallet.address}`;

          const chainId = "421614"; // Arbitrum Sepolia
          const caipAddress = `eip155:${chainId}:${formattedAddress}`;

          const namespaces = {
            eip155: {
              accounts: [caipAddress],
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

          // Attempt to approve session with retries
          let session: { topic: string };
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              logEvent(
                `[DEBUG] Attempting to approve session (attempt ${attempt}/3)`
              );

              const approvalParams = proposal.proposalId
                ? { proposalId: proposal.proposalId, namespaces }
                : { id: proposal.id, namespaces };

              session = await web3wallet.approveSession(approvalParams);
              break;
            } catch (error) {
              logEvent(
                `[DEBUG] Session approval attempt ${attempt} failed: ${
                  error instanceof Error ? error.message : String(error)
                }`
              );

              if (attempt === 3) {
                throw error;
              }

              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }

          // Update connection status to "Connected"
          await updateConnectionStatus(connectionId, "Connected", dAppUrl);
          logEvent(`Connected to dApp: ${dAppUrl}`);

          // Set up session request listener
          web3wallet.on("session_request", async (event: any) => {
            try {
              logEvent(
                `[DEBUG] Received session request event. Method: ${event?.params?.request?.method}`
              );
              await handleSessionRequest(
                event,
                wallet,
                connectionId,
                web3wallet,
                () => {}, // sheetClient
                () => {}, // addTransactionToSheet
                logEvent
              );
            } catch (error) {
              logEvent(
                `Error handling session request: ${
                  error instanceof Error ? error.message : String(error)
                }`
              );
            }
          });

          // Set up session delete listener
          web3wallet.on("session_delete", async (event: any) => {
            try {
              if (event.topic === session.topic) {
                await updateConnectionStatus(
                  connectionId,
                  "Disconnected",
                  dAppUrl
                );
                logEvent(`Disconnected from dApp: ${dAppUrl}`);
              }
            } catch (error) {
              logEvent(
                `Error handling session delete: ${
                  error instanceof Error ? error.message : String(error)
                }`
              );
            }
          });

          // Set up transport error handler
          web3wallet.core.relayer.on("transport_error", async (error: any) => {
            logEvent(
              `[DEBUG] Transport error detected: ${
                error instanceof Error ? error.message : String(error)
              }`
            );

            // Check for WebSocket authentication error
            if (
              error instanceof Error &&
              (error.message.includes(
                "WebSocket connection closed abnormally"
              ) ||
                error.message.includes("Unauthorized: invalid key"))
            ) {
              await updateConnectionStatus(connectionId, "Failed", dAppUrl);
              logEvent(
                "Connection failed: Invalid or expired WalletConnect URL. Please get a fresh URL from the dApp."
              );
              return;
            }

            // Attempt to reconnect for other errors
            try {
              await web3wallet.core.relayer.restartTransport();
              logEvent("[DEBUG] Successfully restarted transport");
            } catch (reconnectError) {
              logEvent(
                `[DEBUG] Failed to restart transport: ${
                  reconnectError instanceof Error
                    ? reconnectError.message
                    : String(reconnectError)
                }`
              );
            }
          });
        } catch (error: unknown) {
          logEvent(
            `[DEBUG] Error in session_proposal handler: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          // Only update to Failed if we're still in Pending or Connecting state
          const currentStatus = await sheetClient.getCellValue(
            ACTIVE_SESSIONS_SHEET,
            3,
            "D"
          );
          if (currentStatus === "Pending" || currentStatus === "Connecting") {
            await updateConnectionStatus(connectionId, "Failed");
          }
          logEvent(
            `Error handling session proposal: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      });
    } catch (error: unknown) {
      logEvent(
        `[DEBUG] Error in pairing process: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      // Only update to Failed if we're still in Connecting state
      const currentStatus = await sheetClient.getCellValue(
        ACTIVE_SESSIONS_SHEET,
        3,
        "D"
      );
      if (currentStatus === "Connecting") {
        await updateConnectionStatus(connectionId, "Failed");
      }
      logEvent(
        `Error connecting to dApp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } catch (error: unknown) {
    logEvent(
      `[DEBUG] General error in connectToDApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    // Only update to Failed if we're still in Connecting state
    const currentStatus = await sheetClient.getCellValue(
      ACTIVE_SESSIONS_SHEET,
      3,
      "D"
    );
    if (currentStatus === "Connecting") {
      await updateConnectionStatus(connectionId, "Failed");
    }
    logEvent(
      `Error in connectToDApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
