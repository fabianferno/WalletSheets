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
    LANGCHAIN_TRACING: "true"
};

console.log(JSON.stringify(base64EncodeEnv(envs), null, 2));