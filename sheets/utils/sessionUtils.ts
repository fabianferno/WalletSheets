import { ethers } from "ethers";
import {
  PENDING_TRANSACTIONS_SHEET,
  ACTIVE_SESSIONS_SHEET,
  WALLET_EXPLORER_SHEET,
  clearCompletedTransactions,
  addCheckboxesToRow,
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
  addTransactionToSheet: Function
) {
  try {
    const { id, topic, params } = event;
    const { request } = params;
    const { method, params: requestParams } = request;

    // Generate unique request ID
    const requestId = `req-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Create a unique transaction key for deduplication based on:
    // - connection ID
    // - method type
    // - key transaction parameters
    let transactionKey = `${connectionId}:${method}:`;

    if (method === "eth_sendTransaction" && requestParams?.[0]) {
      // For transactions, use to-address, value, and data as the unique identifiers
      const txParams = requestParams[0];
      transactionKey += `${txParams.to || ""}:${txParams.value || "0"}:${
        txParams.data || "0x"
      }`;
    } else if (method === "personal_sign" || method === "eth_sign") {
      // For signatures, use the message as the key
      transactionKey += requestParams?.[0] || "";
    } else if (method === "eth_signTypedData") {
      // For typed data, use a hash of the domain and message
      const typedData = requestParams?.[0];
      transactionKey +=
        JSON.stringify(typedData?.domain) + JSON.stringify(typedData?.message);
    } else {
      // For other methods, use the full params
      transactionKey += JSON.stringify(requestParams);
    }

    // Check existing transactions in the Pending Transactions sheet
    const existingValues = await sheetClient.getSheetValues(
      PENDING_TRANSACTIONS_SHEET
    );

    // Find if this transaction already exists
    let existingTransactionRow = null;
    let existingRequestId = null;

    for (let i = 3; i < existingValues.length; i++) {
      // Skip header and instruction rows
      const row = existingValues[i];
      if (!row || row.length < 5) continue;

      // If this row has the same connection ID and method
      if (row[1] === connectionId && row[2] === method) {
        try {
          // Compare transaction parameters based on method
          if (method === "eth_sendTransaction" && requestParams?.[0]) {
            const existingDetails = JSON.parse(row[3] || "[]");
            const existingTx = existingDetails[0] || {};
            const newTx = requestParams[0];

            // Compare key transaction parameters (to, value, data)
            if (
              existingTx.to === newTx.to &&
              existingTx.value === newTx.value &&
              existingTx.data === newTx.data
            ) {
              existingTransactionRow = row;
              existingRequestId = row[0];

              break;
            }
          } else {
            // For other requests, use exact details matching
            if (row[3] === JSON.stringify(requestParams)) {
              existingTransactionRow = row;
              existingRequestId = row[0];

              break;
            }
          }
        } catch (e) {
          // If parsing fails, continue to the next row
          console.error(`[DEBUG] Error comparing row ${i + 1}: ${e}`);
        }
      }
    }

    // If the transaction already exists, use the existing request ID instead of creating a new one
    if (existingTransactionRow) {
      // If the transaction is pending, use the existing one
      if (existingTransactionRow[4] === "Pending") {
        // Monitor the existing request
        monitorRequestApproval(
          existingRequestId,
          id, // Use the new WalletConnect request ID
          method,
          requestParams,
          wallet,
          topic,
          web3wallet,
          sheetClient,
          addTransactionToSheet
        );

        return;
      }
    }

    // Add request to Pending Transactions sheet
    const details = JSON.stringify(requestParams);
    await sheetClient.appendRows(PENDING_TRANSACTIONS_SHEET, [
      [
        requestId,
        connectionId,
        method,
        details,
        "Pending",
        timestamp,
        false,
        false,
      ],
    ]);

    // Get the row number where this was added
    const values = await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);
    let rowIndex = -1;

    // Find the row that contains our request ID
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === requestId) {
        rowIndex = i + 1; // Convert to 1-based index
        break;
      }
    }

    // Add checkboxes to this specific row
    if (rowIndex > 0) {
      await addCheckboxesToRow(sheetClient, rowIndex);
    }

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
      addTransactionToSheet
    );
  } catch (error: unknown) {
    console.error(
      `Error handling session request: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Keep track of requests that are already being monitored
const activeMonitors = new Set<string>();

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
  addTransactionToSheet: Function
) {
  try {
    // Check if this request is already being monitored
    if (activeMonitors.has(requestId)) {
      return;
    }

    // Add to active monitors set
    activeMonitors.add(requestId);

    const checkStatus = async () => {
      try {
        const rows = await sheetClient.getSheetValues(
          PENDING_TRANSACTIONS_SHEET
        );

        let found = false;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === requestId) {
            found = true;
            const status = rows[i][4];
            const details = rows[i][3];
            let parsedParams;

            try {
              parsedParams = JSON.parse(details);
            } catch (e) {
              parsedParams = [];
            }

            // Check if approve checkbox is checked (column G, index 6)
            const isApproved = rows[i][6] === "TRUE" || rows[i][6] === true;

            // Check if reject checkbox is checked (column H, index 7)
            const isRejected = rows[i][7] === "TRUE" || rows[i][7] === true;

            if (isApproved) {
              // Update status to "Approved"
              await sheetClient.setCellValue(
                PENDING_TRANSACTIONS_SHEET,
                i + 1,
                "E",
                "Approved"
              );

              // For transactions, add an entry to Wallet Explorer sheet immediately with "Pending" status
              if (method === "eth_sendTransaction" && parsedParams?.[0]) {
                const txParams = parsedParams[0];
                const currentTimestamp = new Date().toISOString();

                // Add to Wallet Explorer with "Processing" status
                await addTransactionToSheet(
                  sheetClient,
                  "pending-" + requestId, // Temporary hash until real one is available
                  wallet.address,
                  txParams.to,
                  ethers.formatEther(txParams.value || "0"),
                  currentTimestamp,
                  "Processing"
                );
              }

              // Process the approved request
              await processRequest(
                wcRequestId,
                method,
                params,
                wallet,
                topic,
                web3wallet,
                addTransactionToSheet,
                sheetClient,
                requestId
              );

              // Clear the checkboxes
              await sheetClient.setCellValue(
                PENDING_TRANSACTIONS_SHEET,
                i + 1,
                "G",
                false
              );
              await sheetClient.setCellValue(
                PENDING_TRANSACTIONS_SHEET,
                i + 1,
                "H",
                false
              );

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient);

              // Remove from active monitors
              activeMonitors.delete(requestId);
              return; // Stop checking
            } else if (isRejected) {
              // Update status to "Rejected"
              await sheetClient.setCellValue(
                PENDING_TRANSACTIONS_SHEET,
                i + 1,
                "E",
                "Rejected"
              );

              // For transactions, add an entry to Wallet Explorer sheet with "Rejected" status
              if (method === "eth_sendTransaction" && parsedParams?.[0]) {
                const txParams = parsedParams[0];
                const currentTimestamp = new Date().toISOString();

                // Add to Wallet Explorer with "Rejected" status
                await addTransactionToSheet(
                  sheetClient,
                  "rejected-" + requestId,
                  wallet.address,
                  txParams.to,
                  ethers.formatEther(txParams.value || "0"),
                  currentTimestamp,
                  "Rejected"
                );
              }

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

              // Clear the checkboxes
              await sheetClient.setCellValue(
                PENDING_TRANSACTIONS_SHEET,
                i + 1,
                "G",
                false
              );
              await sheetClient.setCellValue(
                PENDING_TRANSACTIONS_SHEET,
                i + 1,
                "H",
                false
              );

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient);

              // Remove from active monitors
              activeMonitors.delete(requestId);
              return; // Stop checking
            }
            // If status is already approved/rejected but not handled by the checkboxes
            else if (status === "Approved") {
              // Process the approved request
              await processRequest(
                wcRequestId,
                method,
                params,
                wallet,
                topic,
                web3wallet,
                addTransactionToSheet,
                sheetClient,
                requestId
              );

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient);

              // Remove from active monitors
              activeMonitors.delete(requestId);
              return; // Stop checking
            } else if (status === "Rejected") {
              // For transactions, add an entry to Wallet Explorer sheet with "Rejected" status
              if (method === "eth_sendTransaction" && parsedParams?.[0]) {
                const txParams = parsedParams[0];
                const currentTimestamp = new Date().toISOString();

                // Add to Wallet Explorer with "Rejected" status
                await addTransactionToSheet(
                  sheetClient,
                  "rejected-" + requestId,
                  wallet.address,
                  txParams.to,
                  ethers.formatEther(txParams.value || "0"),
                  currentTimestamp,
                  "Rejected"
                );
              }

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

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient);

              // Remove from active monitors
              activeMonitors.delete(requestId);
              return; // Stop checking
            }
          }
        }

        // If the request no longer exists in the sheet (cleared/deleted)
        if (!found) {
          activeMonitors.delete(requestId);
          return;
        }

        // Continue checking
        setTimeout(checkStatus, 5000); // Check every 5 seconds (reduced for faster checkbox response)
      } catch (error: unknown) {
        setTimeout(checkStatus, 10000); // Retry after error
      }
    };

    // Start checking
    checkStatus();
  } catch (error: unknown) {
    // Remove from active monitors in case of error
    activeMonitors.delete(requestId);
  }
}

