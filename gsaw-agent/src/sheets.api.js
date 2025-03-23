import { google, sheets_v4 } from "googleapis";
import { GoogleAuth } from "google-auth-library";

/**
 * SheetClient - A class to interact with Google Sheets
 *
 * This client provides methods to read, write, and manipulate data in Google Sheets.
 */
export class SheetClient {
  sheetId;
  sheets;

  /**
   * Constructor for the SheetClient
   * @param sheetIdOrUrl - Either the Google Sheets ID or a share URL
   * @param keyFilePath - Path to the service account credentials file (optional)
   */
  constructor(sheetIdOrUrl, keyFilePath) {
    this.sheetId = this.extractSheetId(sheetIdOrUrl);

    console.log(`🔑 Creating SheetClient for sheet ID: ${this.sheetId}`);
    console.log(
      `📄 Using credentials file: ${keyFilePath || "default credentials"}`
    );

    // Initialize the Google Sheets API client
    try {
      const auth = keyFilePath
        ? new GoogleAuth({
            keyFile: keyFilePath,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
          })
        : undefined; // For cases when using API key or default credentials

      console.log(
        `🔐 Created GoogleAuth instance with scopes: https://www.googleapis.com/auth/spreadsheets`
      );

      this.sheets = google.sheets({ version: "v4", auth });
      console.log(`✅ Successfully created Google Sheets API client`);
    } catch (error) {
      console.error(`❌ Error creating Google Sheets API client:`, error);
      throw error;
    }
  }

