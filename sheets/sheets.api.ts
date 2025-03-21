import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";

/**
 * SheetClient - A class to interact with Google Sheets
 *
 * This client provides methods to read, write, and manipulate data in Google Sheets.
 */
export class SheetClient {
  private sheetId: string;
  private sheets: sheets_v4.Sheets;

  /**
   * Constructor for the SheetClient
   * @param sheetIdOrUrl - Either the Google Sheets ID or a share URL
   * @param keyFilePath - Path to the service account credentials file (optional)
   */
  constructor(sheetIdOrUrl: string, keyFilePath?: string) {
    this.sheetId = this.extractSheetId(sheetIdOrUrl);

    // Initialize the Google Sheets API client
    const auth = keyFilePath
      ? new GoogleAuth({
          keyFile: keyFilePath,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        })
      : undefined; // For cases when using API key or default credentials

    this.sheets = google.sheets({ version: "v4", auth });
  }

  /**
   * Extracts the sheet ID from a sheets URL or returns the ID directly
   */
  private extractSheetId(sheetIdOrUrl: string): string {
    // Check if it's a URL
    if (sheetIdOrUrl.includes("spreadsheets/d/")) {
      const match = sheetIdOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        return match[1];
      }
      throw new Error("Invalid Google Sheets URL format");
    }

