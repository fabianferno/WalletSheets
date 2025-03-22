import { SheetClient } from "../sheets.api";
import { ethers } from "ethers";

// Sheet names
export const SETTINGS_SHEET = "Settings";
export const WALLET_EXPLORER_SHEET = "Wallet Explorer";
export const ACTIVE_SESSIONS_SHEET = "ActiveSessions";
export const PENDING_TRANSACTIONS_SHEET = "Pending Transactions";
export const LOGS_SHEET = "Logs";

/**
 * Initialize or get existing sheets
 */
export async function initializeSheets(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    console.log(`📊 Checking if all required sheets exist...`);

    // Get list of all sheets in the spreadsheet
    const allSheets = await sheetClient.getAllSheets();
    const existingSheetTitles = allSheets.map((sheet) => sheet.title);
    console.log(`📋 Existing sheets: ${existingSheetTitles.join(", ")}`);

    // Check which required sheets are missing
    const requiredSheets = [
      SETTINGS_SHEET,
      WALLET_EXPLORER_SHEET,
      ACTIVE_SESSIONS_SHEET,
      PENDING_TRANSACTIONS_SHEET,
      LOGS_SHEET,
    ];

    const missingSheets = requiredSheets.filter(
      (sheet) => !existingSheetTitles.includes(sheet)
    );

    if (missingSheets.length === 0) {
      console.log(`✅ All required sheets exist, no need to create any.`);
      logEvent("All required sheets already exist");

      // Even if sheets exist, check if Pending Transactions needs to be updated
      await updatePendingTransactionsSheet(sheetClient, logEvent);

      return;
    }

    console.log(`🛠️ Missing sheets: ${missingSheets.join(", ")}`);
    logEvent(`Creating missing sheets: ${missingSheets.join(", ")}`);

    // Create each missing sheet
    for (const sheetName of missingSheets) {
      console.log(`📝 Creating "${sheetName}" sheet...`);
      switch (sheetName) {
        case SETTINGS_SHEET:
          await createSettingsSheet(sheetClient, logEvent);
          break;
        case WALLET_EXPLORER_SHEET:
          await createWalletExplorerSheet(sheetClient, logEvent);
          break;
        case ACTIVE_SESSIONS_SHEET:
          await createActiveSessionsSheet(sheetClient, logEvent);
          break;
        case PENDING_TRANSACTIONS_SHEET:
          await createPendingTransactionsSheet(sheetClient, logEvent);
          break;
        case LOGS_SHEET:
          await createLogsSheet(sheetClient, logEvent);
          break;
      }
    }

    // Even if Pending Transactions sheet was just created, check if it has the correct structure
    if (!missingSheets.includes(PENDING_TRANSACTIONS_SHEET)) {
      await updatePendingTransactionsSheet(sheetClient, logEvent);
    }

    logEvent("Sheets initialized successfully");
  } catch (error: unknown) {
    console.error(`❌ Error in initializeSheets:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    logEvent(
      `Error initializing sheets: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create all required sheets
 */
export async function createSheets(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Create Settings sheet
    await createSettingsSheet(sheetClient, logEvent);

    // Create Wallet Explorer sheet
    await createWalletExplorerSheet(sheetClient, logEvent);

    // Create ActiveSessions sheet
    await createActiveSessionsSheet(sheetClient, logEvent);

    // Create Pending Transactions sheet
    await createPendingTransactionsSheet(sheetClient, logEvent);

    // Create Logs sheet
    await createLogsSheet(sheetClient, logEvent);

    logEvent("All sheets created successfully");
  } catch (error: unknown) {
    logEvent(
      `Error creating sheets: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create Settings sheet
 */
export async function createSettingsSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(SETTINGS_SHEET);
      return;
    } catch {
      // Create the sheet
      await sheetClient.createSheet(SETTINGS_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${SETTINGS_SHEET}!A1:B3`, [
        ["Setting", "Value"],
        ["Wallet Address", ""],
        ["Sheet Owner Email", ""],
      ]);

      logEvent(`${SETTINGS_SHEET} sheet created`);
    }
  } catch (error: unknown) {
    logEvent(
      `Error creating ${SETTINGS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create Wallet Explorer sheet
 */
export async function createWalletExplorerSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);
      return;
    } catch {
      // Create the sheet
      await sheetClient.createSheet(WALLET_EXPLORER_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A1:F1`, [
        ["Transaction Hash", "From", "To", "Amount", "Timestamp", "Status"],
      ]);

      logEvent(`${WALLET_EXPLORER_SHEET} sheet created`);
    }
  } catch (error: unknown) {
    logEvent(
      `Error creating ${WALLET_EXPLORER_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create ActiveSessions sheet
 */
export async function createActiveSessionsSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(ACTIVE_SESSIONS_SHEET);
      return;
    } catch {
      // Create the sheet
      await sheetClient.createSheet(ACTIVE_SESSIONS_SHEET);

      // Set up headers and prompt with detailed instructions
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
        [
          "", // This is cell A3 where users should paste the WalletConnect URL
          "",
          "",
          "",
          "",
        ],
        [
          "TROUBLESHOOTING",
          "If connection fails, make sure you're using a fresh WalletConnect URL",
          "URLs expire after a short time (typically 60 seconds)",
          "Make sure the URL starts with 'wc:' and contains '@2' for v2 protocol",
          "Example format: wc:a1b2c3...@2?relay-protocol=irn&symKey=abc123...",
        ],
      ]);

      // Format the instructions row
      try {
        // First get the sheet ID
        const sheetId = await sheetClient.getSheetIdByName(
          ACTIVE_SESSIONS_SHEET
        );

        // Format the instructions row (row 2, which is index 1)
        await sheetClient.formatRange(
          sheetId,
          1, // startRowIndex (0-based, so row 2)
          2, // endRowIndex (exclusive)
          0, // startColumnIndex
          5, // endColumnIndex (exclusive, so columns A-E)
          {
            backgroundColor: { red: 0.9, green: 0.97, blue: 1.0 }, // Light blue (#e6f7ff)
            textFormat: {
              bold: true,
              italic: true,
            },
          }
        );

        // Format the troubleshooting row
        await sheetClient.formatRange(
          sheetId,
          3, // startRowIndex (row 4)
          4, // endRowIndex (exclusive)
          0, // startColumnIndex
          5, // endColumnIndex (exclusive)
          {
            backgroundColor: { red: 1.0, green: 0.95, blue: 0.95 }, // Light red
            textFormat: {
              bold: true,
            },
          }
        );
      } catch (formatError) {
        logEvent(`Unable to format instructions row: ${formatError}`);
      }

      logEvent(
        `${ACTIVE_SESSIONS_SHEET} sheet created with detailed instructions`
      );
    }
  } catch (error: unknown) {
    logEvent(
      `Error creating ${ACTIVE_SESSIONS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create Pending Transactions sheet
 */
export async function createPendingTransactionsSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);
      return;
    } catch {
      // Create the sheet
      const sheetId = await sheetClient.createSheet(PENDING_TRANSACTIONS_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${PENDING_TRANSACTIONS_SHEET}!A1:H1`, [
        [
          "Request ID",
          "Connection ID",
          "Type",
          "Details",
          "Status",
          "Timestamp",
          "Approve",
          "Reject",
        ],
      ]);

      // Add instructions for approval/rejection
      await sheetClient.setRangeValues(`${PENDING_TRANSACTIONS_SHEET}!A2:H2`, [
        [
          "INSTRUCTIONS",
          "",
          "",
          "",
          "",
          "",
          "Check this box to approve",
          "Check this box to reject",
        ],
      ]);

      // Add a note at the top of the sheet explaining how to use the checkboxes
      await sheetClient.setRangeValues(`${PENDING_TRANSACTIONS_SHEET}!A3:H3`, [
        [
          "NOTE",
          "",
          "",
          "",
          "",
          "",
          "Checkboxes appear when transactions are added",
          "Click to approve or reject",
        ],
      ]);

      logEvent(`${PENDING_TRANSACTIONS_SHEET} sheet created`);
    }
  } catch (error: unknown) {
    logEvent(
      `Error creating ${PENDING_TRANSACTIONS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create Logs sheet
 */
export async function createLogsSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(LOGS_SHEET);
      return;
    } catch {
      // Create the sheet
      await sheetClient.createSheet(LOGS_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${LOGS_SHEET}!A1:B1`, [
        ["Timestamp", "Message"],
      ]);

      logEvent(`${LOGS_SHEET} sheet created`);
    }
  } catch (error: unknown) {
    logEvent(
      `Error creating ${LOGS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Store wallet address in Settings sheet
 */
export async function storeWalletAddress(
  sheetClient: SheetClient,
  walletAddress: string,
  logEvent: Function
) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 2, "B", walletAddress);
    logEvent(`Wallet address stored: ${walletAddress}`);
  } catch (error: unknown) {
    logEvent(
      `Error storing wallet address: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Store sheet owner email in Settings sheet
 */
export async function storeSheetOwnerEmail(
  sheetClient: SheetClient,
  ownerEmail: string,
  logEvent: Function
) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 3, "B", ownerEmail);
    logEvent(`Sheet owner email stored: ${ownerEmail}`);
  } catch (error: unknown) {
    logEvent(
      `Error storing sheet owner email: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Get sheet owner email from settings
 */
export async function getSheetOwnerEmail(
  sheetClient: SheetClient,
  logEvent: Function
): Promise<string> {
  try {
    console.log(
      `🔍 Attempting to get owner email from "${SETTINGS_SHEET}" sheet...`
    );
    const values = await sheetClient.getSheetValues(SETTINGS_SHEET);
    console.log(
      `✅ Successfully retrieved values from "${SETTINGS_SHEET}" sheet`
    );

    // Find the owner email in the settings
    for (const row of values) {
      if (row[0] === "Owner Email") {
        console.log(`✅ Found owner email: ${row[1]}`);
        return row[1];
      }
    }

    console.log(`⚠️ Owner email not found in settings`);
    return "";
  } catch (error: unknown) {
    console.error(`❌ Error getting sheet owner email:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    logEvent(
      `Error getting sheet owner email: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return "";
  }
}

/**
 * Add transaction to Wallet Explorer sheet
 */
export async function addTransactionToSheet(
  sheetClient: SheetClient,
  txHash: string,
  from: string,
  to: string,
  amount: string,
  timestamp: string,
  status: string
) {
  try {
    await sheetClient.appendRows(WALLET_EXPLORER_SHEET, [
      [txHash, from, to, amount, timestamp, status],
    ]);
  } catch (error: unknown) {
    console.error(
      `Error adding transaction to sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Update existing Pending Transactions sheet to add Approve/Reject columns if needed
 */
export async function updatePendingTransactionsSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Check if sheet exists
    try {
      const values = await sheetClient.getSheetValues(
        PENDING_TRANSACTIONS_SHEET
      );

      // Check if the header has Approve and Reject columns
      const headers = values[0] || [];

      if (
        headers.length < 7 ||
        headers[6] !== "Approve" ||
        headers[7] !== "Reject"
      ) {
        logEvent(
          `Updating ${PENDING_TRANSACTIONS_SHEET} sheet to add approve/reject columns`
        );

        // Add headers for Approve and Reject columns
        await sheetClient.setRangeValues(
          `${PENDING_TRANSACTIONS_SHEET}!G1:H1`,
          [["Approve", "Reject"]]
        );

        // Add instructions
        await sheetClient.setRangeValues(
          `${PENDING_TRANSACTIONS_SHEET}!G2:H2`,
          [["Check this box to approve", "Check this box to reject"]]
        );

        logEvent(
          `Successfully updated ${PENDING_TRANSACTIONS_SHEET} sheet with approval/rejection columns`
        );
      }
    } catch (error) {
      logEvent(
        `${PENDING_TRANSACTIONS_SHEET} sheet doesn't exist yet, will be created later`
      );
    }
  } catch (error: unknown) {
    logEvent(
      `Error updating ${PENDING_TRANSACTIONS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Force update all pending transactions to ensure they have checkbox cells
 * This can be called manually to fix existing transactions
 */
export async function forceUpdatePendingTransactions(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    logEvent(`Updating pending transactions with checkbox formatting`);

    // First make sure the sheet structure is correct
    await updatePendingTransactionsSheet(sheetClient, logEvent);

    // Get all rows to find pending transactions
    const values = await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);

    if (values.length <= 3) {
      logEvent(`No transactions found to update`);
      return;
    }

    let updatedCount = 0;

    // Start from row 3 (after header and instructions)
    for (let i = 3; i < values.length; i++) {
      const row = values[i];

      // Check if it's a transaction row
      if (row && row.length >= 5) {
        const status = row[4];
        if (status === "Pending") {
          // Apply checkbox formatting for this specific row
          try {
            const sheets = await sheetClient.getSheetMetadata();
            const sheet = sheets.find(
              (s) => s.title === PENDING_TRANSACTIONS_SHEET
            );
            if (!sheet) throw new Error("Could not find sheet metadata");

            // Set up checkboxes using cell formatting and checkbox validation for this specific row
            const requests = [
              {
                repeatCell: {
                  range: {
                    sheetId: sheet.sheetId,
                    startRowIndex: i, // Format just this row
                    endRowIndex: i + 1,
                    startColumnIndex: 6, // Column G
                    endColumnIndex: 8, // Column H
                  },
                  cell: {
                    userEnteredFormat: {
                      horizontalAlignment: "CENTER",
                      textFormat: {
                        bold: true,
                      },
                    },
                  },
                  fields: "userEnteredFormat",
                },
              },
              {
                setDataValidation: {
                  range: {
                    sheetId: sheet.sheetId,
                    startRowIndex: i, // Validate just this row
                    endRowIndex: i + 1,
                    startColumnIndex: 6, // Column G
                    endColumnIndex: 8, // Column H
                  },
                  rule: {
                    condition: {
                      type: "BOOLEAN",
                    },
                    strict: true,
                    showCustomUi: true,
                  },
                },
              },
            ];

            // Apply the formatting
            await sheetClient.batchUpdate({
              requests,
            });

            updatedCount++;
          } catch (validationError) {
            logEvent(
              `Warning: Could not set up checkbox validation for row ${
                i + 1
              }: ${
                validationError instanceof Error
                  ? validationError.message
                  : String(validationError)
              }`
            );
          }
        }
      }
    }

    if (updatedCount > 0) {
      logEvent(
        `Updated ${updatedCount} pending transactions with checkbox formatting`
      );
    } else {
      logEvent(`No pending transactions found to update`);
    }
  } catch (error: unknown) {
    logEvent(
      `Error force updating pending transactions: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Add checkboxes to a specific row in the Pending Transactions sheet
 * This should be called whenever a new transaction is added
 */
export async function addCheckboxesToRow(
  sheetClient: SheetClient,
  rowIndex: number,
  logEvent: Function
) {
  try {
    const sheets = await sheetClient.getSheetMetadata();
    const sheet = sheets.find((s) => s.title === PENDING_TRANSACTIONS_SHEET);
    if (!sheet) throw new Error("Could not find sheet metadata");

    // Set up checkboxes using cell formatting and checkbox validation for this specific row
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: rowIndex - 1, // Convert to 0-based index
            endRowIndex: rowIndex, // Exclusive end index
            startColumnIndex: 6, // Column G
            endColumnIndex: 8, // Column H
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
              textFormat: {
                bold: true,
              },
            },
          },
          fields: "userEnteredFormat",
        },
      },
      {
        setDataValidation: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: rowIndex - 1, // Convert to 0-based index
            endRowIndex: rowIndex, // Exclusive end index
            startColumnIndex: 6, // Column G
            endColumnIndex: 8, // Column H
          },
          rule: {
            condition: {
              type: "BOOLEAN",
            },
            strict: true,
            showCustomUi: true,
          },
        },
      },
    ];

    // Apply the formatting
    await sheetClient.batchUpdate({
      requests,
    });

    logEvent(`Added checkbox formatting to row ${rowIndex}`);
  } catch (error: unknown) {
    logEvent(
      `Error adding checkboxes to row ${rowIndex}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Clear completed transactions from the Pending Transactions sheet
 * This will remove all transactions that have been approved or rejected
 */
export async function clearCompletedTransactions(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    logEvent(`Clearing completed transactions from sheet`);

    // Get all rows
    const values = await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);

    if (values.length <= 3) {
      logEvent(`No transactions found to clear`);
      return;
    }

    // Find sheet ID for batch operations
    const sheets = await sheetClient.getSheetMetadata();
    const sheet = sheets.find((s) => s.title === PENDING_TRANSACTIONS_SHEET);
    if (!sheet) {
      logEvent(`Could not find sheet metadata`);
      return;
    }

    // Keep track of rows to delete (in reverse order to avoid index shifting)
    const rowsToDelete = [];

    // Start from row 3 (after header and instructions)
    for (let i = 3; i < values.length; i++) {
      const row = values[i];
      if (row.length >= 5) {
        const status = row[4];
        if (status === "Approved" || status === "Rejected") {
          rowsToDelete.push(i);
        }
      }
    }

    // Sort in reverse order to delete from bottom up
    rowsToDelete.sort((a, b) => b - a);

    // Create delete requests
    const requests = rowsToDelete.map((rowIndex) => ({
      deleteDimension: {
        range: {
          sheetId: sheet.sheetId,
          dimension: "ROWS",
          startIndex: rowIndex,
          endIndex: rowIndex + 1,
        },
      },
    }));

    if (requests.length > 0) {
      // Apply the deletions
      await sheetClient.batchUpdate({
        requests,
      });
      logEvent(`Removed ${rowsToDelete.length} completed transactions`);
    } else {
      logEvent(`No completed transactions to remove`);
    }
  } catch (error: unknown) {
    logEvent(
      `Error clearing completed transactions: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Check for any stuck "Pending" transactions and update their status
 * This function can be called periodically to ensure transactions don't get stuck in pending status
 */
export async function checkStuckTransactions(
  sheetClient: SheetClient,
  provider: ethers.JsonRpcProvider,
  logEvent: Function
) {
  try {
    logEvent(`[DEBUG] Checking for stuck transactions in Wallet Explorer`);

    // Get all rows from Wallet Explorer
    const rows = await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);

    if (!rows || rows.length <= 1) {
      logEvent(`[DEBUG] No transactions found in Wallet Explorer sheet`);
      return;
    }

    let pendingCount = 0;
    let updatedCount = 0;

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Check for pending transactions
      if (row[5] === "Pending" || row[5] === "Processing") {
        const txHash = row[0];

        // Skip placeholder or invalid hashes
        if (
          !txHash ||
          txHash.startsWith("pending-") ||
          txHash.startsWith("rejected-")
        ) {
          continue;
        }

        pendingCount++;
        logEvent(`[DEBUG] Found pending transaction: ${txHash}`);

        try {
          // Check transaction receipt
          const receipt = await provider.getTransactionReceipt(txHash);

          if (receipt) {
            // Transaction is mined, update status
            const status = receipt.status === 1 ? "Success" : "Failed";
            logEvent(
              `[DEBUG] Updating stuck transaction ${txHash} to ${status}`
            );

            await sheetClient.setCellValue(
              WALLET_EXPLORER_SHEET,
              i + 1,
              "F",
              status
            );

            updatedCount++;
            logEvent(`Updated stuck transaction ${txHash} to ${status}`);
          } else {
            logEvent(`[DEBUG] Transaction ${txHash} is still pending on-chain`);
          }
        } catch (error) {
          logEvent(`[DEBUG] Error checking transaction ${txHash}: ${error}`);
        }
      }
    }

    logEvent(
      `[DEBUG] Checked ${pendingCount} pending transactions, updated ${updatedCount}`
    );

    if (pendingCount > 0 && updatedCount === 0) {
      logEvent(
        `Checked ${pendingCount} pending transactions - all still pending on-chain`
      );
    } else if (updatedCount > 0) {
      logEvent(
        `Updated ${updatedCount} out of ${pendingCount} pending transactions`
      );
    }
  } catch (error) {
    logEvent(`[DEBUG] Error checking stuck transactions: ${error}`);
  }
}
