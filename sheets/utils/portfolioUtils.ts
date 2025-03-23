import { ethers } from "ethers";
import { SheetClient } from "../sheets.api";
import axios from "axios";
import { PORTFOLIO_SHEET } from "./sheetUtils";

/**
 * Initialize portfolio sheet with enhanced UI
 */
export async function initializePortfolioSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    logEvent("Initializing enhanced portfolio dashboard...");

    // Check if sheet already exists
    const sheets = await sheetClient.getAllSheets();
    if (sheets.some((sheet) => sheet.title === PORTFOLIO_SHEET)) {
      logEvent(`${PORTFOLIO_SHEET} already exists`);
      return;
    }

    // Create the sheet
    await sheetClient.createSheet(PORTFOLIO_SHEET);

    // Apply the enhanced UI formatting
    await formatEnhancedPortfolioSheet(sheetClient, logEvent);

    logEvent("Enhanced portfolio dashboard initialized successfully");
  } catch (error: unknown) {
    logEvent(
      `Error initializing portfolio dashboard: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Format the portfolio sheet with an enhanced UI
 */
async function formatEnhancedPortfolioSheet(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Get sheetId first
    const sheetId = await sheetClient.getSheetIdByName(PORTFOLIO_SHEET);

    // Set column widths using batchUpdate
    try {
      await sheetClient.batchUpdate({
        requests: [
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 0, // Column A
                endIndex: 1,
              },
              properties: {
                pixelSize: 200,
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 1, // Column B
                endIndex: 6,
              },
              properties: {
                pixelSize: 150,
              },
              fields: "pixelSize",
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: 6, // Column G
                endIndex: 7,
              },
              properties: {
                pixelSize: 200,
              },
              fields: "pixelSize",
            },
          },
        ],
      });

      // Charts are now created after data is populated by createOrUpdateCharts
    } catch (e) {
      logEvent("Column width setup not supported, skipping...");
    }

    // Initialize the full sheet template with all sections at once
    const portfolioTemplate = [
      // Row 1 - Main header
      ["🔐 PORTFOLIO", "", "", "", "", "", new Date().toISOString()],

      // Row 2 - Empty row for spacing
      [""],

      // Row 3 - Portfolio summary section header
      ["💰 SUMMARY", "", "", "", ""],

      // Rows 4-6 - Portfolio summary data
      ["Wallet Address", ""],
      ["Network", ""],
      ["Last Updated", ""],

      // Row 7 - Empty row for spacing
      [""],

      // Row 8 - Key metrics section header
      ["📊 KEY METRICS", "", "", "", "", "", ""],

      // Row 9 - Key metrics labels
      [
        "ETH Balance",
        "Token Count",
        "Transactions",
        "Networks",
        "DeFi Protocols",
        "",
        "",
      ],

      // Row 10 - Key metrics values (empty)
      ["", "", "", "", "", "", ""],

      // Row 11 - Empty row for spacing
      [""],

      // Row 12 - Asset allocation section header
      ["📈 DISTRIBUTION", "", ""],

      // Row 13 - Asset allocation table header
      ["Asset", "Value (USD)", "% of Portfolio"],
    ];

    // Add rows 14-25 for asset allocation data (12 rows)
    for (let i = 0; i < 12; i++) {
      portfolioTemplate.push(["", "", ""]);
    }

    // Row 26 - Empty row for spacing
    portfolioTemplate.push([""]);

    // Row 27 - Token holdings section header
    portfolioTemplate.push(["💎 TOKEN HOLDINGS", "", "", "", "", "", "", ""]);

    // Row 28 - Token holdings table header
    portfolioTemplate.push([
      "Token",
      "Symbol",
      "Balance",
      "USD Value",
      "Price (USD)",
      "24h Change",
      "7d Change",
      "Actions",
    ]);

    // Rows 29-43 - Token holdings data (15 rows)
    for (let i = 0; i < 15; i++) {
      portfolioTemplate.push(["", "", "", "", "", "", "", "View on Explorer"]);
    }

    // Row 44 - Portfolio analytics section header
    portfolioTemplate.push(["📊 ANALYTICS", "", "", "", "", "", "", ""]);

    // Row 45 - Refresh button and instructions
    portfolioTemplate.push([
      "⚠️ TYPE ANYTHING HERE TO REFRESH",
      "← Just edit this cell and press Enter to load data",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    // Rows 46-60 - Space for charts (15 rows)
    for (let i = 0; i < 15; i++) {
      portfolioTemplate.push(["", "", "", "", "", "", "", ""]);
    }

    // Set the entire template at once (much more efficient than individual calls)
    await sheetClient.setRangeValues(
      `${PORTFOLIO_SHEET}!A1:H${portfolioTemplate.length}`,
      portfolioTemplate
    );

    // Set supplementary data in specific cells not covered by the main template
    // These are the cells that have different column counts
    await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!D4:E6`, [
      ["Total Balance (USD)", ""],
      ["24h Change", ""],
      ["30d Change", ""],
    ]);

    // Apply conditional formatting for token changes
    try {
      await sheetClient.batchUpdate({
        requests: [
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId: sheetId,
                    startRowIndex: 28,
                    endRowIndex: 43,
                    startColumnIndex: 5,
                    endColumnIndex: 7,
                  },
                ],
                booleanRule: {
                  condition: {
                    type: "TEXT_CONTAINS",
                    values: [{ userEnteredValue: "-" }],
                  },
                  format: {
                    backgroundColor: { red: 1.0, green: 0.9, blue: 0.9 },
                    textFormat: { foregroundColor: { red: 0.8 } },
                  },
                },
              },
            },
          },
          {
            addConditionalFormatRule: {
              rule: {
                ranges: [
                  {
                    sheetId: sheetId,
                    startRowIndex: 28,
                    endRowIndex: 43,
                    startColumnIndex: 5,
                    endColumnIndex: 7,
                  },
                ],
                booleanRule: {
                  condition: {
                    type: "TEXT_NOT_CONTAINS",
                    values: [{ userEnteredValue: "-" }],
                  },
                  format: {
                    backgroundColor: { red: 0.9, green: 1.0, blue: 0.9 },
                    textFormat: { foregroundColor: { green: 0.6 } },
                  },
                },
              },
            },
          },
        ],
      });
    } catch (e) {
      logEvent("Conditional formatting not supported, skipping...");
    }

    // Apply enhanced cell formatting for headers and data in a single batch update
    await sheetClient.batchUpdate({
      requests: [
        // Main header formatting
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 7,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.15, green: 0.15, blue: 0.3 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 16,
                  bold: true,
                },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        },
        // Section headers formatting (Portfolio Summary, Key Metrics, etc.)
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 2,
              endRowIndex: 44,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                borders: {
                  bottom: {
                    style: "SOLID",
                    color: { red: 0.7, green: 0.7, blue: 0.7 },
                  },
                },
              },
            },
            fields: "userEnteredFormat(borders)",
          },
        },
        // Portfolio Summary header
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 2,
              endRowIndex: 3,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 12,
                  bold: true,
                },
                horizontalAlignment: "LEFT",
                verticalAlignment: "MIDDLE",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        },
        // Key Metrics header
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 7,
              endRowIndex: 8,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 12,
                  bold: true,
                },
                horizontalAlignment: "LEFT",
                verticalAlignment: "MIDDLE",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
          },
        },
        // Asset Allocation header
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 11,
              endRowIndex: 12,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 12,
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        // Token Holdings header
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 26,
              endRowIndex: 27,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 12,
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        // Portfolio Analytics header
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 43,
              endRowIndex: 44,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.6 },
                textFormat: {
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 12,
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        // Sub-headers
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 12,
              endRowIndex: 13,
              startColumnIndex: 0,
              endColumnIndex: 3,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                textFormat: {
                  bold: true,
                },
                borders: {
                  bottom: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  top: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  left: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  right: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,borders)",
          },
        },
        // Token headers formatting
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 27,
              endRowIndex: 28,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                textFormat: {
                  bold: true,
                },
                borders: {
                  bottom: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  top: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  left: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  right: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,borders)",
          },
        },
        // Refresh button styling
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 44,
              endRowIndex: 45,
              startColumnIndex: 0,
              endColumnIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.95, blue: 1.0 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 0.1, green: 0.4, blue: 0.7 },
                },
                horizontalAlignment: "CENTER",
                borders: {
                  bottom: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  top: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  left: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                  right: {
                    style: "SOLID",
                    color: { red: 0.5, green: 0.5, blue: 0.5 },
                  },
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,borders)",
          },
        },
        // Instruction text styling
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 44,
              endRowIndex: 45,
              startColumnIndex: 1,
              endColumnIndex: 2,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 1.0, green: 0.95, blue: 0.8 }, // Light yellow
                textFormat: {
                  italic: true,
                  foregroundColor: { red: 0.6, green: 0.3, blue: 0.0 }, // Brown text
                },
                horizontalAlignment: "LEFT",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
      ],
    });

    logEvent(
      "Enhanced portfolio sheet formatted successfully with optimized API calls"
    );
  } catch (error: unknown) {
    logEvent(
      `Error formatting enhanced portfolio sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Update portfolio data with enhanced UI elements
 */
export async function updatePortfolioData(
  sheetClient: SheetClient,
  wallet: ethers.Wallet,
  logEvent: Function
) {
  try {
    logEvent(`Updating portfolio data for wallet: ${wallet.address}`);

    // Get network from provider
    const provider = new ethers.JsonRpcProvider(
      process.env.ETH_RPC_URL || "https://arbitrum-sepolia.drpc.org"
    );
    const network = await provider.getNetwork();
    const networkName = getNetworkName(network.chainId);

    // Get ETH balance
    const balance = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(balance);

    // Get ETH price first
    const ethUsdPrice = await getEthPrice(logEvent);

    // Calculate ETH value
    const ethValueUsd = parseFloat(ethBalance) * ethUsdPrice;
    logEvent(
      `ETH Value: ${ethValueUsd.toFixed(
        2
      )} USD (${ethBalance} ETH @ $${ethUsdPrice})`
    );

    // Get token data
    const tokenData = await getTokenData(
      wallet.address,
      network.chainId.toString(),
      logEvent
    );

    // Get transaction count
    const txCount = await provider.getTransactionCount(wallet.address);

    // Calculate total token value
    let tokenTotalValueUsd = 0;
    let tokenCount = 0;

    if (tokenData && tokenData.items) {
      tokenCount = tokenData.items.length;
      tokenTotalValueUsd = tokenData.items.reduce(
        (total: number, token: { quote?: number }) =>
          total + (token.quote || 0),
        0
      );
      logEvent(
        `Token Value: ${tokenTotalValueUsd.toFixed(
          2
        )} USD from ${tokenCount} tokens`
      );
    } else {
      logEvent("No token data available");
    }

    const totalValueUsd = ethValueUsd + tokenTotalValueUsd;

    // Calculate portfolio-wide changes based on token data
    let portfolioChange24h = 0;
    let portfolioChange30d = 0;

    if (tokenData && tokenData.items && tokenData.items.length > 0) {
      // Calculate weighted average of 24h changes
      let totalWeight = ethValueUsd;
      let weightedSum24h = 0;

      // Include ETH in the calculation with a random change (in real app, get from API)
      const ethChange24h = Math.random() * 14 - 7; // Random between -7% and +7%
      weightedSum24h += ethValueUsd * ethChange24h;

      // Add weighted changes from tokens
      for (const token of tokenData.items) {
        const tokenValue = token.quote || 0;
        totalWeight += tokenValue;

        const change24h =
          token.price_change_24h !== undefined
            ? token.price_change_24h
            : Math.random() * 20 - 10; // Fallback to random

        weightedSum24h += tokenValue * change24h;
      }

      // Calculate weighted average if we have values
      if (totalWeight > 0) {
        portfolioChange24h = weightedSum24h / totalWeight;
      }

      // For 30d change, just use random for demo
      portfolioChange30d = Math.random() * 30 - 15;
    } else {
      // Fallback to random changes if no token data
      portfolioChange24h = Math.random() * 14 - 7;
      portfolioChange30d = Math.random() * 30 - 15;
    }

    // Prepare all portfolio data updates to be done in a batch
    // 1. Portfolio summary data (combine wallet info and balances in single update)
    const portfolioSummary = [
      [
        "Wallet Address",
        wallet.address,
        "",
        "Total Balance (USD)",
        `$${totalValueUsd.toFixed(2)}`,
      ],
      [
        "Network",
        networkName,
        "",
        "24h Change",
        `${portfolioChange24h.toFixed(2)}%`,
      ],
      [
        "Last Updated",
        new Date().toISOString(),
        "",
        "30d Change",
        `${portfolioChange30d.toFixed(2)}%`,
      ],
    ];

    // 2. Key metrics
    const keyMetrics = [
      [
        ethBalance,
        tokenData ? tokenData.items.length : 0,
        txCount,
        "1", // Number of networks - could be expanded if tracking multiple networks
        "",
        "",
        "",
      ],
    ];

    // Batch update all the summary data in just two API calls
    await sheetClient.setRangeValues(
      `${PORTFOLIO_SHEET}!A4:E6`,
      portfolioSummary
    );
    await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A10:G10`, keyMetrics);

    // 3. Update asset allocation section in a single call
    await updateEnhancedAssetAllocation(
      sheetClient,
      ethValueUsd,
      totalValueUsd,
      tokenData,
      logEvent
    );

    // 4. Update token holdings section in a single call
    await updateEnhancedTokenHoldings(sheetClient, tokenData, logEvent);

    // 5. Create/update charts after data is populated
    await createOrUpdateCharts(sheetClient, logEvent);

    logEvent(
      "Enhanced portfolio data updated successfully with optimized API calls"
    );
  } catch (error: unknown) {
    logEvent(
      `Error updating enhanced portfolio data: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Update asset allocation with percentage calculation
 */
async function updateEnhancedAssetAllocation(
  sheetClient: SheetClient,
  ethValueUsd: number,
  totalValueUsd: number,
  tokenData: any,
  logEvent: Function
) {
  try {
    // Calculate ETH percentage
    const ethPercentage =
      totalValueUsd > 0 ? (ethValueUsd / totalValueUsd) * 100 : 0;

    // Prepare asset allocation data
    const assetAllocation = [
      ["ETH", `$${ethValueUsd.toFixed(2)}`, `${ethPercentage.toFixed(2)}%`],
    ];

    // Add token data with percentages
    if (tokenData && tokenData.items) {
      tokenData.items
        .filter((token: any) => token.quote > 1) // Only include tokens with value > $1
        .sort((a: any, b: any) => (b.quote || 0) - (a.quote || 0)) // Sort by value (highest first)
        .slice(0, 11) // Limit to top 11 assets (ETH + 11 = 12 total rows)
        .forEach((token: any) => {
          const tokenPercentage =
            totalValueUsd > 0 ? (token.quote / totalValueUsd) * 100 : 0;
          assetAllocation.push([
            token.contract_name || token.contract_ticker_symbol,
            `$${token.quote.toFixed(2)}`,
            `${tokenPercentage.toFixed(2)}%`,
          ]);
        });
    }

    // Clear and update asset allocation in a single call by filling with empty rows if needed
    const paddedAllocation = [...assetAllocation];

    // Pad with empty rows to always fill rows 14-25 (12 rows total)
    while (paddedAllocation.length < 12) {
      paddedAllocation.push(["", "", ""]);
    }

    // Set all allocation data at once
    await sheetClient.setRangeValues(
      `${PORTFOLIO_SHEET}!A14:C25`,
      paddedAllocation
    );

    logEvent(
      `Enhanced asset allocation data updated (${assetAllocation.length} assets)`
    );
  } catch (error: unknown) {
    logEvent(
      `Error updating enhanced asset allocation: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

/**
 * Get ETH price from CoinGecko API with better error handling and rate limiting
 */
async function getEthPrice(logEvent: Function): Promise<number> {
  try {
    logEvent("Fetching ETH price from CoinGecko...");

    // Function to wait with exponential backoff
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Try making the API request with exponential backoff
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        // Add a cache buster to avoid cached 429 responses
        const cacheBuster = new Date().getTime();

        // Use the same endpoint as in getTokenData for consistency
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&_=${cacheBuster}`,
          {
            headers: {
              // Add a user agent to avoid being blocked
              "User-Agent": "Google-Sheets-Crypto-Dashboard/1.0",
            },
            // Increase timeout for potentially slow responses
            timeout: 10000,
          }
        );

        if (
          response.data &&
          response.data.ethereum &&
          response.data.ethereum.usd
        ) {
          const price = response.data.ethereum.usd;
          logEvent(`Current ETH price: $${price}`);
          return price;
        } else {
          logEvent(
            "Invalid response from CoinGecko API. Using default ETH price."
          );
          return 3500; // Default value if API response format is unexpected
        }
      } catch (error: any) {
        attempt++;

        // Check if the error is a rate limit (429)
        if (error.response && error.response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          logEvent(
            `CoinGecko rate limit hit for ETH price. Waiting ${
              waitTime / 1000
            }s before retry...`
          );
          await delay(waitTime);
        } else {
          // For other errors, don't retry
          logEvent(`Error fetching ETH price: ${error}. Using default value.`);
          return 3500; // Default fallback value
        }
      }
    }

    // If we've exhausted all attempts, use default value
    logEvent(
      `Failed to get ETH price after ${maxAttempts} attempts. Using default value.`
    );
    return 3500; // Default fallback value after all retries failed
  } catch (error) {
    logEvent(`Unexpected error in getEthPrice: ${error}. Using default value.`);
    return 3500; // Default fallback value
  }
}

/**
 * Get token data from CoinGecko API with better error handling and rate limit management
 */
async function getTokenData(
  walletAddress: string,
  chainId: string,
  logEvent: Function
) {
  try {
    logEvent(`Fetching token data from CoinGecko for wallet: ${walletAddress}`);

    // Map of popular tokens to use with CoinGecko
    const popularTokens = [
      { id: "ethereum", symbol: "ETH", name: "Ethereum" },
      { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
      { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
      { id: "tether", symbol: "USDT", name: "Tether" },
      { id: "dai", symbol: "DAI", name: "Dai Stablecoin" },
      { id: "binancecoin", symbol: "BNB", name: "Binance Coin" },
      { id: "ripple", symbol: "XRP", name: "XRP" },
      { id: "cardano", symbol: "ADA", name: "Cardano" },
      { id: "solana", symbol: "SOL", name: "Solana" },
      { id: "polkadot", symbol: "DOT", name: "Polkadot" },
      { id: "chainlink", symbol: "LINK", name: "Chainlink" },
      { id: "uniswap", symbol: "UNI", name: "Uniswap" },
      { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
      { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
    ];

    // Function to wait with increasing backoff
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Try making the API request with exponential backoff
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        // Get price data for all tokens at once from CoinGecko
        const ids = popularTokens.map((token) => token.id).join(",");
        logEvent(
          `Requesting prices for: ${ids} (attempt ${
            attempt + 1
          }/${maxAttempts})`
        );

        // Add a cache-busting parameter to avoid cached 429 responses
        const cacheBuster = new Date().getTime();

        const priceResponse = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24h_change=true&_=${cacheBuster}`,
          {
            headers: {
              // Add a user agent to avoid being blocked
              "User-Agent": "Google-Sheets-Crypto-Dashboard/1.0",
            },
            // Increase timeout for potentially slow responses
            timeout: 10000,
          }
        );

        if (
          !priceResponse.data ||
          Object.keys(priceResponse.data).length === 0
        ) {
          logEvent("Empty response from CoinGecko API. Using mock data.");
          return getMockTokenData();
        }

        // Check if we got at least some token data
        const tokensReceived = Object.keys(priceResponse.data).length;
        logEvent(`Received data for ${tokensReceived} tokens from CoinGecko`);

        if (tokensReceived === 0) {
          logEvent("No token data received from CoinGecko. Using mock data.");
          return getMockTokenData();
        }

        // Transform CoinGecko data to match the format expected by our app
        const items = [];

        for (const token of popularTokens) {
          // Check if we have data for this token
          if (priceResponse.data[token.id]) {
            const price = priceResponse.data[token.id].usd || 0;
            const change24h = priceResponse.data[token.id].usd_24h_change || 0;

            // Generate random balance for demo purposes (higher for more realistic values)
            // In a real application, this would come from blockchain data
            const randomBalance =
              (Math.random() * 10 + 1) *
              (token.symbol === "SHIB"
                ? 1000000
                : token.symbol === "BTC"
                ? 0.1
                : token.symbol === "ETH"
                ? 2
                : 1);

            const tokenBalance =
              token.symbol === "USDC" || token.symbol === "USDT"
                ? randomBalance * 10 ** 6
                : typeof randomBalance === "string"
                ? randomBalance
                : ethers.parseEther(randomBalance.toFixed(8).toString());

            const tokenQuote = price * randomBalance;

            items.push({
              contract_name: token.name,
              contract_ticker_symbol: token.symbol,
              contract_address: `0x${token.id}`, // Placeholder address
              contract_decimals:
                token.symbol === "USDC" || token.symbol === "USDT" ? 6 : 18,
              balance: tokenBalance,
              quote_rate: price,
              quote: tokenQuote,
              price_change_24h: change24h,
            });
          }
        }

        if (items.length === 0) {
          logEvent("Failed to process token data. Using mock data.");
          return getMockTokenData();
        }

        logEvent(
          `Successfully processed ${items.length} tokens from CoinGecko`
        );
        return { items };
      } catch (apiError: any) {
        attempt++;

        // Check if the error is a rate limit (429)
        if (apiError.response && apiError.response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          logEvent(
            `CoinGecko rate limit hit. Waiting ${
              waitTime / 1000
            }s before retry...`
          );
          await delay(waitTime);
        } else {
          // For other errors, don't retry
          logEvent(
            `Error fetching data from CoinGecko: ${apiError}. Using mock data.`
          );
          return getMockTokenData();
        }
      }
    }

    // If we've exhausted all attempts, use mock data
    logEvent(
      `Failed to get data from CoinGecko after ${maxAttempts} attempts. Using mock data.`
    );
    return getMockTokenData();
  } catch (error: unknown) {
    logEvent(
      `Error in token data function: ${
        error instanceof Error ? error.message : String(error)
      }. Using mock data.`
    );
    return getMockTokenData();
  }
}

