import { SecretVaultWrapper } from 'secretvaults';
import { v4 as uuidv4 } from 'uuid';
import { orgConfig } from './orgConfig.js';

(async function main() {
    const SCHEMA_ID = '754b9460-d81a-4fa3-89d6-be2193f64072';

    const web3ExperienceSurveyData = [
        {
            user_id: "user_12345",
            created_at: "2025-03-21T09:15:00Z",
            updated_at: "2025-03-21T09:20:30Z",

            conversation_metadata: {
                '%allot': {
                    title: "Help with Python code",
                    summary: "User asked for help with a Python function to calculate Fibonacci numbers"
                }
            },
            messages: [
                {
                    role: "system",
                    content: {
                        '%allot': "You are a helpful assistant with access to tools. Use the weather tool for weather queries and the search tool for current information."
                    },
                    timestamp: "2025-03-21T09:15:00Z"
                },
                {
                    role: "user",
                    content: {
                        '%allot': "Can you help me write a Python function to calculate Fibonacci numbers?"
                    },
                    timestamp: "2025-03-21T09:15:10Z"
                },
                {
                    role: "assistant",
                    content: {
                        '%allot': "Here's a Python function to calculate Fibonacci numbers:\n\n```python\ndef fibonacci(n):\n    \"\"\"Calculate the nth Fibonacci number.\"\"\"\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        a, b = 0, 1\n        for _ in range(2, n + 1):\n            a, b = b, a + b\n        return b\n\n# Example usage\nfor i in range(10):\n    print(f\"Fibonacci({i}) = {fibonacci(i)}\")\n```\n\nThis implementation uses an iterative approach which is more efficient than the recursive version for larger numbers. Would you like me to explain how it works?"
                    },
                    timestamp: "2025-03-21T09:20:30Z"
                }
            ]
        }
    ];

    try {
        const collection = new SecretVaultWrapper(
            orgConfig.nodes,
            orgConfig.orgCredentials,
            SCHEMA_ID
        );
        await collection.init();

        const dataWritten = await collection.writeToNodes(web3ExperienceSurveyData);
        console.log('dataWritten', JSON.stringify(dataWritten, null, 2));

        const newIds = [
            ...new Set(dataWritten.map((item) => item.data.created).flat()),
        ];
        console.log('created ids:', newIds);

        const dataRead = await collection.readFromNodes({});
        console.log('📚 total records:', dataRead.length);
        console.log(
            '📚 Read new records:',
            JSON.stringify(dataRead.slice(0, web3ExperienceSurveyData.length), null, 2)
        );
    } catch (error) {
        console.error('❌ Failed to use SecretVaultWrapper:', error.message);
        process.exit(1);
    }
})();
