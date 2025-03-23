import { ethers } from "ethers";
import {
  PENDING_TRANSACTIONS_SHEET,
  ACTIVE_SESSIONS_SHEET,
  WALLET_EXPLORER_SHEET,
  clearCompletedTransactions,
  addCheckboxesToRow,
} from "./sheetUtils.js";
import { SheetClient } from "./sheets.api.js";

/**
 * Update connection status in ActiveSessions sheet
 */
export async function updateConnectionStatus(
  sheetClient,
  connectionId,
  status,
  dAppUrl
) {
  try {
    const rows = await sheetClient.getSheetValues(ACTIVE_SESSIONS_SHEET);
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === connectionId) {
        // Update status
        await sheetClient.setCellValue(
          ACTIVE_SESSIONS_SHEET,
          i + 1,
          "D",
          status
        );

        if (dAppUrl) {
          // Update dApp URL
          await sheetClient.setCellValue(
            ACTIVE_SESSIONS_SHEET,
            i + 1,
            "E",
            dAppUrl
          );
        }

        console.log(`Session ${connectionId} status updated to ${status}`);
        return;
      }
    }

    console.log(`Session ${connectionId} not found in ActiveSessions sheet`);
  } catch (error) {
    console.error(
      `Error updating connection status for ${connectionId}:`,
      error
    );
  }
}

/**
 * Handle session request (simplified)
 */
export async function handleSessionRequest(
  event,
  wallet,
  connectionId,
  web3wallet,
  sheetClient,
  addTransactionToSheet,
  logEvent
) {
  try {
    const { topic, params, id } = event;
    const { request } = params;
    const { method, params: requestParams } = request;

    logEvent(`Session request received: ${method} (ID: ${id})`);

    // Add request to sheet for tracking
    const requestId = `req_${Date.now()}`;
    await monitorRequestApproval(
      requestId,
      id,
      method,
      requestParams,
      wallet,
      topic,
      web3wallet,
      sheetClient,
      addTransactionToSheet,
      logEvent
    );

    return true;
  } catch (error) {
    logEvent(`Error handling session request: ${error.message}`);
    return false;
  }
}

/**
 * Monitor request approval (simplified)
 */
export async function monitorRequestApproval(
  requestId,
  wcRequestId,
  method,
  params,
  wallet,
  topic,
  web3wallet,
  sheetClient,
  addTransactionToSheet,
  logEvent
) {
  try {
    logEvent(`Monitoring approval for request ${requestId} (${method})`);

    // In the simplified version, we'll auto-approve basic requests
    let autoApprove = false;

    if (method === "eth_chainId" || method === "eth_accounts") {
      autoApprove = true;
    }

    if (autoApprove) {
      await processRequest(
        wcRequestId,
        method,
        params,
        wallet,
        topic,
        web3wallet,
        addTransactionToSheet,
        logEvent,
        sheetClient,
        requestId
      );
    } else {
      logEvent(`Request ${requestId} requires manual approval`);
      // In real implementation, this would check the sheet for approval status
    }
  } catch (error) {
    logEvent(`Error monitoring request approval: ${error.message}`);
  }
}

/**
 * Process request (simplified)
 */
export async function processRequest(
  wcRequestId,
  method,
  params,
  wallet,
  topic,
  web3wallet,
  addTransactionToSheet,
  logEvent,
  sheetClient,
  requestId = ""
) {
  try {
    logEvent(`Processing request: ${method}`);

    let response;

    // Handle different request types
    if (method === "eth_chainId") {
      // Get chain ID
      const provider = new ethers.JsonRpcProvider(
        "https://arb-sepolia.g.alchemy.com/v2/MShQiNPi5VzUekdRsalsGufPl0IkOFqR"
      );
      const chainId = await provider.send("eth_chainId", []);
      response = chainId;
    } else if (method === "eth_accounts") {
      // Return wallet address
      response = [wallet.address];
    } else if (method === "eth_sendTransaction") {
      // This would be handled in the actual implementation
      logEvent(
        `Transaction request received, not implemented in simplified version`
      );
      response = "0x";
    } else {
      logEvent(`Unsupported method: ${method}`);
      response = null;
    }

    if (response) {
      // Approve the request
      await web3wallet.respondSessionRequest({
        topic,
        response: {
          id: wcRequestId,
          jsonrpc: "2.0",
          result: response,
        },
      });

      logEvent(`Request ${wcRequestId} approved with response: ${response}`);
    }

    return true;
  } catch (error) {
    logEvent(`Error processing request: ${error.message}`);
    return false;
  }
}

/**
 * Monitor DApp connections (simplified)
 */
export async function monitorDAppConnections(
  wallet,
  web3wallet,
  sheetClient,
  addTransactionToSheet,
  logEvent
) {
  try {
    logEvent("Setting up DApp connection monitor");

    // Set up event listeners for session proposals
    web3wallet.on("session_proposal", async (proposal) => {
      try {
        logEvent(`Session proposal received: ${proposal.id}`);

        // Auto-approve in simplified version
        const connectionId = `conn_${Date.now()}`;
        const { id, params } = proposal;

        // Accept the session
        const session = await web3wallet.approveSession({
          id,
          namespaces: {
            eip155: {
              accounts: [`eip155:421614:${wallet.address}`],
              methods: [
                "eth_sendTransaction",
                "eth_sign",
                "personal_sign",
                "eth_signTypedData",
                "eth_signTypedData_v4",
                "eth_chainId",
                "eth_accounts",
              ],
              events: ["accountsChanged", "chainChanged"],
            },
          },
        });

        logEvent(`Session approved: ${session.topic}`);

        // Add session to ActiveSessions sheet
        const dAppInfo = params.proposer.metadata;
        const dAppName = dAppInfo?.name || "Unknown dApp";
        const dAppUrl = dAppInfo?.url || "";

        await updateConnectionStatus(
          sheetClient,
          connectionId,
          "Connected",
          dAppUrl
        );

        logEvent(`Connection to ${dAppName} established`);
      } catch (error) {
        logEvent(`Error handling session proposal: ${error.message}`);
      }
    });

    // Handle session requests
    web3wallet.on("session_request", async (event) => {
      try {
        const connectionId = `conn_${Date.now()}`;
        await handleSessionRequest(
          event,
          wallet,
          connectionId,
          web3wallet,
          sheetClient,
          addTransactionToSheet,
          logEvent
        );
      } catch (error) {
        logEvent(`Error handling session request: ${error.message}`);
      }
    });

    logEvent("DApp connection monitor setup complete");
  } catch (error) {
    logEvent(`Error setting up DApp connection monitor: ${error.message}`);
  }
}

/**
 * Connect to DApp (simplified)
 */
export async function connectToDApp(
  wcUrl,
  wallet,
  web3wallet,
  connectionId,
  sheetClient,
  addTransactionToSheet,
  logEvent
) {
  try {
    logEvent(`Connecting to DApp: ${wcUrl}`);

    if (!wcUrl.startsWith("wc:")) {
      logEvent("Invalid WalletConnect URL format");
      return false;
    }

    // Pair with the DApp
    const pairResult = await web3wallet.core.pairing.pair({ uri: wcUrl });
    logEvent(`Pairing successful: ${pairResult.topic}`);

    // Update connection status
    await updateConnectionStatus(
      sheetClient,
      connectionId,
      "Connecting",
      wcUrl
    );

    logEvent(`Connection initiated to ${wcUrl}`);
    return true;
  } catch (error) {
    logEvent(`Error connecting to DApp: ${error.message}`);
    return false;
  }
}
