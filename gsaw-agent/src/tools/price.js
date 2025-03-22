import { Hyperliquid } from "hyperliquid";

/**
 * Initialize the price tool
 */
export async function initializePriceTool() {
    // Define examples of how to use this tool
    const examples = [
        {
            userQuery: "What's the current price of BTC?",
            toolInput: "BTC",
            toolOutput: JSON.stringify({
                symbol: "BTC",
                price: 65432.75,
                dayChange: "-1.82",
                volume: "1053445.75"
            }),
            finalResponse: "The current price of BTC is $65,432.75 USD. In the last 24 hours, it has changed by -1.82% with a trading volume of $1,053,445.75 USD."
        },
        {
            userQuery: "How much is ETH worth right now?",
            toolInput: "ETH",
            toolOutput: JSON.stringify({
                symbol: "ETH",
                price: 3245.18,
                dayChange: "2.35",
                volume: "875321.42"
            }),
            finalResponse: "ETH is currently trading at $3,245.18 USD. It's up 2.35% in the last 24 hours with a trading volume of $875,321.42 USD."
        }
    ];

    return {
        name: "price",
        description: "Fetches the current price, 24-hour change percentage, and trading volume of any cryptocurrency that is traded on Hyperliquid",
        examples: examples,
        execute: async (input) => {
            try {
                console.log(`🔧 Executing price tool with input: "${input}"`);

                // Extract the symbol from the input
                const symbol = input.trim().toUpperCase();

                // Initialize SDK
                const sdk = new Hyperliquid({
                    enableWs: false,
                });
                await sdk.connect();

                // Get market data
                const [spotMeta, spotAssetCtxs] = await sdk.info.spot.getSpotMetaAndAssetCtxs();
                const [perpsMeta, perpsAssetCtxs] = await sdk.info.perpetuals.getMetaAndAssetCtxs();
                // Find token and market
                const tokenIndex = [...spotMeta.tokens, ...perpsMeta.universe].findIndex(
                    (token) => token.name.toUpperCase() === symbol || token.name.toUpperCase() === symbol + "-PERP"
                );

                if (tokenIndex === -1) {
                    throw new Error(`Could not find token ${symbol}`);
                }
                const marketCtx = tokenIndex < spotMeta.tokens.length ? [...spotAssetCtxs].find(
                    (ctx) => ctx.coin === `${symbol}-SPOT`
                ) : perpsAssetCtxs[tokenIndex - spotMeta.tokens.length];

                if (!marketCtx || !marketCtx.midPx) {
                    throw new Error(`Could not get market price for ${symbol}`);
                }

                const price = Number(marketCtx.midPx);
                const dayChange = (
                    ((price - Number(marketCtx.prevDayPx)) /
                        Number(marketCtx.prevDayPx)) *
                    100
                ).toFixed(2);
                const volume = Number(marketCtx.dayNtlVlm).toFixed(2);

                const result = {
                    symbol: symbol,
                    price: price,
                    dayChange: dayChange,
                    volume: volume
                };

  // Define examples of how to use this tool
  const examples = [
    {
      userQuery: "Example user query that would trigger this tool",
      toolInput: "The exact input that should be passed to the tool",
      toolOutput: JSON.stringify({
        // Sample output data structure
        result: "Sample result from the tool",
        additionalInfo: "Any additional information",
        timestamp: new Date().toISOString(),
      }),
      finalResponse: "This is how the assistant should respond after receiving the tool output. It should incorporate the tool results in a natural, helpful way.",
    },
    // Add at least one more example
    {
      userQuery: "Another example user query for this tool",
      toolInput: "Different input for the tool",
      toolOutput: JSON.stringify({
        result: "Different sample result",
        additionalInfo: "More information",
        timestamp: new Date().toISOString(),
      }),
      finalResponse: "Another example of how the assistant should respond using these tool results.",
    },
  ];

  return {
    name: "price",
    description: "Fetches the price of any asset that is traded on Hyperliquid",
    examples,
    execute: async (input) => {
      try {
        console.log(`🔧 Executing price tool with input: "${input}"`);

        // Implement your tool logic here
        // This is where you'd call your API or perform your function

        // Mock response - replace with actual implementation
        const result = {
          input,
          result: "Your implementation here",
          timestamp: new Date().toISOString(),
        };

        return JSON.stringify(result);
      } catch (error) {
        console.error("Error with price tool:", error);
        if (error instanceof Error) {
          return `Error executing price: ${error.message}`;
        }
    };
}