/**
 * Get network name from chain ID
 */
function getNetworkName(chainId: bigint): string {
  const chainIdMap: { [key: string]: string } = {
    "1": "Ethereum Mainnet",
    "42161": "Arbitrum One",
    "421614": "Arbitrum Sepolia",
    "11155111": "Sepolia",
    "5": "Goerli",
  };

  return chainIdMap[chainId.toString()] || `Chain ID: ${chainId.toString()}`;
}

/**
 * Mock data for token balances with more realistic values
 */
function getMockTokenData() {
  return {
    items: [
      {
        contract_name: "Bitcoin",
        contract_ticker_symbol: "BTC",
        contract_address: "0xbitcoin",
        contract_decimals: 8,
        balance: "15000000", // 0.15 BTC
        quote_rate: 67000,
        quote: 10050,
        price_change_24h: 1.2,
      },
      {
        contract_name: "Ethereum",
        contract_ticker_symbol: "ETH",
        contract_address: "0xethereum",
        contract_decimals: 18,
        balance: "3000000000000000000", // 3 ETH
        quote_rate: 3500,
        quote: 10500,
        price_change_24h: 3.5,
      },
      {
        contract_name: "USD Coin",
        contract_ticker_symbol: "USDC",
        contract_address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        contract_decimals: 6,
        balance: 5000000000, // 5000 USDC
        quote_rate: 1,
        quote: 5000,
        price_change_24h: 0.01, // Stable coin, minimal change
      },
      {
        contract_name: "Tether",
        contract_ticker_symbol: "USDT",
        contract_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        contract_decimals: 6,
        balance: 3000000000, // 3000 USDT
        quote_rate: 1,
        quote: 3000,
        price_change_24h: -0.05,
      },
      {
        contract_name: "Solana",
        contract_ticker_symbol: "SOL",
        contract_address: "0xsolana",
        contract_decimals: 9,
        balance: "30000000000", // 30 SOL
        quote_rate: 160,
        quote: 4800,
        price_change_24h: 4.7,
      },
      {
        contract_name: "Binance Coin",
        contract_ticker_symbol: "BNB",
        contract_address: "0xbnb",
        contract_decimals: 18,
        balance: "7000000000000000000", // 7 BNB
        quote_rate: 580,
        quote: 4060,
        price_change_24h: 2.3,
      },
      {
        contract_name: "XRP",
        contract_ticker_symbol: "XRP",
        contract_address: "0xripple",
        contract_decimals: 6,
        balance: 7500000000, // 7500 XRP
        quote_rate: 0.55,
        quote: 4125,
        price_change_24h: -1.8,
      },
      {
        contract_name: "Cardano",
        contract_ticker_symbol: "ADA",
        contract_address: "0xcardano",
        contract_decimals: 6,
        balance: 10000000000, // 10000 ADA
        quote_rate: 0.45,
        quote: 4500,
        price_change_24h: 3.2,
      },
      {
        contract_name: "Dai Stablecoin",
        contract_ticker_symbol: "DAI",
        contract_address: "0x6b175474e89094c44da98b954eedeac495271d0f",
        contract_decimals: 18,
        balance: "2500000000000000000000", // 2500 DAI
        quote_rate: 1,
        quote: 2500,
        price_change_24h: 0.03,
      },
      {
        contract_name: "Polkadot",
        contract_ticker_symbol: "DOT",
        contract_address: "0xpolkadot",
        contract_decimals: 10,
        balance: "30000000000", // 300 DOT
        quote_rate: 7.5,
        quote: 2250,
        price_change_24h: 5.1,
      },
      {
        contract_name: "Chainlink",
        contract_ticker_symbol: "LINK",
        contract_address: "0x514910771af9ca656af840dff83e8264ecf986ca",
        contract_decimals: 18,
        balance: "100000000000000000000", // 100 LINK
        quote_rate: 14.5,
        quote: 1450,
        price_change_24h: 6.8,
      },
      {
        contract_name: "Uniswap",
        contract_ticker_symbol: "UNI",
        contract_address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        contract_decimals: 18,
        balance: "150000000000000000000", // 150 UNI
        quote_rate: 7.8,
        quote: 1170,
        price_change_24h: -2.3,
      },
      {
        contract_name: "Avalanche",
        contract_ticker_symbol: "AVAX",
        contract_address: "0x85f138bfee4ef8e540890cfb48f8d22ac038f8ea",
        contract_decimals: 18,
        balance: "50000000000000000000", // 50 AVAX
        quote_rate: 34,
        quote: 1700,
        price_change_24h: 8.5,
      },
      {
        contract_name: "Shiba Inu",
        contract_ticker_symbol: "SHIB",
        contract_address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
        contract_decimals: 18,
        balance: "150000000000000000000000000", // 150,000,000 SHIB
        quote_rate: 0.00002,
        quote: 3000,
        price_change_24h: 12.6,
      },
    ],
  };
}

