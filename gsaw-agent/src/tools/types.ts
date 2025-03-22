/**
 * Base interface for all tools
 */
export interface Tool {
    name: string;
    description: string;
    execute: (input: string) => Promise<string>;
}

/**
 * Tool registration function type
 */
export type ToolFactory = () => Promise<Tool | null>;