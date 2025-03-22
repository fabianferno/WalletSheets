// File: src/app/api/create-sheet/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

// Define the expected request body structure
interface RequestBody {
  sheetName: string;
  recipientEmail: string;
}

// Define the response structure
interface SheetResponse {
  message: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sharedWith: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = (await request.json()) as RequestBody;
    const { sheetName, recipientEmail } = body;

    // Validate input
    if (!sheetName || !recipientEmail) {
      return NextResponse.json(
        { message: "Sheet name and recipient email are required" },
        { status: 400 }
      );
    }

    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create a JWT client using the service account credentials
    const auth = new google.auth.GoogleAuth({
      // Use environment variable for service account key path
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    // Create Google Sheets API client
    const sheets = google.sheets({ version: "v4", auth });

    // Create Google Drive API client
    const drive = google.drive({ version: "v3", auth });

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: sheetName,
        },
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    if (!spreadsheetId) {
      throw new Error("Failed to get spreadsheet ID from Google API response");
    }

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // Share the spreadsheet with the recipient
    // Using the correct parameter structure as per the Drive API v3
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: "user",
        role: "writer", // Options: 'owner', 'writer', 'reader'
        emailAddress: recipientEmail,
      },
      // Set sendNotificationEmail as a parameter to the method, not in requestBody
      sendNotificationEmail: true,
    });

    // Prepare the success response
    const response: SheetResponse = {
      message: "Spreadsheet created and shared successfully",
      spreadsheetId,
      spreadsheetUrl,
      title: sheetName,
      sharedWith: recipientEmail,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error creating spreadsheet:", error);

    // Handle different error types
    let errorMessage = "Failed to create spreadsheet";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
