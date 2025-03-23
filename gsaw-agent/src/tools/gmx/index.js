import { ethers } from "ethers";
import {
    assets,
    orderVaultDeployments,
    exchangeRouterAbi as exchangeRouterABI,
} from "./constants.js";
import dotenv from "dotenv";
import { zeroAddress } from "viem";
import dataStore from "./abis/data-store.json";
import exchangeRouter from "./abis/exchange-router.json";
import {
    convertEthToAsset,
    expandDecimals,
    getMarketTokenAddress,
} from "./utils.js";

dotenv.config();

export async function placeTrade(
    pKey,
    native,
    asset,
    chain,
    leverage,
    positionSizeInNative,
    takeProfit,
    stopLoss,
    isLong
) {
    const dataStoreAbi = dataStore.abi;
    const rpcUrl =
        chain == "421614"
            ? "https://arb-sepolia.g.alchemy.com/v2/" + process.env.ALCHMEY_API_KEY
            : "https://avax-fuji.g.alchemy.com/v2/" + process.env.ALCHMEY_API_KEY;

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(pKey, provider);
    const exchangeRouterAbi = exchangeRouterABI[chain];
    const addresses = {
        wnt: assets[chain == "421614" ? "ETH" : "AVAX"][chain],
        token: assets[asset][chain],
        usdc: assets["USDC"][chain],
        exchangeRouter: exchangeRouter[chain],
        dataStore: dataStore[chain],
    };

    const executionFee =
        chain == "421614" ? expandDecimals(5, 14) : expandDecimals(1, 16);

    const params = {
        rpcUrl: rpcUrl,
        chain: chain,
        native: native,
        assetName: asset,
        positionSizeInETH: positionSizeInNative,
        takeProfit: takeProfit,
        stopLoss: stopLoss,
        leverage: leverage,
        slippage: 1,
        isLong: isLong,
        executionFee: executionFee,
    };

    if (addresses.token == undefined) {
        console.log(
            "Token " +
            addresses.token +
            " is not configured for chain " +
            params.chain
        );
        return;
    }

    const exchangeRouterContract = new ethers.Contract(
        addresses.exchangeRouter,
        exchangeRouterAbi,
        wallet
    );
    const dataStoreContract = new ethers.Contract(
        addresses.dataStore,
        dataStoreAbi,
        wallet
    );

    // Get Price
    const { assetPriceInUSD, amountInUSD, amountInETH } = await convertEthToAsset(
        params.chain,
        params.native,
        params.assetName,
        params.positionSizeInETH
    );

    // Get Market Token Address
    const marketTokenAddress = await getMarketTokenAddress(
        dataStoreContract,
        addresses.token,
        addresses.token,
        addresses.usdc,
        "0x4bd5869a01440a9ac6d7bf7aa7004f402b52b845f20e2cec925101e13d84d075"
    );

    const ethUsdMarket = await getMarketTokenAddress(
        dataStoreContract,
        addresses.wnt,
        addresses.wnt,
        addresses.usdc,
        "0x4bd5869a01440a9ac6d7bf7aa7004f402b52b845f20e2cec925101e13d84d075"
    );

    // TODO: Implement Stop Loss and Take Profit

    const walletAddress = await wallet.getAddress();
    const createOrderParams =
        params.chain == "421614"
            ? [
                {
                    addresses: {
                        receiver: walletAddress,
                        callbackContract: zeroAddress,
                        uiFeeReceiver: zeroAddress,
                        market: marketTokenAddress,
                        initialCollateralToken: addresses.wnt,
                        swapPath: params.assetName == params.native ? [] : [ethUsdMarket],
                    },
                    numbers: {
                        sizeDeltaUsd: (amountInUSD * BigInt(params.leverage)).toString(),
                        initialCollateralDeltaAmount: 0,
                        triggerPrice: 0,
                        acceptablePrice: !params.isLong
                            ? (
                                assetPriceInUSD -
                                (assetPriceInUSD * BigInt(params.slippage)) / BigInt(100)
                            ).toString()
                            : (
                                assetPriceInUSD +
                                (assetPriceInUSD * BigInt(params.slippage)) / BigInt(100)
                            ).toString(),
                        executionFee: params.executionFee.toString(),
                        callbackGasLimit: 0,
                        minOutputAmount: 0,
                        validFromTime: 0,
                    },
                    orderType: 2,
                    decreasePositionSwapType: 0,
                    isLong: params.isLong,
                    shouldUnwrapNativeToken: true,
                    referralCode:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                },
            ]
            : [
                {
                    addresses: {
                        receiver: walletAddress,
                        cancellationReceiver: zeroAddress,
                        callbackContract: zeroAddress,
                        uiFeeReceiver: zeroAddress,
                        market: marketTokenAddress,
                        initialCollateralToken: addresses.wnt,
                        swapPath: params.assetName == params.native ? [] : [ethUsdMarket],
                    },
                    numbers: {
                        sizeDeltaUsd: (amountInUSD * BigInt(params.leverage)).toString(),
                        initialCollateralDeltaAmount: 0,
                        triggerPrice: 0,
                        acceptablePrice: !params.isLong
                            ? (
                                assetPriceInUSD -
                                (assetPriceInUSD * BigInt(params.slippage)) / BigInt(100)
                            ).toString()
                            : (
                                assetPriceInUSD +
                                (assetPriceInUSD * BigInt(params.slippage)) / BigInt(100)
                            ).toString(),
                        executionFee: params.executionFee.toString(),
                        callbackGasLimit: 0,
                        minOutputAmount: 0,
                        validFromTime: 0,
                    },
                    orderType: 2,
                    decreasePositionSwapType: 0,
                    isLong: params.isLong,
                    shouldUnwrapNativeToken: true,
                    autoCancel: false,
                    referralCode:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                },
            ];
    console.log(createOrderParams);
    const tx = await exchangeRouterContract.multicall(
        [
            exchangeRouterContract.interface.encodeFunctionData("sendWnt", [
                orderVaultDeployments[params.chain],
                (amountInETH + params.executionFee).toString(),
            ]),
            exchangeRouterContract.interface.encodeFunctionData(
                "createOrder",
                createOrderParams
            ),
        ],
        { value: amountInETH + params.executionFee }
    );
    console.log("Transaction sent. Waiting for confirmation..");
    const receipt = await tx.wait();
    console.log("Transaction Confirmed. View in explorer.");
    console.log(
        (params.chain != "421614"
            ? "https://testnet.snowtrace.io/tx/"
            : "https://sepolia.arbiscan.io/tx/") + receipt.transactionHash
    );
    return tx;
}