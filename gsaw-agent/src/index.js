import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import readline from "readline";
import { AgentService } from "./services/AgentService.js";
import { nodes } from "./config.js";

// Load environment variables
dotenv.config();

// Create agent service
const agentService = new AgentService(nodes);

// Terminal mode implementation
async function runTerminalMode() {
  await agentService.initialize();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n🤖 Agent ready! Type \"exit\" to quit.\n");

  const askQuestion = (query) => new Promise((resolve) => {
    rl.question(query, resolve);
  });

  // Create a function to handle each conversation turn
  const processTurn = async (input, currentConversationId) => {
    try {
      const result = await agentService.processMessage(
        input,
        currentConversationId,
      );
      console.log(`\n🤖 Assistant: ${result.response}\n`);
      return result.conversationId;
    } catch (error) {
      console.error("\n❌ Error processing message:", error);
      return currentConversationId;
    }
  };

  // Initialize conversation
  let conversationId = "temp";

  // Create a function for the conversation loop
  const conversationLoop = async () => {
    // Get user input
    const userInput = await askQuestion("👤 You: ");

    if (userInput.toLowerCase() === "exit") {
      rl.close();
      console.log("\nTerminal session ended.");
      process.exit(0);
      return;
    }

    // Process the message outside the loop
    conversationId = await processTurn(userInput, conversationId);

    // Continue the conversation
    conversationLoop();
  };

  // Start the conversation
  conversationLoop();
}

// Server mode implementation
function runServerMode() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Initialize middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Initialize the agent when server starts
  agentService
    .initialize()
    .then(() => {
      console.log("✅ Agent initialized and ready");
    })
    .catch((error) => {
      console.error("❌ Failed to initialize agent:", error);
      process.exit(1);
    });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Chat endpoint
  app.post("/chat", async (req, res) => {
    try {
      const { message, conversationId = "temp" } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const result = await agentService.processMessage(message, conversationId);

      return res.status(200).json({
        response: result.response,
        conversationId: result.conversationId,
      });
    } catch (error) {
      console.error("Error processing chat request:", error);
      return res.status(500).json({
        error: `Failed to process message ${error}`,
      });
    }
  });

  app.get("/conversations", async (req, res) => {
    try {
      const conversations = await agentService.getConversations();
      return res.status(200).json({ conversations });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return res.status(500).json({
        error: `Failed to fetch conversations: ${error}`,
      });
    }
  });

  app.delete("/conversations/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ error: "Conversation ID is required" });
      }

      await agentService.deleteConversation(conversationId);
      return res
        .status(200)
        .json({ success: true, message: "Conversation deleted" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return res.status(500).json({
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

// Determine if server should run in terminal mode
const terminalMode = process.argv.includes("--terminal");

if (terminalMode) {
  console.log("Starting agent in terminal mode...");
  runTerminalMode();
} else {
  console.log("Starting agent in server mode...");
  runServerMode();
}
