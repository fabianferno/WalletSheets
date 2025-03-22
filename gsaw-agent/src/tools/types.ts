/**
 * Example of a tool usage
 */
export interface ToolExample {
    userQuery: string;
    toolInput: string;
    toolOutput: string;
    finalResponse: string;
}

/**
 * Base interface for all tools
 */
export interface Tool {
    name: string;
    description: string;
    examples: ToolExample[];
    execute: (input: string) => Promise<string>;
}

/**
 * Tool registration function type
 */
export type ToolFactory = () => Promise<Tool | null>;