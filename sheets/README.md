# Google Sheets API Client

A TypeScript client for interacting with Google Sheets API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create Google Cloud Project and enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API
   - Create credentials (Service Account or API Key)
   - Download the JSON credentials file

3. Build the TypeScript code:
```bash
npm run build
```

## Usage

```typescript
import { SheetClient } from './scripts/sheets.api';

// Initialize with sheet ID and optional credentials file
const client = new SheetClient('your-sheet-id', 'path/to/credentials.json');

// Or initialize with URL
const client = new SheetClient('https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0');

// Example usage
async function example() {
  // Get all values from a sheet
  const values = await client.getSheetValues('Sheet1');
  console.log(values);
  
  // Get a specific cell
  const cell = await client.getCellValue('Sheet1', 1, 'A');
  console.log(cell);
  
  // Get a column
  const column = await client.getColumn('Sheet1', 'B');
  console.log(column);
  
  // Append rows
  await client.appendRows('Sheet1', [
    ['John', 'Doe', 30],
    ['Jane', 'Smith', 25]
  ]);
}

example().catch(console.error);
```

## Available Methods

The client provides numerous methods for working with spreadsheets:

- **Reading Data**:
  - `getSheetValues(sheetName)` - Get all values from a sheet
  - `getRange(range)` - Get values from a specific range
  - `getCellValue(sheetName, row, column)` - Get a specific cell value
  - `getColumn(sheetName, column)` - Get an entire column
  - `getRow(sheetName, row)` - Get an entire row
  
- **Writing Data**:
  - `setCellValue(sheetName, row, column, value)` - Set a value in a specific cell
  - `setRangeValues(range, values)` - Set values in a range
  - `appendRows(sheetName, rows)` - Append rows to a sheet
  - `clearRange(range)` - Clear a range of cells
  
- **Sheet Management**:
  - `createSheet(title)` - Create a new sheet (tab)
  - `deleteSheet(sheetId)` - Delete a sheet
  - `getAllSheets()` - Get all sheets in the spreadsheet
  - `getSheetIdByName(sheetName)` - Get the ID of a sheet by name
  
- **Rows and Columns**:
  - `insertRow(sheetId, rowIndex)` - Insert a row
  - `insertColumn(sheetId, columnIndex)` - Insert a column
  - `deleteRow(sheetId, rowIndex)` - Delete a row
  - `deleteColumn(sheetId, columnIndex)` - Delete a column
  
- **Formatting and Sorting**:
  - `formatRange(sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, format)` - Format a range
  - `sortRange(sheetId, startRowIndex, endRowIndex, startColumnIndex, endColumnIndex, sortColumnIndex, ascending)` - Sort a range
  
- **Search**:
  - `searchInSheet(sheetName, searchValue)` - Search for a value in a sheet
