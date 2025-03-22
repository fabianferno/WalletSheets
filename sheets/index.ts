import { runAllWalletAgents, fixPendingTransactions } from "./walletManager";
import * as readline from "readline";

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const sheetId = args[1];

// Create interface for user input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Check if this is a fix-pending-transactions command
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
    .catch((error: unknown) => {
      console.error(
        "Failed to start wallet agents:",
        error instanceof Error ? error.message : String(error)
      );
      rl.close();
      process.exit(1);
    });
}
