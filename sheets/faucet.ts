import { ethers } from "ethers";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Constants from environment variables
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PK || "";
const ETH_RPC_URL =
  "https://arb-sepolia.g.alchemy.com/v2/MShQiNPi5VzUekdRsalsGufPl0IkOFqR";
const THRESHOLD_ETH = 0.005;
const FAUCET_AMOUNT_ETH = 0.01;

async function main() {
  try {
    // Check if an address was provided
    const targetAddress = process.argv[2];
    if (!targetAddress) {
      console.error(
        "Error: Please provide a target address as a command-line argument"
      );
      console.log("Usage: ts-node faucet.ts <address>");
      process.exit(1);
    }

    // Validate the address
    if (!ethers.isAddress(targetAddress)) {
      console.error(`Error: Invalid Ethereum address: ${targetAddress}`);
      process.exit(1);
    }

    // Check if FAUCET_PRIVATE_KEY is provided
    if (!FAUCET_PRIVATE_KEY) {
      console.error("Error: FAUCET_PK environment variable is not set");
      process.exit(1);
    }

    // Connect to the Arbitrum Sepolia network
    console.log("Connecting to Arbitrum Sepolia...");
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

    // Create wallet from private key
    const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
    console.log(`Faucet address: ${wallet.address}`);

    // Check faucet balance
    const faucetBalance = await provider.getBalance(wallet.address);
    console.log(
      `Faucet balance: ${ethers.utils.formatEther(faucetBalance)} ETH`
    );

    if (faucetBalance < ethers.parseEther(FAUCET_AMOUNT_ETH.toString())) {
      console.error("Error: Faucet balance is too low to send ETH");
      process.exit(1);
    }

    // Check target address balance
    const targetBalance = await provider.getBalance(targetAddress);
    const targetBalanceEth = parseFloat(
      ethers.utils.formatEther(targetBalance)
    );
    console.log(`Target address balance: ${targetBalanceEth} ETH`);

    // Check if target balance is below threshold
    if (targetBalanceEth <= THRESHOLD_ETH) {
      console.log(
        `Balance below threshold of ${THRESHOLD_ETH} ETH. Sending ${FAUCET_AMOUNT_ETH} ETH...`
      );

      // Send ETH transaction
      const tx = await wallet.sendTransaction({
        to: targetAddress,
        value: ethers.parseEther(FAUCET_AMOUNT_ETH.toString()),
      });

      console.log(`Transaction sent: ${tx.hash}`);
      console.log(`Waiting for transaction confirmation...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt?.blockNumber}`);
      console.log(
        `Successfully sent ${FAUCET_AMOUNT_ETH} ETH to ${targetAddress}`
      );
    } else {
      console.log(
        `Target address already has sufficient balance (${targetBalanceEth} ETH)`
      );
      console.log(
        `No funds sent as balance is above threshold of ${THRESHOLD_ETH} ETH`
      );
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run the script if directly executed
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}

// Export for use in other modules
export { main as sendFaucetFunds };
