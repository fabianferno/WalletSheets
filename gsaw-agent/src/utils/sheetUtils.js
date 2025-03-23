import { ethers } from "ethers";
import axios from "axios";

// Sheet names
export const SETTINGS_SHEET = "Settings";
export const WALLET_EXPLORER_SHEET = "View Transactions";
export const ACTIVE_SESSIONS_SHEET = "Connect to Dapp";
export const PENDING_TRANSACTIONS_SHEET = "Pending Transactions";
export const CHAT_SHEET = "Chat with Wallet";
export const PORTFOLIO_SHEET = "Portfolio";
export const AGENT_LOGS_SHEET = "Agent Logs";

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

  // Button styling
  BUTTON: {
    backgroundColor: { red: 0.9, green: 0.9, blue: 1.0 },
    textFormat: {
      bold: true,
      fontFamily: "Roboto",
      fontSize: 12,
    },
    horizontalAlignment: "CENTER",
    verticalAlignment: "MIDDLE",
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
      AGENT_LOGS_SHEET,
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
            `Failed to delete sheet ${sheet.title}: ${
              deleteError instanceof Error
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
        case AGENT_LOGS_SHEET:
          await createAgentLogsSheet(sheetClient, logEvent);
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

    // Create Agent Logs sheet
    await createAgentLogsSheet(sheetClient, logEvent);

    logEvent("All sheets created successfully");
  } catch (error) {
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
      `Error creating ${SETTINGS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
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

    // Get the chain ID for explorer URL construction
    let chainId = 42161; // Default to Arbitrum
    try {
      const network = await provider.getNetwork();
      chainId = network.chainId;
      logEvent(`Detected chain ID: ${chainId}`);
    } catch (error) {
      logEvent(`Error getting chain ID: ${error}. Using default: ${chainId}`);
    }

    // First try using Arbiscan API
    try {
      const ARBISCAN_API_KEY = process.env.ARBISCAN_KEY || "";

      if (!ARBISCAN_API_KEY) {
        logEvent(
          `No Arbiscan API key found. To improve performance, add an Arbiscan API key.`
        );
      } else {
        logEvent(`Using Arbiscan API for transaction history`);
      }

      const ARBISCAN_API_URL = "https://api.arbiscan.io/api";

      // Fetch normal transactions
      const normalTxResponse = await axios.get(ARBISCAN_API_URL, {
          params: {
            module: "account",
            action: "txlist",
            address: walletAddress,
            startblock: 0,
            endblock: 99999999,
            page: 1,
            offset: limit,
            sort: "desc",
          apikey: ARBISCAN_API_KEY,
        },
        timeout: 5000, // 5 second timeout
      });

      // Fetch internal transactions (ETH transfers from contracts)
      const internalTxResponse = await axios.get(ARBISCAN_API_URL, {
        params: {
          module: "account",
          action: "txlistinternal",
          address: walletAddress,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: limit,
          sort: "desc",
          apikey: ARBISCAN_API_KEY,
        },
        timeout: 5000, // 5 second timeout
      });

      // Process normal transactions
      if (
        normalTxResponse.data.status === "1" &&
        normalTxResponse.data.result
      ) {
          logEvent(
          `Found ${normalTxResponse.data.result.length} normal transactions from Arbiscan API`
          );

        for (const tx of normalTxResponse.data.result) {
            const timestamp = new Date(
              parseInt(tx.timeStamp) * 1000
            ).toISOString();
            const status = tx.isError === "0" ? "Success" : "Failed";
          const amount = ethers.formatEther(tx.value);
          const explorerUrl = getTransactionExplorerUrl(tx.hash, chainId);

            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
            amount,
            timestamp,
            status,
            explorerUrl,
            txType: "normal",
          });
        }
      }

      // Process internal transactions
      if (
        internalTxResponse.data.status === "1" &&
        internalTxResponse.data.result
      ) {
        logEvent(
          `Found ${internalTxResponse.data.result.length} internal transactions from Arbiscan API`
        );

        for (const tx of internalTxResponse.data.result) {
          // Skip if we already have this transaction hash
          if (!transactions.some((t) => t.hash === tx.hash)) {
            const timestamp = new Date(
              parseInt(tx.timeStamp) * 1000
            ).toISOString();
            // Internal txs don't have an isError field
            const status = "Success";
            const amount = ethers.formatEther(tx.value);
            const explorerUrl = getTransactionExplorerUrl(tx.hash, chainId);

            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount,
              timestamp,
              status,
              explorerUrl,
              txType: "internal",
            });
          }
        }
      }

      if (transactions.length > 0) {
      logEvent(
          `Found ${transactions.length} total transactions from Arbiscan API`
        );

        // Sort by timestamp (newest first)
        transactions.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });

        // Take only the limit number of transactions
        const limitedTransactions = transactions.slice(0, limit);

        // Clean up transactions by removing the txType field
        const cleanedTransactions = limitedTransactions.map((tx) => {
          const { txType, ...cleanTx } = tx;
          return cleanTx;
        });

        // Log the final results
        const incomingCount = cleanedTransactions.filter(
          (tx) => tx.to?.toLowerCase() === walletAddress.toLowerCase()
        ).length;

        logEvent(
          `Returning ${cleanedTransactions.length} transactions (${incomingCount} incoming)`
        );

        return cleanedTransactions;
      }
    } catch (apiError) {
      logEvent(
        `Error using Arbiscan API: ${apiError}. Will try fallback method.`
      );
    }

    // If we get here, both Arbiscan API methods failed
    logEvent(
      `No transactions found via Arbiscan API, trying standard RPC method`
    );

    // Fallback to a very simplified RPC method - just get recent blocks
    try {
      // Just get the latest 10 blocks for a quick check
      const currentBlock = await provider.getBlockNumber();
      const blocksToCheck = Math.min(10, currentBlock);

      logEvent(
        `Checking only the most recent ${blocksToCheck} blocks as a last resort...`
      );

      // Check blocks one by one
      for (let i = 0; i < blocksToCheck && transactions.length < limit; i++) {
        try {
          const blockNumber = currentBlock - i;
          const block = await provider.getBlock(blockNumber, true);

          if (!block || !block.transactions) continue;

          // Check each transaction in the block
          for (const tx of block.transactions) {
            // Check if transaction involves our wallet
            if (
              tx.to?.toLowerCase() === walletAddress.toLowerCase() ||
              tx.from?.toLowerCase() === walletAddress.toLowerCase()
            ) {
              const receipt = await provider.getTransactionReceipt(tx.hash);
            const status =
                receipt && receipt.status === 1 ? "Success" : "Failed";
            const timestamp = new Date(
              (block.timestamp || 0) * 1000
            ).toISOString();
              const amount = tx.value ? ethers.formatEther(tx.value) : "0";
              const explorerUrl = getTransactionExplorerUrl(tx.hash, chainId);

            transactions.push({
              hash: tx.hash,
              from: tx.from || "Unknown",
              to: tx.to || "Contract Creation",
                amount,
                timestamp,
                status,
                explorerUrl,
              });

              if (transactions.length >= limit) break;
          }
        }
      } catch (blockError) {
          logEvent(`Error checking block ${currentBlock - i}: ${blockError}`);
        }
      }
    } catch (rpcError) {
      logEvent(`Error with RPC fallback method: ${rpcError}`);
    }

    // Sort and limit final results
    if (transactions.length > 0) {
      transactions.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });

      return transactions.slice(0, limit);
    }

    logEvent(`No transactions found through any method`);
    return [];
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

      // Set up headers with Explorer URL column
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A1:G1`, [
        [
          "Transaction Hash",
          "From",
          "To",
          "Amount",
          "Timestamp",
          "Status",
          "Explorer URL",
        ],
      ]);

      // Add refresh buttons
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A2:A3`, [
        ["🔄 Refresh Transactions"],
        ["🔄 Refresh"],
      ]);

      // Format the first refresh button
      await sheetClient.formatRange(
        sheetId,
        1, // startRowIndex (row 2)
        2, // endRowIndex (exclusive)
        0, // startColumnIndex
        1, // endColumnIndex (exclusive)
        SHEET_STYLES.BUTTON || {
          backgroundColor: { red: 0.9, green: 0.9, blue: 1.0 },
          textFormat: {
            bold: true,
            fontFamily: "Roboto",
            fontSize: 12,
          },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
        }
      );

      // Format the second refresh button with a different style
      await sheetClient.formatRange(
        sheetId,
        2, // startRowIndex (row 3)
        3, // endRowIndex (exclusive)
        0, // startColumnIndex
        1, // endColumnIndex (exclusive)
        {
          backgroundColor: { red: 0.2, green: 0.6, blue: 0.4 },
          textFormat: {
            bold: true,
            fontFamily: "Roboto",
            fontSize: 11,
          },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
        }
      );

      // Add explanation text for the refresh buttons
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!B2:G3`, [
        [
          "This page shows your most recent transactions. Click the refresh button to update.",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "Use either button to refresh your transaction history. Both do the same thing.",
          "",
          "",
          "",
          "",
          "",
        ],
      ]);

      // Format the explanation text
      await sheetClient.formatRange(
        sheetId,
        1, // startRowIndex (row 2)
        3, // endRowIndex (exclusive)
        1, // startColumnIndex
        7, // endColumnIndex (exclusive)
        SHEET_STYLES.HELPER_NOTES
      );

      // Merge the explanation cells for better presentation
      await sheetClient.batchUpdate({
        requests: [
          {
            mergeCells: {
              range: {
                sheetId: sheetId,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 1,
                endColumnIndex: 7,
              },
              mergeType: "MERGE_ALL",
            },
          },
          {
            mergeCells: {
              range: {
                sheetId: sheetId,
                startRowIndex: 2,
                endRowIndex: 3,
                startColumnIndex: 1,
                endColumnIndex: 7,
              },
              mergeType: "MERGE_ALL",
            },
          },
        ],
      });

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
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 6, // Explorer URL column
                endIndex: 7,
              },
              properties: {
                pixelSize: 250, // Width for explorer URL
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
        4, // endRowIndex (enough for header, buttons, and first data row)
        0, // startColumnIndex
        7, // endColumnIndex (exclusive)
        SHEET_STYLES.BASE_TEXT
      );

      // Format the header row with mild green
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex (0-based, so row 1)
        1, // endRowIndex (exclusive)
        0, // startColumnIndex
        7, // endColumnIndex (exclusive)
        SHEET_STYLES.HEADER
      );

      // Set up named ranges for the refresh buttons
      try {
        // Add a named range for the first refresh button
        await sheetClient.setNamedRange(
          sheetId,
          "refresh_transactions_button_1",
          1, // rowIndex (0-based)
          2, // endRowIndex (exclusive)
          0, // columnIndex
          1 // endColumnIndex (exclusive)
        );

        // Add a named range for the second refresh button
        await sheetClient.setNamedRange(
          sheetId,
          "refresh_transactions_button_2",
          2, // rowIndex (0-based)
          3, // endRowIndex (exclusive)
          0, // columnIndex
          1 // endColumnIndex (exclusive)
        );

        logEvent(`Set up named ranges for refresh transaction buttons`);
      } catch (triggerError) {
        logEvent(`Error setting up refresh button triggers: ${triggerError}`);
      }

      logEvent(
        `${WALLET_EXPLORER_SHEET} sheet created with styling and refresh buttons`
      );
    }
  } catch (error) {
    logEvent(
      `Error creating ${WALLET_EXPLORER_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
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
  logEvent,
  forceRefresh = false
) {
  try {
    logEvent(
      `${
        forceRefresh ? "Force refreshing" : "Initializing"
      } Wallet Explorer with recent transactions for ${walletAddress}`
    );

    // Check if sheet exists
    try {
      // Get the current values to check if we need to restore the refresh buttons
      const values = await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);
      let hasRefreshButtons = false;
      let buttonCount = 0;

      // Check if the refresh buttons exist by looking at the first few rows
      if (values.length > 1) {
        // Check for the first refresh button at A2
        if (
          values.length > 1 &&
          values[1][0] &&
          values[1][0].includes("Refresh")
        ) {
          buttonCount++;
        }

        // Check for the second refresh button at A3
        if (
          values.length > 2 &&
          values[2][0] &&
          values[2][0].includes("Refresh")
        ) {
          buttonCount++;
        }

        hasRefreshButtons = buttonCount > 0;

        // Get the sheet ID
        const sheetId = await sheetClient.getSheetIdByName(
          WALLET_EXPLORER_SHEET
        );

        // Clear existing transaction data (keeping the header row and refresh button rows)
        await sheetClient.batchUpdate({
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: "ROWS",
                  startIndex: buttonCount > 0 ? 1 + buttonCount : 1, // Start after header and refresh buttons
                  endIndex: values.length,
                },
              },
            },
          ],
        });

        logEvent(
          `Cleared existing transaction data from ${WALLET_EXPLORER_SHEET}`
        );
      }

      // Update header to include Explorer URL
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A1:G1`, [
        [
          "Transaction Hash",
          "From",
          "To",
          "Amount",
          "Timestamp",
          "Status",
          "Explorer URL",
        ],
      ]);

      // Get the sheet ID
      const sheetId = await sheetClient.getSheetIdByName(WALLET_EXPLORER_SHEET);

      // If there are no refresh buttons, add them
      if (!hasRefreshButtons) {
        // Add first refresh button - "Refresh Transactions"
        await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A2:A2`, [
          ["🔄 Refresh Transactions"],
        ]);

        // Format the first refresh button with custom style
        await sheetClient.formatRange(
          sheetId,
          1, // startRowIndex (row 2)
          2, // endRowIndex (exclusive)
          0, // startColumnIndex
          1, // endColumnIndex (exclusive)
          SHEET_STYLES.BUTTON
        );

        // Add second refresh button - "Refresh"
        await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A3:A3`, [
          ["🔄 Refresh"],
        ]);

        // Format the second refresh button with a different style
        await sheetClient.formatRange(
          sheetId,
          2, // startRowIndex (row 3)
          3, // endRowIndex (exclusive)
          0, // startColumnIndex
          1, // endColumnIndex (exclusive)
          {
            ...SHEET_STYLES.BUTTON,
            backgroundColor: {
              red: 0.2,
              green: 0.6,
              blue: 0.4,
            },
            textFormat: {
              ...SHEET_STYLES.BUTTON.textFormat,
              fontSize: 11,
            },
          }
        );

        // Add a message explaining the transaction history feature
        await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!B2:G3`, [
          [
            "This page shows your most recent transactions. Click the refresh button to update.",
            "",
            "",
            "",
            "",
            "",
          ],
          [
            "Use either button to refresh your transaction history. Both do the same thing.",
            "",
            "",
            "",
            "",
            "",
          ],
        ]);

        // Format the explanation rows
        await sheetClient.formatRange(
          sheetId,
          1, // startRowIndex (row 2)
          3, // endRowIndex (exclusive)
          1, // startColumnIndex
          7, // endColumnIndex (exclusive)
          SHEET_STYLES.HELPER_NOTES
        );

        // Merge the explanation cells for better presentation
        await sheetClient.batchUpdate({
          requests: [
            {
              mergeCells: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1,
                  endRowIndex: 2,
                  startColumnIndex: 1,
                  endColumnIndex: 7,
                },
                mergeType: "MERGE_ALL",
              },
            },
            {
              mergeCells: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 2,
                  endRowIndex: 3,
                  startColumnIndex: 1,
                  endColumnIndex: 7,
                },
                mergeType: "MERGE_ALL",
              },
            },
          ],
        });

        logEvent(`Added refresh buttons to Wallet Explorer sheet`);
        buttonCount = 2; // We've added 2 buttons
      }

      // Update column widths
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 6, // Explorer URL column
                endIndex: 7,
              },
              properties: {
                pixelSize: 250, // Width for explorer URL column
              },
              fields: "pixelSize",
            },
          },
        ],
      });

      // Display a "Loading..." message while we fetch transactions
      const startRow = 1 + buttonCount; // Start after header and buttons
      await sheetClient.setRangeValues(
        `${WALLET_EXPLORER_SHEET}!A${startRow}:G${startRow}`,
        [["Loading transactions...", "", "", "", "", "", ""]]
      );

      // Format the loading message
      await sheetClient.formatRange(
        sheetId,
        startRow - 1, // Convert to 0-based index
        startRow, // Exclusive end
        0,
        7,
        {
          ...SHEET_STYLES.HELPER_NOTES,
          textFormat: {
            ...SHEET_STYLES.HELPER_NOTES.textFormat,
            italic: true,
            bold: true,
          },
        }
      );

      // Merge the loading message cells for better presentation
      await sheetClient.batchUpdate({
        requests: [
          {
            mergeCells: {
              range: {
                sheetId: sheetId,
                startRowIndex: startRow - 1, // Convert to 0-based index
                endRowIndex: startRow, // Exclusive end
                startColumnIndex: 0,
                endColumnIndex: 7,
              },
              mergeType: "MERGE_ALL",
            },
          },
        ],
      });

      // If force refresh, clear provider cache by creating a new one
      let transactionProvider = provider;
      if (forceRefresh) {
        logEvent(`Creating new provider to ensure fresh blockchain data`);
        transactionProvider = new ethers.JsonRpcProvider(
          provider.connection.url
        );
      }

      // Fetch recent transactions with slightly increased timeout for refresh
      const transactions = await fetchHistoricalTransactions(
        walletAddress,
        transactionProvider,
        10, // Limit to last 10 transactions
        logEvent
      );

      // Clear the loading message by deleting the row
      await sheetClient.batchUpdate({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: startRow - 1, // Convert to 0-based index
                endIndex: startRow,
              },
            },
          },
        ],
      });

      if (transactions.length === 0) {
        // Add a "No transactions available" row if no transactions found
        await sheetClient.setRangeValues(
          `${WALLET_EXPLORER_SHEET}!A${startRow}:G${startRow}`,
          [["No transactions available", "", "", "", "", "", ""]]
        );

        // Format the no transactions message
        await sheetClient.formatRange(
          sheetId,
          startRow - 1, // Convert to 0-based index
          startRow, // Exclusive end
          0,
          7,
          SHEET_STYLES.HELPER_NOTES
        );

        // Merge the no transactions message cells
        await sheetClient.batchUpdate({
          requests: [
            {
              mergeCells: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: startRow - 1, // Convert to 0-based index
                  endRowIndex: startRow, // Exclusive end
                  startColumnIndex: 0,
                  endColumnIndex: 7,
                },
                mergeType: "MERGE_ALL",
              },
            },
          ],
        });

        logEvent(
          `No historical transactions found for wallet ${walletAddress}`
        );
        return;
      }

      // Add transactions to the sheet with explorer URLs
      const transactionRows = transactions.map((tx) => [
        tx.hash,
        tx.from,
        tx.to,
        tx.amount,
        tx.timestamp,
        tx.status,
        tx.explorerUrl || "", // Include the explorer URL
      ]);

      // Append rows after the refresh buttons and any explanation text
      await sheetClient.appendRows(WALLET_EXPLORER_SHEET, transactionRows);

      // Make the Explorer URL column clickable (hyperlink)
      for (let i = 0; i < transactions.length; i++) {
        const rowIndex = 1 + buttonCount + i; // Adjust for header and button rows
        const url = transactions[i].explorerUrl;

        if (url) {
          await sheetClient.batchUpdate({
            requests: [
              {
                updateCells: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: rowIndex - 1, // Convert to 0-based index
                    endRowIndex: rowIndex,
                    startColumnIndex: 6,
                    endColumnIndex: 7,
                  },
                  rows: [
                    {
                      values: [
                        {
                          userEnteredValue: {
                            formulaValue: `=HYPERLINK("${url}","View Transaction")`,
                          },
                        },
                      ],
                    },
                  ],
                  fields: "userEnteredValue",
                },
              },
            ],
          });
        }
      }

      logEvent(
        `Added ${transactions.length} historical transactions with explorer links to Wallet Explorer`
      );

      // Add named ranges for the refresh buttons
      try {
        // Add a named range for the first refresh button
        await sheetClient.setNamedRange(
          sheetId,
          "refresh_transactions_button_1",
          1, // rowIndex (0-based)
          2, // endRowIndex (exclusive)
          0, // columnIndex
          1 // endColumnIndex (exclusive)
        );

        // Add a named range for the second refresh button
        await sheetClient.setNamedRange(
          sheetId,
          "refresh_transactions_button_2",
          2, // rowIndex (0-based)
          3, // endRowIndex (exclusive)
          0, // columnIndex
          1 // endColumnIndex (exclusive)
        );

        logEvent(`Set up named ranges for refresh transaction buttons`);
      } catch (triggerError) {
        logEvent(`Error setting up refresh button triggers: ${triggerError}`);
      }
    } catch (error) {
      logEvent(`Error initializing Wallet Explorer: ${error}`);
    }
  } catch (error) {
    logEvent(
      `Error initializing Wallet Explorer: ${
        error instanceof Error ? error.message : String(error)
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
      `Error creating ${PENDING_TRANSACTIONS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
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
export async function storeSheetOwnerEmail(sheetClient, ownerEmail, logEvent) {
  try {
    await sheetClient.setCellValue(SETTINGS_SHEET, 3, "B", ownerEmail);
    logEvent(`Sheet owner email stored: ${ownerEmail}`);
  } catch (error) {
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
      `Error adding transaction to sheet: ${
        error instanceof Error ? error.message : String(error)
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
      `Error updating ${PENDING_TRANSACTIONS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Create Agent Logs sheet
 */
export async function createAgentLogsSheet(sheetClient, logEvent) {
  try {
    // Check if sheet exists
    try {
      await sheetClient.getSheetValues(AGENT_LOGS_SHEET);
      return;
    } catch {
      // Create the sheet
      const sheetId = await sheetClient.createSheet(AGENT_LOGS_SHEET);

      // Set up headers
      await sheetClient.setRangeValues(`${AGENT_LOGS_SHEET}!A1:D1`, [
        ["Action", "Explanation", "Transaction Hash", "Created At"],
      ]);

      // Set column widths
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0, // Action column
                endIndex: 1,
              },
              properties: {
                pixelSize: 150, // Width for Action
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 1, // Explanation column
                endIndex: 2,
              },
              properties: {
                pixelSize: 350, // Width for Explanation (wider for detailed text)
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 2, // Transaction Hash column
                endIndex: 3,
              },
              properties: {
                pixelSize: 250, // Width for Transaction Hash
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 3, // Created At column
                endIndex: 4,
              },
              properties: {
                pixelSize: 180, // Width for Created At
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
        4, // endColumnIndex (exclusive)
        SHEET_STYLES.BASE_TEXT
      );

      // Format the header row with mild green
      await sheetClient.formatRange(
        sheetId,
        0, // startRowIndex (0-based, so row 1)
        1, // endRowIndex (exclusive)
        0, // startColumnIndex
        4, // endColumnIndex (exclusive)
        SHEET_STYLES.HEADER
      );

      logEvent(`${AGENT_LOGS_SHEET} sheet created with styling`);
    }
  } catch (error) {
    logEvent(
      `Error creating ${AGENT_LOGS_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Insert a new agent log entry
 * @param {Object} sheetClient - The sheet client instance
 * @param {Object} tradeData - Object containing action, explanation and trade_data with tx_hash
 * @param {string} tradeData.action - The action that was performed
 * @param {string} tradeData.explanation - The explanation for the action
 * @param {Object} tradeData.trade_data - Object containing transaction details
 * @param {string} tradeData.trade_data.tx_hash - The transaction hash
 * @param {Function} logEvent - Function to log events
 */
export async function insertAgentLogEntry(sheetClient, tradeData) {
  try {
    // Check if sheet exists, create if not
    try {
      await sheetClient.getSheetValues(AGENT_LOGS_SHEET);
    } catch {
      console.log("Agent logs sheet doesn't exist yet, will be created later");
    }

    // Extract data from the tradeData object
    const action = tradeData.action || "Unknown";
    const explanation = tradeData.explanation || "";
    const txHash = tradeData.trade_data?.tx_hash || "";
    const createdAt = new Date().toISOString();

    // Add the log entry to the sheet
    await sheetClient.appendRows(AGENT_LOGS_SHEET, [
      [action, explanation, txHash, createdAt],
    ]);

    console.log(`Added agent log entry for action: ${action}`);
  } catch (error) {
    console.error(
      `Error inserting agent log entry: ${
        error instanceof Error ? error.message : String(error)
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
  } catch (error) {
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
      `Error creating ${CHAT_SHEET} sheet: ${
        error instanceof Error ? error.message : String(error)
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
    let url = "placeholder";

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

              let agentResponse = "";
              if (url == "placeholder") url = await agent.getUrl();

              if (url == "placeholder") {
                agentResponse = "Agent is still deploying. Please wait...";
              } else {
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
                agentResponse =
                data.response ||
                data.message ||
                data.content ||
                "Sorry, I couldn't process your request.";
              }

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
                `API Error: ${
                  apiError instanceof Error
                    ? apiError.message
                    : String(apiError)
                }`
              );
              // Update with error message
              await sheetClient.setCellValue(
                CHAT_SHEET,
                6,
                "B",
                `Sorry, there was an error connecting to the agent service: ${
                  apiError instanceof Error
                    ? apiError.message
                    : String(apiError)
                }`
              );
            }
          } catch (formatError) {
            logEvent(
              `Format Error: ${
                formatError instanceof Error
                  ? formatError.message
                  : String(formatError)
              }`
            );
          }
        }
      } catch (error) {
        logEvent(
          `Error checking for messages: ${
            error instanceof Error ? error.message : String(error)
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
      `Error monitoring chat sheet: ${
        error instanceof Error ? error.message : String(error)
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
      `Error getting risk factor: ${
        error instanceof Error ? error.message : String(error)
      }. Using default value of 5.`
    );
    return 5; // Default to middle value if error
  }
}

/**
 * Monitors clicks on either of the transaction refresh buttons and refreshes transactions when clicked
 * Uses a portfolio-style approach checking for any value change
 * @param {SheetClient} sheetClient - Google Sheets API client
 * @param {string} walletAddress - Wallet address to fetch transactions for
 * @param {ethers.Provider} provider - Ethereum provider to use for fetching transactions
 * @param {Function} logEvent - Function to log events
 * @returns {Promise<boolean>} - Returns true if a refresh was triggered
 */
export async function monitorTransactionRefreshButton(
  sheetClient,
  walletAddress,
  provider,
  logEvent
) {
  try {
    // Check if sheet exists
    const sheetId = await sheetClient.getSheetIdByName(WALLET_EXPLORER_SHEET);
    if (!sheetId) return false;

    // Get the current values of both buttons
    const button1Values = await sheetClient.getSheetValues(
      WALLET_EXPLORER_SHEET,
      "A2:A2"
    );
    const button2Values = await sheetClient.getSheetValues(
      WALLET_EXPLORER_SHEET,
      "A3:A3"
    );

    const button1Text = button1Values?.[0]?.[0] || "";
    const button2Text = button2Values?.[0]?.[0] || "";

    // Define the expected button states
    const defaultButton1Text = "🔄 Refresh Transactions";
    const defaultButton2Text = "🔄 Refresh";
    const refreshingText = "⏳ Refreshing...";

    // Check if either button text indicates it's in a refreshing state
    const isRefreshing =
      button1Text.includes(refreshingText) ||
      button2Text.includes(refreshingText);

    if (isRefreshing) {
      // Already refreshing, don't trigger again
      return false;
    }

    // Only trigger refresh if button text has been MODIFIED by a user
    // and is NOT one of the known states (default or refreshing)
    const button1Modified =
      button1Text &&
      button1Text !== defaultButton1Text &&
      !button1Text.includes(refreshingText);

    const button2Modified =
      button2Text &&
      button2Text !== defaultButton2Text &&
      !button2Text.includes(refreshingText);

    if (button1Modified || button2Modified) {
      logEvent(
        `Detected change in refresh button text: "${button1Text}" or "${button2Text}". Triggering refresh.`
      );

      // Directly call the refresh function
      await refreshTransactionHistory(
        sheetClient,
        walletAddress,
        provider,
        logEvent
      );

      // Reset buttons to default state to prevent continuous refreshing
      if (button1Modified) {
        await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A2:A2`, [
          [defaultButton1Text],
        ]);
      }

      if (button2Modified) {
        await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A3:A3`, [
          [defaultButton2Text],
        ]);
      }

      return true;
    }

    return false;
  } catch (error) {
    logEvent(
      `Error monitoring transaction refresh button: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return false;
  }
}

/**
 * Generates a transaction explorer URL based on the chain ID
 * @param {string} txHash - Transaction hash
 * @param {number} chainId - Chain ID
 * @returns {string} - Explorer URL
 */
function getTransactionExplorerUrl(txHash, chainId = 42161) {
  // Default to Arbitrum explorer
  let baseUrl = "https://arbiscan.io/tx/";

  // Use the appropriate explorer based on chain ID
  switch (chainId) {
    case 1: // Ethereum Mainnet
      baseUrl = "https://etherscan.io/tx/";
      break;
    case 42161: // Arbitrum One
      baseUrl = "https://arbiscan.io/tx/";
      break;
    case 10: // Optimism
      baseUrl = "https://optimistic.etherscan.io/tx/";
      break;
    case 137: // Polygon
      baseUrl = "https://polygonscan.com/tx/";
      break;
    case 56: // BNB Smart Chain
      baseUrl = "https://bscscan.com/tx/";
      break;
    case 43114: // Avalanche C-Chain
      baseUrl = "https://snowtrace.io/tx/";
      break;
    case 42170: // Arbitrum Nova
      baseUrl = "https://nova.arbiscan.io/tx/";
      break;
    case 11155111: // Sepolia testnet
      baseUrl = "https://sepolia.etherscan.io/tx/";
      break;
    default:
      // Keep default Arbitrum explorer
      baseUrl = "https://arbiscan.io/tx/";
  }

  return baseUrl + txHash;
}

/**
 * Directly trigger a refresh of the wallet transaction history
 * This can be called when a user clicks a refresh button
 * @param {SheetClient} sheetClient - Google Sheets API client
 * @param {string} walletAddress - Wallet address to fetch transactions for
 * @param {ethers.Provider} provider - Ethereum provider to use for fetching transactions
 * @param {Function} logEvent - Function to log events
 * @returns {Promise<boolean>} - Returns true if the refresh was successful
 */
export async function refreshTransactionHistory(
  sheetClient,
  walletAddress,
  provider,
  logEvent
) {
  try {
    logEvent(`Manually refreshing transaction history for ${walletAddress}...`);

    // Get the sheet ID to work with
    const sheetId = await sheetClient.getSheetIdByName(WALLET_EXPLORER_SHEET);
    if (!sheetId) {
      logEvent(`Wallet Explorer sheet not found`);
      return false;
    }

    // Get the current sheet values to determine button positions
    const values = await sheetClient.getSheetValues(WALLET_EXPLORER_SHEET);

    // Determine button count for positioning
    let buttonCount = 0;
    if (values.length > 1 && values[1][0] && values[1][0].includes("Refresh")) {
      buttonCount++;
    }
    if (values.length > 2 && values[2][0] && values[2][0].includes("Refresh")) {
      buttonCount++;
    }

    // Set both buttons to refreshing state
    if (buttonCount >= 1) {
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A2:A2`, [
        ["⏳ Refreshing (API rate limited)..."],
      ]);

      // Change button color to indicate processing
      await sheetClient.formatRange(
        sheetId,
        1, // row 2 (0-based)
        2, // exclusive end
        0, // column A
        1, // exclusive end
        {
          backgroundColor: {
            red: 0.9,
            green: 0.7,
            blue: 0.2,
          },
          textFormat: {
            bold: true,
            fontFamily: "Roboto",
            fontSize: 12,
          },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
        }
      );
    }

    if (buttonCount >= 2) {
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A3:A3`, [
        ["⏳ Refreshing (API rate limited)..."],
      ]);

      // Change button color to indicate processing
      await sheetClient.formatRange(
        sheetId,
        2, // row 3 (0-based)
        3, // exclusive end
        0, // column A
        1, // exclusive end
        {
          backgroundColor: {
            red: 0.9,
            green: 0.7,
            blue: 0.2,
          },
          textFormat: {
            bold: true,
            fontFamily: "Roboto",
            fontSize: 12,
          },
          horizontalAlignment: "CENTER",
          verticalAlignment: "MIDDLE",
        }
      );
    }

    // Create a fresh provider to ensure no caching issues
    const freshProvider = new ethers.providers.JsonRpcProvider(
      provider.connection.url
    );

    // Force a refresh of the transactions
    await initializeWalletExplorer(
      sheetClient,
      walletAddress,
      freshProvider,
      logEvent,
      true // Force refresh
    );

    // Restore button states with cooldown info
    const nextRefreshTime = new Date(Date.now() + 60000).toLocaleTimeString();

    if (buttonCount >= 1) {
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A2:A2`, [
        [`🔄 Next refresh after ${nextRefreshTime}`],
      ]);

      // Restore button style but with gray to indicate cooldown
      await sheetClient.formatRange(
        sheetId,
        1, // row 2 (0-based)
        2, // exclusive end
        0, // column A
        1, // exclusive end
        {
          ...SHEET_STYLES.BUTTON,
          backgroundColor: {
            red: 0.7,
            green: 0.7,
            blue: 0.7,
          },
          textFormat: {
            ...SHEET_STYLES.BUTTON.textFormat,
            fontSize: 10,
          },
        }
      );
    }

    if (buttonCount >= 2) {
      await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A3:A3`, [
        [`🔄 Available at ${nextRefreshTime}`],
      ]);

      // Restore button style for second button but grayed out
      await sheetClient.formatRange(
        sheetId,
        2, // row 3 (0-based)
        3, // exclusive end
        0, // column A
        1, // exclusive end
        {
          ...SHEET_STYLES.BUTTON,
          backgroundColor: {
            red: 0.7,
            green: 0.7,
            blue: 0.7,
          },
          textFormat: {
            ...SHEET_STYLES.BUTTON.textFormat,
            fontSize: 10,
          },
        }
      );
    }

    // Schedule restoration of normal button text after cooldown
    setTimeout(async () => {
      try {
        if (buttonCount >= 1) {
          await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A2:A2`, [
            ["🔄 Refresh Transactions"],
          ]);

          // Restore original button style
          await sheetClient.formatRange(
            sheetId,
            1, // row 2 (0-based)
            2, // exclusive end
            0, // column A
            1, // exclusive end
            SHEET_STYLES.BUTTON
          );
        }

        if (buttonCount >= 2) {
          await sheetClient.setRangeValues(`${WALLET_EXPLORER_SHEET}!A3:A3`, [
            ["🔄 Refresh"],
          ]);

          // Restore original button style for second button
          await sheetClient.formatRange(
            sheetId,
            2, // row 3 (0-based)
            3, // exclusive end
            0, // column A
            1, // exclusive end
            {
              ...SHEET_STYLES.BUTTON,
              backgroundColor: {
                red: 0.2,
                green: 0.6,
                blue: 0.4,
              },
              textFormat: {
                ...SHEET_STYLES.BUTTON.textFormat,
                fontSize: 11,
              },
            }
          );
        }

        logEvent("Refresh buttons restored to normal state after cooldown");
      } catch (restoreError) {
        logEvent(`Error restoring button state: ${restoreError}`);
      }
    }, 60000); // After 60 seconds (matches the rate limit in walletManager.js)

    logEvent(`Transaction history refreshed successfully (rate limited)`);
    return true;
  } catch (error) {
    logEvent(`Error refreshing transaction history: ${error}`);
    return false;
  }
}
