~~1. Test Nillion chat~~ 
~~2. Create scripts to get all chats and decrypt and display~~
~~3. Create and deploy agent flow with Autonome~~

Creation flow

1. Get basic info: email, sheet id, secret salt
2. Deploy an agent. Pass the basic info and other .envs in the .env and create the agent.
3. On deploy the agent creates a new wallet, stores it on Nillion and other user info and setups everything in the client side.


Services
1. Wallet info service
    - Fetches the wallet balance on 3 chains every 30 seconds
    - Fetches the price of assets every 5 minutes
2. Trading Service
    - Monitors the trading positions, anlayzes current market conditions, social sentiment for every 5 minutes and decides whether to change/create or stay idle.

Tools

1. Debridge Tool for asset bridging
2. GMX for Perp trading
3. CoW or any for Spot Trading
4. ???

Providers

1. Basic usage knowledge provider. Helps with any queries related to the usage. (Cell content access??? )