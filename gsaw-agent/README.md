# Agent Tool System

This system provides a modular way to add tools to your agent service. Tools are functions that the agent can use to interact with external services or perform specific computations.

## Directory Structure

```
src/
  ├── tools/
  │   ├── index.ts         # Tool loader and registration
  │   ├── types.ts         # Tool interface definitions
  │   ├── search.ts        # Search tool implementation
  │   ├── weather.ts       # Weather tool implementation
  │   └── ...              # Other tool implementations
  ├── services/
  │   └── AgentService.ts  # Uses the tools
  └── ...
```

## Creating a New Tool

You can create a new tool using the CLI command:

```bash
npm run create-tool
```

Or with a specific name:

```bash
npm run create-tool MyTool
```

The CLI will prompt you for the tool name (if not provided) and a description. It will then:

1. Create a new tool file in the `src/tools/` directory
2. Update the `src/tools/index.ts` file to register the new tool

## Tool Interface

Each tool must implement the `Tool` interface:

```typescript
interface ToolExample {
    userQuery: string;     // Example user query that would trigger this tool
    toolInput: string;     // Example input to the tool
    toolOutput: string;    // Example output from the tool
    finalResponse: string; // Example of assistant's final response using the tool output
}

interface Tool {
    name: string;          // Tool identifier used in tool calls
    description: string;   // Description shown to the LLM
    examples: ToolExample[]; // Example usage patterns for the LLM to learn from
    execute: (input: string) => Promise<string>;  // Tool implementation
}
```

## Tool Registration

Tools are registered in the `src/tools/index.ts` file. Each tool has an initialization function that returns a Tool object or null if the tool cannot be initialized (e.g., missing API key).

The `loadTools()` function calls all tool initializers and collects the successfully initialized tools.

## Using Tools

The AgentService loads all available tools during initialization. When processing a user message, it:

1. Sends the message to the LLM
2. Checks if the LLM response contains a tool call
3. If so, it extracts the tool name and input, executes the tool, and sends the result back to the LLM
4. The LLM then generates a final response incorporating the tool result

## Tips for Implementing Tools

1. Keep tools focused on a single purpose
2. Handle errors gracefully and return meaningful error messages
3. Use environment variables for sensitive information like API keys
4. Add proper logging for debugging
5. Return results as JSON strings for consistency
6. Provide comprehensive examples to help the LLM understand when and how to use your tool
7. Make your examples diverse to cover different use cases
8. Make sure your tool description clearly communicates its purpose and limitations