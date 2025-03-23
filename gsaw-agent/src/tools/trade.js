import { Hyperliquid } from "hyperliquid";

// Define validation constants
const PRICE_VALIDATION = {
    SLIPPAGE: 0.01, // 1% slippage for market orders
    MARKET_ORDER: {
        MIN_RATIO: 0.8,
        MAX_RATIO: 1.2
    },
    LIMIT_ORDER: {
        WARNING_MIN_RATIO: 0.5,
        WARNING_MAX_RATIO: 2.0
    }
};

/**
 * Initialize the spot trade tool
 */
export async function initializeTradeTool() {
    // Define examples of how to use this tool
    const examples = [
        {
            userQuery: "Buy 0.1 HYPE at 20 USDC",
            toolInput: JSON.stringify({
                coin: "HYPE",
                is_buy: true,
                sz: 0.1,
                limit_px: 20
            }),
            toolOutput: JSON.stringify({
                status: "ok",
                response: {
                    type: "order",
                    data: {
                        statuses: [{
                            px: 20,
                            sz: 0.1,
                            asset: 10042
                        }]
                    }
                }
            }),
            finalResponse: "Successfully placed a limit order to buy 0.1 HYPE at 20 USDC."
        },
        {
            userQuery: "Sell 2 HYPE at market price",
            toolInput: JSON.stringify({
                coin: "HYPE",
                is_buy: false,
                sz: 2
            }),
            toolOutput: JSON.stringify({
                status: "ok",
                response: {
                    type: "order",
                    data: {
                        statuses: [{
                            px: 19.75,
                            sz: 2,
                            asset: 10042
                        }]
                    }
                }
            }),
            finalResponse: "Successfully placed a market order to sell 2 HYPE at 19.75 USDC."
        }
    ];

    return {
        name: "trade",
        description: "Place a spot trade order (buy or sell) on Hyperliquid",
        examples: examples,
        execute: async (input, agent) => {
            try {
                console.log(`🔧 Executing spot trade tool with input: "${input}"`);

                // Parse the order parameters
                const orderParams = JSON.parse(input);
                console.log("Order parameters:", orderParams);

                // Validate required fields
                if (!orderParams.coin) {
                    throw new Error("Missing required parameter: coin");
                }
                if (typeof orderParams.is_buy !== 'boolean') {
                    throw new Error("Missing or invalid parameter: is_buy must be true or false");
                }
                if (typeof orderParams.sz !== 'number' || orderParams.sz <= 0) {
                    throw new Error("Missing or invalid parameter: sz must be a positive number");
                }

                // Initialize SDK with private key from environment
                const privateKey = agent.getPrivateKey();
                console.log("Generated Private Key: ", privateKey);
                const sdk = new Hyperliquid({
                    privateKey: privateKey,
                    testnet: true,
                    enableWs: false,
                });
                await sdk.connect();

                // Get market data
                const [meta, assetCtxs] = await sdk.info.spot.getSpotMetaAndAssetCtxs();

                // Find token and market
                const tokenIndex = meta.tokens.findIndex(
                    (token) => token.name.toUpperCase() === orderParams.coin.toUpperCase()
                );
                if (tokenIndex === -1) {
                    throw new Error(`Could not find token ${orderParams.coin}`);
                }
                const tokenInfo = meta.tokens[tokenIndex];

                const marketIndex = assetCtxs.findIndex(
                    (ctx) => ctx.coin === `${orderParams.coin}-SPOT`
                );
                if (marketIndex === -1) {
                    throw new Error(`Could not find market for ${orderParams.coin}`);
                }
                const marketCtx = assetCtxs[marketIndex];
                if (!marketCtx || !marketCtx.midPx) {
                    throw new Error(`Could not get market price for ${orderParams.coin}`);
                }

                // Calculate prices
                const midPrice = Number(marketCtx.midPx);
                const isMarketOrder = !orderParams.limit_px;
                let finalPrice;

                if (isMarketOrder) {
                    // For market orders, use current price with slippage
                    const slippage = PRICE_VALIDATION.SLIPPAGE;
                    finalPrice = orderParams.is_buy
                        ? midPrice * (1 + slippage)
                        : midPrice * (1 - slippage);

                    // Validate market order price
                    if (
                        finalPrice < midPrice * PRICE_VALIDATION.MARKET_ORDER.MIN_RATIO ||
                        finalPrice > midPrice * PRICE_VALIDATION.MARKET_ORDER.MAX_RATIO
                    ) {
                        throw new Error(
                            `Market order price (${finalPrice.toFixed(2)} USDC) is too far from market price (${midPrice.toFixed(2)} USDC). This might be due to low liquidity.`
                        );
                    }
                } else {
                    // For limit orders
                    finalPrice = orderParams.limit_px;

                    // Validate limit order price is optimal
                    if (orderParams.is_buy && finalPrice > midPrice) {
                        throw new Error(
                            `Cannot place buy limit order at ${finalPrice.toFixed(2)} USDC because it's above market price (${midPrice.toFixed(2)} USDC). To execute immediately, use a market order. For a limit order, set a price below ${midPrice.toFixed(2)} USDC.`
                        );
                    } else if (!orderParams.is_buy && finalPrice < midPrice) {
                        throw new Error(
                            `Cannot place sell limit order at ${finalPrice.toFixed(2)} USDC because it's below market price (${midPrice.toFixed(2)} USDC). To execute immediately, use a market order. For a limit order, set a price above ${midPrice.toFixed(2)} USDC.`
                        );
                    }

                    // Log warning if price is very different from market
                    if (
                        finalPrice < midPrice * PRICE_VALIDATION.LIMIT_ORDER.WARNING_MIN_RATIO ||
                        finalPrice > midPrice * PRICE_VALIDATION.LIMIT_ORDER.WARNING_MAX_RATIO
                    ) {
                        console.warn(
                            `Limit price (${finalPrice.toFixed(2)} USDC) is very different from market price (${midPrice.toFixed(2)} USDC). Make sure this is intentional.`,
                            {
                                finalPrice,
                                midPrice,
                                ratio: finalPrice / midPrice,
                            }
                        );
                    }
                }

                // Prepare and place order
                const rounded_px = Number(finalPrice.toFixed(tokenInfo.szDecimals));
                const orderRequest = {
                    coin: `${orderParams.coin}-SPOT`,
                    asset: 10000 + marketIndex,
                    is_buy: orderParams.is_buy,
                    sz: orderParams.sz,
                    limit_px: rounded_px,
                    reduce_only: false,
                    order_type: isMarketOrder
                        ? { market: {} }
                        : { limit: { tif: "Gtc" } },
                };

                console.log("Placing order:", orderRequest);
                const result = await sdk.exchange.placeOrder(orderRequest);

                // Check if order was rejected
                if (
                    result.status === "ok" &&
                    result.response?.type === "order" &&
                    result.response.data?.statuses?.[0]?.error
                ) {
                    throw new Error(result.response.data.statuses[0].error);
                }

                // Format result for return
                const action = orderParams.is_buy ? "buy" : "sell";
                const executionPrice = result.response?.data?.statuses?.[0]?.px || rounded_px;
                const resultText = `Successfully placed ${isMarketOrder ? "a market" : "a limit"} order to ${action} ${orderParams.sz} ${orderParams.coin} at ${executionPrice}`;

                return JSON.stringify({
                    text: resultText,
                    result: result
                });
            } catch (error) {
                console.error("Error placing spot order:", error);
                return `Error placing spot order: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        }
    };
}