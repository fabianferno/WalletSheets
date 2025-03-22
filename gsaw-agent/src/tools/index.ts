import { Tool, ToolFactory } from './types';
import { initializeSearchTool } from './search';
import { initializeWeatherTool } from './weather';

/**
 * Load all available tools
 */
export async function loadTools(): Promise<Tool[]> {
    const toolFactories: ToolFactory[] = [
        initializeSearchTool,
        initializeWeatherTool,
        // Add new tool factories here
    ];

    const tools: Tool[] = [];

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