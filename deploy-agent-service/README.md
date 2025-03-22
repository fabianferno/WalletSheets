# Autonome Agent Deployment Server

An Express TypeScript server that accepts agent deployment requests and interfaces with the Autonome service to deploy AI agents.

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your Autonome JWT token and RPC endpoint

## Running the Server

### Development mode
```
npm run dev
```

### Production
```
npm run build
npm start
```

## API Usage

### Deploy an Agent

**Endpoint:** `POST /deploy-agent`

**Request Body:**
```json
{
  "name": "agent-name",
  "config": "{\"optional\":\"JSON configuration string\"}",
  "metadata": {
    "optional": "additional metadata"
  },
  "envList": {
    "ENV_VAR1": "value1",
    "ENV_VAR2": "value2"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "name": "agent-name",
  "appId": "unique-app-id",
  "appUrl": "https://dev.autonome.fun/autonome/unique-app-id/details"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details if available"
}
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `AUTONOME_JWT_TOKEN`: JWT token for authenticating with the Autonome service
- `AUTONOME_RPC_ENDPOINT`: URL of the Autonome RPC endpoint