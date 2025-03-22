import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import readline from 'readline';
import { AgentService } from './services/AgentService.js';
import { conversationsSchemaId, orgConfig } from './config.js';

// Load environment variables
dotenv.config();

// Create agent service
const agentService = new AgentService(orgConfig, conversationsSchemaId);

// Determine if server should run in terminal mode
const terminalMode = process.argv.includes('--terminal');

if (terminalMode) {
    console.log('Starting agent in terminal mode...');
    runTerminalMode();
} else {
    console.log('Starting agent in server mode...');
    runServerMode();
}

// Terminal mode implementation
async function runTerminalMode() {
    await agentService.initialize();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n🤖 Agent ready! Type "exit" to quit.\n');

    const askQuestion = (query) => new Promise((resolve) => {
        rl.question(query, resolve);
    });

    // Start the conversation loop
    let conversationId = `temp`;
    while (true) {
        const userInput = await askQuestion('👤 You: ');

        if (userInput.toLowerCase() === 'exit') {
            break;
        }

        try {
            const { conversationId: receivedConvoId, response } = await agentService.processMessage(userInput, conversationId);
            console.log(`\n🤖 Assistant: ${response}\n`);
            conversationId = receivedConvoId;
        } catch (error) {
            console.error('\n❌ Error processing message:', error);
        }
    }

    rl.close();
    console.log('\nTerminal session ended.');
    process.exit(0);
}

// Server mode implementation
function runServerMode() {
    const app = express();
    const port = process.env.PORT || 3000;

    // Initialize middleware
    app.use(cors());
    app.use(bodyParser.json());

    // Initialize the agent when server starts
    agentService.initialize()
        .then(() => {
            console.log('✅ Agent initialized and ready');
        })
        .catch(error => {
            console.error('❌ Failed to initialize agent:', error);
            process.exit(1);
        });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    // Chat endpoint
    app.post('/chat', async (req, res) => {
        try {
            const { message, conversationId = `temp` } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const { conversationId: updatedConversationId, response } = await agentService.processMessage(message, conversationId);

            res.status(200).json({
                response,
                conversationId: updatedConversationId
            });
        } catch (error) {
            console.error('Error processing chat request:', error);
            res.status(500).json({
                error: `Failed to process message ${error}`,
            });
        }
    });

    app.get('/conversations', async (req, res) => {
        try {
            const conversations = await agentService.getConversations();
            res.status(200).json({ conversations });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({
                error: `Failed to fetch conversations: ${error}`,
            });
        }
    });

    app.delete('/conversations/:conversationId', async (req, res) => {
        try {
            const { conversationId } = req.params;

            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID is required' });
            }

            await agentService.deleteConversation(conversationId);
            res.status(200).json({ success: true, message: 'Conversation deleted' });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({
                error: `Failed to delete conversation: ${error}`,
            });
        }
    });

    // Start the server
    app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log(`📌 Chat endpoint: POST http://localhost:${port}/chat`);
        console.log(`📌 Health check: GET http://localhost:${port}/health`);
    });
}