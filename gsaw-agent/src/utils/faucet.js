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
      console.log("Usage: node faucet.js <address>");
      process.exit(1);
    }

    // Validate the address
    if (!ethers.isAddress(targetAddress)) {
      console.error(`Error: Invalid Ethereum address: ${targetAddress}`);
      process.exit(1);
    }

    console.log(`🚰 Faucet - Checking balance of ${targetAddress}`);

    // Connect to the Ethereum network
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const targetBalance = await provider.getBalance(targetAddress);
    const targetBalanceEth = ethers.formatEther(targetBalance);

    console.log(`Current balance: ${targetBalanceEth} ETH`);

    // Check if the target address needs funds
    if (Number(targetBalanceEth) >= THRESHOLD_ETH) {
      console.log(
        `Target address already has ${targetBalanceEth} ETH, which is above the threshold (${THRESHOLD_ETH} ETH)`
      );
      console.log("No funds sent.");
      process.exit(0);
    }

    // Connect the faucet wallet
    if (!FAUCET_PRIVATE_KEY) {
      console.error("Error: FAUCET_PK environment variable is not set");
      process.exit(1);
    }

    const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
    const faucetAddress = faucetWallet.address;
    const faucetBalance = await provider.getBalance(faucetAddress);
    const faucetBalanceEth = ethers.formatEther(faucetBalance);

    console.log(`Faucet address: ${faucetAddress}`);
    console.log(`Faucet balance: ${faucetBalanceEth} ETH`);

    // Check if the faucet has enough funds
    if (Number(faucetBalanceEth) < FAUCET_AMOUNT_ETH) {
      console.error(
        `Error: Faucet does not have enough funds. Current balance: ${faucetBalanceEth} ETH`
      );
      process.exit(1);
    }

    // Send the transaction
    console.log(`Sending ${FAUCET_AMOUNT_ETH} ETH to ${targetAddress}`);

    const tx = await faucetWallet.sendTransaction({
      to: targetAddress,
      value: ethers.parseEther(FAUCET_AMOUNT_ETH.toString()),
    });

    console.log(`Transaction sent: ${tx.hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Check the new balance
    const newBalance = await provider.getBalance(targetAddress);
    const newBalanceEth = ethers.formatEther(newBalance);

    console.log(`New balance of ${targetAddress}: ${newBalanceEth} ETH`);
    console.log("✅ Funds successfully sent!");
  } catch (error) {
    console.error("Error:", error.message || error);
    process.exit(1);
  }
}

// Call the main function and handle any unhandled promise rejections
if (process.argv[1] === import.meta.url.substring(7)) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

export { main as sendFaucetFunds };
