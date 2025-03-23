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
            userQuery: "I want to place a 2x long position on BTC with 0.1 ETH on Arbitrum, with take profits at $80,000 (50%) and $90,000 (50%), and stop loss at $60,000 (100%)",
            toolInput: JSON.stringify({
                native: "ETH",
                asset: "BTC",
                chain: "421614", // Arbitrum Sepolia testnet
                leverage: 2,
                positionSizeInNative: 0.1,
                takeProfit: [
                    { price: 80000, percent: 50 },
                    { price: 90000, percent: 50 }
                ],
                stopLoss: [
                    { price: 60000, percent: 100 }
                ],
                isLong: true
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0x497fc0b5699a94481485b51897834c1a30fef506c2f1fbd700cff9ccf4d87f24",
                explorerUrl: "https://sepolia.arbiscan.io/tx/0x497fc0b5699a94481485b51897834c1a30fef506c2f1fbd700cff9ccf4d87f24",
                position: {
                    asset: "BTC",
                    size: "$20",
                    leverage: "2x",
                    direction: "LONG",
                    entryPrice: "$70,000",
                    takeProfit: "50% at $80,000, 50% at $90,000",
                    stopLoss: "100% at $60,000"
                }
            }),
            finalResponse: "I've successfully placed your 2x long position on BTC using 0.1 ETH. Your trade is now active with take profits set at $80,000 (50%) and $90,000 (50%), and a stop loss at $60,000. You can view the transaction details here: https://sepolia.arbiscan.io/tx/0x497fc0b5699a94481485b51897834c1a30fef506c2f1fbd700cff9ccf4d87f24"
        },
        {
            userQuery: "Short AVAX with 0.5 AVAX, 3x leverage on Avalanche, with stop loss at $40 and take profit at $30",
            toolInput: JSON.stringify({
                native: "AVAX",
                asset: "AVAX",
                chain: "43113", // Avalanche Fuji testnet
                leverage: 3,
                positionSizeInNative: 0.5,
                takeProfit: [
                    { price: 30, percent: 100 }
                ],
                stopLoss: [
                    { price: 40, percent: 100 }
                ],
                isLong: false
            }),
            toolOutput: JSON.stringify({
                success: true,
                txHash: "0x7096739acdae47f793f35f314b34dc3ad5cf971c7f06f4d8a0ef21c50f7ee48c",
                explorerUrl: "https://testnet.snowtrace.io/tx/0x7096739acdae47f793f35f314b34dc3ad5cf971c7f06f4d8a0ef21c50f7ee48c",
                position: {
                    asset: "AVAX",
                    size: "$17.5",
                    leverage: "3x",
                    direction: "SHORT",
                    entryPrice: "$35",
                    takeProfit: "100% at $30",
                    stopLoss: "100% at $40"
                }
            }),
            finalResponse: "I've executed your 3x short position on AVAX using 0.5 AVAX. Your position is now active with a take profit at $30 and stop loss at $40. You can monitor this transaction at: https://testnet.snowtrace.io/tx/0x7096739acdae47f793f35f314b34dc3ad5cf971c7f06f4d8a0ef21c50f7ee48c"
        }
    ];

    return {
        name: "trading",
        description: "Enables users to place leveraged long or short positions on GMX with customizable take profit and stop loss levels",
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
                        takeProfit: takeProfit.map(tp => `${tp.percent}% at $${tp.price}`).join(', '),
                        stopLoss: stopLoss.map(sl => `${sl.percent}% at $${sl.price}`).join(', ')
                    }
                };

                return JSON.stringify(result);
            } catch (error) {
                console.error("Error with GMX trading tool:", error);
                return JSON.stringify({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred"
                });
            }
        }
    };
}

// Helper function to format currency values
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}