import { ethers } from "ethers";
import axios from "axios";

// Sheet names
export const SETTINGS_SHEET = "Settings";
export const WALLET_EXPLORER_SHEET = "View Transactions";
export const ACTIVE_SESSIONS_SHEET = "Connect to Dapp";
export const PENDING_TRANSACTIONS_SHEET = "Pending Transactions";
export const CHAT_SHEET = "Chat with Wallet";
export const PORTFOLIO_SHEET = "Portfolio";

// Common styling constants for sheets
export const SHEET_STYLES = {
  // Color constants
  COLORS: {
    HEADER_GREEN: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    LIGHT_BLUE: { red: 0.95, green: 0.97, blue: 1.0 }, // Very light blue
    LIGHT_RED: { red: 1.0, green: 0.95, blue: 0.95 }, // Light red
    GRAY: { red: 0.5, green: 0.5, blue: 0.5 }, // Mild grey for text
    BLACK: { red: 0, green: 0, blue: 0 }, // Black text
    INPUT_BLUE: { red: 0.95, green: 0.95, blue: 1.0 }, // Blue for input fields
    USER_BLUE: { red: 0.9, green: 0.95, blue: 1.0 }, // Light blue for user messages
    AGENT_RED: { red: 1.0, green: 0.9, blue: 0.9 }, // Light red for agent blocks
  },

  // Header row styling (mild green)
  HEADER: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
  },

  // Header with right alignment
  HEADER_RIGHT: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "RIGHT",
  },

  // Header with center alignment
  HEADER_CENTER: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "CENTER",
  },

  // Helper notes styling (mild grey)
  HELPER_NOTES: {
    textFormat: {
      fontFamily: "Roboto",
      foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 }, // Mild grey
      italic: true,
    },
  },

  // Base text styling
  BASE_TEXT: {
    wrapStrategy: "WRAP",
    textFormat: {
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
  },

  // Bold text styling
  BOLD_TEXT: {
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
  },

  // Title with Lexend font
  LEXEND_TITLE: {
    horizontalAlignment: "RIGHT",
    textFormat: {
      bold: true,
      fontFamily: "Lexend",
      fontSize: 24,
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
  },

  // Subtitle with Lexend font
  LEXEND_SUBTITLE: {
    horizontalAlignment: "RIGHT",
    textFormat: {
      fontFamily: "Lexend",
      fontSize: 14,
      foregroundColor: { red: 0.3, green: 0.3, blue: 0.3 }, // Dark gray text
    },
  },

  // Left-aligned text
  LEFT_ALIGNED_TEXT: {
    horizontalAlignment: "LEFT",
    textFormat: {
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
  },

  // User input label
  USER_INPUT_LABEL: {
    backgroundColor: { red: 0.85, green: 0.92, blue: 0.85 }, // Mild green
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "RIGHT",
  },

  // User input area
  USER_INPUT_AREA: {
    backgroundColor: { red: 0.95, green: 0.95, blue: 1.0 }, // Very light blue
    textFormat: {
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    borders: {
      top: { style: "SOLID" },
      bottom: { style: "SOLID" },
      left: { style: "SOLID" },
      right: { style: "SOLID" },
    },
  },

  // User message
  USER_MESSAGE: {
    backgroundColor: { red: 0.95, green: 0.97, blue: 1.0 }, // Very light blue
    textFormat: {
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    wrapStrategy: "WRAP",
  },

  // User label
  USER_LABEL: {
    backgroundColor: { red: 0.9, green: 0.95, blue: 1.0 }, // Light blue
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "RIGHT",
  },

  // Agent message
  AGENT_MESSAGE: {
    backgroundColor: { red: 1.0, green: 0.95, blue: 0.95 }, // Light red
    textFormat: {
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    wrapStrategy: "WRAP",
  },

  // Agent label
  AGENT_LABEL: {
    backgroundColor: { red: 1.0, green: 0.9, blue: 0.9 }, // Light red
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
    },
    horizontalAlignment: "RIGHT",
  },

  // Checkbox centered
  CHECKBOX_CENTERED: {
    horizontalAlignment: "CENTER",
    textFormat: {
      bold: true,
    },
  },

  // Instruction row
  INSTRUCTION_ROW: {
    backgroundColor: { red: 0.9, green: 0.97, blue: 1.0 }, // Light blue (#e6f7ff)
    textFormat: {
      bold: true,
      italic: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 }, // Mild grey for helper notes
    },
    wrapStrategy: "WRAP",
  },

  // Troubleshooting row
  TROUBLESHOOTING_ROW: {
    backgroundColor: { red: 1.0, green: 0.95, blue: 0.95 }, // Light red
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      foregroundColor: { red: 0.5, green: 0.5, blue: 0.5 }, // Mild grey for helper notes
    },
    wrapStrategy: "WRAP",
  },
};

/**
 * Initialize or get existing sheets
 */
export async function initializeSheets(sheetClient, logEvent) {
  try {
    console.log(`📊 Checking if all required sheets exist...`);

    // Define required sheets - make sure this is a complete list
    const requiredSheets = [
      SETTINGS_SHEET,
      WALLET_EXPLORER_SHEET,
      ACTIVE_SESSIONS_SHEET,
      PENDING_TRANSACTIONS_SHEET,
      CHAT_SHEET,
      PORTFOLIO_SHEET,
    ];

    console.log(`📋 Required sheets: ${requiredSheets.join(", ")}`);

    // Get list of all sheets in the spreadsheet
    const allSheets = await sheetClient.getAllSheets();
    const existingSheetTitles = allSheets.map((sheet) => sheet.title);
    console.log(`📋 Existing sheets: ${existingSheetTitles.join(", ")}`);

    // Identify unknown sheets that should be deleted
    const unknownSheets = allSheets.filter(
      (sheet) => !requiredSheets.includes(sheet.title)
    );

    // Delete unknown sheets
    if (unknownSheets.length > 0) {
      console.log(
        `🧹 Deleting unknown sheets: ${unknownSheets
          .map((s) => s.title)
          .join(", ")}`
      );
      logEvent(
        `Deleting unknown sheets: ${unknownSheets
          .map((s) => s.title)
          .join(", ")}`
      );

      // First, make sure we have at least one required sheet
      // Google Sheets requires at least one sheet to exist
      let hasOneRequiredSheet = false;
      for (const sheetName of requiredSheets) {
        if (existingSheetTitles.includes(sheetName)) {
          hasOneRequiredSheet = true;
          break;
        }
      }

      // If no required sheets exist, create one first
      if (!hasOneRequiredSheet) {
        console.log(
          `🛠️ Creating ${SETTINGS_SHEET} sheet first to ensure at least one required sheet exists`
        );
        await createSettingsSheet(sheetClient, logEvent);
      }

      // Now try to delete unknown sheets
      const deletionPromises = [];

      for (const sheet of unknownSheets) {
        console.log(
          `🗑️ Attempting to delete sheet: ${sheet.title} (ID: ${sheet.id})`
        );
        try {
          // Try different approaches for deletion
          const deleteSheet = async () => {
            try {
              // First attempt: Standard deletion
              await sheetClient.deleteSheet(sheet.id);
              console.log(`✅ Successfully deleted sheet: ${sheet.title}`);
              return true;
            } catch (error) {
              console.log(
                `First deletion attempt failed for ${sheet.title}: ${error}`
              );

              try {
                // Second attempt: Try batch update with force option
                await sheetClient.batchUpdate({
                  requests: [
                    {
                      deleteSheet: {
                        sheetId: sheet.id,
                        force: true, // Try force option if available
                      },
                    },
                  ],
                });
                console.log(
                  `✅ Successfully deleted sheet with force option: ${sheet.title}`
                );
                return true;
              } catch (forcedError) {
                console.log(
                  `Force deletion attempt failed for ${sheet.title}: ${forcedError}`
                );

                try {
                  // Third attempt: Try hiding the sheet if deletion fails
                  await sheetClient.batchUpdate({
                    requests: [
                      {
                        updateSheetProperties: {
                          properties: {
                            sheetId: sheet.id,
                            hidden: true,
                          },
                          fields: "hidden",
                        },
                      },
                    ],
                  });
                  console.log(
                    `⚠️ Could not delete sheet ${sheet.title}, but successfully hid it`
                  );
                  return false;
                } catch (hideError) {
                  console.error(
                    `❌ All attempts failed for sheet ${sheet.title}`
                  );
                  return false;
                }
              }
            }
          };

          deletionPromises.push(deleteSheet());
        } catch (deleteError) {
          console.error(
            `❌ Failed to delete sheet ${sheet.title}:`,
            deleteError
          );
          logEvent(
            `Failed to delete sheet ${sheet.title}: ${deleteError instanceof Error
              ? deleteError.message
              : String(deleteError)
            }`
          );
        }
      }

      // Wait for all deletion attempts to complete
      await Promise.all(deletionPromises);

      // Verify deletion was successful by refreshing the sheet list
      const remainingSheets = await sheetClient.getAllSheets();
      const remainingTitles = remainingSheets.map((s) => s.title);
      console.log(
        `📋 Remaining sheets after deletion/hiding: ${remainingTitles.join(
          ", "
        )}`
      );

      // Check if any unknown sheets still exist
      const stillUnknown = remainingSheets.filter(
        (sheet) => !requiredSheets.includes(sheet.title)
      );

      if (stillUnknown.length > 0) {
        console.warn(
          `⚠️ Some unknown sheets could not be deleted: ${stillUnknown
            .map((s) => s.title)
            .join(", ")}`
        );
        logEvent(
          `Warning: Some sheets could not be deleted: ${stillUnknown
            .map((s) => s.title)
            .join(", ")}`
        );
      }
    } else {
      console.log(`✅ No unknown sheets found`);
    }

    // Check which required sheets are missing
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
        case CHAT_SHEET:
          await createChatSheet(sheetClient, logEvent);
          break;
        case PORTFOLIO_SHEET:
          // Handle Portfolio sheet creation if needed
          break;
      }
    }

    // Even if Pending Transactions sheet was just created, check if it has the correct structure
    if (!missingSheets.includes(PENDING_TRANSACTIONS_SHEET)) {
      await updatePendingTransactionsSheet(sheetClient, logEvent);
    }

    logEvent("Sheets initialized successfully");
  } catch (error) {
    console.error(`❌ Error in initializeSheets:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    logEvent(
      `Error initializing sheets: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create all required sheets
 */
export async function createSheets(sheetClient, logEvent) {
  try {
    // Create Settings sheet
    await createSettingsSheet(sheetClient, logEvent);

    // Create Wallet Explorer sheet
    await createWalletExplorerSheet(sheetClient, logEvent);

    // Create ActiveSessions sheet
    await createActiveSessionsSheet(sheetClient, logEvent);

    // Create Pending Transactions sheet
    await createPendingTransactionsSheet(sheetClient, logEvent);

    // Create Chat sheet
    await createChatSheet(sheetClient, logEvent);

    logEvent("All sheets created successfully");
  } catch (error) {
    logEvent(
      `Error creating sheets: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create Settings sheet
 */
export async function createSettingsSheet(sheetClient, logEvent) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(SETTINGS_SHEET);
      return;
    } catch {
      // Create the sheet
      const sheetId = await sheetClient.createSheet(SETTINGS_SHEET);

      // Set up headers and content, including the new WalletSheets section with Lexend font
      await sheetClient.setRangeValues(`${SETTINGS_SHEET}!A1:B13`, [
        ["Setting", "Value"],
        ["Wallet Address", ""],
        ["Sheet Owner Email", ""],
        ["Risk Factor", "5"], // Default value of 5 (middle of 0-10 range)
        ["", ""], // Empty row for spacing
        ["", ""], // Empty row for spacing
        ["", ""], // Empty row for spacing
        ["", ""], // Empty row for spacing
        ["", ""], // Empty row for spacing
        ["", "Hi there, welcome to"],
        ["", "WalletSheets"],
        ["", "Google Sheets as a Wallet"],
        ["", ""], // Empty row for spacing
      ]);

      // Set column widths
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0, // Column A (Setting)
                endIndex: 1,
              },
              properties: {
                pixelSize: 150, // Width for Setting column
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 1, // Column B (Value)
                endIndex: 2,
              },
              properties: {
                pixelSize: 340, // Increased width for Value column
              },
              fields: "pixelSize",
            },
          },
        ],
      });

      // Apply text wrapping and Roboto font to all cells
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex
        13, // endRowIndex (exclusive, increased to include new rows)
        0, // startColumnIndex
        2, // endColumnIndex (exclusive)
        SHEET_STYLES.BASE_TEXT
      );

      // Format the header row with mild green
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex (0-based, so row 1)
        1, // endRowIndex (exclusive)
        0, // startColumnIndex
        2, // endColumnIndex (exclusive)
        SHEET_STYLES.HEADER
      );

      // Bold the setting names in column A
      await sheetClient.formatRange(
        sheetId,
        1, // startRowIndex (row 2)
        4, // endRowIndex (exclusive, increased to include new row)
        0, // startColumnIndex
        1, // endColumnIndex (exclusive)
        SHEET_STYLES.BOLD_TEXT
      );

      // Apply Lexend font styles to the WalletSheets section
      // Welcome text
      await sheetClient.formatRange(
        sheetId,
        9, // startRowIndex (row 10)
        10, // endRowIndex (exclusive)
        0, // startColumnIndex
        2, // endColumnIndex (exclusive)
        SHEET_STYLES.LEXEND_SUBTITLE
      );

      // WalletSheets Title
      await sheetClient.formatRange(
        sheetId,
        10, // startRowIndex (row 11)
        11, // endRowIndex (exclusive)
        0, // startColumnIndex
        2, // endColumnIndex (exclusive)
        SHEET_STYLES.LEXEND_TITLE
      );

      // Subtitle
      await sheetClient.formatRange(
        sheetId,
        11, // startRowIndex (row 12)
        12, // endRowIndex (exclusive)
        0, // startColumnIndex
        2, // endColumnIndex (exclusive)
        SHEET_STYLES.LEXEND_SUBTITLE
      );

      // Add data validation for Risk Factor (0-10)
      const requests = [
        {
          setDataValidation: {
            range: {
              sheetId: sheetId,
              startRowIndex: 3, // Risk Factor row (4th row, 0-based)
              endRowIndex: 4,
              startColumnIndex: 1, // Column B
              endColumnIndex: 2,
            },
            rule: {
              condition: {
                type: "NUMBER_BETWEEN",
                values: [{ userEnteredValue: "0" }, { userEnteredValue: "10" }],
              },
              inputMessage: "Enter a value between 0 and 10",
              strict: true,
              showCustomUi: true,
            },
          },
        },
        // Add formatting for risk factor value to be left-aligned
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 3, // Risk Factor row (4th row, 0-based)
              endRowIndex: 4,
              startColumnIndex: 1, // Column B
              endColumnIndex: 2,
            },
            cell: {
              userEnteredFormat: SHEET_STYLES.LEFT_ALIGNED_TEXT,
            },
            fields:
              "userEnteredFormat(horizontalAlignment,textFormat.fontFamily)",
          },
        },
      ];

      await sheetClient.batchUpdate({ requests });

      logEvent(
        `${SETTINGS_SHEET} sheet created with styling and Lexend font section`
      );
    }
  } catch (error) {
    logEvent(
      `Error creating ${SETTINGS_SHEET} sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Fetch historical transactions for a wallet address
 * Returns the last N transactions
 */
export async function fetchHistoricalTransactions(
  walletAddress,
  provider,
  limit = 10,
  logEvent
) {
  try {
    logEvent(`Fetching last ${limit} transactions for wallet ${walletAddress}`);
    const transactions = [];

    try {
      // First try using Etherscan-compatible API if available
      // You might need to set up an Etherscan API key in environment variables
      const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
      const ETHERSCAN_API_URL =
        process.env.ETHERSCAN_API_URL || "https://api.etherscan.io/api";

      if (ETHERSCAN_API_KEY) {
        const response = await axios.get(`${ETHERSCAN_API_URL}`, {
          params: {
            module: "account",
            action: "txlist",
            address: walletAddress,
            startblock: 0,
            endblock: 99999999,
            page: 1,
            offset: limit,
            sort: "desc",
            apikey: ETHERSCAN_API_KEY,
          },
        });

        if (response.data.status === "1" && response.data.result.length > 0) {
          logEvent(
            `Found ${response.data.result.length} transactions from Etherscan API`
          );

          for (const tx of response.data.result) {
            const timestamp = new Date(
              parseInt(tx.timeStamp) * 1000
            ).toISOString();
            const status = tx.isError === "0" ? "Success" : "Failed";
            const amount = ethers.utils.formatEther(tx.value);

            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: amount,
              timestamp: timestamp,
              status: status,
            });
          }

          return transactions;
        }
      }
    } catch (etherscanError) {
      logEvent(
        `Etherscan API error: ${etherscanError}. Falling back to RPC provider.`
      );
    }

    // Fallback to RPC provider if Etherscan is not available or fails
    // This is much more limited since most providers don't let you query by address easily
    // We'll try to get the latest blocks and check if our address was involved

    logEvent(`Falling back to RPC provider for transaction history`);

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    const blockCount = Math.min(5000, currentBlock); // Look back up to 5000 blocks

    // Track the blocks we need to scan
    const blocksToScan = [];
    for (let i = 0; i < blockCount && blocksToScan.length < 100; i++) {
      blocksToScan.push(currentBlock - i);
    }

    // Scan blocks for transactions involving our address
    for (const blockNumber of blocksToScan) {
      if (transactions.length >= limit) break;

      try {
        const block = await provider.getBlock(blockNumber, true);
        if (!block || !block.transactions) continue;

        // Properly type block transactions
        const blockTransactions = block.transactions;

        for (const tx of blockTransactions) {
          if (transactions.length >= limit) break;

          // Check if the transaction involves our wallet
          if (
            (tx.from &&
              tx.from.toLowerCase() === walletAddress.toLowerCase()) ||
            (tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase())
          ) {
            // Get full transaction details if needed
            const txReceipt = await provider.getTransactionReceipt(tx.hash);
            const status =
              txReceipt && txReceipt.status === 1 ? "Success" : "Failed";
            const timestamp = new Date(
              (block.timestamp || 0) * 1000
            ).toISOString();

            transactions.push({
              hash: tx.hash,
              from: tx.from || "Unknown",
              to: tx.to || "Contract Creation",
              amount: tx.value ? ethers.utils.formatEther(tx.value) : "0",
              timestamp: timestamp,
              status: status,
            });
          }
        }
      } catch (blockError) {
        logEvent(`Error scanning block ${blockNumber}: ${blockError}`);
      }
    }

    logEvent(`Found ${transactions.length} transactions from RPC provider`);
    return transactions;
  } catch (error) {
    logEvent(`Error fetching historical transactions: ${error}`);
    return [];
  }
}

/**
 * Create Wallet Explorer sheet
 */
export async function createWalletExplorerSheet(sheetClient, logEvent) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);
      return;
    } catch {
      // Create the sheet
      const sheetId = await sheetClient.createSheet(WALLET_EXPLORER_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A1:F1`, [
        ["Transaction Hash", "From", "To", "Amount", "Timestamp", "Status"],
      ]);

      // Set column widths
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0, // Transaction Hash column
                endIndex: 1,
              },
              properties: {
                pixelSize: 250, // Wider for hash
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 1, // From column
                endIndex: 3, // To column
              },
              properties: {
                pixelSize: 220, // Width for address columns
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 3, // Amount column
                endIndex: 6, // Status column
              },
              properties: {
                pixelSize: 150, // Width for other columns
              },
              fields: "pixelSize",
            },
          },
        ],
      });

      // Apply text wrapping and Roboto font to all cells
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex
        2, // endRowIndex (enough for header and first data row)
        0, // startColumnIndex
        6, // endColumnIndex (exclusive)
        SHEET_STYLES.BASE_TEXT
      );

      // Format the header row with mild green
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex (0-based, so row 1)
        1, // endRowIndex (exclusive)
        0, // startColumnIndex
        6, // endColumnIndex (exclusive)
        SHEET_STYLES.HEADER
      );

      logEvent(`${WALLET_EXPLORER_SHEET} sheet created with styling`);
    }
  } catch (error) {
    logEvent(
      `Error creating ${WALLET_EXPLORER_SHEET} sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Initialize the Wallet Explorer sheet with recent transactions
 * This should be called after the sheet is created and a wallet address is available
 */
export async function initializeWalletExplorer(
  sheetClient,
  walletAddress,
  provider,
  logEvent
) {
  try {
    logEvent(
      `Initializing Wallet Explorer with recent transactions for ${walletAddress}`
    );

    // Check if sheet exists and has data
    try {
      const values = await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);

      // If there's already transaction data, skip initialization
      if (values.length > 2) {
        logEvent(
          `Wallet Explorer already has ${values.length - 1
          } transactions, skipping initialization`
        );
        return;
      }

      // Fetch recent transactions
      const transactions = await fetchHistoricalTransactions(
        walletAddress,
        provider,
        10, // Limit to last 10 transactions
        logEvent
      );

      if (transactions.length === 0) {
        logEvent(
          `No historical transactions found for wallet ${walletAddress}`
        );
        return;
      }

      // Add transactions to the sheet
      const transactionRows = transactions.map((tx) => [
        tx.hash,
        tx.from,
        tx.to,
        tx.amount,
        tx.timestamp,
        tx.status,
      ]);

      await sheetClient.appendRows(WALLET_EXPLORER_SHEET, transactionRows);
      logEvent(
        `Added ${transactions.length} historical transactions to Wallet Explorer`
      );
    } catch (error) {
      logEvent(`Error initializing Wallet Explorer: ${error}`);
    }
  } catch (error) {
    logEvent(
      `Error initializing Wallet Explorer: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Create ActiveSessions sheet
 */
export async function createActiveSessionsSheet(sheetClient, logEvent) {
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

      // First get the sheet ID
      const sheetId = await sheetClient.getSheetIdByName(ACTIVE_SESSIONS_SHEET);

      // Set column widths
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 5,
              },
              properties: {
                pixelSize: 220, // Set width for all columns
              },
              fields: "pixelSize",
            },
          },
        ],
      });

      // Apply text wrapping to all cells
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex
        4, // endRowIndex (exclusive)
        0, // startColumnIndex
        5, // endColumnIndex (exclusive)
        SHEET_STYLES.BASE_TEXT
      );

      // Format the header row (row 1)
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex (0-based, so row 1)
        1, // endRowIndex (exclusive)
        0, // startColumnIndex
        5, // endColumnIndex (exclusive, so columns A-E)
        SHEET_STYLES.HEADER
      );

      // Format the instructions row (row 2)
      await sheetClient.formatRange(
        sheetId,
        1, // startRowIndex (0-based, so row 2)
        2, // endRowIndex (exclusive)
        0, // startColumnIndex
        5, // endColumnIndex (exclusive, so columns A-E)
        SHEET_STYLES.INSTRUCTION_ROW
      );

      // Format the troubleshooting row
      await sheetClient.formatRange(
        sheetId,
        3, // startRowIndex (row 4)
        4, // endRowIndex (exclusive)
        0, // startColumnIndex
        5, // endColumnIndex (exclusive)
        SHEET_STYLES.TROUBLESHOOTING_ROW
      );

      logEvent(
        `${ACTIVE_SESSIONS_SHEET} sheet created with detailed instructions and styling`
      );
    }
  } catch (error) {
    logEvent(
      `Error creating ${ACTIVE_SESSIONS_SHEET} sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Create Pending Transactions sheet
 */
export async function createPendingTransactionsSheet(sheetClient, logEvent) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(PENDING_TRANSACTIONS_SHEET);
      return;
    } catch {
      // Create the sheet
      const sheetId = await sheetClient.createSheet(PENDING_TRANSACTIONS_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${PENDING_TRANSACTIONS_SHEET}!A1:H2`, [
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
        [
          "",
          "",
          "",
          "",
          "",
          "",
          "Check this box to approve",
          "Check this box to reject",
        ],
      ]);

      // Set column widths
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0, // Request ID column
                endIndex: 2, // Type column
              },
              properties: {
                pixelSize: 180, // Width for ID columns
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 2, // Type column
                endIndex: 3, // Details column
              },
              properties: {
                pixelSize: 150, // Width for Type column
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 3, // Details column
                endIndex: 4, // Status column
              },
              properties: {
                pixelSize: 250, // Wider for Details
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 4, // Status column
                endIndex: 6, // Approve column
              },
              properties: {
                pixelSize: 150, // Width for status and timestamp
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 6, // Approve column
                endIndex: 8, // End of Reject column
              },
              properties: {
                pixelSize: 130, // Width for checkbox columns
              },
              fields: "pixelSize",
            },
          },
        ],
      });

      // Apply text wrapping and Roboto font to all cells
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex
        3, // endRowIndex (enough for header, instructions, and first data row)
        0, // startColumnIndex
        8, // endColumnIndex (exclusive)
        SHEET_STYLES.BASE_TEXT
      );

      // Format the header row with mild green
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex (0-based, so row 1)
        1, // endRowIndex (exclusive)
        0, // startColumnIndex
        8, // endColumnIndex (exclusive)
        SHEET_STYLES.HEADER
      );

      // Format the helper text row with grey text
      await sheetClient.formatRange(
        sheetId,
        1, // startRowIndex (row 2)
        2, // endRowIndex (exclusive)
        6, // startColumnIndex (Approve column)
        8, // endColumnIndex (exclusive)
        SHEET_STYLES.HELPER_NOTES
      );

      // Removed checkbox creation - will only create checkboxes when transactions are added

      logEvent(`${PENDING_TRANSACTIONS_SHEET} sheet created with styling`);
    }
  } catch (error) {
    logEvent(
      `Error creating ${PENDING_TRANSACTIONS_SHEET} sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Store wallet address in Settings sheet
 */
export async function storeWalletAddress(sheetClient, walletAddress, logEvent) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 2, "B", walletAddress);
    logEvent(`Wallet address stored: ${walletAddress}`);
  } catch (error) {
    logEvent(
      `Error storing wallet address: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Store sheet owner email in Settings sheet
 */
export async function storeSheetOwnerEmail(sheetClient, ownerEmail, logEvent) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 3, "B", ownerEmail);
    logEvent(`Sheet owner email stored: ${ownerEmail}`);
  } catch (error) {
    logEvent(
      `Error storing sheet owner email: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Get sheet owner email from settings
 */
export async function getSheetOwnerEmail(sheetClient, logEvent) {
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
  } catch (error) {
    console.error(`❌ Error getting sheet owner email`);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    logEvent(
      `Error getting sheet owner email: ${error instanceof Error ? error.message : String(error)
      }`
    );
    return "";
  }
}

/**
 * Add transaction to Wallet Explorer sheet
 */
export async function addTransactionToSheet(
  sheetClient,
  txHash,
  from,
  to,
  amount,
  timestamp,
  status
) {
  try {
    await sheetClient.appendRows(WALLET_EXPLORER_SHEET, [
      [txHash, from, to, amount, timestamp, status],
    ]);
  } catch (error) {
    console.error(
      `Error adding transaction to sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Update existing Pending Transactions sheet to add Approve/Reject columns if needed
 */
export async function updatePendingTransactionsSheet(sheetClient, logEvent) {
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
  } catch (error) {
    logEvent(
      `Error updating ${PENDING_TRANSACTIONS_SHEET} sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Force update all pending transactions to ensure they have checkbox cells
 * This can be called manually to fix existing transactions
 */
export async function forceUpdatePendingTransactions(sheetClient, logEvent) {
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
                    userEnteredFormat: SHEET_STYLES.CHECKBOX_CENTERED,
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
              `Warning: Could not set up checkbox validation for row ${i + 1
              }: ${validationError instanceof Error
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
  } catch (error) {
    logEvent(
      `Error force updating pending transactions: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Add checkboxes to a specific row in the Pending Transactions sheet
 * This should be called whenever a new transaction is added
 */
export async function addCheckboxesToRow(sheetClient, rowIndex, logEvent) {
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
            userEnteredFormat: SHEET_STYLES.CHECKBOX_CENTERED,
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
  } catch (error) {
    logEvent(
      `Error adding checkboxes to row ${rowIndex}: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Clear completed transactions from the Pending Transactions sheet
 * This will remove all transactions that have been approved or rejected
 */
export async function clearCompletedTransactions(sheetClient, logEvent) {
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
  } catch (error) {
    logEvent(
      `Error clearing completed transactions: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Check for any stuck "Pending" transactions and update their status
 * This function can be called periodically to ensure transactions don't get stuck in pending status
 */
export async function checkStuckTransactions(sheetClient, provider, logEvent) {
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

/**
 * Create Chat sheet
 */
export async function createChatSheet(sheetClient, logEvent) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(CHAT_SHEET);
      return;
    } catch {
      // Create the sheet
      const sheetId = await sheetClient.createSheet(CHAT_SHEET);

      // Set up initial UI structure - put the input field at the top for better visibility
      await sheetClient.setRangeValues(`${CHAT_SHEET}!A1:F5`, [
        ["WalletSheets Agent", "", "", "", "", ""],
        ["Your message:", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["Chat History", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ]);

      // Add the send button as text with instructions
      await sheetClient.setCellValue(
        CHAT_SHEET,
        2,
        "C",
        "Type your message in B2 and press Enter to send"
      );

      // Format the header
      try {
        // Format the title row with mild green to match other sheets
        await sheetClient.formatRange(
          sheetId,
          0, // startRowIndex
          1, // endRowIndex
          0, // startColumnIndex
          6, // endColumnIndex
          {
            ...SHEET_STYLES.HEADER,
            horizontalAlignment: "RIGHT",
          }
        );

        // Format the user input label
        await sheetClient.formatRange(
          sheetId,
          1, // startRowIndex
          2, // endRowIndex
          0, // startColumnIndex
          1, // endColumnIndex
          SHEET_STYLES.USER_INPUT_LABEL
        );

        // Format user input area
        await sheetClient.formatRange(
          sheetId,
          1, // startRowIndex
          2, // endRowIndex
          1, // startColumnIndex
          2, // endColumnIndex
          SHEET_STYLES.USER_INPUT_AREA
        );

        // Format the instructions with helper notes style
        await sheetClient.formatRange(
          sheetId,
          1, // startRowIndex
          2, // endRowIndex
          2, // startColumnIndex
          6, // endColumnIndex
          SHEET_STYLES.HELPER_NOTES
        );

        // Format the chat history header
        await sheetClient.formatRange(
          sheetId,
          3, // startRowIndex
          4, // endRowIndex
          0, // startColumnIndex
          6, // endColumnIndex
          SHEET_STYLES.HEADER_RIGHT
        );

        // Set column widths
        const requests = [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0, // First column (A)
                endIndex: 1, // Second column (B)
              },
              properties: {
                pixelSize: 200, // Increase width from 120 to 150 pixels
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 1, // Second column (B)
                endIndex: 2, // Third column (C)
              },
              properties: {
                pixelSize: 400, // Width in pixels for the message column
              },
              fields: "pixelSize",
            },
          },
          // Freeze the first 3 rows (title, input field, and spacing)
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                gridProperties: {
                  frozenRowCount: 3,
                },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ];

        // Apply column width changes and freeze rows
        await sheetClient.batchUpdate({
          requests,
        });
      } catch (formatError) {
        logEvent(`Unable to format Chat sheet: ${formatError}`);
      }

      logEvent(`${CHAT_SHEET} sheet created with standard styling`);
    }
  } catch (error) {
    logEvent(
      `Error creating ${CHAT_SHEET} sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Monitor the Chat sheet for new messages
 */
export async function monitorChatSheet(sheetClient, logEvent, agent) {
  try {
    logEvent(`Starting Chat sheet monitoring`);
    const url = await agent.getUrl();

    // Keep track of the last processed message to avoid duplication
    let lastProcessedMessage = "";
    let lastMessageTimestamp = Date.now();

    const checkForNewMessages = async () => {
      try {
        // Get the message from cell B2 (input field is now in row 2)
        const userMessage = await sheetClient.getCellValue(CHAT_SHEET, 2, "B");

        // Check if there's a new non-empty message and it's different from the last one
        // Also add a small delay check to prevent processing the same message multiple times
        const currentTime = Date.now();
        if (
          userMessage &&
          userMessage !== lastProcessedMessage &&
          currentTime - lastMessageTimestamp > 2000
        ) {
          logEvent(`New message detected: ${userMessage}`);

          // Save this message to avoid processing it again
          lastProcessedMessage = userMessage;
          lastMessageTimestamp = currentTime;

          // Clear the input field
          await sheetClient.setCellValue(CHAT_SHEET, 2, "B", "");

          // Get the sheet ID for formatting
          const sheetId = await sheetClient.getSheetIdByName(CHAT_SHEET);

          // Insert two new rows at the beginning of the chat history section (after row 4)
          await sheetClient.insertRow(sheetId, 4);
          await sheetClient.insertRow(sheetId, 5);

          // Add user message at the first row of the chat history
          await sheetClient.setRangeValues(`${CHAT_SHEET}!A5:B5`, [
            ["You", userMessage],
          ]);

          // Format the "You" label with light blue
          await sheetClient.formatRange(
            sheetId,
            4, // startRowIndex (row 5, zero-based)
            5, // endRowIndex
            0, // startColumnIndex
            1, // endColumnIndex
            SHEET_STYLES.USER_LABEL
          );

          // Format the user message cell
          await sheetClient.formatRange(
            sheetId,
            4, // startRowIndex
            5, // endRowIndex
            1, // startColumnIndex
            6, // endColumnIndex
            SHEET_STYLES.USER_MESSAGE
          );

          // Call the chat API
          try {
            // Show "Agent is typing..." indicator
            await sheetClient.setRangeValues(`${CHAT_SHEET}!A6:B6`, [
              ["Agent", "Thinking..."],
            ]);

            // Format the agent label with light red
            await sheetClient.formatRange(
              sheetId,
              5, // startRowIndex
              6, // endRowIndex
              0, // startColumnIndex
              1, // endColumnIndex
              SHEET_STYLES.AGENT_LABEL
            );

            // Use your existing API endpoint instead of a custom local one
            try {
              // Get wallet address for context
              const walletAddress = await sheetClient.getCellValue(
                SETTINGS_SHEET,
                2,
                "B"
              );

              // Get API URL from environment or use default
              const apiUrl = `${url}/chat`;

              // Make API call to the agent service
              const response = await axios.post(apiUrl, {
                message: userMessage,
                walletAddress: walletAddress || "unknown",
                context: "chat",
              });

              if (response.status !== 200) {
                throw new Error(`API error: ${response.status}`);
              }

              const data = response.data;
              // Extract response from your API's response format
              const agentResponse =
                data.response ||
                data.message ||
                data.content ||
                "Sorry, I couldn't process your request.";

              // Update the agent response
              await sheetClient.setCellValue(CHAT_SHEET, 6, "B", agentResponse);

              // Format the agent response cell
              await sheetClient.formatRange(
                sheetId,
                5, // startRowIndex
                6, // endRowIndex
                1, // startColumnIndex
                6, // endColumnIndex
                SHEET_STYLES.AGENT_MESSAGE
              );
            } catch (apiError) {
              logEvent(
                `API Error: ${apiError instanceof Error
                  ? apiError.message
                  : String(apiError)
                }`
              );
              // Update with error message
              await sheetClient.setCellValue(
                CHAT_SHEET,
                6,
                "B",
                `Sorry, there was an error connecting to the agent service: ${apiError instanceof Error
                  ? apiError.message
                  : String(apiError)
                }`
              );
            }
          } catch (formatError) {
            logEvent(
              `Format Error: ${formatError instanceof Error
                ? formatError.message
                : String(formatError)
              }`
            );
          }
        }
      } catch (error) {
        logEvent(
          `Error checking for messages: ${error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Continue checking every 10 seconds
      setTimeout(checkForNewMessages, 10000);
    };

    // Start the monitoring loop
    checkForNewMessages();
  } catch (error) {
    logEvent(
      `Error monitoring chat sheet: ${error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Get risk factor from settings
 * Returns a number between 0-10 indicating risk tolerance, defaults to 5 if not set
 */
export async function getRiskFactor(sheetClient, logEvent) {
  try {
    console.log(
      `🔍 Attempting to get risk factor from "${SETTINGS_SHEET}" sheet...`
    );
    const values = await sheetClient.getSheetValues(SETTINGS_SHEET);

    // Find the risk factor in the settings
    for (const row of values) {
      if (row[0] === "Risk Factor") {
        const riskValue = parseFloat(row[1]);
        // Validate that the value is within range
        if (!isNaN(riskValue) && riskValue >= 0 && riskValue <= 10) {
          console.log(`✅ Found risk factor: ${riskValue}`);
          return riskValue;
        } else {
          console.log(`⚠️ Invalid risk factor value: ${row[1]}, using default`);
          return 5; // Default to middle value if invalid
        }
      }
    }

    console.log(
      `⚠️ Risk factor not found in settings, using default value of 5`
    );
    return 5; // Default to middle value if not found
  } catch (error) {
    console.error(`❌ Error getting risk factor:`, error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    logEvent(
      `Error getting risk factor: ${error instanceof Error ? error.message : String(error)
      }. Using default value of 5.`
    );
    return 5; // Default to middle value if error
  }
}
