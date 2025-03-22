import { initializeSearchTool } from './search.js';

/**
 * Load all available tools
 */
export async function loadTools() {
    const toolFactories = [
        initializeSearchTool,
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