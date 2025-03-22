import { loadTools } from "../tools/index.js";
import { v5 as uuidv5 } from 'uuid';
import { SecretVaultWrapper } from "secretvaults";

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export class AgentService {
    constructor(nodes) {
        this.tools = [];
        this.tempConversations = {};
        this.initialized = false;
        this.nillionChatCollection = null;
        this.nodes = nodes;
        this.user_id = uuidv5("gabriel", NAMESPACE);
    }

    /**
     * Initialize the agent service
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        console.log("Initializing agent service...");

        // Initialize tools
        this.tools = await loadTools();
        // Initialize Nillion collection
        this.nillionChatCollection = new SecretVaultWrapper(
            this.nodes,
            {
                secretKey: process.env.NILLION_ORG_SECRET_KEY,
                orgDid: process.env.NILLION_ORG_DID,
            },
            process.env.NILLION_CHAT_SCHEMA_ID
        );
        await this.nillionChatCollection.init();

        this.nillionUserCollection = new SecretVaultWrapper(
            this.nodes,
            {
                secretKey: process.env.NILLION_ORG_SECRET_KEY,
                orgDid: process.env.NILLION_ORG_DID,
            },
            process.env.NILLION_USER_SCHEMA_ID
        );
        await this.nillionUserCollection.init();

        this.initialized = true;
        console.log("Agent service initialized with Nillion encryption!");
    }

    /**
     * Process a user message and return the agent's response
     */
    async processMessage(message, conversationId) {
        // Ensure the agent is initialized
        if (!this.initialized) {
            await this.initialize();
        }

        console.log(`Processing conversation: ${conversationId}`);

        if (conversationId == "temp") {
            this.tempConversations["temp"] = this.createNewConversation();
        }

        // Get or create conversation from Nillion or temporary storage
        if (!this.tempConversations[conversationId]) {
            // Try to load from Nillion first
            const existingConversations = await this.nillionChatCollection.readFromNodes({
                "_id": conversationId
            });
            console.log(JSON.stringify(existingConversations, null, 2));
            if (existingConversations && existingConversations.length > 0) {
                // Convert Nillion format to local format for processing
                this.tempConversations[conversationId] = existingConversations[0].messages
            } else {
                // Create a new conversation with system message
                throw "Something went wrong";
                // this.tempConversations[conversationId] = this.createNewConversation();
            }
        }

        // Add user message
        this.tempConversations[conversationId].push({
            role: "user",
            content: message
        });

        // Get initial response from LLM
        const llmResponse = await this.callNilaiAPI(this.tempConversations[conversationId]);
        console.log(`🤖 Assistant (initial): ${llmResponse}`);

        // Check if the response contains a tool call
        const toolCallRegex = /<tool>(.*?):(.*?)<\/tool>/;
        const match = llmResponse.match(toolCallRegex);

        let finalResponse = llmResponse;

        if (match) {
            // Extract tool name and input
            const toolName = match[1].trim();
            const toolInput = match[2].trim();

            console.log(`🔧 Using tool: ${toolName} with input: ${toolInput}`);

            // Find the tool
            const tool = this.tools.find(t => t.name === toolName);

            if (tool) {
                // Execute the tool
                const toolResult = await tool.execute(toolInput, this);
                console.log(`🔧 Tool result received (${toolResult.length} chars)`);

                // Add assistant message with tool call
                this.tempConversations[conversationId].push({
                    role: "assistant",
                    content: llmResponse
                });

                // Add tool result as a system message
                this.tempConversations[conversationId].push({
                    role: "system",
                    content: `Tool result: ${toolResult}`
                });

                // Get final response from LLM
                finalResponse = await this.callNilaiAPI(this.tempConversations[conversationId]);
                console.log(`🤖 Assistant (final): ${finalResponse.substring(0, 100)}...`);

                // Add final response to conversation
                this.tempConversations[conversationId].push({
                    role: "assistant",
                    content: finalResponse
                });
            } else {
                console.log(`❌ Tool "${toolName}" not found`);

                // Add response to conversation
                this.tempConversations[conversationId].push({
                    role: "assistant",
                    content: finalResponse
                });
            }
        } else {
            // Add response to conversation
            this.tempConversations[conversationId].push({
                role: "assistant",
                content: finalResponse
            });
        }

        // Save conversation to Nillion
        const updatedConversationId = await this.saveConversationToNillion(conversationId);

        return {
            conversationId: updatedConversationId,
            response: finalResponse
        };
    }

    /**
     * Create a new conversation with system message
     */
    createNewConversation() {
        // Create tool information with descriptions and examples
        let toolInfo = "";

        for (const tool of this.tools) {
            toolInfo += `## ${tool.name}\n${tool.description}\n\nExamples:\n`;

            // Add examples for each tool
            for (const example of tool.examples) {
                toolInfo += `
User: "${example.userQuery}"
Assistant: <tool>${tool.name}: ${example.toolInput}</tool>
Tool Result: ${example.toolOutput}
Assistant's Final Response: "${example.finalResponse}"
`;
            }

            toolInfo += "\n\n";
        }

        return [{
            role: "system",
            content: `You are a helpful assistant with access to tools. Follow these steps:
1. If a user's request requires current data or information you don't have, use an available tool.
2. To use a tool, respond with: <tool>tool_name: tool_input</tool>
3. After receiving tool results, provide a helpful response incorporating the information.

# Available Tools and Usage Examples
${toolInfo}

Always use tools when appropriate rather than making up information. Study the examples carefully to understand when and how to use each tool.`
        }];
    }

    /**
     * Convert local format to Nillion format for storage
     */
    convertToNillionFormat(conversationId) {
        const messages = this.tempConversations[conversationId];
        const currentTime = new Date().toISOString();

        // Convert messages to Nillion format
        const encryptedMessages = messages.map((message, index) => {
            // Calculate a reasonable timestamp with 30 second intervals between messages
            const timestamp = new Date(Date.now() - (messages.length - index) * 30000).toISOString();

            return {
                role: message.role,
                content: {
                    '%allot': message.content
                },
                timestamp: timestamp
            };
        });

        return {
            user_id: this.user_id,
            created_at: encryptedMessages[0].timestamp,
            updated_at: currentTime,
            messages: encryptedMessages
        };
    }

    /**
     * Save conversation to Nillion
     */
    async saveConversationToNillion(conversationId) {
        try {
            console.log(`Starting to save conversation with ID: ${conversationId}`);
            const conversation = this.tempConversations[conversationId];
            console.log(JSON.stringify(conversation, null, 2));
            if (!conversation) {
                console.log(`Conversation with ID: ${conversationId} not found in temporary storage`);
                throw "Conversation not found";
            }

            console.log(`Converting conversation with ID: ${conversationId} to Nillion format`);
            const encryptedConversation = this.convertToNillionFormat(conversationId);

            if (conversationId == 'temp') {
                console.log(`Saving new conversation to Nillion`);
                const dataWritten = await this.nillionChatCollection.writeToNodes([encryptedConversation]);
                const newIds = [
                    ...new Set(dataWritten.map((item) => item.data.created).flat()),
                ];
                console.log(`Conversation saved with new ID: ${newIds[0]} and encrypted in Nillion`);
                return newIds[0];
            } else {
                console.log(`Updating existing conversation with ID: ${conversationId} in Nillion`);
                const updatedData = await this.nillionChatCollection.updateDataToNodes(
                    encryptedConversation,
                    {
                        _id: conversationId
                    }
                );
                console.log(`Conversation with ID: ${conversationId} successfully updated in Nillion`);
                return conversationId;
            }

        } catch (error) {
            console.error(`Error saving conversation ${conversationId} to Nillion:`, error);
            throw error;
        }
    }

    /**
     * Call the Nilai API
     */
    async callNilaiAPI(messages) {
        const apiUrl = process.env.NILAI_API_URL;
        const apiKey = process.env.NILAI_API_KEY;

        if (!apiUrl || !apiKey) {
            throw new Error("Missing NILAI_API_URL or NILAI_API_KEY environment variables");
        }

        try {
            console.log("Calling Nilai API...");
            const response = await fetch(`${apiUrl}/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct",
                    messages: messages,
                    temperature: 0.2
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error calling Nilai API:", error);
            throw error;
        }
    }

    /**
     * Retrieve conversation history for a user
     */
    async getConversations() {
        try {
            // Query Nillion for all conversations for this user
            const conversations = await this.nillionChatCollection.readFromNodes({
                "user_id": this.user_id
            });

            // Return metadata only for listing purposes
            return conversations
        } catch (error) {
            console.error(`Error retrieving conversation history for user ${this.user_id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId) {
        try {
            // Delete from Nillion
            await this.nillionChatCollection.deleteDataFromNodes({
                "$and": [
                    { "user_id": this.user_id },
                    { "_id": conversationId }
                ]
            });

            // Also remove from temporary storage if exists
            if (this.tempConversations[conversationId]) {
                delete this.tempConversations[conversationId];
            }

            console.log(`Conversation ${conversationId} deleted from Nillion`);
        } catch (error) {
            console.error(`Error deleting conversation ${conversationId} from Nillion:`, error);
            throw error;
        }
    }

    async getPrivateKey() {

    }
}