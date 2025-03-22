import { SheetClient } from "../sheets.api";

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

      // Format the Approve and Reject columns as checkboxes
      try {
        // Simply log that checkboxes need to be set up manually
        // We'll handle checkbox values through the existing cell value methods
        logEvent(
          `Note: Please set up columns G and H as checkboxes in Google Sheets manually`
        );

        // Add a note at the top of the sheet explaining how to use the checkboxes
        await sheetClient.setRangeValues(
          `${PENDING_TRANSACTIONS_SHEET}!A3:H3`,
          [
            [
              "NOTE",
              "",
              "",
              "",
              "",
              "",
              "For approval to work, please format columns G & H as checkboxes",
              "Right-click column header > Data validation > Checkbox",
            ],
          ]
        );
      } catch (formatError: unknown) {
        logEvent(
          `Warning: Could not set up instructions for checkboxes: ${
            formatError instanceof Error
              ? formatError.message
              : String(formatError)
          }`
        );
      }

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

        // Add note about setting up checkboxes
        await sheetClient.setRangeValues(
          `${PENDING_TRANSACTIONS_SHEET}!A3:H3`,
          [
            [
              "NOTE",
              "",
              "",
              "",
              "",
              "",
              "For approval to work, please format columns G & H as checkboxes",
              "Right-click column header > Data validation > Checkbox",
            ],
          ]
        );

        // Update any existing pending transactions to add checkbox columns
        if (values.length > 1) {
          for (let i = 1; i < values.length; i++) {
            const row = values[i];
            if (row.length >= 5 && row[4] === "Pending") {
              // Add empty checkbox cells (false) for this pending row
              await sheetClient.setRangeValues(
                `${PENDING_TRANSACTIONS_SHEET}!G${i + 1}:H${i + 1}`,
                [[false, false]]
              );

              logEvent(`Updated row ${i + 1} with approval checkboxes`);
            }
          }
        }

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
    logEvent(`Force updating all pending transactions to add checkbox columns`);

    // First make sure the sheet structure is correct
    await updatePendingTransactionsSheet(sheetClient, logEvent);

    // Get all rows to find pending transactions
    const values = await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);

    if (values.length <= 1) {
      logEvent(`No transactions found to update`);
      return;
    }

    let updatedCount = 0;

    // Start from row 1 (after header)
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      // Skip instruction/note rows
      if (i <= 2) continue;

      // Check if it's a transaction row
      if (row.length >= 5) {
        const status = row[4];
        if (status === "Pending") {
          // Add checkbox cells if they don't exist or update existing ones
          await sheetClient.setRangeValues(
            `${PENDING_TRANSACTIONS_SHEET}!G${i + 1}:H${i + 1}`,
            [[false, false]]
          );
          updatedCount++;
        }
      }
    }

    logEvent(
      `Updated ${updatedCount} pending transactions with checkbox columns`
    );
  } catch (error: unknown) {
    logEvent(
      `Error force updating pending transactions: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
