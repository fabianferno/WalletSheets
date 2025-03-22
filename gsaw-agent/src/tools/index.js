import { initializeSearchTool } from "./search.js";
import { initializePriceTool } from "./price.js";
import { initializeTradeTool } from "./trade.js";
import { initializeTransferTool } from "./transfer.js";
import { initializeTransactionTool } from "./transaction.js";

/**
 * Load all available tools
 */
export async function loadTools() {
  const toolFactories = [
    initializePriceTool,
    initializeTradeTool
    // initializeTransferTool,
    // initializeTransactionTool,
    // Add new tool factories here
  ];

  // Use Promise.all with map instead of for...of
  const results = await Promise.all(
    toolFactories.map(async (factory) => {
      try {
        const tool = await factory();
        if (tool) {
          console.log(`✅ ${tool.name} tool initialized`);
          return tool;
        }
        return null;
      } catch (error) {
        console.error("Failed to initialize tool:", error);
        return null;
      }
    })
  );

  // Filter out any null results
  return results.filter((tool) => tool !== null);
}
