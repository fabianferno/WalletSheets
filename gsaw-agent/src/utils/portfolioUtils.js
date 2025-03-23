import { ethers } from "ethers";
import axios from "axios";
import { SheetClient } from "./sheets.api.js";
import { PORTFOLIO_SHEET } from "./sheetUtils.js";
import { getRiskFactor } from "./sheetUtils.js";

// Simplified ERC20 ABI with only the functions we need
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

// Cache for token data to avoid redundant API calls
const tokenCache = new Map();

/**
 * Update portfolio for a given wallet
 */
export async function updatePortfolio(
  sheetClient,
  walletAddress,
  provider,
  logEvent
) {
  try {
    logEvent(`Updating portfolio for wallet ${walletAddress}...`);

    // Get ETH balance
    const ethBalance = await provider.getBalance(walletAddress);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);

    // Get token balances (in a simplified manner)
    const tokenBalances = await getTokenBalances(
      walletAddress,
      provider,
      logEvent
    );

    // Get token prices (simplified)
    const prices = await getTokenPrices(
      [{ symbol: "ETH", address: "ethereum" }, ...tokenBalances],
      logEvent
    );

    // Format portfolio data
    const portfolioData = formatPortfolioData(
      ethBalanceFormatted,
      tokenBalances,
      prices,
      logEvent
    );

    // Update portfolio sheet
    await updatePortfolioSheet(sheetClient, portfolioData, logEvent);

    logEvent(`Portfolio updated for wallet ${walletAddress}.`);
    return true;
  } catch (error) {
    logEvent(`Error updating portfolio: ${error.message}`);
    return false;
  }
}

/**
 * Get token balances for a wallet
 */
