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
