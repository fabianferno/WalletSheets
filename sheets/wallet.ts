import { SheetClient } from "./sheets.api";
import { ethers } from "ethers";
import axios from "axios";
import path from "path";
import "dotenv/config";

// Etherscan API key (optional, but helps with rate limits)
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
// Provider URL (using public providers if not specified)
const PROVIDER_URL = process.env.PROVIDER_URL || "https://eth.llamarpc.com";

interface TokenBalance {
  token: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  value_usd?: number;
}

interface Transaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  methodId: string;
  methodName?: string;
  tokenTransfers?: any[];
}

/**
 * WalletPortfolio - A class to fetch and update wallet data in Google Sheets
 */
export class WalletPortfolio {
  private sheetClient: SheetClient;
  private provider: ethers.JsonRpcProvider;

  /**
   * Constructor for WalletPortfolio
   * @param sheetIdOrUrl - Google Sheets ID or URL
   * @param keyFilePath - Path to Google API credentials
   */
  constructor(sheetIdOrUrl: string, keyFilePath: string) {
    this.sheetClient = new SheetClient(sheetIdOrUrl, keyFilePath);
    this.provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  }

  /**
   * Initialize portfolio by setting up sheet structure
   */
  async initializePortfolio() {
    try {
      // Check if sheets exist, create them if not
      const sheets = await this.sheetClient.getAllSheets();
      const existingSheets = sheets.map((sheet) => sheet.title);

      // Create required sheets if they don't exist
      if (!existingSheets.includes("Settings")) {
        console.log("Creating Settings sheet...");
        await this.sheetClient.createSheet("Settings");

        // Initialize Settings sheet with headers and example data
        await this.sheetClient.setRangeValues("Settings!A4:C5", [
          [
            "Set up wallet here",
            "",
            "0x5A4830885f12438E00D8f4d98e9Fe083e707698C",
          ],
          ["Your name", "", "Fabian Ferno"],
        ]);
      }

      if (!existingSheets.includes("Hold Wallet")) {
        console.log("Creating Hold Wallet sheet...");
        await this.sheetClient.createSheet("Hold Wallet");

        // Initialize with headers
        await this.sheetClient.setRangeValues("Hold Wallet!A1:G1", [
          [
            "Token",
            "Name",
            "Symbol",
            "Balance",
            "USD Value",
            "Last Updated",
            "Address",
          ],
        ]);
      }

      if (!existingSheets.includes("Spot Wallet")) {
        console.log("Creating Spot Wallet sheet...");
        await this.sheetClient.createSheet("Spot Wallet");

        // Initialize with headers
        await this.sheetClient.setRangeValues("Spot Wallet!A1:J1", [
          [
            "Transaction Hash",
            "Timestamp",
            "From",
            "To",
            "Value (ETH)",
            "Gas Used",
            "Gas Price (Gwei)",
            "Method ID",
            "Method Name",
            "Status",
          ],
        ]);
      }

      console.log("Portfolio sheets initialized successfully");
    } catch (error) {
      console.error("Error initializing portfolio:", error);
    }
  }

  /**
   * Get wallet address and user name from Settings sheet
   */
  async getWalletSettings(): Promise<{ address: string; name: string }> {
    try {
      // Get all values from Settings sheet
      const settingsData = await this.sheetClient.getSheetValues("Settings");

      // Find wallet address and name
      let walletAddress = "";
      let userName = "";

      // Based on image, wallet address is in cell C4 and name is in cell C5
      if (settingsData.length >= 5) {
        // Check row 4 (index 3) for wallet address
        if (settingsData[3] && settingsData[3][2]) {
          walletAddress = settingsData[3][2].toString();
        }

        // Check row 5 (index 4) for name
        if (settingsData[4] && settingsData[4][2]) {
          userName = settingsData[4][2].toString();
        }
      }

      // Alternative: try to look for the labels in column A and get values from column C
      if (!walletAddress || !userName) {
        for (let i = 0; i < settingsData.length; i++) {
          const row = settingsData[i];
          if (row && row[0] === "Set up wallet here" && row[2]) {
            walletAddress = row[2].toString();
          }
          if (row && row[0] === "Your name" && row[2]) {
            userName = row[2].toString();
          }
        }
      }

      if (!walletAddress) {
        throw new Error("Wallet address not found in Settings sheet");
      }

      return { address: walletAddress, name: userName };
    } catch (error) {
      console.error("Error getting wallet settings:", error);
      throw error;
    }
  }

