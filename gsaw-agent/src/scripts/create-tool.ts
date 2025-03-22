import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Tool template content
function getToolTemplate(toolName: string, toolDescription: string): string {
    const camelCaseName = toolName.charAt(0).toLowerCase() + toolName.slice(1);

    return `import { Tool } from './types';

/**
 * Initialize the ${camelCaseName} tool
 */
export async function initialize${toolName}Tool(): Promise<Tool | null> {
    // Add any initialization logic or environment variable checks here
    
    return {
        name: "${camelCaseName}",
        description: "${toolDescription}",
        execute: async (input: string) => {
            try {
                console.log(\`🔧 Executing ${camelCaseName} tool with input: "\${input}"\`);
                
                // Implement your tool logic here
                // This is where you'd call your API or perform your function
                
                // Mock response - replace with actual implementation
                const result = {
                    input,
                    result: "Your implementation here",
                    timestamp: new Date().toISOString()
                };

                return JSON.stringify(result);
            } catch (error) {
                console.error("Error with ${camelCaseName} tool:", error);
                if (error instanceof Error) {
                    return \`Error executing ${camelCaseName}: \${error.message}\`;
                } else {
                    return "Error executing ${camelCaseName}: An unknown error occurred.";
                }
            }
        }
    };
}
`;
}

// Function to update index.ts to include the new tool
function updateIndexFile(toolName: string): void {
    const indexPath = path.join(process.cwd(), 'src', 'tools', 'index.ts');
    let indexContent = fs.readFileSync(indexPath, 'utf8');

    // Add import statement
    const importStatement = `import { initialize${toolName}Tool } from './${toolName.toLowerCase()}';\n`;
    const importLocation = indexContent.lastIndexOf('import');

    // Find the last import statement and insert after it
    const lastImportEndIndex = indexContent.indexOf(';', importLocation) + 1;
    indexContent = indexContent.slice(0, lastImportEndIndex) + '\n' + importStatement + indexContent.slice(lastImportEndIndex);

    // Add to toolFactories array
    const arrayPattern = /const toolFactories: ToolFactory\[\] = \[([\s\S]*?)\];/;
    const arrayMatch = indexContent.match(arrayPattern);

    if (arrayMatch) {
        const currentArrayContent = arrayMatch[1];
        const updatedArrayContent = currentArrayContent.includes('// Add new tool factories here')
            ? currentArrayContent.replace('// Add new tool factories here', `initialize${toolName}Tool,\n        // Add new tool factories here`)
            : currentArrayContent + `\n        initialize${toolName}Tool,`;

        indexContent = indexContent.replace(arrayPattern, `const toolFactories: ToolFactory[] = [${updatedArrayContent}];`);
    }

    fs.writeFileSync(indexPath, indexContent, 'utf8');
}

// Main function to create a tool
async function createTool(): Promise<void> {
    // Check if tools directory exists
    const toolsDir = path.join(process.cwd(), 'src', 'tools');
    if (!fs.existsSync(toolsDir)) {
        fs.mkdirSync(toolsDir, { recursive: true });
        console.log('Created tools directory');
    }

    // Get tool name from argument or prompt
    let toolName = process.argv[2];
    if (!toolName) {
        toolName = await new Promise(resolve => {
            rl.question('Enter the tool name (PascalCase, e.g., "Calculator"): ', resolve);
        });
    }

    // Validate tool name
    toolName = toolName.trim();
    if (!toolName) {
        console.error('Tool name is required!');
        rl.close();
        return;
    }

    // Make sure first letter is uppercase for PascalCase
    toolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);

    // Get tool description
    const toolDescription = await new Promise<string>(resolve => {
        rl.question('Enter a brief description for the tool: ', resolve);
    });

    // Create tool file
    const fileName = `${toolName.toLowerCase()}.ts`;
    const filePath = path.join(toolsDir, fileName);

    if (fs.existsSync(filePath)) {
        const overwrite = await new Promise<string>(resolve => {
            rl.question(`Tool file ${fileName} already exists. Overwrite? (y/N): `, resolve);
        });

        if (overwrite.toLowerCase() !== 'y') {
            console.log('Operation cancelled');
            rl.close();
            return;
        }
    }

    // Write the tool file
    fs.writeFileSync(filePath, getToolTemplate(toolName, toolDescription));

    // Update the index.ts file
    updateIndexFile(toolName);

    console.log(`\n✅ Created tool: ${toolName} in ${filePath}`);
    console.log(`✅ Updated tools/index.ts to include the new tool`);
    console.log('\nNext steps:');
    console.log(`1. Implement your tool's logic in the execute function`);
    console.log(`2. Add any necessary environment variables or configuration`);

    rl.close();
}

// Run the function
createTool().catch(error => {
    console.error('Error creating tool:', error);
    process.exit(1);
});