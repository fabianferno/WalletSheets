import { runAllWalletAgents } from "./walletManager";
import * as readline from "readline";

// Create interface for user input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

// Run the wallet manager
runAllWalletAgents()
  .then(() => {
    console.log("Wallet Manager service started successfully");
  })
  .catch((error: unknown) => {
    console.error("Failed to start Wallet Manager service:", error);
    process.exit(1);
  });
