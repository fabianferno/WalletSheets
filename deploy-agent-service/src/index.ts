import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Interface for the request body
interface DeployAgentRequest {
    name: string;
    config?: string;
    metadata?: Record<string, any>;
    envList?: Record<string, string>;
}

// Interface for the response from Autonome
interface AutonomeResponse {
    app?: {
        id: string;
    };
    error?: string;
}

/**
 * Deploy an agent to Autonome
 */
app.post('/deploy-agent', async (req: Request, res: Response) => {
    try {
        const { name, config = "{}", metadata = {}, envList = {} } = req.body as DeployAgentRequest;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Agent name is required'
            });
        }

        // Get authentication and endpoint info from environment variables
        const autonomeJwt = process.env.AUTONOME_JWT_TOKEN;
        const autonomeRpc = process.env.AUTONOME_RPC_ENDPOINT;

        if (!autonomeJwt || !autonomeRpc) {
            return res.status(500).json({
                success: false,
                error: 'Missing Autonome configuration in server environment'
            });
        }

        // Prepare request body
        const requestBody = {
            name,
            config,
            creationMethod: 2,
            envList,
            templateId: "Eliza",
            ...metadata
        };

        console.log('Deploying agent with configuration:', {
            name: requestBody.name,
            templateId: requestBody.templateId,
            // Don't log sensitive information
            hasConfig: !!requestBody.config,
            hasEnvList: Object.keys(requestBody.envList).length > 0
        });

        // Make request to Autonome service
        const response = await axios.post<AutonomeResponse>(autonomeRpc, requestBody, {
            headers: {
                Authorization: `Bearer ${autonomeJwt}`,
                'Content-Type': 'application/json'
            }
        });

        // Handle the response
        if (response.data?.app?.id) {
            const appUrl = `https://dev.autonome.fun/autonome/${response.data.app.id}/details`;
            console.log(`Agent "${name}" successfully deployed at: ${appUrl}`);

            return res.status(200).json({
                success: true,
                name,
                appId: response.data.app.id,
                appUrl
            });
        } else {
            // Unexpected response format
            console.error('Unexpected response format from Autonome service:', response.data);

            return res.status(500).json({
                success: false,
                error: 'Unexpected response from Autonome service',
                details: response.data
            });
        }
    } catch (error: any) {
        console.error('Error deploying agent:', error.message);

        // Extract the error message from the Autonome service if available
        const autonomeError = error.response?.data?.error || error.message;

        return res.status(500).json({
            success: false,
            error: 'Failed to deploy agent',
            details: autonomeError
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});