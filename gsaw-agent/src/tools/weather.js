/**
 * Initialize the weather tool
 */
export async function initializeWeatherTool() {
    const examples = [
        {
            userQuery: "What's the weather like in New York?",
            toolInput: "New York",
            toolOutput: JSON.stringify({
                location: "New York",
                temperature: 22,
                condition: "Partly Cloudy",
                humidity: 65,
                windSpeed: 12,
                updated: "2025-03-22T14:30:00.000Z",
            }),
            finalResponse: "In New York right now, it's 22°C (72°F) and partly cloudy. The humidity is at 65% with winds at 12 km/h. This data was last updated about an hour ago.",
        },
        {
            userQuery: "Should I bring an umbrella to London today?",
            toolInput: "London",
            toolOutput: JSON.stringify({
                location: "London",
                temperature: 14,
                condition: "Rainy",
                humidity: 82,
                windSpeed: 18,
                updated: "2025-03-22T15:15:00.000Z",
            }),
            finalResponse: "Yes, you should definitely bring an umbrella to London today. The current weather shows it's rainy with a temperature of 14°C (57°F). The humidity is high at 82%, and there are winds of 18 km/h. I'd recommend a waterproof jacket along with that umbrella!",
        },
    ];

    return {
        name: "weather",
        description: "Get current weather information for a location",
        examples,
        execute: async (location, agent) => {
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
                    updated: new Date().toISOString(),
                };

                return JSON.stringify(mockWeather);
            } catch (error) {
                if (error instanceof Error) {
                    return `Error getting weather: ${error.message}`;
                }
                return "Error getting weather: An unknown error occurred.";
            }
        },
    };
}
