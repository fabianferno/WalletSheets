import dotenv from "dotenv";
dotenv.config();

function base64EncodeEnv(envs) {
    const encodedEnvs = {};
    for (const key in envs) {
        if (envs.hasOwnProperty(key)) {
            encodedEnvs[key] = Buffer.from(envs[key]).toString("base64");
        }
    }

    return encodedEnvs;
}

// Example usage
const envs = {
    NILAI_API_URL: process.env.NILAI_API_URL,
    NILAI_API_KEY: process.env.NILAI_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    LANGCHAIN_TRACING: "true",
    SHEET_ID: process.env.SHEET_ID,
    GMAIL: process.env.GMAIL,
    NAME: process.env.NAME,
    NILLION_ORG_DID: process.env.NILLION_ORG_DID,
    NILLION_ORG_SECRET_KEY: process.env.NILLION_ORG_SECRET_KEY,
    PROJECT_ID: process.env.PROJECT_ID,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    NILLION_CHAT_SCHEMA_ID: process.env.NILLION_CHAT_SCHEMA_ID,
    NILLION_USER_SCHEMA_ID: process.env.NILLION_USER_SCHEMA_ID,
    NILLION_TRADES_SCHEMA_ID: process.env.NILLION_TRADES_SCHEMA_ID,
    CRYPTO_PANIC_API_KEY: process.env.CRYPTO_PANIC_API_KEY,
    SUPAVEC_API_KEY: process.env.SUPAVEC_API_KEY,
    ARBISCAN_KEY: process.env.ARBISCAN_KEY
};

console.log(JSON.stringify(base64EncodeEnv(envs), null, 2));