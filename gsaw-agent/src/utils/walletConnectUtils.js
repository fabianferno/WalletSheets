import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { ACTIVE_SESSIONS_SHEET } from "./sheetUtils.js";
import { SheetClient } from "./sheets.api.js";

// Load environment variables
dotenv.config();

/**
 * Initialize WalletConnect
 */
export async function initializeWalletConnect(wallet, logEvent) {
  try {
    logEvent(`[DEBUG] Starting WalletConnect initialization`);
    const projectId = "4ffb0cda1971e8063939ebc64377f532";

    // Validate project ID
    if (!projectId || projectId === "your-project-id") {
      const error =
        "PROJECT_ID environment variable is not set. Please set it in your .env file.";
      logEvent(`[ERROR] ${error}`);
      logEvent(
        `[INFO] Get a free project ID from https://cloud.walletconnect.com/app`
      );
      throw new Error(error);
    }

    logEvent(`[DEBUG] Creating WalletConnect core instance`);
    const core = new Core({
      projectId,
    });

    // Create a new web3wallet instance
    logEvent(`[DEBUG] Creating Web3Wallet instance`);
    const web3wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "Google Sheets Wallet",
        description: "Google Sheets Wallet powered by WalletConnect",
        url: "https://sheets.google.com",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
    });

    // Set up event listeners for session proposals
    web3wallet.on("session_proposal", async (proposal) => {
      try {
        logEvent(`[DEBUG] Session proposal received: ${proposal.id}`);

        // In the simplified version, we'll automatically accept session proposals
        const { id, params } = proposal;

        logEvent(`[DEBUG] Auto-approving session proposal`);

        // Accept the session
        const namespaces = {};

        params.requiredNamespaces.eip155.chains.forEach((chain) => {
          const namespace = chain.split(":")[0];
          const chainId = parseInt(chain.split(":")[1]);

          if (!namespaces[namespace]) {
            namespaces[namespace] = {
              accounts: [],
              methods: params.requiredNamespaces.eip155.methods,
              events: params.requiredNamespaces.eip155.events,
            };
          }

          namespaces[namespace].accounts.push(
            `${namespace}:${chainId}:${wallet.address}`
          );
        });

        const session = await web3wallet.approveSession({
          id,
          namespaces,
        });

        logEvent(`[INFO] Session approved: ${session.topic}`);

        // Log metadata about the connecting dApp
        const dAppInfo = params.proposer.metadata;
        logEvent(
          `[INFO] Connected to dApp: ${dAppInfo.name} (${dAppInfo.url})`
        );
      } catch (error) {
        logEvent(
          `[ERROR] Error handling session proposal: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });

    // Log active sessions
    const activeSessions = web3wallet.getActiveSessions();
    const sessionCount = Object.keys(activeSessions).length;
    logEvent(`[INFO] Active sessions: ${sessionCount}`);

    if (sessionCount > 0) {
      Object.entries(activeSessions).forEach(([topic, session]) => {
        logEvent(`[DEBUG] Active session: ${topic}`);
      });
    }

    logEvent(`[INFO] WalletConnect initialized successfully`);
    return web3wallet;
  } catch (error) {
    logEvent(
      `[ERROR] Failed to initialize WalletConnect: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Connect to DApp using WalletConnect URI
 */
export async function connectToDApp(
  wcUrl,
  wallet,
  web3wallet,
  connectionId,
  appendToActiveSessionsSheet,
  updateConnectionStatus,
  handleSessionRequest,
  logEvent,
  sheetClient
) {
  try {
    logEvent(`[INFO] Connecting to dApp with URI: ${wcUrl}`);

    // Validate WalletConnect URI format
    if (!wcUrl.startsWith("wc:")) {
      logEvent("[ERROR] Invalid WalletConnect URI format");
      throw new Error("Invalid WalletConnect URI format");
    }

    // Pair with the dApp
    const pairResult = await web3wallet.core.pairing.pair({ uri: wcUrl });
    logEvent(`[INFO] Pairing successful: ${pairResult.topic}`);

    // Record the connection in the ActiveSessions sheet
    logEvent(`[DEBUG] Adding connection to ActiveSessions sheet`);
    const now = new Date().toISOString();

    await appendToActiveSessionsSheet(
      connectionId,
      wallet.address,
      pairResult.topic,
      "Connecting",
      wcUrl,
      now
    );

    // Set up session request handler
    web3wallet.on("session_request", async (event) => {
      try {
        logEvent(`[DEBUG] Session request received from topic: ${event.topic}`);
        await handleSessionRequest(event);
      } catch (error) {
        logEvent(
          `[ERROR] Error handling session request: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });

    // Set up session delete handler
    web3wallet.on("session_delete", async (event) => {
      try {
        logEvent(`[INFO] Session deleted: ${event.topic}`);

        // Update the connection status in the ActiveSessions sheet
        await updateConnectionStatus(sheetClient, event.topic, "Disconnected");
      } catch (error) {
        logEvent(
          `[ERROR] Error handling session delete: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });

    logEvent(`[INFO] Connection to dApp initiated successfully`);
    return pairResult.topic;
  } catch (error) {
    logEvent(
      `[ERROR] Failed to connect to dApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}
