# Setting Up Google Sheets API Credentials

Follow these steps to set up credentials for the Google Sheets API:

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select "New Project"
3. Enter a project name and click "Create"

## 2. Enable the Google Sheets API

1. In your project, navigate to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and then click "Enable"

## 3. Create Service Account Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create credentials" and select "Service account"
3. Enter a name for your service account
4. Click "Create and continue"
5. For the role, select "Project" > "Editor" (or a more restricted role if preferred)
6. Click "Continue" and then "Done"

## 4. Generate and Download Service Account Key

1. In the Credentials page, click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" and click "Create"
5. A JSON file will be downloaded to your computer
6. Rename this file to `credentials.json` and place it in the root directory of this project

## 5. Share Your Google Sheet

1. For the service account to access your Google Sheet, you need to share the sheet with the service account email
2. Open your Google Sheet
3. Click the "Share" button in the top right
4. Enter the service account email (found in the `client_email` field of your credentials.json file)
5. Grant "Editor" access (or viewer if you only need read-only access)
6. Click "Share"

## 6. Update Your Code

In your code, reference the credentials file:

```typescript
// Initialize with sheet ID and credentials
const client = new SheetClient('your-sheet-id', './credentials.json');

// Or with a Google Sheets URL
const client = new SheetClient('https://docs.google.com/spreadsheets/d/your-sheet-id/edit', './credentials.json');
```

## Security Notes

- **NEVER commit your credentials.json file to version control**
- The file has been added to .gitignore to prevent accidental commits
- If you need to share your project, use environment variables or a secrets manager to store credentials
- Only grant the minimum necessary permissions to your service account 