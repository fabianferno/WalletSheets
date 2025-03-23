import { placeTrade } from "../tools/gmx";
import { processCandles } from "./utils/candles";
import { processSentimentCryptoPanic } from "./utils/cryptopanic";
import { generateEmbeddings } from "./utils/supavec";

export class TradingService {
    constructor(agent) {
        this.name = "Trading";
        this.agent = agent;
        this.timer = null;
    }

    async start() {
        // Start the periodic trading logic
        this.timer = setInterval(async () => {
            await this.executeTradeLogic();
        }, 10 * 60 * 1000); // 10 minutes in milliseconds

        console.log("Trading service started, will run every 10 minutes");
    }

    async stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log("Trading service stopped");
        }
    }

    async executeTradeLogic() {
        try {
            // 1. Check balance first
            const balance = await this.agent.getBalance();
            if (balance < BigInt("2000000000000000")) {
                console.log("Insufficient balance (< 0.002 ETH) to perform trade operations");
                return {
                    decision: "stay_idle",
                    reason: "Insufficient balance (< 0.002 ETH)"
                };
            }

            // 3. Gather all necessary trading data
            const [candleStickData, socialSentiment] = await Promise.all([
                processCandles("ETH"),
                processSentimentCryptoPanic("ETH", this.agent),
            ]);

            // 4. Generate embeddings using RAG service
            const embeddingsData = await generateEmbeddings(
                'ETH',
                candleStickData,
                socialSentiment,
            );

            const decision = await this.agent.processAnalysis({
                marketData: candleStickData,
                socialSentiment: socialSentiment,
            }, embeddingsData);
            let selectedTrade = null;
            if (decision.action === "close_position") {
                selectedTrade = await this.agent.getTradeById(decision.data.trade_id);
            }

            // 6. Execute the decision
            return await this.executeDecision(decision, selectedTrade);

        } catch (error) {
            console.error("Error in trading execution:", error);

        }
    }


    async executeDecision(decision, selectedTrade) {
        switch (decision.action) {
            case "buy_more":

                const hash = await placeTrade(
                    this.agent.getPrivateKey(),
                    'ETH',
                    'ETH',
                    '421614',
                    decision.data.leverage,
                    decision.data.amount,
                    [],
                    [],
                    decision.data.isLong
                );
                await this.agent.addTradingData({
                    action: {
                        "%allot": 'buy_more'
                    },
                    trade_data: {
                        is_long: {
                            "%allot": decision.data.isLong
                        },
                        asset: {
                            "%allot": "ETH"
                        },
                        leverage: {
                            "%allot": decision.data.leverage
                        },
                        amount: {
                            "%allot": decision.data.amount
                        },
                        tx_hash: {
                            "%allot": hash
                        },
                    },
                    explanation: {
                        "%allot": decision.reason
                    }
                })
                return {
                    success: true,
                }

            case "close_position":
                await this.agent.addTradingData({
                    action: {
                        "%allot": 'close_position'
                    },
                    trade_data: {
                        is_long: {
                            "%allot": selectedTrade.isLong
                        },
                        asset: {
                            "%allot": "ETH"
                        },
                        leverage: {
                            "%allot": selectedTrade.leverage
                        },
                        amount: {
                            "%allot": selectedTrade.amount
                        },
                        reference_trade_id: {
                            "%allot": decision.data.trade_id
                        }
                    },
                    explanation: {
                        "%allot": decision.reason
                    }
                })

            case "stay_idle":
            default:
                return {
                    decision: "stay_idle",
                    reason: decision.reason || "No trading opportunity identified"
                };
        }
    }
}