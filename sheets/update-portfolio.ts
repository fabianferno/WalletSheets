import path from "path";
import "dotenv/config";
import { WalletPortfolio } from "./wallet";

async function main() {
  try {
    // Get sheet ID from environment
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
