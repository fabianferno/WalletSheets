import { placeTrade } from './gmx/index.js';

/**
 * Initialize the trading tool for executing trades on GMX
 */
export async function initializeTradingTool() {
    // Add any initialization logic or environment variable checks here
    if (!process.env.ALCHMEY_API_KEY) {
        console.warn("Warning: ALCHMEY_API_KEY environment variable not set");
    }

    // Define examples of how to use this tool
    const examples = [
        {
            userQuery: "I want to place a 2x long position on BTC with 0.001 ETH",
            toolInput: JSON.stringify({
                native: "ETH",
                asset: "BTC",
                chain: "421614",
                leverage: 2,
                positionSizeInNative: 0.001,
                isLong: true
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0x123abc456def789ghi",
                explorerUrl: "https://sepolia.arbiscan.io/tx/0x123abc456def789ghi",
                position: {
                    asset: "BTC",
                    leverage: "2x",
                    direction: "LONG",
                }
            }),
        },
        {
            userQuery: "Place a 3x short position on ETH with 0.005 ETH",
            toolInput: JSON.stringify({
                native: "ETH",
                asset: "ETH",
                chain: "421614",
                leverage: 3,
                positionSizeInNative: 0.005,
                isLong: false
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0x789ghi123abc456def",
                explorerUrl: "https://sepolia.arbiscan.io/tx/0x789ghi123abc456def",
                position: {
                    asset: "ETH",
                    leverage: "3x",
                    direction: "SHORT",
                }
            }),
        },
        {
            userQuery: "Open a 5x long position on AVAX with 0.01 ETH",
            toolInput: JSON.stringify({
                native: "ETH",
                asset: "AVAX",
                chain: "421614",
                leverage: 5,
                positionSizeInNative: 0.01,
                isLong: true
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0x456def789ghi123abc",
                explorerUrl: "https://sepolia.arbiscan.io/tx/0x456def789ghi123abc",
                position: {
                    asset: "AVAX",
                    leverage: "5x",
                    direction: "LONG",
                }
            }),
        },
        {
            userQuery: "I want to short BTC with 0.002 ETH at 4x leverage",
            toolInput: JSON.stringify({
                native: "ETH",
                asset: "BTC",
                chain: "421614",
                leverage: 4,
                positionSizeInNative: 0.002,
                isLong: false
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0xdef789ghi123abc456",
                explorerUrl: "https://sepolia.arbiscan.io/tx/0xdef789ghi123abc456",
                position: {
                    asset: "BTC",
                    leverage: "4x",
                    direction: "SHORT",
                }
            }),
        },
        {
            userQuery: "Open a 1.5x long position on SOL with 0.003 ETH",
            toolInput: JSON.stringify({
                native: "ETH",
                asset: "SOL",
                chain: "421614",
                leverage: 1.5,
                positionSizeInNative: 0.003,
                isLong: true
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0xabc456def789ghi123",
                explorerUrl: "https://sepolia.arbiscan.io/tx/0xabc456def789ghi123",
                position: {
                    asset: "SOL",
                    leverage: "1.5x",
                    direction: "LONG",
                }
            }),
        },
    ];

    return {
        name: "trading",
        description: "Enables users to place leveraged long or short positions on GMX",
        examples: examples,
        execute: async (input, agent) => {
            try {
                console.log(`🔧 Executing GMX trading tool with input: "${input}"`);

                // Parse the input
                const params = JSON.parse(input);

                // Validate required parameters
                const requiredParams = ['native', 'asset', 'chain', 'leverage', 'positionSizeInNative', 'isLong'];
                for (const param of requiredParams) {
                    if (!params[param] && params[param] !== false) {
                        throw new Error(`Missing required parameter: ${param}`);
                    }
                }

                // Default empty arrays if not provided
                const takeProfit = params.takeProfit || [];
                const stopLoss = params.stopLoss || [];
                const privateKey = await agent.getPrivateKey();
                // Log the trade details before execution
                console.log("Trade details:", {
                    privateKey: privateKey ? "Provided" : "Not provided",
                    native: params.native,
                    asset: params.asset,
                    chain: params.chain,
                    leverage: params.leverage,
                    positionSizeInNative: params.positionSizeInNative,
                    takeProfit: takeProfit,
                    stopLoss: stopLoss,
                    isLong: params.isLong
                });

                // Execute the trade
                const tx = await placeTrade(
                    privateKey,
                    params.native,
                    params.asset,
                    params.chain,
                    params.leverage,
                    params.positionSizeInNative,
                    takeProfit,
                    stopLoss,
                    params.isLong
                );

                // Extract tx hash
                const txHash = tx.hash;

                // Get explorer URL
                const explorerUrl = params.chain !== "421614"
                    ? `https://testnet.snowtrace.io/tx/${txHash}`
                    : `https://sepolia.arbiscan.io/tx/${txHash}`;

                // Format the response
                const result = {
                    success: true,
                    txHash: txHash,
                    explorerUrl: explorerUrl,
                    position: {
                        asset: params.asset,
                        leverage: `${params.leverage}x`,
                        direction: params.isLong ? "LONG" : "SHORT",
                    }
                };

                return JSON.stringify(result);
            } catch (error) {
                console.error("Error with GMX trading tool:", error);
                return JSON.stringify({
                    success: false,
                    error: "Insufficient funds or other error occurred",
                });
            }
        }
    };
}