  /**
   * Get token balances for a wallet address
   * @param address - Ethereum wallet address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      // Get ETH balance
      const ethBalance = await this.provider.getBalance(address);
      const balances: TokenBalance[] = [
        {
          token: "ETH",
          name: "Ethereum",
          symbol: "ETH",
          balance: ethers.formatEther(ethBalance),
          decimals: 18,
        },
      ];

      // Get token balances using Ethplorer API (free alternative to Etherscan)
      try {
        const response = await axios.get(
          `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`
        );

        if (response.data.tokens) {
          for (const token of response.data.tokens) {
            if (token.tokenInfo.symbol && token.tokenInfo.name) {
              balances.push({
                token: token.tokenInfo.address,
                name: token.tokenInfo.name,
                symbol: token.tokenInfo.symbol,
                balance: (
                  token.balance / Math.pow(10, token.tokenInfo.decimals)
                ).toString(),
                decimals: token.tokenInfo.decimals,
                value_usd: token.tokenInfo.price?.rate
                  ? (token.balance / Math.pow(10, token.tokenInfo.decimals)) *
                    token.tokenInfo.price.rate
                  : undefined,
              });
            }
          }
        }
      } catch (tokenError) {
        console.error("Error fetching token balances:", tokenError);
      }

      return balances;
    } catch (error) {
      console.error("Error getting token balances:", error);
      throw error;
    }
  }

  /**
   * Get transaction history for a wallet address
   * @param address - Ethereum wallet address
   */
  async getTransactionHistory(address: string): Promise<Transaction[]> {
    try {
      // Etherscan is the most reliable source for transaction history
      const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

      const response = await axios.get(etherscanUrl);

      if (response.data.status === "1" && response.data.result) {
        return response.data.result.map((tx: any) => ({
          hash: tx.hash,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasUsed: tx.gasUsed,
          gasPrice: ethers.formatUnits(tx.gasPrice, "gwei"),
          methodId: tx.methodId || "0x",
          methodName: tx.functionName || "",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error getting transaction history:", error);
      throw error;
    }
  }

  /**
   * Update Hold Wallet sheet with token balances
   * @param walletAddress - Ethereum wallet address
   */
  async updateHoldWallet(walletAddress: string) {
    try {
      const balances = await this.getTokenBalances(walletAddress);

      // Clear existing data
      try {
        await this.sheetClient.clearRange("Hold Wallet!A2:G1000");
      } catch (clearError) {
        console.warn(
          "Error clearing Hold Wallet sheet, might be empty:",
          clearError
        );
      }

      // Set headers if needed
      await this.sheetClient.setRangeValues("Hold Wallet!A1:G1", [
        [
          "Token",
          "Name",
          "Symbol",
          "Balance",
          "USD Value",
          "Last Updated",
          "Address",
        ],
      ]);

      // Add token balances
      const rows = balances.map((token) => [
        token.token,
        token.name,
        token.symbol,
        token.balance,
        token.value_usd?.toString() || "N/A",
        new Date().toISOString(),
        walletAddress,
      ]);

      await this.sheetClient.appendRows("Hold Wallet", rows);

      console.log(`Updated Hold Wallet sheet with ${balances.length} tokens`);
    } catch (error) {
      console.error("Error updating Hold Wallet sheet:", error);
      throw error;
    }
  }

  /**
   * Update Spot Wallet sheet with transaction history
   * @param walletAddress - Ethereum wallet address
   */
  async updateSpotWallet(walletAddress: string) {
    try {
      const transactions = await this.getTransactionHistory(walletAddress);

      // Clear existing data
      try {
        await this.sheetClient.clearRange("Spot Wallet!A2:J1000");
      } catch (clearError) {
        console.warn(
          "Error clearing Spot Wallet sheet, might be empty:",
          clearError
        );
      }

      // Set headers if needed
      await this.sheetClient.setRangeValues("Spot Wallet!A1:J1", [
        [
          "Transaction Hash",
          "Timestamp",
          "From",
          "To",
          "Value (ETH)",
          "Gas Used",
          "Gas Price (Gwei)",
          "Method ID",
          "Method Name",
          "Status",
        ],
      ]);

      // Add transactions
      const rows = transactions.map((tx) => [
        tx.hash,
        tx.timestamp,
        tx.from,
        tx.to,
        tx.value,
        tx.gasUsed,
        tx.gasPrice,
        tx.methodId,
        tx.methodName || "Unknown",
        tx.from.toLowerCase() === walletAddress.toLowerCase()
          ? "Sent"
          : "Received",
      ]);

      await this.sheetClient.appendRows("Spot Wallet", rows);

      console.log(
        `Updated Spot Wallet sheet with ${transactions.length} transactions`
      );
    } catch (error) {
      console.error("Error updating Spot Wallet sheet:", error);
      throw error;
    }
  }

  /**
   * Update all wallet data in the Google Sheet
   */
  async updateAllData() {
    try {
      console.log("Fetching wallet settings...");
      const { address, name } = await this.getWalletSettings();

      console.log(
        `Updating portfolio for wallet: ${address} (${name || "Anonymous"})`
      );

      console.log("Updating Hold Wallet with token balances...");
      await this.updateHoldWallet(address);

      console.log("Updating Spot Wallet with transaction history...");
      await this.updateSpotWallet(address);

      console.log("Portfolio update completed successfully!");
    } catch (error) {
      console.error("Error updating portfolio data:", error);
    }
  }
}

async function main() {
  try {
    // Get sheet ID from environment or use default
    const sheetId = process.env.GOOGLE_SHEET_ID || "";

    if (!sheetId) {
      console.error(
        "ERROR: No Google Sheet ID provided. Please set GOOGLE_SHEET_ID in .env file."
      );
      process.exit(1);
    }

    // Path to credentials file
    const credentialsPath = path.resolve(__dirname, "./credentials.json");

    console.log("🔑 Using credentials from:", credentialsPath);
    console.log("📊 Using sheet ID:", sheetId);

    // Initialize portfolio
    const portfolio = new WalletPortfolio(sheetId, credentialsPath);

    // Initialize sheets if needed
    console.log("Initializing portfolio sheets...");
    await portfolio.initializePortfolio();

    // Update all wallet data
    await portfolio.updateAllData();
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

// Run the script
console.log("🚀 Starting Ethereum wallet portfolio tracker");
main()
  .then(() => console.log("✅ Portfolio update completed"))
  .catch((err) => console.error("❌ Fatal error:", err));
