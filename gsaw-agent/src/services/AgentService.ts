import { Tool } from "../tools/types";
import { loadTools } from "../tools";
import { v5 as uuidv5 } from 'uuid';

import { EncryptedConversation, EncryptedMessage } from "../types";
import { SecretVaultWrapper } from "secretvaults";

// Message interface
interface Message {
    role: string;
    content: string;
}

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export class AgentService {
    private tools: Tool[] = [];
    private tempConversations: { [conversationId: string]: Message[] } = {};
    private initialized: boolean = false;
    private nillionCollection: any = null;
    private orgConfig: any;
    private SCHEMA_ID: string;
    private user_id: string;

    constructor(orgConfig: any, schemaId: string) {
        this.orgConfig = orgConfig;
        this.SCHEMA_ID = schemaId;
        this.user_id = uuidv5("gabriel", NAMESPACE);
    }

    /**
     * Initialize the agent service
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        console.log("Initializing agent service...");

        // Initialize tools
        this.tools = await loadTools();
        // Initialize Nillion collection
        this.nillionCollection = new SecretVaultWrapper(
            this.orgConfig.nodes,
            this.orgConfig.orgCredentials,
            this.SCHEMA_ID
        );
        await this.nillionCollection.init();

        this.initialized = true;
        console.log("Agent service initialized with Nillion encryption!");
    }

    /**
     * Process a user message and return the agent's response
     */
    async processMessage(message: string, conversationId: string): Promise<{
        conversationId: string;
        response: string;
    }> {
        // Ensure the agent is initialized
        if (!this.initialized) {
            await this.initialize();
        }

        if (conversationId == "temp") {
            this.tempConversations["temp"] = this.createNewConversation();
        }

        // Get or create conversation from Nillion or temporary storage
        if (!this.tempConversations[conversationId]) {
            // Try to load from Nillion first
            const existingConversations = await this.nillionCollection.readFromNodes({
                "filter": {
                    "$and": [
                        { "_id": conversationId },
                    ]
                }
            });

            if (existingConversations && existingConversations.length > 0) {
                // Convert Nillion format to local format for processing
                this.tempConversations[conversationId] = this.convertFromNillionFormat(existingConversations[0]);
            } else {
                // Create a new conversation with system message
                this.tempConversations["temp"] = this.createNewConversation();
            }
        }

        // Add user message
        const currentTime = new Date().toISOString();
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
                const toolResult = await tool.execute(toolInput);
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
        await this.saveConversationToNillion(conversationId);

        return {
            conversationId,
            response: finalResponse
        };
    }

    /**
     * Create a new conversation with system message
     */
    private createNewConversation(): Message[] {
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
    private convertToNillionFormat(conversationId: string): EncryptedConversation {
        const messages = this.tempConversations[conversationId];
        const currentTime = new Date().toISOString();

        // Extract a title and summary from the conversation
        let title = conversationId;
        let summary = "Conversation with assistant";

        if (messages.length > 1 && messages[1].role === "user") {
            // Use first user message for title (truncated)
            title = messages[1].content.length > 30 ?
                messages[1].content.substring(0, 30) + "..." :
                messages[1].content;

            // Try to generate a summary based on conversation content
            if (messages.length > 2) {
                const userMessages = messages.filter(m => m.role === "user");
                summary = `Conversation about ${userMessages.map(m => m.content.substring(0, 20)).join(", ")}`;
                if (summary.length > 100) summary = summary.substring(0, 100) + "...";
            }
        }

        // Convert messages to Nillion format
        const encryptedMessages: EncryptedMessage[] = messages.map((message, index) => {
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
            conversation_metadata: {
                '%allot': {
                    title: title,
                    summary: summary
                }
            },
            messages: encryptedMessages
        };
    }

    /**
     * Convert Nillion format to local format for processing
     */
    private convertFromNillionFormat(encryptedConversation: EncryptedConversation): Message[] {
        return encryptedConversation.messages.map(message => ({
            role: message.role,
            content: message.content['%allot']
        }));
    }

    /**
     * Save conversation to Nillion
     */
    private async saveConversationToNillion(conversationId: string): Promise<string> {
        try {
            const conversation = this.tempConversations[conversationId];
            if (!conversation) return "Conversation not found";
            const encryptedConversation = this.convertToNillionFormat(conversationId);

            if (conversationId == 'temp') {
                const dataWritten = await this.nillionCollection.writeToNodes([encryptedConversation]);
                const newIds = [
                    ...new Set(dataWritten.map((item: any) => item.data.created).flat()),
                ];
                console.log(`Conversation ${newIds[0]} encrypted and saved to Nillion`);
                return newIds[0] as string;
            } else {
                const updatedData = await this.nillionCollection.updateDataToNodes(
                    encryptedConversation,
                    {
                        _id: conversationId
                    }
                );
                console.log(`Conversation ${conversationId} updated in Nillion`);
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
    private async callNilaiAPI(messages: Message[]): Promise<string> {
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
    async getConversationHistory(): Promise<any[]> {
        try {
            // Query Nillion for all conversations for this user
            const conversations: EncryptedConversation[] = await this.nillionCollection.readFromNodes({
                "filter": { "user_id": this.user_id }
            });

            // Return metadata only for listing purposes
            return conversations.map((conv: EncryptedConversation) => ({
                id: conv.conversation_metadata['%allot'].title,
                summary: conv.conversation_metadata['%allot'].summary,
                created_at: conv.created_at,
                updated_at: conv.updated_at
            }));
        } catch (error) {
            console.error(`Error retrieving conversation history for user ${this.user_id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string): Promise<void> {
        try {
            // Delete from Nillion
            await this.nillionCollection.deleteFromNodes({
                "filter": {
                    "$and": [
                        { "user_id": this.user_id },
                        { "conversation_metadata.%allot.title": conversationId }
                    ]
                }
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
}