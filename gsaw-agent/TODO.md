~~1. Test Nillion chat~~ 
~~2. Create scripts to get all chats and decrypt and display~~
~~3. Create and deploy agent flow with Autonome~~

~~Creation flow~~

~~1. Get basic info: email, sheet id, secret salt~~
~~2. Deploy an agent. Pass the basic info and other .envs in the .env and create the agent.~~
~~3. On deploy the agent creates a new wallet, stores it on Nillion and other user info and setups everything in the client side.~~

Services

2. Trading Service
    - Monitors the trading positions, anlayzes current market conditions, social sentiment for every 5 minutes and decides whether to change/create or stay idle.


Providers

1. Basic usage knowledge provider. Helps with any queries related to the usage. (Cell content access??? )

ENV

1. SECRET SALT
2. GMAIL
3. NILAI_API_URL
4. NILAI_API_KEY
5. TAVILY_API_KEY
6. NILLION_ORG_DID
7. NILLION_ORG_SECRET_KEY
8. PROJECT_ID
9. ALCHEMY_API_KEY


FINAL TODO

~~1. Test GMX works~~
~~2. Estimate and return error if not enough value to perform trade~~
3. Trader Service with Nillion trades
4. Autonome deployment

