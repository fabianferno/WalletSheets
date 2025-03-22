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
export async function initializeSheets(sheetClient: SheetClient) {
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

      // Even if sheets exist, check if Pending Transactions needs to be updated
      await updatePendingTransactionsSheet(sheetClient);

      return;
    }

    console.log(`🛠️ Missing sheets: ${missingSheets.join(", ")}`);

    // Create each missing sheet
    for (const sheetName of missingSheets) {
      console.log(`📝 Creating "${sheetName}" sheet...`);
      switch (sheetName) {
        case SETTINGS_SHEET:
          await createSettingsSheet(sheetClient);
          break;
        case WALLET_EXPLORER_SHEET:
          await createWalletExplorerSheet(sheetClient);
          break;
        case ACTIVE_SESSIONS_SHEET:
          await createActiveSessionsSheet(sheetClient);
          break;
        case PENDING_TRANSACTIONS_SHEET:
          await createPendingTransactionsSheet(sheetClient);
          break;
        case LOGS_SHEET:
          await createLogsSheet(sheetClient);
          break;
      }
    }

    // Even if Pending Transactions sheet was just created, check if it has the correct structure
    if (!missingSheets.includes(PENDING_TRANSACTIONS_SHEET)) {
      await updatePendingTransactionsSheet(sheetClient);
    }
  } catch (error: unknown) {
    console.error(`❌ Error in initializeSheets:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }

    throw error;
  }
}

/**
 * Create all required sheets
 */
export async function createSheets(sheetClient: SheetClient) {
  try {
    // Create Settings sheet
    await createSettingsSheet(sheetClient);

    // Create Wallet Explorer sheet
    await createWalletExplorerSheet(sheetClient);

    // Create ActiveSessions sheet
    await createActiveSessionsSheet(sheetClient);

    // Create Pending Transactions sheet
    await createPendingTransactionsSheet(sheetClient);

    // Create Logs sheet
    await createLogsSheet(sheetClient);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Create Settings sheet
 */
export async function createSettingsSheet(sheetClient: SheetClient) {
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
    }
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Create Wallet Explorer sheet
 */
export async function createWalletExplorerSheet(sheetClient: SheetClient) {
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
    }
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Create ActiveSessions sheet
 */
export async function createActiveSessionsSheet(sheetClient: SheetClient) {
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
        console.error(`❌ Unable to format instructions row: ${formatError}`);
      }
    }
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Create Pending Transactions sheet
 */
export async function createPendingTransactionsSheet(sheetClient: SheetClient) {
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
    }
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Create Logs sheet
 */
export async function createLogsSheet(sheetClient: SheetClient) {
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
    }
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Store wallet address in Settings sheet
 */
export async function storeWalletAddress(
  sheetClient: SheetClient,
  walletAddress: string
) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 2, "B", walletAddress);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Store sheet owner email in Settings sheet
 */
export async function storeSheetOwnerEmail(
  sheetClient: SheetClient,
  ownerEmail: string
) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 3, "B", ownerEmail);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Get sheet owner email from settings
 */
export async function getSheetOwnerEmail(
  sheetClient: SheetClient
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
export async function updatePendingTransactionsSheet(sheetClient: SheetClient) {
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
      }
    } catch (error) {
      console.error(
        `${PENDING_TRANSACTIONS_SHEET} sheet doesn't exist yet, will be created later`
      );
    }
  } catch (error: unknown) {
    console.error(
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
export async function forceUpdatePendingTransactions(sheetClient: SheetClient) {
  try {
    // First make sure the sheet structure is correct
    await updatePendingTransactionsSheet(sheetClient);

    // Get all rows to find pending transactions
    const values = await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);

    if (values.length <= 3) {
      console.log(`No transactions found to update`);
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
            console.error(
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
      console.log(
        `Updated ${updatedCount} pending transactions with checkbox formatting`
      );
    } else {
      console.log(`No pending transactions found to update`);
    }
  } catch (error: unknown) {
    console.error(
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
  rowIndex: number
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
  } catch (error: unknown) {
    console.error(
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
export async function clearCompletedTransactions(sheetClient: SheetClient) {
  try {
    console.log(`Clearing completed transactions from sheet`);

    // Get all rows
    const values = await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);

    if (values.length <= 3) {
      console.log(`No transactions found to clear`);
      return;
    }

    // Find sheet ID for batch operations
    const sheets = await sheetClient.getSheetMetadata();
    const sheet = sheets.find((s) => s.title === PENDING_TRANSACTIONS_SHEET);
    if (!sheet) {
      console.log(`Could not find sheet metadata`);
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
      console.log(`Removed ${rowsToDelete.length} completed transactions`);
    } else {
      console.log(`No completed transactions to remove`);
    }
  } catch (error: unknown) {
    console.error(
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
  provider: ethers.JsonRpcProvider
) {
  try {
    // Get all rows from Wallet Explorer
    const rows = await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);

    if (!rows || rows.length <= 1) {
      console.log(`[DEBUG] No transactions found in Wallet Explorer sheet`);
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
        console.log(`[DEBUG] Found pending transaction: ${txHash}`);

        try {
          // Check transaction receipt
          const receipt = await provider.getTransactionReceipt(txHash);

          if (receipt) {
            // Transaction is mined, update status
            const status = receipt.status === 1 ? "Success" : "Failed";

            await sheetClient.setCellValue(
              WALLET_EXPLORER_SHEET,
              i + 1,
              "F",
              status
            );

            updatedCount++;
            console.log(`Updated stuck transaction ${txHash} to ${status}`);
          } else {
            console.log(
              `[DEBUG] Transaction ${txHash} is still pending on-chain`
            );
          }
        } catch (error) {
          console.error(
            `[DEBUG] Error checking transaction ${txHash}: ${error}`
          );
        }
      }
    }

    if (pendingCount > 0 && updatedCount === 0) {
      console.log(
        `Checked ${pendingCount} pending transactions - all still pending on-chain`
      );
    } else if (updatedCount > 0) {
      console.log(
        `Updated ${updatedCount} out of ${pendingCount} pending transactions`
      );
    }
  } catch (error) {
    console.error(`[DEBUG] Error checking stuck transactions: ${error}`);
  }
}
