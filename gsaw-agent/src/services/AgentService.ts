import fs from "fs";
import path from "path";
import { Tool } from "../tools/types";
import { loadTools } from "../tools";

// Message interface
interface Message {
    role: string;
    content: string;
}

// Conversation store
interface ConversationStore {
    [conversationId: string]: Message[];
}

export class AgentService {
    private tools: Tool[] = [];
    private conversations: ConversationStore = {};
    private initialized: boolean = false;

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

        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.initialized = true;
        console.log("Agent service initialized!");
    }

    /**
     * Process a user message and return the agent's response
     */
    async processMessage(message: string, conversationId: string): Promise<string> {
        // Ensure the agent is initialized
        if (!this.initialized) {
            await this.initialize();
        }

        // Get or create conversation
        if (!this.conversations[conversationId]) {
            // Create a new conversation with system message
            this.conversations[conversationId] = this.createNewConversation();
        }

        // Add user message
        this.conversations[conversationId].push({
            role: "user",
            content: message
        });

        // Get initial response from LLM
        const llmResponse = await this.callNilaiAPI(this.conversations[conversationId]);
        console.log(`🤖 Assistant (initial): ${llmResponse}`);

        // Check if the response contains a tool call
        const toolCallRegex = /<tool>(.*?):(.*?)<\/tool>/;
        const match = llmResponse.match(toolCallRegex);

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
                this.conversations[conversationId].push({
                    role: "assistant",
                    content: llmResponse
                });

                // Add tool result as a system message
                this.conversations[conversationId].push({
                    role: "system",
                    content: `Tool result: ${toolResult}`
                });

                // Get final response from LLM
                const finalResponse = await this.callNilaiAPI(this.conversations[conversationId]);
                console.log(`🤖 Assistant (final): ${finalResponse.substring(0, 100)}...`);

                // Add final response to conversation
                this.conversations[conversationId].push({
                    role: "assistant",
                    content: finalResponse
                });

                // Save conversation
                this.saveConversation(conversationId);

                return finalResponse;
            } else {
                console.log(`❌ Tool "${toolName}" not found`);

                // Add response to conversation
                this.conversations[conversationId].push({
                    role: "assistant",
                    content: llmResponse
                });

                // Save conversation
                this.saveConversation(conversationId);

                return llmResponse;
            }
        } else {
            // Add response to conversation
            this.conversations[conversationId].push({
                role: "assistant",
                content: llmResponse
            });

            // Save conversation
            this.saveConversation(conversationId);

            return llmResponse;
        }
    }

    /**
     * Create a new conversation with system message
     */
    private createNewConversation(): Message[] {
        // Create the system message with tool descriptions
        const toolDescriptions = this.tools.map(tool =>
            `${tool.name}: ${tool.description}`
        ).join("\n");

        return [{
            role: "system",
            content: `You are a helpful assistant with access to tools. Follow these steps:
1. If a user's request requires current data or information you don't have, use an available tool.
2. To use a tool, respond with: <tool>tool_name: tool_input</tool>
3. Available tools:
${toolDescriptions}

Always use tools when appropriate rather than making up information. For weather queries, use the weather tool. For current events or factual information, use the search tool.

After receiving tool results, provide a helpful response incorporating the information.`
        }];
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
     * Save conversation to file
     */
    private saveConversation(conversationId: string): void {
        try {
            const conversation = this.conversations[conversationId];
            if (!conversation) return;

            const dataDir = path.join(process.cwd(), 'data');
            const filePath = path.join(dataDir, `${conversationId}.json`);

            fs.writeFileSync(
                filePath,
                JSON.stringify(conversation, null, 2)
            );
        } catch (error) {
            console.error(`Error saving conversation ${conversationId}:`, error);
        }
    }
}