import { ethers } from "ethers";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Constants from environment variables
const SALT = process.env.SALT || "xAISalt2025";
const ETH_RPC_URL =
  process.env.ETH_RPC_URL || "https://arbitrum-sepolia.drpc.org";

/**
 * Generate a deterministic wallet from sheetId, email, and salt
 */
export async function generateWallet(
  sheetId: string,
  ownerEmail: string
): Promise<ethers.Wallet> {
  try {
    // Combine sheetId, email, and salt
    const combinedString = `${sheetId}${ownerEmail}${SALT}`;

    // Hash the combined string using SHA-256
    const hashedValue = ethers.keccak256(ethers.toUtf8Bytes(combinedString));

    // Create a wallet from the hash
    const wallet = new ethers.Wallet(hashedValue);

    return wallet;
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Set up blockchain event listeners for the wallet
 */
export async function setUpBlockchainListeners(
  wallet: ethers.Wallet,
  addTransactionToSheet: Function
) {
  try {
    // Connect to Ethereum network (using Goerli for testing)
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const connectedWallet = wallet.connect(provider);

    // Listen for incoming transactions
    provider.on(
      {
        address: connectedWallet.address,
        topics: [],
      },
      async (log) => {
        try {
          // Get transaction details
          const tx = await provider.getTransaction(log.transactionHash);
          if (tx) {
            const timestamp = new Date().toISOString();
            const status = "Confirmed";
            const amount = ethers.formatEther(tx.value || "0");

            // Add to Wallet Explorer sheet
            await addTransactionToSheet(
              tx.hash,
              tx.from,
              tx.to,
              amount,
              timestamp,
              status
            );

            console.log(`Transaction recorded: ${tx.hash}`);
          }
        } catch (error: unknown) {
          console.error(
            `Error processing transaction: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    );

    console.log("Blockchain listeners set up successfully");
    return connectedWallet;
  } catch (error: unknown) {
    console.error(
      `Error setting up blockchain listeners: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}