  /**
   * Extracts the sheet ID from a sheets URL or returns the ID directly
   */
  extractSheetId(sheetIdOrUrl) {
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
   * @returns Promise resolving to a 2D array of values
   */
  async getSheetValues(sheetName) {
    try {
      console.log(
        `📡 Making API request to get values from sheet: "${sheetName}"`
      );
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `${sheetName}!A1:ZZ`,
      });

      console.log(`✅ Successfully retrieved values from "${sheetName}"`);

      if (!response.data.values) {
        console.log(`⚠️ No values found in "${sheetName}" sheet`);
        return [];
      }

      return response.data.values;
    } catch (error) {
      console.error(`❌ Error getting sheet values for "${sheetName}"`);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
      }
      throw error;
    }
  }

  /**
   * Get values from a specific range
   * @param range - Range in A1 notation, e.g., "Sheet1!A1:B10"
   * @returns Promise with the range values
   */
  async getRange(range) {
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
  async getCellValue(sheetName, row, column) {
    try {
      // First check if the sheet exists and has enough rows
      try {
        const sheetValues = await this.getSheetValues(sheetName);
        // Check if the sheet has enough rows
        if (sheetValues.length < row) {
          console.log(
            `Sheet ${sheetName} doesn't have row ${row}, returning empty value`
          );
          return "";
        }
      } catch (error) {
        console.log(
          `Error accessing sheet ${sheetName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return ""; // Return empty string if sheet doesn't exist
      }

      // Convert column to letter if it's a number
      const colLetter =
        typeof column === "string" ? column : this.columnIndexToLetter(column);
      const range = `${sheetName}!${colLetter}${row}`;

      try {
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range,
        });

        const values = response.data.values;
        return values && values.length > 0 ? values[0][0] : "";
      } catch (error) {
        console.log(`Error getting cell value for ${range}: ${error.message}`);

        // If the error is about an invalid range, it's likely that the sheet structure is not as expected
        if (error.message && error.message.includes("Unable to parse range")) {
          return ""; // Return empty string on range parsing errors
        }

        throw error;
      }
    } catch (error) {
      console.error(
        `Error in getCellValue for ${sheetName}!${column}${row}:`,
        error
      );
      return ""; // Return empty string on any error
    }
  }

  /**
   * Get an entire column
   * @param sheetName - Name of the sheet
   * @param column - Column index (1-based) or letter
   * @returns Promise with the column values
   */
  async getColumn(sheetName, column) {
    const colLetter =
      typeof column === "string" ? column : this.columnIndexToLetter(column);
    const range = `${sheetName}!${colLetter}:${colLetter}`;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range,
    });

    const values = response.data.values || [];
    return values.map((row) => row[0]);
  }

  /**
   * Get an entire row
   * @param sheetName - Name of the sheet
   * @param row - Row index (1-based)
   * @returns Promise with the row values
   */
  async getRow(sheetName, row) {
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
  async setCellValue(sheetName, row, column, value) {
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
  async setRangeValues(range, values) {
    // Convert boolean values to proper format for Google Sheets checkboxes
    const processedValues = values.map((row) =>
      row.map((value) => {
        if (typeof value === "boolean") {
          return value; // Pass boolean values directly
        }
        return value;
      })
    );

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: processedValues,
      },
    });
  }

  /**
   * Append rows to a sheet
   * @param sheetName - Name of the sheet
   * @param rows - Array of rows to append, each row is an array of values
   */
  async appendRows(sheetName, rows) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${sheetName}!A1`,
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
  async clearRange(range) {
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
  async insertRow(sheetId, rowIndex) {
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
  async insertColumn(sheetId, columnIndex) {
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
  async deleteRow(sheetId, rowIndex) {
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
  async deleteColumn(sheetId, columnIndex) {
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
  async getSheetIdByName(sheetName) {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.sheetId,
    });

    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === sheetName
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
  async createSheet(title) {
    try {
      // Check if the sheet already exists
      try {
        const allSheets = await this.getAllSheets();
        const existingSheet = allSheets.find((sheet) => sheet.title === title);
        if (existingSheet) {
          console.log(
            `Sheet "${title}" already exists with ID ${existingSheet.id}`
          );
          return existingSheet.id;
        }
      } catch (error) {
        console.log(`Error checking if sheet "${title}" exists:`, error);
        // Continue with creation even if check fails
      }

      // Create the new sheet
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

      console.log(
        `Successfully created sheet "${title}" with ID ${reply.sheetId}`
      );
      return reply.sheetId;
    } catch (error) {
      // Check for "already exists" error
      if (error.message && error.message.includes("already exists")) {
        console.log(`Sheet "${title}" already exists, trying to get its ID`);
        // If sheet already exists, get its ID
        const allSheets = await this.getAllSheets();
        const existingSheet = allSheets.find((sheet) => sheet.title === title);
        if (existingSheet) {
          return existingSheet.id;
        }
      }

      // Re-throw other errors
      console.error(`Error creating sheet "${title}":`, error);
      throw error;
    }
  }

  /**
   * Delete a sheet (tab)
   * @param sheetId - ID of the sheet to delete
   */
  async deleteSheet(sheetId) {
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
    sheetId,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
    format
  ) {
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
  async searchInSheet(sheetName, searchValue) {
    const values = await this.getSheetValues(sheetName);
    const results = [];

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
    sheetId,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
    sortColumnIndex,
    ascending = true
  ) {
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
  async getAllSheets() {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.sheetId,
    });

    return (
      response.data.sheets?.map((sheet) => ({
        id: sheet.properties?.sheetId,
        title: sheet.properties?.title,
      })) || []
    );
  }

  /**
   * Convert a column index to a letter (e.g., 1 -> A, 2 -> B)
   * @param columnIndex - 1-based column index
   * @returns Column letter
   */
  columnIndexToLetter(columnIndex) {
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
  columnLetterToIndex(columnLetter) {
    let sum = 0;
    for (let i = 0; i < columnLetter.length; i++) {
      sum = sum * 26;
      sum = sum + (columnLetter.charCodeAt(i) - 64);
    }
    return sum;
  }

  /**
   * Get metadata about all sheets in the spreadsheet
   */
  async getSheetMetadata() {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.sheetId,
    });

    if (!response.data.sheets) {
      return [];
    }

    const sheets = [];

    for (const sheet of response.data.sheets) {
      const props = sheet.properties;
      if (
        props &&
        typeof props.sheetId === "number" &&
        typeof props.title === "string"
      ) {
        sheets.push({
          sheetId: props.sheetId,
          title: props.title,
        });
      }
    }

    return sheets;
  }

  /**
   * Apply batch updates to the spreadsheet
   */
  async batchUpdate(body) {
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: body,
    });
  }
}