/**
 * Process an approved request
 */
export async function processRequest(
  wcRequestId: string,
  method: string,
  params: any[],
  wallet: ethers.Wallet,
  topic: string,
  web3wallet: any,
  addTransactionToSheet: Function,
  sheetClient?: SheetClient,
  requestId: string = "" // Original request ID to link with pending entries
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
          process.env.ETH_RPC_URL || "https://arbitrum-sepolia.drpc.org"
        );
        const connectedWallet = wallet.connect(provider);

        try {
          const tx = await connectedWallet.sendTransaction({
            to: txParams.to,
            value: txParams.value ? ethers.toBigInt(txParams.value) : BigInt(0),
            data: txParams.data || "0x",
            gasLimit: txParams.gas ? ethers.toBigInt(txParams.gas) : undefined,
          });

          result = tx.hash;

          // Find and update the pending entry in Wallet Explorer
          if (sheetClient && requestId) {
            const walletExplorerRows = await sheetClient.getSheetValues(
              WALLET_EXPLORER_SHEET
            );
            let updatedEntry = false;

            // Look for temporary pending entry
            for (let i = 1; i < walletExplorerRows.length; i++) {
              const row = walletExplorerRows[i];
              if (row[0] === "pending-" + requestId) {
                // Update the transaction hash
                await sheetClient.setCellValue(
                  WALLET_EXPLORER_SHEET,
                  i + 1,
                  "A",
                  tx.hash
                );

                // Update status to Pending
                await sheetClient.setCellValue(
                  WALLET_EXPLORER_SHEET,
                  i + 1,
                  "F",
                  "Pending"
                );

                // Verify update was successful
                const updatedHash = await sheetClient.getCellValue(
                  WALLET_EXPLORER_SHEET,
                  i + 1,
                  "A"
                );

                if (updatedHash === tx.hash) {
                  updatedEntry = true;
                }
                break;
              }
            }

            // If no entry was found or update failed, create a new one
            if (!updatedEntry) {
              const timestamp = new Date().toISOString();
              await addTransactionToSheet(
                sheetClient,
                tx.hash,
                wallet.address,
                txParams.to,
                ethers.formatEther(txParams.value || "0"),
                timestamp,
                "Pending"
              );
            }

            // Wait a moment to ensure sheet updates are processed
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Start transaction status monitoring
            updateTransactionStatus(tx.hash, provider, sheetClient);
          }
        } catch (error) {
          // Only try to create fallback entry if we have a sheet client
          if (sheetClient) {
            // Fallback: create a new entry
            const timestamp = new Date().toISOString();
            await addTransactionToSheet(
              sheetClient,
              "failed-tx",
              wallet.address,
              txParams.to,
              ethers.formatEther(txParams.value || "0"),
              timestamp,
              "Failed"
            );
          }
        }
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
  } catch (error: unknown) {
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
 * Update transaction status in Wallet Explorer sheet based on receipt
 */
export async function updateTransactionStatus(
  txHash: string,
  provider: ethers.JsonRpcProvider,
  sheetClient: SheetClient
) {
  if (!sheetClient) {
    return;
  }

  try {
    let attemptCount = 0;
    const maxAttempts = 30; // Allow up to 5 minutes of monitoring (10s * 30)

    // Function to wait for transaction confirmation
    const waitForReceipt = async () => {
      try {
        if (attemptCount >= maxAttempts) {
          return;
        }

        attemptCount++;

        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
          // Transaction not yet mined, check again in 10 seconds
          setTimeout(waitForReceipt, 10000);
          return;
        }

        // Transaction is mined, update status in sheet
        const status = receipt.status === 1 ? "Success" : "Failed";

        // Perform multiple attempts to update the status in case of sheet API issues
        let updated = false;
        for (
          let retryAttempt = 0;
          retryAttempt < 3 && !updated;
          retryAttempt++
        ) {
          try {
            // Update status in Wallet Explorer sheet
            const rows = await sheetClient.getSheetValues(
              WALLET_EXPLORER_SHEET
            );
            let found = false;

            for (let i = 1; i < rows.length; i++) {
              if (rows[i][0] === txHash) {
                found = true;

                await sheetClient.setCellValue(
                  WALLET_EXPLORER_SHEET,
                  i + 1,
                  "F",
                  status
                );

                // Verify the update was successful
                const updatedValue = await sheetClient.getCellValue(
                  WALLET_EXPLORER_SHEET,
                  i + 1,
                  "F"
                );

                if (updatedValue === status) {
                  updated = true;
                  break;
                }
              }
            }

            if (!found) {
              // Try adding the transaction since it wasn't found
              if (retryAttempt === 2) {
              }
            }

            if (updated) {
              break;
            } else if (retryAttempt < 2) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          } catch (retryError) {
            if (retryAttempt < 2) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }
        }

        if (!updated) {
          console.warn(
            `Failed to update transaction ${txHash} status after multiple attempts`
          );
        }
      } catch (error) {
        // If we still have attempts left, retry
        if (attemptCount < maxAttempts) {
          setTimeout(waitForReceipt, 15000); // Retry in 15 seconds after an error
        } else {
          console.warn(
            `Max retry attempts reached after error. Stopping monitoring for ${txHash}`
          );
        }
      }
    };

    // Start monitoring the transaction immediately
    waitForReceipt();

    // Return immediately to not block execution
    return;
  } catch (error) {
    console.warn(`Error setting up transaction monitoring: ${error}`);
  }
}

