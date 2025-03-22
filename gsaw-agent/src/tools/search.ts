import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { Tool } from './types';

/**
 * Initialize the search tool using Tavily
 */
export async function initializeSearchTool(): Promise<Tool | null> {
    if (!process.env.TAVILY_API_KEY) {
        console.log("⚠️ TAVILY_API_KEY not set, search tool unavailable");
        return null;
    }

    try {
        const tavilySearch = new TavilySearchResults({
            apiKey: process.env.TAVILY_API_KEY,
            maxResults: 3
        });

        return {
            name: "search",
            description: "Search the web for current information on a topic or question",
            execute: async (query: string) => {
                try {
                    console.log(`🔍 Executing search for: "${query}"`);
                    const results = await tavilySearch.invoke(query);
                    return JSON.stringify(results);
                } catch (error) {
                    console.error("Error with search tool:", error);
                    if (error instanceof Error) {
                        return `Error performing search: ${error.message}`;
                    } else {
                        return "Error performing search: An unknown error occurred.";
                    }
                }
            }
        };
    } catch (error) {
        console.error("Failed to initialize Tavily search:", error);
        return null;
    }
}