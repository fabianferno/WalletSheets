import { runAllWalletAgents } from "./walletManager";

// If run directly
if (require.main === module) {
  runAllWalletAgents()
    .then(() => {
      console.log("Wallet Manager started successfully");
    })
    .catch((error: unknown) => {
      console.error(
        "Failed to start Wallet Manager:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    });
}

// Export the function for use in other modules
export { runAllWalletAgents };