    // Assume it's already an ID
    return sheetIdOrUrl;
  }

  /**
   * Get all values from a specific sheet
   * @param sheetName - Name of the sheet (tab)
   * @returns Promise with the sheet values
   */
  async getSheetValues(sheetName: string): Promise<any[][]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: sheetName,
    });

    return response.data.values || [];
  }

  /**
   * Get values from a specific range
   * @param range - Range in A1 notation, e.g., "Sheet1!A1:B10"
   * @returns Promise with the range values
   */
  async getRange(range: string): Promise<any[][]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range,
    });

    return response.data.values || [];
  }

  /**
   * Get a specific cell value
   * @param sheetName - Name of the sheet
   * @param row - Row index (1-based)
   * @param column - Column index (1-based) or column letter (A, B, etc.)
   * @returns Promise with the cell value
   */
  async getCellValue(
    sheetName: string,
    row: number,
    column: number | string
  ): Promise<any> {
    const colLetter =
      typeof column === "string" ? column : this.columnIndexToLetter(column);
    const range = `${sheetName}!${colLetter}${row}`;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range,
    });

    const values = response.data.values;
    return values && values.length > 0 ? values[0][0] : null;
  }

  /**
   * Get an entire column
   * @param sheetName - Name of the sheet
   * @param column - Column index (1-based) or letter
   * @returns Promise with the column values
   */
  async getColumn(sheetName: string, column: number | string): Promise<any[]> {
    const colLetter =
      typeof column === "string" ? column : this.columnIndexToLetter(column);
    const range = `${sheetName}!${colLetter}:${colLetter}`;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range,
    });

    const values = response.data.values || [];
    return values.map((row: any[]) => row[0]);
  }

  /**
   * Get an entire row
   * @param sheetName - Name of the sheet
   * @param row - Row index (1-based)
   * @returns Promise with the row values
   */
  async getRow(sheetName: string, row: number): Promise<any[]> {
    const range = `${sheetName}!${row}:${row}`;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range,
    });

    const values = response.data.values;
    return values && values.length > 0 ? values[0] : [];
  }

  /**
   * Set a value in a specific cell
   * @param sheetName - Name of the sheet
   * @param row - Row index (1-based)
   * @param column - Column index (1-based) or letter
   * @param value - Value to set
   */
  async setCellValue(
    sheetName: string,
    row: number,
    column: number | string,
    value: any
  ): Promise<void> {
    const colLetter =
      typeof column === "string" ? column : this.columnIndexToLetter(column);
    const range = `${sheetName}!${colLetter}${row}`;

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });
  }

  /**
   * Set values in a range
   * @param range - Range in A1 notation
   * @param values - 2D array of values to set
   */
  async setRangeValues(range: string, values: any[][]): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  }

  /**
   * Append rows to a sheet
   * @param sheetName - Name of the sheet
   * @param rows - Array of rows to append, each row is an array of values
   */
  async appendRows(sheetName: string, rows: any[][]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows,
      },
    });
  }

  /**
   * Clear a range of cells
   * @param range - Range in A1 notation
   */
  async clearRange(range: string): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.sheetId,
      range,
    });
  }

  /**
   * Insert a row at a specific position
   * @param sheetId - The sheet ID (not spreadsheet ID, but the sheet tab ID)
   * @param rowIndex - Index where to insert the row (0-based)
   */
  async insertRow(sheetId: number, rowIndex: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
              inheritFromBefore: rowIndex > 0,
            },
          },
        ],
      },
    });
  }

  /**
   * Insert a column at a specific position
   * @param sheetId - The sheet ID (not spreadsheet ID, but the sheet tab ID)
   * @param columnIndex - Index where to insert the column (0-based)
   */
  async insertColumn(sheetId: number, columnIndex: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: columnIndex,
                endIndex: columnIndex + 1,
              },
              inheritFromBefore: columnIndex > 0,
            },
          },
        ],
      },
    });
  }

  /**
   * Delete a specific row
   * @param sheetId - The sheet ID (not spreadsheet ID, but the sheet tab ID)
   * @param rowIndex - Index of the row to delete (0-based)
   */
  async deleteRow(sheetId: number, rowIndex: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  }

  /**
   * Delete a specific column
   * @param sheetId - The sheet ID (not spreadsheet ID, but the sheet tab ID)
   * @param columnIndex - Index of the column to delete (0-based)
   */
  async deleteColumn(sheetId: number, columnIndex: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex: columnIndex,
                endIndex: columnIndex + 1,
              },
            },
          },
        ],
      },
    });
  }

  /**
   * Get the ID of a sheet by name
   * @param sheetName - Name of the sheet to find
   * @returns Promise with the sheet ID
   */
  async getSheetIdByName(sheetName: string): Promise<number> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.sheetId,
    });

    const sheet = response.data.sheets?.find(
      (s: any) => s.properties?.title === sheetName
    );

    if (!sheet || !sheet.properties?.sheetId) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    return sheet.properties.sheetId;
  }

  /**
   * Create a new sheet (tab)
   * @param title - Title of the new sheet
   * @returns Promise with the new sheet's ID
   */
  async createSheet(title: string): Promise<number> {
    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      },
    });

    const reply = response.data.replies?.[0]?.addSheet?.properties;
    if (!reply || !reply.sheetId) {
      throw new Error("Failed to create sheet");
    }

    return reply.sheetId;
  }

  /**
   * Delete a sheet (tab)
   * @param sheetId - ID of the sheet to delete
   */
  async deleteSheet(sheetId: number): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId,
            },
          },
        ],
      },
    });
  }

  /**
   * Format a range of cells
   * @param sheetId - The sheet ID
   * @param startRowIndex - Start row index (0-based)
   * @param endRowIndex - End row index (exclusive)
   * @param startColumnIndex - Start column index (0-based)
   * @param endColumnIndex - End column index (exclusive)
   * @param format - Format to apply (see Google Sheets API documentation)
   */
  async formatRange(
    sheetId: number,
    startRowIndex: number,
    endRowIndex: number,
    startColumnIndex: number,
    endColumnIndex: number,
    format: sheets_v4.Schema$CellFormat
  ): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex,
                endRowIndex,
                startColumnIndex,
                endColumnIndex,
              },
              cell: {
                userEnteredFormat: format,
              },
              fields: "userEnteredFormat",
            },
          },
        ],
      },
    });
  }

  /**
   * Search for a value in a sheet
   * @param sheetName - Name of the sheet to search in
   * @param searchValue - Value to search for
   * @returns Promise with array of positions where the value was found
   */
  async searchInSheet(
    sheetName: string,
    searchValue: any
  ): Promise<{ row: number; column: number }[]> {
    const values = await this.getSheetValues(sheetName);
    const results: { row: number; column: number }[] = [];

    values.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        // String comparison to handle different data types
        if (String(cell) === String(searchValue)) {
          // Return 1-based indices to match the Google Sheets UI
          results.push({ row: rowIndex + 1, column: colIndex + 1 });
        }
      });
    });

    return results;
  }

  /**
   * Sort a range by a specific column
   * @param sheetId - The sheet ID
   * @param startRowIndex - Start row index of the range (0-based)
   * @param endRowIndex - End row index of the range (exclusive)
   * @param startColumnIndex - Start column index of the range (0-based)
   * @param endColumnIndex - End column index of the range (exclusive)
   * @param sortColumnIndex - Index of the column to sort by (0-based, relative to the start of the range)
   * @param ascending - Whether to sort in ascending (true) or descending (false) order
   */
  async sortRange(
    sheetId: number,
    startRowIndex: number,
    endRowIndex: number,
    startColumnIndex: number,
    endColumnIndex: number,
    sortColumnIndex: number,
    ascending: boolean = true
  ): Promise<void> {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        requests: [
          {
            sortRange: {
              range: {
                sheetId,
                startRowIndex,
                endRowIndex,
                startColumnIndex,
                endColumnIndex,
              },
              sortSpecs: [
                {
                  dimensionIndex: sortColumnIndex,
                  sortOrder: ascending ? "ASCENDING" : "DESCENDING",
                },
              ],
            },
          },
        ],
      },
    });
  }

  /**
   * Get all sheets in the spreadsheet
   * @returns Promise with array of sheet info objects
   */
  async getAllSheets(): Promise<{ id: number; title: string }[]> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.sheetId,
    });

    return (
      response.data.sheets?.map((sheet: any) => ({
        id: sheet.properties?.sheetId as number,
        title: sheet.properties?.title as string,
      })) || []
    );
  }

  /**
   * Convert a column index to a letter (e.g., 1 -> A, 2 -> B)
   * @param columnIndex - 1-based column index
   * @returns Column letter
   */
  private columnIndexToLetter(columnIndex: number): string {
    let letter = "";
    let temp = columnIndex;

    while (temp > 0) {
      const remainder = (temp - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      temp = Math.floor((temp - 1) / 26);
    }

    return letter;
  }

  /**
   * Convert a column letter to an index (e.g., A -> 1, B -> 2)
   * @param columnLetter - Column letter
   * @returns 1-based column index
   */
  private columnLetterToIndex(columnLetter: string): number {
    let sum = 0;
    for (let i = 0; i < columnLetter.length; i++) {
      sum = sum * 26;
      sum = sum + (columnLetter.charCodeAt(i) - 64);
    }
    return sum;
  }
}

// Example usage
/*
// Initialize with sheet ID
const client = new SheetClient('your-sheet-id', 'path/to/credentials.json');

// Or initialize with URL
const client = new SheetClient('https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0');

// Read data
async function example() {
  // Get all values from a sheet
  const values = await client.getSheetValues('Sheet1');
  
  // Get a specific cell
  const cell = await client.getCellValue('Sheet1', 1, 'A');
  
  // Append rows
  await client.appendRows('Sheet1', [
    ['John', 'Doe', 30],
    ['Jane', 'Smith', 25]
  ]);
}
*/