/**
 * Monitor for dApp connections
 */
export async function monitorDAppConnections(
  wallet: ethers.Wallet,
  web3wallet: any,
  sheetClient: SheetClient,
  addTransactionToSheet: Function
) {
  try {
    console.log(
      `[DEBUG] Starting dApp connection monitoring for wallet: ${wallet.address}`
    );

    // Check cell A3 in ActiveSessions sheet for new WalletConnect URL
    const checkUrl = async () => {
      try {
        console.log(
          `[DEBUG] Checking for new WalletConnect URLs in ActiveSessions sheet`
        );

        // First check if the ActiveSessions sheet exists
        try {
          const sheetValues = await sheetClient.getSheetValues(
            ACTIVE_SESSIONS_SHEET
          );

          // If we get here, the sheet exists, now check if it has the proper structure
          if (sheetValues.length < 4) {
            // Sheet doesn't have enough rows, let's ensure the proper structure
            await sheetClient.setRangeValues(`${ACTIVE_SESSIONS_SHEET}!A1:E4`, [
              [
                "Connection ID",
                "dApp URL",
                "WalletConnect URL",
                "Status",
                "Timestamp",
              ],
              [
                "TO CONNECT: Paste a WalletConnect URL (starting with 'wc:') in cell A3 below",
                "Copy a WalletConnect URL from any dApp's connect wallet dialog",
                "The URL must be a v2 format URL starting with 'wc:' and containing '@2'",
                "The URL will be processed automatically once pasted",
                "Each URL can be used only once - get a fresh URL from the dApp for each connection",
              ],
              ["", "", "", "", ""],
              [
                "TROUBLESHOOTING",
                "If connection fails, make sure you're using a fresh WalletConnect URL",
                "URLs expire after a short time (typically 60 seconds)",
                "Make sure the URL starts with 'wc:' and contains '@2' for v2 protocol",
                "Example format: wc:a1b2c3...@2?relay-protocol=irn&symKey=abc123...",
              ],
            ]);
            setTimeout(checkUrl, 5000); // Check again after 5 seconds
            return;
          }

          // Now it's safe to check cell A3
          const url = await sheetClient.getCellValue(
            ACTIVE_SESSIONS_SHEET,
            3,
            "A"
          );
          if (url && typeof url === "string" && url.startsWith("wc:")) {
            // Clear the cell
            await sheetClient.setCellValue(ACTIVE_SESSIONS_SHEET, 3, "A", "");

            // Generate unique connection ID
            const connectionId = `conn-${Date.now()}`;

            // Connect to dApp
            await connectToDApp(
              url,
              wallet,
              web3wallet,
              connectionId,
              sheetClient,
              addTransactionToSheet
            );
          } else {
            if (
              url &&
              typeof url === "string" &&
              !url.startsWith("wc:") &&
              url !== ""
            ) {
              console.log(
                `[DEBUG] Found non-WalletConnect text in cell A3: "${url}"`
              );
            } else {
              console.log(`[DEBUG] No WalletConnect URL found in cell A3`);
            }
          }
        } catch (sheetError) {
          // The sheet might not exist or have the right structure
          console.warn(
            `[DEBUG] Error accessing ActiveSessions sheet: ${
              sheetError instanceof Error
                ? sheetError.message
                : String(sheetError)
            }`
          );
          console.log(`Creating or fixing ${ACTIVE_SESSIONS_SHEET} sheet`);

          // Try to create the ActiveSessions sheet
          try {
            console.log(
              `[DEBUG] Attempting to create ${ACTIVE_SESSIONS_SHEET} sheet`
            );
            await sheetClient.createSheet(ACTIVE_SESSIONS_SHEET);
            // Set up headers and prompt
            await sheetClient.setRangeValues(`${ACTIVE_SESSIONS_SHEET}!A1:E4`, [
              [
                "Connection ID",
                "dApp URL",
                "WalletConnect URL",
                "Status",
                "Timestamp",
              ],
              [
                "TO CONNECT: Paste a WalletConnect URL (starting with 'wc:') in cell A3 below",
                "Copy a WalletConnect URL from any dApp's connect wallet dialog",
                "The URL must be a v2 format URL starting with 'wc:' and containing '@2'",
                "The URL will be processed automatically once pasted",
                "Each URL can be used only once - get a fresh URL from the dApp for each connection",
              ],
              ["", "", "", "", ""],
              [
                "TROUBLESHOOTING",
                "If connection fails, make sure you're using a fresh WalletConnect URL",
                "URLs expire after a short time (typically 60 seconds)",
                "Make sure the URL starts with 'wc:' and contains '@2' for v2 protocol",
                "Example format: wc:a1b2c3...@2?relay-protocol=irn&symKey=abc123...",
              ],
            ]);
            console.log(`${ACTIVE_SESSIONS_SHEET} sheet created successfully`);
          } catch (createError) {
            // Sheet might exist but we can't access it properly
            console.warn(
              `[DEBUG] Error creating ${ACTIVE_SESSIONS_SHEET} sheet: ${
                createError instanceof Error
                  ? createError.message
                  : String(createError)
              }`
            );
            console.warn(
              `Error with ${ACTIVE_SESSIONS_SHEET} sheet: ${
                createError instanceof Error
                  ? createError.message
                  : String(createError)
              }`
            );
          }
        }
      } catch (error: unknown) {
        // Don't log this error too frequently to avoid cluttering the logs
        console.warn(
          `[DEBUG] Error in checkUrl: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        console.error(
          `Error checking for WalletConnect URL: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Check again after delay
      console.log(`[DEBUG] Scheduling next URL check in 30 seconds`);
      setTimeout(checkUrl, 30000); // Check every 30 seconds
    };

    // Start checking
    checkUrl();

    console.log("dApp connection monitoring started");

    // Register for session events
    console.log(
      `[DEBUG] Setting up session_request event listener on web3wallet`
    );
    web3wallet.on("session_request", async (event: any) => {
      // Handle session requests (transactions, signatures)
      const { topic, params } = event;
      const { request } = params;

      console.log(
        `[DEBUG] Received session_request event. Topic: ${topic}, Method: ${request.method}`
      );
      console.log(`Received session request: ${request.method}`);

      // Find the connection ID for this topic
      let connectionId = "";
      try {
        console.log(`[DEBUG] Searching for connection ID for topic: ${topic}`);
        const sessions = await sheetClient.getSheetValues(
          ACTIVE_SESSIONS_SHEET
        );
        for (let i = 1; i < sessions.length; i++) {
          if (sessions[i][0] && sessions[i][2] === topic) {
            connectionId = sessions[i][0];
            console.log(
              `[DEBUG] Found connection ID: ${connectionId} for topic: ${topic}`
            );
            break;
          }
        }

        if (!connectionId) {
          console.log(
            `[DEBUG] No connection ID found for topic: ${topic}, generating new ID`
          );
          connectionId = `conn-${Date.now()}`;
          console.log(`[DEBUG] Generated new connection ID: ${connectionId}`);
        }
      } catch (error) {
        // If we can't find the connection ID, generate a new one
        console.log(`[DEBUG] Error finding connection ID for topic: ${topic}`);
        connectionId = `conn-${Date.now()}`;
        console.log(`[DEBUG] Generated new connection ID: ${connectionId}`);
      }

      await handleSessionRequest(
        event,
        wallet,
        connectionId,
        web3wallet,
        sheetClient,
        addTransactionToSheet
      );
    });
  } catch (error: unknown) {
    console.warn(
      `[DEBUG] Error in monitorDAppConnections: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    if (error instanceof Error && error.stack) {
      console.warn(`[DEBUG] Error stack: ${error.stack}`);
    }
    console.warn(
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
  addTransactionToSheet: Function
) {
  try {
    if (!web3wallet) {
      console.log("WalletConnect not initialized");
      return;
    }

    const timestamp = new Date().toISOString();
    console.log(`[DEBUG] Creating new connection with ID: ${connectionId}`);

    // Add connection to ActiveSessions sheet with "Connecting" status
    await sheetClient.appendRows(ACTIVE_SESSIONS_SHEET, [
      [connectionId, "Connecting...", wcUrl, "Connecting", timestamp],
    ]);

    try {
      // Check URL format
      if (!wcUrl.startsWith("wc:")) {
        throw new Error(
          "Invalid WalletConnect URL format. Must start with 'wc:'"
        );
      }

      // Attempt pairing with logging for diagnostic purposes
      const pairResult = await web3wallet.core.pairing.pair({ uri: wcUrl });

      if (!pairResult || (!pairResult.topic && !pairResult.uri)) {
        throw new Error("Pairing returned an invalid result");
      }

      // Set up session proposal listener
      web3wallet.on("session_proposal", async (proposal: any) => {
        try {
          // Get dApp metadata safely
          let dAppUrl = "Unknown";
          let dAppName = "Unknown";

          if (
            proposal.params &&
            proposal.params.proposer &&
            proposal.params.proposer.metadata
          ) {
            // WalletConnect v2 structure
            const { metadata } = proposal.params.proposer;
            dAppUrl = metadata.url || "Unknown";
            dAppName = metadata.name || "Unknown";
          } else if (proposal.proposer && proposal.proposer.metadata) {
            // Alternative structure
            const { metadata } = proposal.proposer;
            dAppUrl = metadata.url || "Unknown";
            dAppName = metadata.name || "Unknown";
          } else {
            if (proposal.params) {
              console.log(
                `[DEBUG] proposal.params keys: ${Object.keys(
                  proposal.params
                ).join(", ")}`
              );
            }
          }

          // Try to extract namespaces regardless of structure
          let requiredNamespaces = {};
          if (proposal.params && proposal.params.requiredNamespaces) {
            requiredNamespaces = proposal.params.requiredNamespaces;
          } else if (proposal.requiredNamespaces) {
            requiredNamespaces = proposal.requiredNamespaces;
          }

          // Update dApp URL in sheet
          await updateConnectionStatus(
            sheetClient,
            connectionId,
            "Pending",
            dAppUrl
          );

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

          try {
            // Prepare the approval parameters
            let approvalParams: any = {
              id: proposal.id,
              namespaces,
            };

            // For v2, we might need to use different parameters
            if (proposal.proposalId) {
              // This might be a v2 specific format
              approvalParams = {
                proposalId: proposal.proposalId,
                namespaces,
              };
            }

            // Try to approve the session
            const session = await web3wallet.approveSession(approvalParams);

            // Update connection status to "Connected"
            await updateConnectionStatus(
              sheetClient,
              connectionId,
              "Connected",
              dAppUrl
            );

            web3wallet.on("session_request", async (event: any) => {
              await handleSessionRequest(
                event,
                wallet,
                connectionId,
                web3wallet,
                sheetClient,
                addTransactionToSheet
              );
            });

            // Set up session delete listener
            console.log(`[DEBUG] Setting up session delete listener`);
            web3wallet.on("session_delete", async (event: any) => {
              console.log(
                `[DEBUG] Received session delete event. Topic: ${event.topic}`
              );
              if (event.topic === session.topic) {
                await updateConnectionStatus(
                  sheetClient,
                  connectionId,
                  "Disconnected",
                  dAppUrl
                );
                console.log(`Disconnected from dApp: ${dAppUrl}`);
              }
            });
          } catch (approvalError: unknown) {
            console.warn(
              `[DEBUG] Error in approveSession: ${
                approvalError instanceof Error
                  ? approvalError.message
                  : String(approvalError)
              }`
            );
            if (approvalError instanceof Error && approvalError.stack) {
              console.warn(`[DEBUG] Error stack: ${approvalError.stack}`);
            }
            throw approvalError;
          }
        } catch (error: unknown) {
          console.warn(
            `[DEBUG] Error in session_proposal handler: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          if (error instanceof Error && error.stack) {
            console.warn(`[DEBUG] Error stack: ${error.stack}`);
          }
          await updateConnectionStatus(sheetClient, connectionId, "Failed");
          console.warn(
            `Error handling session proposal: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      });
    } catch (error: unknown) {
      console.warn(
        `[DEBUG] Error in pairing process: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      if (error instanceof Error && error.stack) {
        console.warn(`[DEBUG] Error stack: ${error.stack}`);
      }
      await updateConnectionStatus(sheetClient, connectionId, "Failed");
      console.warn(
        `Error connecting to dApp: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } catch (error: unknown) {
    console.warn(
      `[DEBUG] General error in connectToDApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    if (error instanceof Error && error.stack) {
      console.warn(`[DEBUG] Error stack: ${error.stack}`);
    }
    console.warn(
      `Error in connectToDApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
