

export class WalletService {
    constructor(agent) {
        this.name = "Wallet";
        this.agent = agent;
    }

    async start() {
        // TODO: Fetch and set Balances inside a webhook or a cron job??
        // /* 
        //  const balances = {
        //    "HYPE": {
        //      "address": "0x0000000000000000000000000000000000000000",
        //      "decimals": 18,
        //      "symbol": "HYPE",
        //      "amount": "2.45891234"
        //    },
        //    "USDC": {
        //      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //      "decimals": 6,
        //      "symbol": "USDC",
        //      "amount": "1250.50"
        //    },
        //    "WBTC": {
        //      "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        //      "decimals": 8,
        //      "symbol": "WBTC",
        //      "amount": "0.05123"
        //    },
        //    "UNI": {
        //      "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
        //      "decimals": 18,
        //      "symbol": "UNI",
        //      "amount": "75.321"
        //    }
        //  }
        // */   
        // User this method to fetch balances
        // this.agent.getBalances()
        // When a balance update is received, call this method to update the balances
        // this.agent.setBalannces(balances)

    }

}
