import { ethers } from "ethers";
import {
  PENDING_TRANSACTIONS_SHEET,
  ACTIVE_SESSIONS_SHEET,
} from "./sheetUtils";
import { SheetClient } from "../sheets.api";

/**
 * Update connection status in ActiveSessions sheet
 */
export async function updateConnectionStatus(
  sheetClient: SheetClient,
  connectionId: string,
  status: string,
  dAppUrl?: string
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

        // Update dApp URL if provided
        if (dAppUrl) {
          await sheetClient.setCellValue(
            ACTIVE_SESSIONS_SHEET,
            i + 1,
            "B",
            dAppUrl
          );
        }
        break;
      }
    }
  } catch (error: unknown) {
    console.error(
      `Error updating connection status: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Handle session requests (transactions, signatures)
 */
export async function handleSessionRequest(
  event: any,
  wallet: ethers.Wallet,
  connectionId: string,
  web3wallet: any,
  sheetClient: SheetClient,
  addTransactionToSheet: Function,
  logEvent: Function
) {
  try {
    const { id, topic, params } = event;
    const { request } = params;
    const { method, params: requestParams } = request;

    // Generate unique request ID
    const requestId = `req-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Add request to Pending Transactions sheet
    const details = JSON.stringify(requestParams);
    await sheetClient.appendRows(PENDING_TRANSACTIONS_SHEET, [
      [requestId, connectionId, method, details, "Pending", timestamp],
    ]);

    logEvent(`New request: ${method} (${requestId})`);

    // Monitor for approval/rejection in the sheet
    monitorRequestApproval(
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
  } catch (error: unknown) {
    logEvent(
      `Error handling session request: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Monitor for request approval/rejection
 */
export async function monitorRequestApproval(
  requestId: string,
  wcRequestId: string,
  method: string,
  params: any[],
  wallet: ethers.Wallet,
  topic: string,
  web3wallet: any,
  sheetClient: SheetClient,
  addTransactionToSheet: Function,
  logEvent: Function
) {
  try {
    const checkStatus = async () => {
      try {
        const rows = await sheetClient.getSheetValues(
          PENDING_TRANSACTIONS_SHEET
        );
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === requestId) {
            const status = rows[i][4];

            if (status === "Approved") {
              // Process the approved request
              await processRequest(
                wcRequestId,
                method,
                params,
                wallet,
                topic,
                web3wallet,
                addTransactionToSheet,
                logEvent
              );
              return; // Stop checking
            } else if (status === "Rejected") {
              // Reject the request
              await web3wallet.respondSessionRequest({
                topic,
                response: {
                  id: wcRequestId,
                  jsonrpc: "2.0",
                  error: {
                    code: 4001,
                    message: "User rejected the request",
                  },
                },
              });

              logEvent(`Request ${requestId} rejected`);
              return; // Stop checking
            }
          }
        }

        // Continue checking
        setTimeout(checkStatus, 10000); // Check every 10 seconds
      } catch (error: unknown) {
        logEvent(
          `Error checking request status: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        setTimeout(checkStatus, 10000); // Retry after error
      }
    };

    // Start checking
    checkStatus();
  } catch (error: unknown) {
    logEvent(
      `Error monitoring request approval: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Process an approved request
 * Moved from walletConnectUtils to avoid circular dependency
 */
export async function processRequest(
  wcRequestId: string,
  method: string,
  params: any[],
  wallet: ethers.Wallet,
  topic: string,
  web3wallet: any,
  addTransactionToSheet: Function,
  logEvent: Function
) {
  try {
    let result;

    switch (method) {
      case "personal_sign":
      case "eth_sign":
        // Sign a message
        const message = params[0];
        result = await wallet.signMessage(
          ethers.isHexString(message) ? ethers.toUtf8String(message) : message
        );
        break;

      case "eth_signTypedData":
        // Sign typed data
        const typedData = params[0];
        result = await wallet.signTypedData(
          typedData.domain,
          typedData.types,
          typedData.message
        );
        break;

      case "eth_sendTransaction":
        // Send a transaction
        const txParams = params[0];
        const provider = new ethers.JsonRpcProvider(
          process.env.ETH_RPC_URL || "https://rpc.ankr.com/eth_goerli"
        );
        const connectedWallet = wallet.connect(provider);

        const tx = await connectedWallet.sendTransaction({
          to: txParams.to,
          value: txParams.value ? ethers.parseEther(txParams.value) : 0,
          data: txParams.data || "0x",
          gasLimit: txParams.gas ? ethers.toBigInt(txParams.gas) : undefined,
        });

        result = tx.hash;

        // Add to Wallet Explorer sheet
        const timestamp = new Date().toISOString();
        await addTransactionToSheet(
          tx.hash,
          wallet.address,
          txParams.to,
          ethers.formatEther(txParams.value || "0"),
          timestamp,
          "Pending"
        );
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // Respond to the request
    await web3wallet.respondSessionRequest({
      topic,
      response: {
        id: wcRequestId,
        jsonrpc: "2.0",
        result,
      },
    });

    logEvent(`Request ${wcRequestId} processed successfully`);
  } catch (error: unknown) {
    logEvent(
      `Error processing approved request: ${
        error instanceof Error ? error.message : String(error)
      }`
    );

    // Respond with error
    await web3wallet.respondSessionRequest({
      topic,
      response: {
        id: wcRequestId,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      },
    });
  }
}

/**
 * Monitor for dApp connections
 */
export async function monitorDAppConnections(
  wallet: ethers.Wallet,
  web3wallet: any,
  sheetClient: SheetClient,
  addTransactionToSheet: Function,
  logEvent: Function
) {
  try {
    // Check cell A2 in ActiveSessions sheet for new WalletConnect URL
    const checkUrl = async () => {
      try {
        const url = await sheetClient.getCellValue(
          ACTIVE_SESSIONS_SHEET,
          2,
          "A"
        );

        if (url && typeof url === "string" && url.startsWith("wc:")) {
          logEvent(`Found WalletConnect URL: ${url}`);

          // Clear the cell
          await sheetClient.setCellValue(ACTIVE_SESSIONS_SHEET, 2, "A", "");

          // Generate unique connection ID
          const connectionId = `conn-${Date.now()}`;

          // Connect to dApp
          await connectToDApp(
            url,
            wallet,
            web3wallet,
            connectionId,
            sheetClient,
            addTransactionToSheet,
            logEvent
          );
        }
      } catch (error: unknown) {
        logEvent(
          `Error checking for WalletConnect URL: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Check again after delay
      setTimeout(checkUrl, 30000); // Check every 30 seconds
    };

    // Start checking
    checkUrl();
    logEvent("dApp connection monitoring started");
  } catch (error: unknown) {
    logEvent(
      `Error monitoring dApp connections: ${
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
  sheetClient: SheetClient,
  addTransactionToSheet: Function,
  logEvent: Function
) {
  try {
    if (!web3wallet) {
      logEvent("WalletConnect not initialized");
      return;
    }

    const timestamp = new Date().toISOString();

    // Add connection to ActiveSessions sheet with "Connecting" status
    await sheetClient.appendRows(ACTIVE_SESSIONS_SHEET, [
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
          await updateConnectionStatus(
            sheetClient,
            connectionId,
            "Pending",
            dAppUrl
          );

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
          await updateConnectionStatus(
            sheetClient,
            connectionId,
            "Connected",
            dAppUrl
          );
          logEvent(`Connected to dApp: ${dAppUrl}`);

          // Set up session request listener
          web3wallet.on("session_request", async (event: any) => {
            await handleSessionRequest(
              event,
              wallet,
              connectionId,
              web3wallet,
              sheetClient,
              addTransactionToSheet,
              logEvent
            );
          });

          // Set up session delete listener
          web3wallet.on("session_delete", async (event: any) => {
            if (event.topic === session.topic) {
              await updateConnectionStatus(
                sheetClient,
                connectionId,
                "Disconnected",
                dAppUrl
              );
              logEvent(`Disconnected from dApp: ${dAppUrl}`);
            }
          });
        } catch (error: unknown) {
          await updateConnectionStatus(sheetClient, connectionId, "Failed");
          logEvent(
            `Error handling session proposal: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      });
    } catch (error: unknown) {
      await updateConnectionStatus(sheetClient, connectionId, "Failed");
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
