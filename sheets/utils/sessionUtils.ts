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

    logEvent(`[DEBUG] Transaction key: ${transactionKey}`);

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
              logEvent(
                `[DEBUG] Found duplicate transaction request at row ${i + 1}`
              );
              break;
            }
          } else {
            // For other requests, use exact details matching
            if (row[3] === JSON.stringify(requestParams)) {
              existingTransactionRow = row;
              existingRequestId = row[0];
              logEvent(`[DEBUG] Found duplicate request at row ${i + 1}`);
              break;
            }
          }
        } catch (e) {
          // If parsing fails, continue to the next row
          logEvent(`[DEBUG] Error comparing row ${i + 1}: ${e}`);
        }
      }
    }

    // If the transaction already exists, use the existing request ID instead of creating a new one
    if (existingTransactionRow) {
      logEvent(
        `[DEBUG] Duplicate transaction detected with ID ${existingRequestId}`
      );

      // If the transaction is pending, use the existing one
      if (existingTransactionRow[4] === "Pending") {
        logEvent(
          `Skipping duplicate transaction request. Using existing request ID ${existingRequestId}`
        );

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
          addTransactionToSheet,
          logEvent
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
      await addCheckboxesToRow(sheetClient, rowIndex, logEvent);
      logEvent(
        `Added approval checkboxes to request ${requestId} at row ${rowIndex}`
      );
    }

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
  addTransactionToSheet: Function,
  logEvent: Function
) {
  try {
    // Check if this request is already being monitored
    if (activeMonitors.has(requestId)) {
      logEvent(
        `Request ${requestId} is already being monitored - skipping duplicate monitor`
      );
      return;
    }

    // Add to active monitors set
    activeMonitors.add(requestId);
    logEvent(`Started monitoring request ${requestId}`);

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
              logEvent(`[DEBUG] Error parsing request details: ${e}`);
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

                logEvent(
                  `Added transaction to Wallet Explorer with Processing status`
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
                logEvent,
                sheetClient,
                requestId // Pass the requestId to link the pending transaction
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

              logEvent(`Request ${requestId} approved and processed`);

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient, logEvent);

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

                logEvent(`Added rejected transaction to Wallet Explorer`);
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

              logEvent(`Request ${requestId} rejected`);

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient, logEvent);

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
                logEvent,
                sheetClient,
                requestId
              );

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient, logEvent);

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

                logEvent(`Added rejected transaction to Wallet Explorer`);
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

              logEvent(`Request ${requestId} rejected`);

              // Clear completed transactions
              await clearCompletedTransactions(sheetClient, logEvent);

              // Remove from active monitors
              activeMonitors.delete(requestId);
              return; // Stop checking
            }
          }
        }

        // If the request no longer exists in the sheet (cleared/deleted)
        if (!found) {
          logEvent(
            `Request ${requestId} no longer found in sheet - stopping monitor`
          );
          activeMonitors.delete(requestId);
          return;
        }

        // Continue checking
        setTimeout(checkStatus, 5000); // Check every 5 seconds (reduced for faster checkbox response)
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
    // Remove from active monitors in case of error
    activeMonitors.delete(requestId);

    logEvent(
      `Error monitoring request approval: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
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
  logEvent: Function,
  sheetClient: SheetClient,
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

        logEvent(`[DEBUG] Preparing to send transaction to: ${txParams.to}`);

        try {
          const tx = await connectedWallet.sendTransaction({
            to: txParams.to,
            value: txParams.value ? ethers.toBigInt(txParams.value) : BigInt(0),
            data: txParams.data || "0x",
            gasLimit: txParams.gas ? ethers.toBigInt(txParams.gas) : undefined,
          });

          result = tx.hash;
          logEvent(
            `[DEBUG] Transaction sent successfully with hash: ${tx.hash}`
          );

          // Find and update the pending entry in Wallet Explorer
          if (requestId) {
            try {
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
                    logEvent(
                      `[DEBUG] Successfully updated temporary transaction entry with hash ${tx.hash}`
                    );
                  } else {
                    logEvent(
                      `[DEBUG] Update verification failed. Hash should be ${tx.hash} but got ${updatedHash}`
                    );
                  }
                  break;
                }
              }

              // If no entry was found or update failed, create a new one
              if (!updatedEntry) {
                logEvent(
                  `[DEBUG] No existing entry found or update failed. Creating new transaction entry.`
                );
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
                logEvent(
                  `[DEBUG] Added new transaction to Wallet Explorer: ${tx.hash}`
                );
              }

              // Wait a moment to ensure sheet updates are processed
              await new Promise((resolve) => setTimeout(resolve, 2000));

              // Start transaction status monitoring
              logEvent(
                `[DEBUG] Initiating status monitoring for transaction ${tx.hash}`
              );
              updateTransactionStatus(tx.hash, provider, sheetClient, logEvent);
            } catch (error) {
              logEvent(
                `[DEBUG] Error updating transaction in Wallet Explorer: ${error}`
              );

              // Fallback: create a new entry
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

              // Start transaction status monitoring
              setTimeout(() => {
                updateTransactionStatus(
                  tx.hash,
                  provider,
                  sheetClient,
                  logEvent
                );
              }, 3000); // Slight delay to ensure the entry is created first
            }
          } else {
            // If no requestId is provided, just add a new entry
            logEvent(
              `[DEBUG] No requestId provided. Creating new transaction entry.`
            );
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

            // Start transaction status monitoring with a slight delay
            setTimeout(() => {
              updateTransactionStatus(tx.hash, provider, sheetClient, logEvent);
            }, 3000);
          }
        } catch (txError) {
          logEvent(`[DEBUG] Transaction error: ${txError}`);
          throw txError; // Re-throw to be caught by the outer try/catch
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
 * Update transaction status in Wallet Explorer sheet based on receipt
 */
export async function updateTransactionStatus(
  txHash: string,
  provider: ethers.JsonRpcProvider,
  sheetClient: SheetClient,
  logEvent: Function
) {
  if (!sheetClient) {
    logEvent(
      `Error: SheetClient not available for updating transaction status`
    );
    return;
  }

  try {
    logEvent(`[DEBUG] Monitoring transaction ${txHash} for status updates`);

    let attemptCount = 0;
    const maxAttempts = 30; // Allow up to 5 minutes of monitoring (10s * 30)

    // Function to wait for transaction confirmation
    const waitForReceipt = async () => {
      try {
        if (attemptCount >= maxAttempts) {
          logEvent(
            `[DEBUG] Max attempts reached for transaction ${txHash}. Stopping monitoring.`
          );
          return;
        }

        attemptCount++;
        logEvent(
          `[DEBUG] Checking receipt for ${txHash} (Attempt ${attemptCount}/${maxAttempts})`
        );

        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
          // Transaction not yet mined, check again in 10 seconds
          logEvent(
            `[DEBUG] No receipt yet for transaction ${txHash}. Checking again in 10 seconds.`
          );
          setTimeout(waitForReceipt, 10000);
          return;
        }

        // Transaction is mined, update status in sheet
        const status = receipt.status === 1 ? "Success" : "Failed";
        logEvent(
          `[DEBUG] Transaction ${txHash} confirmed with status: ${status}`
        );

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
                logEvent(
                  `[DEBUG] Found transaction in Wallet Explorer at row ${i + 1}`
                );
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
                  logEvent(
                    `Transaction ${txHash} status updated to ${status} in Wallet Explorer`
                  );
                  updated = true;
                  break;
                } else {
                  logEvent(
                    `[DEBUG] Status update verification failed. Got "${updatedValue}" instead of "${status}"`
                  );
                }
              }
            }

            if (!found) {
              logEvent(
                `[DEBUG] Transaction ${txHash} not found in Wallet Explorer sheet. Retrying search...`
              );

              // Try adding the transaction since it wasn't found
              if (retryAttempt === 2) {
                logEvent(
                  `[DEBUG] Transaction not found after retries. This may indicate a synchronization issue.`
                );
              }
            }

            if (updated) {
              break;
            } else if (retryAttempt < 2) {
              // Wait before retrying
              logEvent(
                `[DEBUG] Update attempt ${
                  retryAttempt + 1
                } failed. Waiting 5s before retry.`
              );
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          } catch (retryError) {
            logEvent(
              `[DEBUG] Error during update attempt ${
                retryAttempt + 1
              }: ${retryError}`
            );
            if (retryAttempt < 2) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }
        }

        if (!updated) {
          logEvent(
            `[WARNING] Failed to update transaction ${txHash} status after multiple attempts`
          );
        }
      } catch (error) {
        logEvent(`[DEBUG] Error checking transaction receipt: ${error}`);

        // If we still have attempts left, retry
        if (attemptCount < maxAttempts) {
          setTimeout(waitForReceipt, 15000); // Retry in 15 seconds after an error
        } else {
          logEvent(
            `[DEBUG] Max retry attempts reached after error. Stopping monitoring for ${txHash}`
          );
        }
      }
    };

    // Start monitoring the transaction immediately
    waitForReceipt();

    // Return immediately to not block execution
    return;
  } catch (error) {
    logEvent(`[DEBUG] Error setting up transaction monitoring: ${error}`);
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
    logEvent(
      `[DEBUG] Starting dApp connection monitoring for wallet: ${wallet.address}`
    );

    // Check cell A3 in ActiveSessions sheet for new WalletConnect URL
    const checkUrl = async () => {
      try {
        logEvent(
          `[DEBUG] Checking for new WalletConnect URLs in ActiveSessions sheet`
        );

        // First check if the ActiveSessions sheet exists
        try {
          logEvent(
            `[DEBUG] Attempting to get values from ${ACTIVE_SESSIONS_SHEET} sheet`
          );
          const sheetValues = await sheetClient.getSheetValues(
            ACTIVE_SESSIONS_SHEET
          );
          logEvent(
            `[DEBUG] Successfully retrieved values from ActiveSessions sheet. Found ${sheetValues.length} rows`
          );

          // If we get here, the sheet exists, now check if it has the proper structure
          if (sheetValues.length < 4) {
            logEvent(
              `[DEBUG] ActiveSessions sheet doesn't have enough rows (${sheetValues.length}), fixing structure`
            );
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
            logEvent(`Fixed structure of ${ACTIVE_SESSIONS_SHEET} sheet`);
            setTimeout(checkUrl, 5000); // Check again after 5 seconds
            return;
          }

          // Now it's safe to check cell A3
          logEvent(`[DEBUG] Checking cell A3 for WalletConnect URL`);
          const url = await sheetClient.getCellValue(
            ACTIVE_SESSIONS_SHEET,
            3,
            "A"
          );
          logEvent(`[DEBUG] Cell A3 value: "${url}"`);

          if (url && typeof url === "string" && url.startsWith("wc:")) {
            logEvent(`Found WalletConnect URL: ${url}`);

            // Clear the cell
            logEvent(`[DEBUG] Clearing cell A3`);
            await sheetClient.setCellValue(ACTIVE_SESSIONS_SHEET, 3, "A", "");

            // Generate unique connection ID
            const connectionId = `conn-${Date.now()}`;
            logEvent(`[DEBUG] Generated connection ID: ${connectionId}`);

            // Connect to dApp
            logEvent(`[DEBUG] Initiating connection to dApp with URL: ${url}`);
            await connectToDApp(
              url,
              wallet,
              web3wallet,
              connectionId,
              sheetClient,
              addTransactionToSheet,
              logEvent
            );
          } else {
            if (
              url &&
              typeof url === "string" &&
              !url.startsWith("wc:") &&
              url !== ""
            ) {
              logEvent(
                `[DEBUG] Found non-WalletConnect text in cell A3: "${url}"`
              );
            } else {
              logEvent(`[DEBUG] No WalletConnect URL found in cell A3`);
            }
          }
        } catch (sheetError) {
          // The sheet might not exist or have the right structure
          logEvent(
            `[DEBUG] Error accessing ActiveSessions sheet: ${
              sheetError instanceof Error
                ? sheetError.message
                : String(sheetError)
            }`
          );
          logEvent(`Creating or fixing ${ACTIVE_SESSIONS_SHEET} sheet`);

          // Try to create the ActiveSessions sheet
          try {
            logEvent(
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
            logEvent(`${ACTIVE_SESSIONS_SHEET} sheet created successfully`);
          } catch (createError) {
            // Sheet might exist but we can't access it properly
            logEvent(
              `[DEBUG] Error creating ${ACTIVE_SESSIONS_SHEET} sheet: ${
                createError instanceof Error
                  ? createError.message
                  : String(createError)
              }`
            );
            logEvent(
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
        logEvent(
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
      logEvent(`[DEBUG] Scheduling next URL check in 30 seconds`);
      setTimeout(checkUrl, 30000); // Check every 30 seconds
    };

    // Start checking
    checkUrl();

    logEvent("dApp connection monitoring started");

    // Register for session events
    logEvent(`[DEBUG] Setting up session_request event listener on web3wallet`);
    web3wallet.on("session_request", async (event: any) => {
      // Handle session requests (transactions, signatures)
      const { topic, params } = event;
      const { request } = params;

      logEvent(
        `[DEBUG] Received session_request event. Topic: ${topic}, Method: ${request.method}`
      );
      logEvent(`Received session request: ${request.method}`);

      // Find the connection ID for this topic
      let connectionId = "";
      try {
        logEvent(`[DEBUG] Searching for connection ID for topic: ${topic}`);
        const sessions = await sheetClient.getSheetValues(
          ACTIVE_SESSIONS_SHEET
        );
        for (let i = 1; i < sessions.length; i++) {
          if (sessions[i][0] && sessions[i][2] === topic) {
            connectionId = sessions[i][0];
            logEvent(
              `[DEBUG] Found connection ID: ${connectionId} for topic: ${topic}`
            );
            break;
          }
        }

        if (!connectionId) {
          logEvent(
            `[DEBUG] No connection ID found for topic: ${topic}, generating new ID`
          );
          connectionId = `conn-${Date.now()}`;
          logEvent(`[DEBUG] Generated new connection ID: ${connectionId}`);
        }
      } catch (error) {
        // If we can't find the connection ID, generate a new one
        logEvent(`[DEBUG] Error finding connection ID for topic: ${topic}`);
        connectionId = `conn-${Date.now()}`;
        logEvent(`[DEBUG] Generated new connection ID: ${connectionId}`);
      }

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
  } catch (error: unknown) {
    logEvent(
      `[DEBUG] Error in monitorDAppConnections: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    if (error instanceof Error && error.stack) {
      logEvent(`[DEBUG] Error stack: ${error.stack}`);
    }
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
    logEvent(`[DEBUG] Starting connection process for URI: ${wcUrl}`);

    if (!web3wallet) {
      logEvent("WalletConnect not initialized");
      return;
    }

    const timestamp = new Date().toISOString();
    logEvent(`[DEBUG] Creating new connection with ID: ${connectionId}`);

    // Add connection to ActiveSessions sheet with "Connecting" status
    await sheetClient.appendRows(ACTIVE_SESSIONS_SHEET, [
      [connectionId, "Connecting...", wcUrl, "Connecting", timestamp],
    ]);
    logEvent(
      `[DEBUG] Added connection to ActiveSessions sheet with status 'Connecting'`
    );

    try {
      // Pair with the dApp
      logEvent(`[DEBUG] Attempting to pair with dApp using WalletConnect URL`);
      logEvent(
        `[DEBUG] URL format: ${wcUrl.substring(
          0,
          Math.min(30, wcUrl.length)
        )}...`
      );

      // Check URL format
      if (!wcUrl.startsWith("wc:")) {
        throw new Error(
          "Invalid WalletConnect URL format. Must start with 'wc:'"
        );
      }

      try {
        // Try to extract components for debugging
        const [wcProtocol, wcParams] = wcUrl.split("?");
        const wcProtocolParts = wcProtocol.split("@");

        if (wcProtocolParts.length > 1) {
          const version = wcProtocolParts[1];
          logEvent(`[DEBUG] WalletConnect protocol version: ${version}`);

          if (version !== "2") {
            logEvent(
              `[WARN] WalletConnect URL uses version ${version}, but this wallet supports v2. Attempting to pair anyway.`
            );
          }
        }

        if (wcParams) {
          const paramParts = wcParams.split("&");
          logEvent(`[DEBUG] URL has ${paramParts.length} parameters`);
        }
      } catch (parseError) {
        logEvent(
          `[DEBUG] Error parsing WalletConnect URL components: ${parseError}`
        );
      }

      // Attempt pairing with logging for diagnostic purposes
      logEvent(`[DEBUG] Calling web3wallet.core.pairing.pair`);
      const pairResult = await web3wallet.core.pairing.pair({ uri: wcUrl });

      if (!pairResult || (!pairResult.topic && !pairResult.uri)) {
        logEvent(
          `[DEBUG] Pairing result seems invalid: ${JSON.stringify(pairResult)}`
        );
        throw new Error("Pairing returned an invalid result");
      }

      const { uri, topic } = pairResult;
      logEvent(
        `[DEBUG] Pairing successful. Topic: ${topic || "Not available"}`
      );

      // Set up session proposal listener
      logEvent(`[DEBUG] Setting up session proposal listener`);
      web3wallet.on("session_proposal", async (proposal: any) => {
        try {
          logEvent(`[DEBUG] Received session proposal. ID: ${proposal.id}`);
          logEvent(`[DEBUG] Full proposal data: ${JSON.stringify(proposal)}`);

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
            logEvent(`[DEBUG] Found metadata in proposal.params.proposer`);
          } else if (proposal.proposer && proposal.proposer.metadata) {
            // Alternative structure
            const { metadata } = proposal.proposer;
            dAppUrl = metadata.url || "Unknown";
            dAppName = metadata.name || "Unknown";
            logEvent(`[DEBUG] Found metadata in proposal.proposer`);
          } else {
            // Could not find metadata in expected locations
            logEvent(
              `[DEBUG] Could not find metadata in proposal. Using default values.`
            );
            logEvent(
              `[DEBUG] Proposal structure: ${Object.keys(proposal).join(", ")}`
            );
            if (proposal.params) {
              logEvent(
                `[DEBUG] proposal.params keys: ${Object.keys(
                  proposal.params
                ).join(", ")}`
              );
            }
          }

          logEvent(
            `[DEBUG] dApp metadata - Name: ${dAppName}, URL: ${dAppUrl}`
          );

          // Try to extract namespaces regardless of structure
          let requiredNamespaces = {};
          if (proposal.params && proposal.params.requiredNamespaces) {
            requiredNamespaces = proposal.params.requiredNamespaces;
          } else if (proposal.requiredNamespaces) {
            requiredNamespaces = proposal.requiredNamespaces;
          }
          logEvent(
            `[DEBUG] Required namespaces: ${JSON.stringify(requiredNamespaces)}`
          );

          // Update dApp URL in sheet
          await updateConnectionStatus(
            sheetClient,
            connectionId,
            "Pending",
            dAppUrl
          );
          logEvent(`[DEBUG] Updated connection status to 'Pending'`);

          // Approve the session
          logEvent(
            `[DEBUG] Preparing to approve session with wallet address: ${wallet.address}`
          );

          // Format the wallet address according to CAIP-10 for WalletConnect v2
          const formattedAddress = wallet.address.startsWith("0x")
            ? wallet.address
            : `0x${wallet.address}`;

          const chainId = "421614"; // Arbitrum Sepolia
          const caipAddress = `eip155:${chainId}:${formattedAddress}`;
          logEvent(`[DEBUG] Formatted CAIP-10 address: ${caipAddress}`);

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
          logEvent(
            `[DEBUG] Session namespaces prepared: ${JSON.stringify(namespaces)}`
          );

          try {
            logEvent(`[DEBUG] Calling approveSession with ID: ${proposal.id}`);

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
              logEvent(`[DEBUG] Using proposalId format for approval`);
            }

            logEvent(
              `[DEBUG] Approval params: ${JSON.stringify(approvalParams)}`
            );

            // Try to approve the session
            const session = await web3wallet.approveSession(approvalParams);

            logEvent(
              `[DEBUG] Session approved successfully. Session topic: ${session.topic}`
            );

            // Update connection status to "Connected"
            await updateConnectionStatus(
              sheetClient,
              connectionId,
              "Connected",
              dAppUrl
            );
            logEvent(`Connected to dApp: ${dAppUrl}`);

            // Set up session request listener
            logEvent(`[DEBUG] Setting up session request listener`);
            web3wallet.on("session_request", async (event: any) => {
              logEvent(
                `[DEBUG] Received session request event. Method: ${event?.params?.request?.method}`
              );
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
            logEvent(`[DEBUG] Setting up session delete listener`);
            web3wallet.on("session_delete", async (event: any) => {
              logEvent(
                `[DEBUG] Received session delete event. Topic: ${event.topic}`
              );
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
          } catch (approvalError: unknown) {
            logEvent(
              `[DEBUG] Error in approveSession: ${
                approvalError instanceof Error
                  ? approvalError.message
                  : String(approvalError)
              }`
            );
            if (approvalError instanceof Error && approvalError.stack) {
              logEvent(`[DEBUG] Error stack: ${approvalError.stack}`);
            }
            throw approvalError;
          }
        } catch (error: unknown) {
          logEvent(
            `[DEBUG] Error in session_proposal handler: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          if (error instanceof Error && error.stack) {
            logEvent(`[DEBUG] Error stack: ${error.stack}`);
          }
          await updateConnectionStatus(sheetClient, connectionId, "Failed");
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
      if (error instanceof Error && error.stack) {
        logEvent(`[DEBUG] Error stack: ${error.stack}`);
      }
      await updateConnectionStatus(sheetClient, connectionId, "Failed");
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
    if (error instanceof Error && error.stack) {
      logEvent(`[DEBUG] Error stack: ${error.stack}`);
    }
    logEvent(
      `Error in connectToDApp: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
