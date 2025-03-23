import { runAllWalletAgents } from "./walletManager.js";

// If run directly
if (process.argv[1] === import.meta.url.substring(7)) {
  runAllWalletAgents()
    .then(() => {
      console.log("Wallet Manager started successfully");
    })
    .catch((error) => {
      console.error(
        "Failed to start Wallet Manager:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    });
}

// Export the function for use in other modules
export { runAllWalletAgents };
