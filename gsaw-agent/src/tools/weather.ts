import { Tool } from './types';

/**
 * Initialize the weather tool
 */
export async function initializeWeatherTool(): Promise<Tool> {
    return {
        name: "weather",
        description: "Get current weather information for a location",
        execute: async (location: string) => {
            try {
                console.log(`🌤️ Getting weather for: "${location}"`);
                // This is a mock implementation
                // In a real scenario, you would call a weather API
                const mockWeather = {
                    location,
                    temperature: Math.floor(Math.random() * 30) + 5,
                    condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
                    humidity: Math.floor(Math.random() * 100),
                    windSpeed: Math.floor(Math.random() * 30),
                    updated: new Date().toISOString()
                };

                return JSON.stringify(mockWeather);
            } catch (error) {
                if (error instanceof Error) {
                    return `Error getting weather: ${error.message}`;
                } else {
                    return "Error getting weather: An unknown error occurred.";
                }
            }
        }
    };
}