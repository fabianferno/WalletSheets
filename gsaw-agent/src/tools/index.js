import { initializeSearchTool } from './search.js';
import { initializeHyperliquidTool } from './hyperliquid.js';
import { initializePriceTool } from './price';
import { initializeTransferTool } from './transfer';
import { initializeTransactionTool } from './transaction';





/**
 * Load all available tools
 */
export async function loadTools() {
    const toolFactories = [
        initializeSearchTool,
        initializeHyperliquidTool,
        initializePriceTool,
        initializeTransferTool,
        initializeTransactionTool,
        // Add new tool factories here
    ];

    const tools = [];

    for (const factory of toolFactories) {
        try {
            const tool = await factory();
            if (tool) {
                tools.push(tool);
                console.log(`✅ ${tool.name} tool initialized`);
            }
        } catch (error) {
            console.error(`Failed to initialize tool:`, error);
        }
    }

    return tools;
}