/**
 * Schedule regular portfolio updates and handle refresh button
 */
export function schedulePortfolioUpdates(
  sheetClient: SheetClient,
  wallet: ethers.Wallet,
  logEvent: Function,
  intervalMinutes: number = 60
) {
  // Track if we've already created charts
  let chartsCreated = false;

  // Force an initial data load to avoid empty tables
  setTimeout(async () => {
    try {
      logEvent("Performing initial data load...");

      // Set to refreshing state
      await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A45`, [
        ["🔄 Refreshing..."],
      ]);

      // Update data
      await updatePortfolioData(sheetClient, wallet, logEvent);

      // Create charts
      try {
        await createOrUpdateCharts(sheetClient, logEvent);
        chartsCreated = true;
        logEvent("Charts created on initial load");
      } catch (chartError) {
        logEvent(`Error creating charts on initial load: ${chartError}`);
      }

      // Reset the refresh button text
      await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A45`, [
        ["⚠️ TYPE ANYTHING HERE TO REFRESH"],
      ]);

      logEvent("Initial data load completed successfully");
    } catch (error) {
      logEvent(`Error during initial data load: ${error}`);
      // Reset the refresh button in case of error
      await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A45`, [
        ["⚠️ TYPE ANYTHING HERE TO REFRESH"],
      ]);
    }
  }, 5000); // Wait 5 seconds after initialization before loading data

  // Set up refresh button monitoring
  const checkRefreshButton = async () => {
    try {
      // Get the refresh button cell value
      const refreshCell = await sheetClient.getRange(
        `${PORTFOLIO_SHEET}!A45:A45`
      );

      // Consider the button pressed if the cell isn't showing the expected text
      // This covers any case where the user edits the cell
      const refreshText =
        refreshCell && refreshCell[0] && refreshCell[0][0]
          ? refreshCell[0][0].toString()
          : "";

      if (
        refreshText !== "⚠️ TYPE ANYTHING HERE TO REFRESH" &&
        refreshText !== "🔄 Refreshing..."
      ) {
        // Always set to refreshing state when any change is detected
        await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A45`, [
          ["🔄 Refreshing..."],
        ]);

        logEvent(`Manual refresh triggered by user action: "${refreshText}"`);

        // Update the data
        try {
          await updatePortfolioData(sheetClient, wallet, logEvent);

          // Create charts if not created yet
          if (!chartsCreated) {
            try {
              await createOrUpdateCharts(sheetClient, logEvent);
              chartsCreated = true;
              logEvent("Charts created on first refresh");
            } catch (chartError) {
              logEvent(`Error creating charts: ${chartError}`);
            }

            // Add borders to data cells
            try {
              // Get sheet ID
              const sheetId = await sheetClient.getSheetIdByName(
                PORTFOLIO_SHEET
              );

              // Add borders to asset allocation data
              await sheetClient.batchUpdate({
                requests: [
                  {
                    updateBorders: {
                      range: {
                        sheetId: sheetId,
                        startRowIndex: 13,
                        endRowIndex: 25,
                        startColumnIndex: 0,
                        endColumnIndex: 3,
                      },
                      top: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      bottom: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      left: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      right: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      innerHorizontal: {
                        style: "SOLID",
                        color: { red: 0.8, green: 0.8, blue: 0.8 },
                      },
                      innerVertical: {
                        style: "SOLID",
                        color: { red: 0.8, green: 0.8, blue: 0.8 },
                      },
                    },
                  },
                  {
                    updateBorders: {
                      range: {
                        sheetId: sheetId,
                        startRowIndex: 28,
                        endRowIndex: 43,
                        startColumnIndex: 0,
                        endColumnIndex: 8,
                      },
                      top: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      bottom: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      left: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      right: {
                        style: "SOLID",
                        color: { red: 0.5, green: 0.5, blue: 0.5 },
                      },
                      innerHorizontal: {
                        style: "SOLID",
                        color: { red: 0.8, green: 0.8, blue: 0.8 },
                      },
                      innerVertical: {
                        style: "SOLID",
                        color: { red: 0.8, green: 0.8, blue: 0.8 },
                      },
                    },
                  },
                ],
              });

              logEvent("Added borders to data cells");
            } catch (borderError) {
              logEvent(`Error adding borders: ${borderError}`);
            }
          }
        } catch (refreshError) {
          logEvent(`Error during refresh: ${refreshError}`);
        }

        // Reset the button text
        await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A45`, [
          ["⚠️ TYPE ANYTHING HERE TO REFRESH"],
        ]);

        logEvent("Manual refresh completed");
      }
    } catch (error) {
      logEvent(`Error checking refresh button: ${error}`);
    }
  };

  // Check for refresh button changes more frequently (every 2 seconds instead of 5)
  setInterval(checkRefreshButton, 2000);

  // Regular updates
  setInterval(async () => {
    try {
      await updatePortfolioData(sheetClient, wallet, logEvent);
      logEvent(
        `Scheduled portfolio update completed (${new Date().toISOString()})`
      );
    } catch (error) {
      logEvent(`Error in scheduled update: ${error}`);
    }
  }, intervalMinutes * 60 * 1000);

  logEvent(`Portfolio updates scheduled (every ${intervalMinutes} minutes)`);
}

/**
 * Create or update charts in the portfolio sheet
 */
async function createOrUpdateCharts(
  sheetClient: SheetClient,
  logEvent: Function
) {
  try {
    // Get sheet ID for chart creation
    const sheetId = await sheetClient.getSheetIdByName(PORTFOLIO_SHEET);

    logEvent("Creating portfolio charts with minimal configuration...");

    // Create simple charts with minimal configuration
    const chartRequests = {
      requests: [
        // Basic pie chart - no fancy configuration
        {
          addChart: {
            chart: {
              spec: {
                title: "Asset Distribution",
                pieChart: {
                  domain: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: sheetId,
                          startRowIndex: 13,
                          endRowIndex: 25,
                          startColumnIndex: 0,
                          endColumnIndex: 1,
                        },
                      ],
                    },
                  },
                  series: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: sheetId,
                          startRowIndex: 13,
                          endRowIndex: 25,
                          startColumnIndex: 1,
                          endColumnIndex: 2,
                        },
                      ],
                    },
                  },
                },
              },
              position: {
                newSheet: false,
                overlayPosition: {
                  anchorCell: {
                    sheetId: sheetId,
                    rowIndex: 46,
                    columnIndex: 0,
                  },
                  offsetXPixels: 10,
                  offsetYPixels: 10,
                  widthPixels: 350,
                  heightPixels: 300,
                },
              },
            },
          },
        },
        // Basic column chart - no fancy configuration
        {
          addChart: {
            chart: {
              spec: {
                title: "24h Performance",
                basicChart: {
                  chartType: "COLUMN",
                  domains: [
                    {
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 28,
                              endRowIndex: 35,
                              startColumnIndex: 1,
                              endColumnIndex: 2,
                            },
                          ],
                        },
                      },
                    },
                  ],
                  series: [
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 28,
                              endRowIndex: 35,
                              startColumnIndex: 5,
                              endColumnIndex: 6,
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
              position: {
                newSheet: false,
                overlayPosition: {
                  anchorCell: {
                    sheetId: sheetId,
                    rowIndex: 46,
                    columnIndex: 4,
                  },
                  offsetXPixels: 10,
                  offsetYPixels: 10,
                  widthPixels: 350,
                  heightPixels: 300,
                },
              },
            },
          },
        },
      ],
    };

    await sheetClient.batchUpdate(chartRequests);
    logEvent("Portfolio charts created with minimal configuration");
  } catch (error) {
    logEvent(`Error creating charts: ${error}`);
  }
}

/**
 * Update token holdings with enhanced formatting
 */
async function updateEnhancedTokenHoldings(
  sheetClient: SheetClient,
  tokenData: any,
  logEvent: Function
) {
  try {
    // Prepare token data rows to update in a single API call
    let tokenRows = [];

    if (!tokenData || !tokenData.items || tokenData.items.length === 0) {
      // If no tokens, add a placeholder row
      tokenRows.push(["No tokens found", "-", "-", "-", "-", "-", "-", "-"]);

      // Pad with empty rows to fill the entire token area (15 rows total)
      for (let i = 1; i < 15; i++) {
        tokenRows.push(["", "", "", "", "", "", "", ""]);
      }
    } else {
      // Prepare token data (limit to top 15 by value)
      const sortedTokens = [...tokenData.items]
        .sort((a, b) => (b.quote || 0) - (a.quote || 0))
        .slice(0, 15);

      // Process all tokens at once
      tokenRows = sortedTokens.map((token: any) => {
        // Use the actual 24h change if available from CoinGecko, otherwise generate random
        const change24h =
          token.price_change_24h !== undefined
            ? token.price_change_24h.toFixed(2)
            : (Math.random() * 20 - 10).toFixed(2);

        // Generate random change for 7d (for demo purposes)
        const change7d = (Math.random() * 30 - 15).toFixed(2);

        // Format the values for better readability
        // Handle both string and number balance formats, and properly convert BigInt
        const balance =
          typeof token.balance === "string"
            ? Number(ethers.formatEther(token.balance))
            : typeof token.balance === "bigint"
            ? token.contract_ticker_symbol === "USDC" ||
              token.contract_ticker_symbol === "USDT"
              ? Number(token.balance) / 10 ** 6
              : Number(token.balance) / 10 ** 18
            : token.contract_ticker_symbol === "USDC" ||
              token.contract_ticker_symbol === "USDT"
            ? (token.balance / 10 ** 6).toFixed(2)
            : (token.balance / 10 ** 18).toFixed(6);

        // Format as string if not already a string
        const formattedBalance =
          typeof balance === "string" ? balance : balance.toFixed(6);

        const formattedUsdValue = `$${
          token.quote ? token.quote.toFixed(2) : "0.00"
        }`;
        const formattedPrice = `$${
          token.quote_rate ? token.quote_rate.toFixed(4) : "0.0000"
        }`;

        return [
          token.contract_name || "Unknown",
          token.contract_ticker_symbol,
          formattedBalance,
          formattedUsdValue,
          formattedPrice,
          `${change24h}%`,
          `${change7d}%`,
          "View on Explorer", // This could be a hyperlink with proper formatting
        ];
      });

      // Pad with empty rows if we have fewer than 15 tokens
      while (tokenRows.length < 15) {
        tokenRows.push(["", "", "", "", "", "", "", ""]);
      }
    }

    // Update all token data in a single call (more efficient)
    await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A29:H43`, tokenRows);

    const tokenCount =
      tokenData && tokenData.items ? Math.min(tokenData.items.length, 15) : 0;
    logEvent(
      `Updated token holdings in a single operation (${tokenCount} tokens)`
    );
  } catch (error: unknown) {
    logEvent(
      `Error updating enhanced token holdings: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}