export async function getTokenBalances(walletAddress, provider, logEvent) {
  try {
    logEvent(`Getting token balances for ${walletAddress}...`);

    // For this simplified version, we'll just return a few hardcoded tokens
    // In a real implementation, this would use an API or scan for token transfers
    const tokens = [
      {
        name: "USD Coin",
        symbol: "USDC",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      {
        name: "Tether USD",
        symbol: "USDT",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
    ];

    const tokenBalances = [];

    for (const token of tokens) {
      try {
        // Get balance using ERC20 contract
        const contract = new ethers.Contract(
          token.address,
          ERC20_ABI,
          provider
        );

        const decimals = await contract.decimals();
        const balance = await contract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, decimals);

        // Only add token if balance > 0
        if (parseFloat(formattedBalance) > 0) {
          tokenBalances.push({
            name: token.name,
            symbol: token.symbol,
            address: token.address,
            balance: formattedBalance,
          });

          logEvent(`Found ${formattedBalance} ${token.symbol}`);
        }
      } catch (error) {
        logEvent(`Error getting balance for ${token.symbol}: ${error.message}`);
      }
    }

    logEvent(`Found ${tokenBalances.length} tokens with non-zero balance`);
    return tokenBalances;
  } catch (error) {
    logEvent(`Error getting token balances: ${error.message}`);
    return [];
  }
}

/**
 * Get token prices from CoinGecko API
 */
export async function getTokenPrices(tokens, logEvent) {
  try {
    logEvent(`Getting token prices for ${tokens.length} tokens...`);

    const prices = new Map();

    // Add ETH as a default
    prices.set("ETH", 3000); // Default price if API fails

    try {
      // We'd normally fetch from CoinGecko or similar API
      // For this simplified version, we'll use hardcoded values
      prices.set("USDC", 1.0);
      prices.set("USDT", 1.0);

      logEvent(`Got prices for ${prices.size} tokens`);
    } catch (error) {
      logEvent(`Error fetching prices: ${error.message}`);
    }

    return prices;
  } catch (error) {
    logEvent(`Error getting token prices: ${error.message}`);
    return new Map([["ETH", 3000]]);
  }
}

/**
 * Format portfolio data for the sheet
 */
export async function formatPortfolioData(
  ethBalance,
  tokenBalances,
  prices,
  logEvent
) {
  try {
    const portfolioData = [];

    // Add ETH
    const ethValue = parseFloat(ethBalance) * (prices.get("ETH") || 3000);
    portfolioData.push({
      asset: "Ethereum",
      symbol: "ETH",
      balance: ethBalance,
      price: prices.get("ETH") || 3000,
      value: ethValue,
      allocation: 0, // Will be calculated after all assets are added
    });

    // Add tokens
    let totalValue = ethValue;

    for (const token of tokenBalances) {
      const price = prices.get(token.symbol) || 0;
      const value = parseFloat(token.balance) * price;
      totalValue += value;

      portfolioData.push({
        asset: token.name,
        symbol: token.symbol,
        balance: token.balance,
        price: price,
        value: value,
        allocation: 0, // Will be calculated after all assets are added
      });
    }

    // Calculate allocations
    for (const asset of portfolioData) {
      asset.allocation = (asset.value / totalValue) * 100;
    }

    // Sort by value (descending)
    portfolioData.sort((a, b) => b.value - a.value);

    logEvent(`Formatted portfolio data for ${portfolioData.length} assets`);
    return portfolioData;
  } catch (error) {
    logEvent(`Error formatting portfolio data: ${error.message}`);
    return [];
  }
}

/**
 * Update the Portfolio sheet
 */
export async function updatePortfolioSheet(
  sheetClient,
  portfolioData,
  logEvent
) {
  try {
    logEvent(`Updating ${PORTFOLIO_SHEET} sheet...`);

    // Check if the sheet exists
    const sheets = await sheetClient.getSheetMetadata();
    const portfolioSheet = sheets.find(
      (sheet) => sheet.title === PORTFOLIO_SHEET
    );

    // If the sheet doesn't exist, create it
    if (!portfolioSheet) {
      await createPortfolioSheet(sheetClient, logEvent);
    }

    // Clear existing data
    await sheetClient.clearSheet(PORTFOLIO_SHEET, "A2:F100");

    // Format portfolio data for the sheet
    const rows = portfolioData.map((asset) => [
      asset.asset,
      asset.symbol,
      asset.balance,
      asset.price,
      asset.value,
      `${asset.allocation.toFixed(2)}%`,
    ]);

    // Add total row if we have data
    if (rows.length > 0) {
      const totalValue = portfolioData.reduce(
        (sum, asset) => sum + asset.value,
        0
      );
      rows.push(["Total", "", "", "", totalValue, "100%"]);
    }

    // Add portfolio data
    if (rows.length > 0) {
      await sheetClient.setRangeValues(
        `${PORTFOLIO_SHEET}!A2:F${rows.length + 1}`,
        rows
      );
    }

    // Update timestamp
    await sheetClient.setCellValue(
      PORTFOLIO_SHEET,
      1,
      "H",
      new Date().toISOString()
    );

    // Clear and recreate charts
    try {
      // First clear existing charts
      await clearExistingCharts(sheetClient, logEvent);

      // Then create new charts
      createOrUpdateCharts(sheetClient, logEvent);

      logEvent("Portfolio charts updated");
    } catch (chartError) {
      logEvent(`Warning: Could not update charts: ${chartError}`);
    }

    logEvent(`Portfolio sheet updated with ${portfolioData.length} assets.`);
    return true;
  } catch (error) {
    logEvent(`Error updating portfolio sheet: ${error.message}`);
    return false;
  }
}

/**
 * Create the Portfolio sheet
 */
export async function createPortfolioSheet(sheetClient, logEvent) {
  try {
    logEvent(`Creating ${PORTFOLIO_SHEET} sheet...`);

    // Create the sheet
    const sheetId = await sheetClient.createSheet(PORTFOLIO_SHEET);

    // Set up headers
    const headers = [
      "Asset",
      "Symbol",
      "Balance",
      "Price (USD)",
      "Value (USD)",
      "Allocation",
      "",
      "Last Updated",
    ];

    await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A1:H1`, [headers]);

    // Add timestamp
    await sheetClient.setCellValue(
      PORTFOLIO_SHEET,
      1,
      "H",
      new Date().toISOString()
    );

    // Add some spacing rows for charts
    const spacingRows = Array(70).fill([""]); // Create 70 empty rows for chart space
    await sheetClient.setRangeValues(`${PORTFOLIO_SHEET}!A10:A80`, spacingRows);

    // Create initial charts
    setTimeout(() => {
      try {
        createOrUpdateCharts(sheetClient, logEvent);
        logEvent("Initial portfolio charts created");
      } catch (chartError) {
        logEvent(`Warning: Could not create initial charts: ${chartError}`);
      }
    }, 1000); // Small delay to ensure sheet is ready

    logEvent(`${PORTFOLIO_SHEET} sheet created.`);
    return sheetId;
  } catch (error) {
    logEvent(`Error creating portfolio sheet: ${error.message}`);
    return null;
  }
}

/**
 * Get risk assessment for portfolio
 */
export async function getRiskAssessment(sheetClient, portfolioData, logEvent) {
  try {
    logEvent(`Getting risk assessment for portfolio...`);

    // Get user's risk tolerance from settings
    const riskFactor = await getRiskFactor(sheetClient, logEvent);

    // Calculate concentration risk
    const topAssetAllocation =
      portfolioData.length > 0 ? portfolioData[0].allocation : 0;

    // Calculate stablecoin percentage
    const stablecoins = ["USDC", "USDT", "DAI", "BUSD"];
    const stablecoinAllocation = portfolioData
      .filter((asset) => stablecoins.includes(asset.symbol))
      .reduce((sum, asset) => sum + asset.allocation, 0);

    // Generate risk assessment
    let riskAssessment = "Moderate";

    if (topAssetAllocation > 50) {
      riskAssessment = "High"; // High concentration in one asset
    } else if (stablecoinAllocation > 70) {
      riskAssessment = "Low"; // Mostly stablecoins
    }

    // Adjust based on user's risk tolerance
    if (riskFactor >= 4) {
      // More tolerant of risk
      riskAssessment =
        riskAssessment === "High" ? "Moderate-High" : riskAssessment;
    } else if (riskFactor <= 2) {
      // Less tolerant of risk
      riskAssessment =
        riskAssessment === "Moderate" ? "Moderate-Low" : riskAssessment;
    }

    logEvent(`Risk assessment: ${riskAssessment}`);
    return riskAssessment;
  } catch (error) {
    logEvent(`Error getting risk assessment: ${error.message}`);
    return "Unknown";
  }
}

/**
 * Generate portfolio diversification recommendations
 */
export async function generateRecommendations(
  sheetClient,
  portfolioData,
  logEvent
) {
  try {
    logEvent(`Generating portfolio recommendations...`);

    // Get risk assessment
    const riskAssessment = await getRiskAssessment(
      sheetClient,
      portfolioData,
      logEvent
    );

    // Generate basic recommendations
    const recommendations = [];

    // Check for concentration risk
    if (portfolioData.length > 0 && portfolioData[0].allocation > 40) {
      recommendations.push(
        `Consider diversifying away from ${
          portfolioData[0].asset
        } (${portfolioData[0].allocation.toFixed(2)}% of portfolio).`
      );
    }

    // Check for stablecoin allocation
    const stablecoins = ["USDC", "USDT", "DAI", "BUSD"];
    const stablecoinAllocation = portfolioData
      .filter((asset) => stablecoins.includes(asset.symbol))
      .reduce((sum, asset) => sum + asset.allocation, 0);

    if (stablecoinAllocation < 20) {
      recommendations.push(
        `Consider increasing stablecoin allocation (currently ${stablecoinAllocation.toFixed(
          2
        )}%) for safety.`
      );
    }

    // Recommend portfolio diversification
    if (portfolioData.length < 3) {
      recommendations.push(
        "Consider adding more assets to diversify your portfolio."
      );
    }

    logEvent(`Generated ${recommendations.length} recommendations.`);
    return recommendations;
  } catch (error) {
    logEvent(`Error generating recommendations: ${error.message}`);
    return ["Unable to generate recommendations due to an error."];
  }
}

/**
 * Clear existing charts from the portfolio sheet
 */
export async function clearExistingCharts(sheetClient, logEvent) {
  try {
    logEvent("Clearing existing charts before creating new ones");

    // Get the sheet ID
    const sheetId = await sheetClient.getSheetIdByName(PORTFOLIO_SHEET);

    // Get all charts in the sheet
    const spreadsheet = await sheetClient.getSpreadsheet();

    if (!spreadsheet.sheets) {
      logEvent("No sheets found in spreadsheet");
      return false;
    }

    // Find the sheet that matches our sheet ID
    const sheet = spreadsheet.sheets.find(
      (s) => s.properties?.sheetId === sheetId
    );

    if (!sheet || !sheet.charts || sheet.charts.length === 0) {
      logEvent("No charts found to clear");
      return true; // No charts to clear is still a success
    }

    // Create delete requests for all charts
    const deleteRequests = sheet.charts.map((chart) => ({
      deleteEmbeddedObject: {
        objectId: chart.chartId,
      },
    }));

    if (deleteRequests.length > 0) {
      // Execute batch delete
      await sheetClient.batchUpdate({ requests: deleteRequests });
      logEvent(`Cleared ${deleteRequests.length} existing charts`);
    }

    return true;
  } catch (error) {
    logEvent(`Error clearing existing charts: ${error}`);
    return false; // Failed to clear charts
  }
}

/**
 * Create or update charts in the portfolio sheet
 */
export function createOrUpdateCharts(sheetClient, logEvent) {
  try {
    logEvent("Attempting to create portfolio charts");
    const CHART_WIDTH = 400;
    const CHART_HEIGHT = 350;

    // First clear existing charts, then create new ones
    clearExistingCharts(sheetClient, logEvent)
      .then(() => sheetClient.getSheetIdByName(PORTFOLIO_SHEET))
      .then((sheetId) => {
        // Create batch update request for charts
        const chartRequests = {
          requests: [
            // Asset Distribution (Pie Chart)
            {
              addChart: {
                chart: {
                  spec: {
                    title: "Asset Distribution",
                    pieChart: {
                      legendPosition: "RIGHT_LEGEND",
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 12,
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
                              startRowIndex: 12,
                              endRowIndex: 25,
                              startColumnIndex: 2,
                              endColumnIndex: 3,
                            },
                          ],
                        },
                      },
                      pieHole: 0.4, // Add a donut hole for better visualization
                    },
                  },
                  position: {
                    overlayPosition: {
                      anchorCell: {
                        sheetId: sheetId,
                        rowIndex: 46,
                        columnIndex: 0,
                      },
                      widthPixels: CHART_WIDTH,
                      heightPixels: CHART_HEIGHT,
                    },
                  },
                },
              },
            },
            // 24h Performance (Column Chart)
            {
              addChart: {
                chart: {
                  spec: {
                    title: "24h Performance",
                    basicChart: {
                      chartType: "COLUMN",
                      legendPosition: "BOTTOM_LEGEND",
                      domains: [
                        {
                          domain: {
                            sourceRange: {
                              sources: [
                                {
                                  sheetId: sheetId,
                                  startRowIndex: 27,
                                  endRowIndex: 35,
                                  startColumnIndex: 0,
                                  endColumnIndex: 1,
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
                                  startRowIndex: 27,
                                  endRowIndex: 35,
                                  startColumnIndex: 5,
                                  endColumnIndex: 6,
                                },
                              ],
                            },
                          },
                          targetAxis: "LEFT_AXIS",
                        },
                      ],
                    },
                  },
                  position: {
                    overlayPosition: {
                      anchorCell: {
                        sheetId: sheetId,
                        rowIndex: 46,
                        columnIndex: 3,
                      },
                      widthPixels: CHART_WIDTH,
                      heightPixels: CHART_HEIGHT,
                    },
                  },
                },
              },
            },
            // Weekly Performance (Line Chart)
            {
              addChart: {
                chart: {
                  spec: {
                    title: "Weekly Performance",
                    basicChart: {
                      chartType: "LINE",
                      legendPosition: "BOTTOM_LEGEND",
                      domains: [
                        {
                          domain: {
                            sourceRange: {
                              sources: [
                                {
                                  sheetId: sheetId,
                                  startRowIndex: 27,
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
                                  startRowIndex: 27,
                                  endRowIndex: 35,
                                  startColumnIndex: 6,
                                  endColumnIndex: 7,
                                },
                              ],
                            },
                          },
                          targetAxis: "LEFT_AXIS",
                        },
                      ],
                    },
                  },
                  position: {
                    overlayPosition: {
                      anchorCell: {
                        sheetId: sheetId,
                        rowIndex: 46,
                        columnIndex: 6,
                      },
                      widthPixels: CHART_WIDTH,
                      heightPixels: CHART_HEIGHT,
                    },
                  },
                },
              },
            },
            // Token Balances (Bar Chart)
            {
              addChart: {
                chart: {
                  spec: {
                    title: "Token Balances",
                    basicChart: {
                      chartType: "BAR",
                      legendPosition: "BOTTOM_LEGEND",
                      domains: [
                        {
                          domain: {
                            sourceRange: {
                              sources: [
                                {
                                  sheetId: sheetId,
                                  startRowIndex: 27,
                                  endRowIndex: 35,
                                  startColumnIndex: 1, // Symbol column
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
                                  startRowIndex: 27,
                                  endRowIndex: 35,
                                  startColumnIndex: 3, // USD Value column
                                  endColumnIndex: 4,
                                },
                              ],
                            },
                          },
                          targetAxis: "BOTTOM_AXIS",
                        },
                      ],
                    },
                  },
                  position: {
                    overlayPosition: {
                      anchorCell: {
                        sheetId: sheetId,
                        rowIndex: 66,
                        columnIndex: 0,
                      },
                      widthPixels: CHART_WIDTH + 100, // Slightly wider for bar chart
                      heightPixels: CHART_HEIGHT,
                    },
                  },
                },
              },
            },
          ],
        };

        // Execute the batch update to create charts
        sheetClient
          .batchUpdate(chartRequests)
          .then(() => {
            logEvent("Portfolio charts created successfully");
          })
          .catch((error) => {
            logEvent(`Error in chart batch update: ${error}`);

            // Try simplified charts if the regular ones fail
            logEvent("Attempting to create simplified charts as fallback");
            createSimplifiedCharts(sheetClient, logEvent).then((success) => {
              if (success) {
                logEvent("Created simplified charts successfully as fallback");
              } else {
                logEvent("Failed to create any charts");
              }
            });
          });
      })
      .catch((error) => {
        logEvent(`Error getting sheet ID: ${error}`);
      });
  } catch (error) {
    logEvent(`Error creating charts: ${error}`);
  }
}

/**
 * Create simplified charts as a fallback method
 * This function uses a more direct approach with explicit dimensions
 */
export async function createSimplifiedCharts(sheetClient, logEvent) {
  try {
    logEvent("Creating simplified charts as fallback");

    // Clear existing charts first
    await clearExistingCharts(sheetClient, logEvent);

    // Get the sheet ID
    const sheetId = await sheetClient.getSheetIdByName(PORTFOLIO_SHEET);

    // Create a simpler version of the chart requests
    const simplifiedChartRequests = {
      requests: [
        // Simplified asset distribution pie chart
        {
          addChart: {
            chart: {
              spec: {
                title: "Asset Distribution",
                pieChart: {
                  legendPosition: "RIGHT_LEGEND",
                  domain: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: sheetId,
                          startRowIndex: 13, // First data row
                          endRowIndex: 20, // Limit rows for reliability
                          startColumnIndex: 0, // Asset column
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
                          startRowIndex: 13, // First data row
                          endRowIndex: 20, // Limit rows for reliability
                          startColumnIndex: 1, // Value column
                          endColumnIndex: 2,
                        },
                      ],
                    },
                  },
                  pieHole: 0.4, // Donut style
                },
              },
              position: {
                overlayPosition: {
                  anchorCell: {
                    sheetId: sheetId,
                    rowIndex: 46,
                    columnIndex: 0,
                  },
                  widthPixels: 400,
                  heightPixels: 350,
                },
              },
            },
          },
        },
        // Simplified performance column chart
        {
          addChart: {
            chart: {
              spec: {
                title: "24h Performance",
                basicChart: {
                  chartType: "COLUMN",
                  legendPosition: "BOTTOM_LEGEND",
                  domains: [
                    {
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 28, // Token rows
                              endRowIndex: 33, // Limit rows for reliability
                              startColumnIndex: 0, // Token column
                              endColumnIndex: 1,
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
                              startRowIndex: 28, // Token rows
                              endRowIndex: 33, // Limit rows for reliability
                              startColumnIndex: 5, // 24h change column
                              endColumnIndex: 6,
                            },
                          ],
                        },
                      },
                      targetAxis: "LEFT_AXIS",
                    },
                  ],
                },
              },
              position: {
                overlayPosition: {
                  anchorCell: {
                    sheetId: sheetId,
                    rowIndex: 46,
                    columnIndex: 3,
                  },
                  widthPixels: 400,
                  heightPixels: 350,
                },
              },
            },
          },
        },
        // Weekly Performance Line Chart (New)
        {
          addChart: {
            chart: {
              spec: {
                title: "Weekly Performance",
                basicChart: {
                  chartType: "LINE",
                  legendPosition: "BOTTOM_LEGEND",
                  domains: [
                    {
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 28, // Token rows
                              endRowIndex: 33, // Limit rows for reliability
                              startColumnIndex: 1, // Symbol column
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
                              startRowIndex: 28, // Token rows
                              endRowIndex: 33, // Limit rows for reliability
                              startColumnIndex: 6, // 7d change column
                              endColumnIndex: 7,
                            },
                          ],
                        },
                      },
                      targetAxis: "LEFT_AXIS",
                    },
                  ],
                  lineSmoothing: true,
                },
              },
              position: {
                overlayPosition: {
                  anchorCell: {
                    sheetId: sheetId,
                    rowIndex: 46,
                    columnIndex: 6,
                  },
                  widthPixels: 400,
                  heightPixels: 350,
                },
              },
            },
          },
        },
        // Token Balances Bar Chart as a simplified version
        {
          addChart: {
            chart: {
              spec: {
                title: "Token Balances",
                basicChart: {
                  chartType: "BAR",
                  legendPosition: "BOTTOM_LEGEND",
                  domains: [
                    {
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 28, // Token rows
                              endRowIndex: 33, // Limit rows for reliability
                              startColumnIndex: 1, // Symbol column
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
                              startRowIndex: 28, // Token rows
                              endRowIndex: 33, // Limit rows for reliability
                              startColumnIndex: 3, // USD Value column
                              endColumnIndex: 4,
                            },
                          ],
                        },
                      },
                      targetAxis: "BOTTOM_AXIS",
                    },
                  ],
                },
              },
              position: {
                overlayPosition: {
                  anchorCell: {
                    sheetId: sheetId,
                    rowIndex: 66,
                    columnIndex: 0,
                  },
                  widthPixels: 500,
                  heightPixels: 350,
                },
              },
            },
          },
        },
      ],
    };

    await sheetClient.batchUpdate(simplifiedChartRequests);
    logEvent("Simplified charts created successfully");
    return true;
  } catch (error) {
    logEvent(`Error creating simplified charts: ${error}`);

    // Try creating a single, basic chart as last resort
    try {
      const sheetId = await sheetClient.getSheetIdByName(PORTFOLIO_SHEET);
      const basicChartRequest = {
        requests: [
          {
            addChart: {
              chart: {
                spec: {
                  title: "Portfolio Overview",
                  pieChart: {
                    legendPosition: "RIGHT_LEGEND",
                    domain: {
                      sourceRange: {
                        sources: [
                          {
                            sheetId: sheetId,
                            startRowIndex: 13,
                            endRowIndex: 17, // Use very few rows to ensure data exists
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
                            endRowIndex: 17, // Use very few rows to ensure data exists
                            startColumnIndex: 1,
                            endColumnIndex: 2,
                          },
                        ],
                      },
                    },
                  },
                },
                position: {
                  overlayPosition: {
                    anchorCell: {
                      sheetId: sheetId,
                      rowIndex: 50,
                      columnIndex: 2,
                    },
                    widthPixels: 600,
                    heightPixels: 400,
                  },
                },
              },
            },
          },
        ],
      };

      await sheetClient.batchUpdate(basicChartRequest);
      logEvent("Basic fallback chart created successfully");
      return true;
    } catch (basicError) {
      logEvent(`Failed to create even basic chart: ${basicError}`);
      return false;
    }
  }
}
