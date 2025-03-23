import {
  runAllWalletAgents,
  fixPendingTransactions,
  updatePortfolio,
} from "./walletManager.js";
import * as readline from "readline";

// Create command-line interface to manage wallet operations
export function startWalletCliTool() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const sheetId = args[1];

  // Create interface for user input/output
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Process different commands
  if (command === "fix-pending-transactions" && sheetId) {
    console.log(`🛠️ Fixing pending transactions for sheet: ${sheetId}`);
    fixPendingTransactions(sheetId)
      .then((success) => {
        if (success) {
          console.log("✅ Successfully fixed pending transactions!");
        } else {
          console.error("❌ Failed to fix pending transactions");
        }
        rl.close();
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Error:", error);
        rl.close();
        process.exit(1);
      });
  } else if (command === "update-portfolio" && sheetId) {
    console.log(`📊 Manually updating portfolio for sheet: ${sheetId}`);
    updatePortfolio(sheetId)
      .then((success) => {
        if (success) {
          console.log("✅ Successfully updated portfolio dashboard!");
        } else {
          console.error("❌ Failed to update portfolio dashboard");
        }
        rl.close();
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Error:", error);
        rl.close();
        process.exit(1);
      });
  } else if (command === "help") {
    console.log("Google Sheets Crypto Wallet Agent - Help");
    console.log("========================================");
    console.log("Available commands:");
    console.log("");
    console.log(
      "node index.js                           - Start wallet agents for all accessible spreadsheets"
    );
    console.log(
      "node index.js fix-pending-transactions <sheetId> - Fix pending transactions for a specific sheet"
    );
    console.log(
      "node index.js update-portfolio <sheetId>     - Manually update portfolio dashboard for a specific sheet"
    );
    console.log(
      "node index.js help                      - Show this help message"
    );
    rl.close();
    process.exit(0);
  } else if (command) {
    console.log(`❌ Unknown command: ${command}`);
    console.log("Use 'node index.js help' to see available commands");
    rl.close();
    process.exit(1);
  } else {
    // Normal startup mode
    console.log("Google Sheets Crypto Wallet Agent");
    console.log("================================");
    console.log("Starting wallet agents for all accessible spreadsheets...");

    // Run all wallet agents automatically
    runAllWalletAgents()
      .then(() => {
        console.log("Wallet agents started and running in the background...");
        // Keep the process running, the agents have their own setInterval
      })
      .catch((error) => {
        console.error(
          "Failed to start wallet agents:",
          error instanceof Error ? error.message : String(error)
        );
        rl.close();
        process.exit(1);
      });
  }
}

export { runAllWalletAgents, fixPendingTransactions, updatePortfolio };
