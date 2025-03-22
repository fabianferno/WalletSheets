# WalletSheets Chat Feature

This document explains how to use the new Chat feature in your WalletSheets agent.

## Overview

The Chat feature provides a conversational interface to interact with your WalletSheets agent directly within Google Sheets. You can ask questions about your wallet, transactions, and get help using the various features.

## How to Use

1. Open your Google Sheet that's connected to the WalletSheets agent
2. Navigate to the "Chat" tab
3. In the "Your message:" input field (cell B5), type your message
4. Press Enter to send your message
5. The agent will respond in the chat history section below

## Example Questions

You can ask the agent questions like:

- "Hello" - Get a greeting from the agent
- "Help" - Get general help about what the agent can do
- "How do I check my balance?" - Get instructions for checking your wallet balance
- "How do I view my transactions?" - Learn how to view your transaction history
- "How do I connect to a dApp?" - Get instructions for connecting to decentralized applications

## Chat History

Your conversation history is saved directly in the sheet. New messages appear at the top of the history section, with the most recent conversations always visible.

## Customization

The Chat feature automatically connects to your existing agent API. The API endpoint used for the chat service is configured to use either an environment variable `AGENT_API_URL` or the default `/api/agent/message`. 

If you need to modify this configuration, you can update it in the `sheets/utils/sheetUtils.ts` file in the `monitorChatSheet` function.

## Troubleshooting

If you encounter issues with the Chat feature:

1. Make sure your agent service is running
2. Check that your Google Sheet has permission to make API requests to your service
3. If messages aren't sending, try refreshing the sheet or reopening it
4. Verify your agent API is working by testing it directly
5. Check your agent service logs for any error messages

For more advanced troubleshooting, check if there are any CORS issues or network connectivity problems between Google Sheets and your agent service. 