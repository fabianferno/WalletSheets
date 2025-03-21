import { SheetClient } from "./sheets.api";
import path from "path";
import "dotenv/config";

// Environment variable to control execution of examples (optional)
const RUN_WRITE_EXAMPLES = process.env.RUN_WRITE_EXAMPLES === "true";

async function main() {
  try {
    // CONFIGURATION
    // -------------
    // You can use either a sheet ID or URL
    // For this example, replace with your Google Sheet ID or URL
    const sheetId =
      process.env.GOOGLE_SHEET_ID ||
      "1ID8G1hGqupWEZSzqjSw3uBv1YY1Rxd23u9A9ZnzPC7I";

    // Path to credentials file (relative to project root)
    const credentialsPath = path.resolve(__dirname, "./credentials.json");

    console.log("🔑 Using credentials from:", credentialsPath);
    console.log("📊 Using sheet ID:", sheetId);

    // Initialize the client
    const client = new SheetClient(sheetId, credentialsPath);

    // READ OPERATIONS
    // --------------
    console.log("\n📖 READ OPERATIONS");
    console.log("==================");

    // Example 1: Get all values from Hold sheet
    console.log("\n📄 Example 1: Getting all values from Hold sheet");
    try {
      const allValues = await client.getSheetValues("Hold");
      console.log(
        allValues.length > 0
          ? `Found ${allValues.length} rows of data`
          : "Sheet is empty or not accessible"
      );

      // Print first few rows for preview
      if (allValues.length > 0) {
        console.log("Preview:", allValues.slice(0, 3));
      }
    } catch (error: any) {
      console.error("Error getting sheet values:", error.message);
    }

    // Example 2: Get a specific cell from Hold sheet
    console.log("\n🔍 Example 2: Getting cell A1 from Hold sheet");
    try {
      const cellValue = await client.getCellValue("Hold", 1, "A");
      console.log(`Cell A1 value: ${cellValue || "empty or not accessible"}`);
    } catch (error: any) {
      console.error("Error getting cell value:", error.message);
    }

    // Example 3: Get an entire column from Spot sheet
    console.log("\n📊 Example 3: Getting column B from Spot sheet");
    try {
      const columnB = await client.getColumn("Spot", "B");
      console.log(`Column B has ${columnB.length} values`);
      if (columnB.length > 0) {
        console.log("Preview:", columnB.slice(0, 3));
      }
    } catch (error: any) {
      console.error("Error getting column:", error.message);
    }

    // Example 4: Get sheet information
    console.log("\n📋 Example 4: Getting all sheets");
    try {
      const sheets = await client.getAllSheets();
      console.log(`Found ${sheets.length} sheets:`);
      sheets.forEach((sheet) => {
        console.log(`- ${sheet.title} (ID: ${sheet.id})`);
      });
    } catch (error: any) {
      console.error("Error getting sheets:", error.message);
    }

    // WRITE OPERATIONS (only run if explicitly enabled)
    // ----------------
    if (RUN_WRITE_EXAMPLES) {
      console.log("\n✏️ WRITE OPERATIONS");
      console.log("=================");
      console.log("Write operations enabled! These will modify your sheet.");

      // Example 5: Append crypto data to Hold sheet
      console.log("\n➕ Example 5: Appending crypto holdings to Hold sheet");
      try {
        await client.appendRows("Hold", [
          ["BTC", "Bitcoin", 0.5, 50000, new Date().toISOString()],
          ["ETH", "Ethereum", 5, 3000, new Date().toISOString()],
          ["SOL", "Solana", 20, 100, new Date().toISOString()],
        ]);
        console.log("Crypto holdings appended successfully");
      } catch (error: any) {
        console.error("Error appending rows:", error.message);
      }

      // Example 6: Update a cell in Spot sheet
      console.log("\n🔄 Example 6: Updating price in Spot sheet");
      try {
        await client.setCellValue("Spot", 2, "C", "45678.50");
        console.log("Price updated successfully");
      } catch (error: any) {
        console.error("Error updating cell:", error.message);
      }

      // Example 7: Clear a range in Hold sheet
      console.log("\n🧹 Example 7: Clearing range D1:D5 in Hold sheet");
      try {
        await client.clearRange("Hold!D1:D5");
        console.log("Range cleared successfully");
      } catch (error: any) {
        console.error("Error clearing range:", error.message);
      }
    } else {
      console.log("\n✏️ WRITE OPERATIONS");
      console.log("=================");
      console.log(
        "Write operations disabled. Set RUN_WRITE_EXAMPLES=true to enable them."
      );
    }

    // SEARCH OPERATIONS
    // ----------------
    console.log("\n🔎 SEARCH OPERATIONS");
    console.log("==================");

    // Example 8: Search for a crypto ticker
    console.log('\n🔍 Example 8: Searching for "BTC" in Hold sheet');
    try {
      const searchResults = await client.searchInSheet("Hold", "BTC");
      console.log(`Found "${searchResults.length}" matches for "BTC"`);
      searchResults.forEach((result) => {
        console.log(`- Found at row ${result.row}, column ${result.column}`);
      });
    } catch (error: any) {
      console.error("Error searching:", error.message);
    }
  } catch (error: any) {
    console.error("Fatal error:", error);
  }
}

// Run the examples
console.log(
  "🚀 Starting Google Sheets API examples with crypto portfolio data"
);
main()
  .then(() => console.log("✅ Examples completed"))
  .catch((err: any) => console.error("❌ Fatal error:", err));
