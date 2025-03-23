import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

/**
 * SheetClient - A class to interact with Google Sheets
 *
 * This client provides methods to read, write, and manipulate data in Google Sheets.
 */
export class SheetClient {
  /**
   * Constructor for the SheetClient
   * @param {string} sheetIdOrUrl - Either the Google Sheets ID or a share URL
   * @param {string} keyFilePath - Path to the service account credentials file (optional)
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
        : new GoogleAuth({
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
          });

      this.sheets = google.sheets({
        version: "v4",
        auth,
      });

      console.log("✅ SheetClient initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize SheetClient:", error);
      throw error;
    }
  }

  /**
   * Extract the sheet ID from a URL or direct ID string
   * @param {string} sheetIdOrUrl - The Sheet ID or URL
   * @returns {string} - The extracted Sheet ID
   */
  extractSheetId(sheetIdOrUrl) {
    // Check if it's a URL
    if (sheetIdOrUrl.includes("spreadsheets/d/")) {
      const match = sheetIdOrUrl.match(/spreadsheets\/d\/([^/]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Assume it's already an ID
    return sheetIdOrUrl;
  }

  /**
   * Get all values from a sheet
   * @param {string} sheetName - The name of the sheet
   * @returns {Promise<any[][]>} - 2D array of values
   */
  async getSheetValues(sheetName) {
    try {
      console.log(`📊 Getting values from sheet: ${sheetName}`);
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: sheetName,
      });

      const values = response.data.values || [];
      console.log(
        `✅ Retrieved ${values.length} rows from sheet: ${sheetName}`
      );
      return values;
    } catch (error) {
      console.error(`❌ Error getting values from sheet ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Get values from a specific range
   * @param {string} range - The range to get (e.g., "Sheet1!A1:D10")
   * @returns {Promise<any[][]>} - 2D array of values
   */
  async getRange(range) {
    try {
      console.log(`📊 Getting values from range: ${range}`);
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range,
      });

      const values = response.data.values || [];
      return values;
    } catch (error) {
      console.error(`❌ Error getting range ${range}:`, error);
      throw error;
    }
  }

  /**
   * Get a single cell value
   * @param {string} sheetName - The name of the sheet
   * @param {number} row - The row number (1-indexed)
   * @param {number|string} column - The column as number or letter
   * @returns {Promise<any>} - The cell value
   */
  async getCellValue(sheetName, row, column) {
    try {
      let colLetter;
      if (typeof column === "number") {
        colLetter = this.columnIndexToLetter(column);
      } else {
        colLetter = column.toUpperCase();
      }

      const range = `${sheetName}!${colLetter}${row}`;
      console.log(`🔍 Getting cell value at: ${range}`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range,
      });

      const values = response.data.values;
      if (!values || values.length === 0) {
        console.log(`⚠️ No value found at ${range}`);
        return null;
      }

      return values[0][0];
    } catch (error) {
      console.error(
        `❌ Error getting cell value at [${sheetName}][${row}][${column}]:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all values from a column
   * @param {string} sheetName - The name of the sheet
   * @param {number|string} column - The column as number or letter
   * @returns {Promise<any[]>} - Array of values
   */
  async getColumn(sheetName, column) {
    try {
      let colLetter;
      if (typeof column === "number") {
        colLetter = this.columnIndexToLetter(column);
      } else {
        colLetter = column.toUpperCase();
      }

      const range = `${sheetName}!${colLetter}:${colLetter}`;
      console.log(`📊 Getting column values from: ${range}`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range,
      });

      const values = response.data.values || [];
      return values.map((row) => (row.length > 0 ? row[0] : null));
    } catch (error) {
      console.error(
        `❌ Error getting column values from [${sheetName}][${column}]:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all values from a row
   * @param {string} sheetName - The name of the sheet
   * @param {number} row - The row number (1-indexed)
   * @returns {Promise<any[]>} - Array of values
   */
  async getRow(sheetName, row) {
    try {
      const range = `${sheetName}!${row}:${row}`;
      console.log(`📊 Getting row values from: ${range}`);

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range,
      });

      const values = response.data.values;
      if (!values || values.length === 0) {
        console.log(`⚠️ No values found in row ${row}`);
        return [];
      }

      return values[0];
    } catch (error) {
      console.error(
        `❌ Error getting row values from [${sheetName}][${row}]:`,
        error
      );
      throw error;
    }
  }

  /**
   * Set a single cell value
   * @param {string} sheetName - The name of the sheet
   * @param {number} row - The row number (1-indexed)
   * @param {number|string} column - The column as number or letter
   * @param {any} value - The value to set
   * @returns {Promise<void>}
   */
  async setCellValue(sheetName, row, column, value) {
    try {
      let colLetter;
      if (typeof column === "number") {
        colLetter = this.columnIndexToLetter(column);
      } else {
        colLetter = column.toUpperCase();
      }

      const range = `${sheetName}!${colLetter}${row}`;
      console.log(`✏️ Setting cell value at: ${range} to: ${value}`);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [[value]],
        },
      });

      console.log(`✅ Updated cell value at ${range}`);
    } catch (error) {
      console.error(
        `❌ Error setting cell value at [${sheetName}][${row}][${column}]:`,
        error
      );
      throw error;
    }
  }

  /**
   * Set values for a range of cells
   * @param {string} range - The range to set (e.g., "Sheet1!A1:D10")
   * @param {any[][]} values - 2D array of values to set
   * @returns {Promise<void>}
   */
  async setRangeValues(range, values) {
    try {
      console.log(`✏️ Setting values for range: ${range}`);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: {
          values,
        },
      });

      console.log(`✅ Updated range: ${range}`);
    } catch (error) {
      console.error(`❌ Error setting range values for ${range}:`, error);
      throw error;
    }
  }

  /**
   * Append rows to a sheet
   * @param {string} sheetName - The name of the sheet
   * @param {any[][]} rows - 2D array of row values to append
   * @returns {Promise<void>}
   */
  async appendRows(sheetName, rows) {
    try {
      console.log(`➕ Appending ${rows.length} rows to sheet: ${sheetName}`);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: sheetName,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: rows,
        },
      });

      console.log(`✅ Appended ${rows.length} rows to sheet: ${sheetName}`);
    } catch (error) {
      console.error(`❌ Error appending rows to ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Clear a range of cells
   * @param {string} range - The range to clear (e.g., "Sheet1!A1:D10")
   * @returns {Promise<void>}
   */
  async clearRange(range) {
    try {
      console.log(`🧹 Clearing range: ${range}`);

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.sheetId,
        range,
      });

      console.log(`✅ Cleared range: ${range}`);
    } catch (error) {
      console.error(`❌ Error clearing range ${range}:`, error);
      throw error;
    }
  }

  /**
   * Insert a row at the specified index
   * @param {number} sheetId - The sheet ID
   * @param {number} rowIndex - The row index (0-indexed)
   * @returns {Promise<void>}
   */
  async insertRow(sheetId, rowIndex) {
    try {
      console.log(`➕ Inserting row at index: ${rowIndex}`);

      const request = {
        insertDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Inserted row at index: ${rowIndex}`);
    } catch (error) {
      console.error(`❌ Error inserting row at index ${rowIndex}:`, error);
      throw error;
    }
  }

  /**
   * Insert a column at the specified index
   * @param {number} sheetId - The sheet ID
   * @param {number} columnIndex - The column index (0-indexed)
   * @returns {Promise<void>}
   */
  async insertColumn(sheetId, columnIndex) {
    try {
      console.log(`➕ Inserting column at index: ${columnIndex}`);

      const request = {
        insertDimension: {
          range: {
            sheetId,
            dimension: "COLUMNS",
            startIndex: columnIndex,
            endIndex: columnIndex + 1,
          },
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Inserted column at index: ${columnIndex}`);
    } catch (error) {
      console.error(
        `❌ Error inserting column at index ${columnIndex}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a row at the specified index
   * @param {number} sheetId - The sheet ID
   * @param {number} rowIndex - The row index (0-indexed)
   * @returns {Promise<void>}
   */
  async deleteRow(sheetId, rowIndex) {
    try {
      console.log(`🗑️ Deleting row at index: ${rowIndex}`);

      const request = {
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Deleted row at index: ${rowIndex}`);
    } catch (error) {
      console.error(`❌ Error deleting row at index ${rowIndex}:`, error);
      throw error;
    }
  }

  /**
   * Delete a column at the specified index
   * @param {number} sheetId - The sheet ID
   * @param {number} columnIndex - The column index (0-indexed)
   * @returns {Promise<void>}
   */
  async deleteColumn(sheetId, columnIndex) {
    try {
      console.log(`🗑️ Deleting column at index: ${columnIndex}`);

      const request = {
        deleteDimension: {
          range: {
            sheetId,
            dimension: "COLUMNS",
            startIndex: columnIndex,
            endIndex: columnIndex + 1,
          },
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Deleted column at index: ${columnIndex}`);
    } catch (error) {
      console.error(`❌ Error deleting column at index ${columnIndex}:`, error);
      throw error;
    }
  }

  /**
   * Get the sheet ID by name
   * @param {string} sheetName - The name of the sheet
   * @returns {Promise<number>} - The sheet ID
   */
  async getSheetIdByName(sheetName) {
    try {
      console.log(`🔍 Getting sheet ID for sheet name: ${sheetName}`);

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
      });

      const sheet = response.data.sheets.find(
        (s) => s.properties.title === sheetName
      );

      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }

      console.log(
        `✅ Found sheet ID ${sheet.properties.sheetId} for sheet: ${sheetName}`
      );
      return sheet.properties.sheetId;
    } catch (error) {
      console.error(`❌ Error getting sheet ID for ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new sheet
   * @param {string} title - The title of the new sheet
   * @returns {Promise<number>} - The new sheet ID
   */
  async createSheet(title) {
    try {
      console.log(`➕ Creating new sheet with title: ${title}`);

      // Check if a sheet with this name already exists
      try {
        const existingSheetId = await this.getSheetIdByName(title);
        console.log(
          `⚠️ Sheet "${title}" already exists with ID: ${existingSheetId}`
        );
        return existingSheetId;
      } catch (error) {
        // Sheet doesn't exist, continue with creation
      }

      const request = {
        addSheet: {
          properties: {
            title,
          },
        },
      };

      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      const newSheetId = response.data.replies[0].addSheet.properties.sheetId;
      console.log(`✅ Created new sheet "${title}" with ID: ${newSheetId}`);
      return newSheetId;
    } catch (error) {
      console.error(`❌ Error creating sheet "${title}":`, error);
      throw error;
    }
  }

  /**
   * Delete a sheet by ID
   * @param {number} sheetId - The sheet ID to delete
   * @returns {Promise<void>}
   */
  async deleteSheet(sheetId) {
    try {
      console.log(`🗑️ Deleting sheet with ID: ${sheetId}`);

      const request = {
        deleteSheet: {
          sheetId,
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Deleted sheet with ID: ${sheetId}`);
    } catch (error) {
      console.error(`❌ Error deleting sheet with ID ${sheetId}:`, error);
      throw error;
    }
  }

  /**
   * Format a range of cells
   * @param {number} sheetId - The sheet ID
   * @param {number} startRowIndex - Start row index (0-indexed)
   * @param {number} endRowIndex - End row index (0-indexed)
   * @param {number} startColumnIndex - Start column index (0-indexed)
   * @param {number} endColumnIndex - End column index (0-indexed)
   * @param {Object} format - The cell format to apply
   * @returns {Promise<void>}
   */
  async formatRange(
    sheetId,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
    format
  ) {
    try {
      console.log(
        `🎨 Formatting range from [${startRowIndex},${startColumnIndex}] to [${endRowIndex},${endColumnIndex}]`
      );

      const request = {
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
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Range formatted successfully`);
    } catch (error) {
      console.error(`❌ Error formatting range:`, error);
      throw error;
    }
  }

  /**
   * Search for a value in a sheet
   * @param {string} sheetName - The name of the sheet
   * @param {any} searchValue - The value to search for
   * @returns {Promise<Array<{row: number, column: number}>>} - Array of positions where value was found
   */
  async searchInSheet(sheetName, searchValue) {
    try {
      console.log(`🔍 Searching for "${searchValue}" in sheet: ${sheetName}`);

      const values = await this.getSheetValues(sheetName);
      const positions = [];

      for (let r = 0; r < values.length; r++) {
        const row = values[r];
        for (let c = 0; c < row.length; c++) {
          if (row[c] === searchValue) {
            positions.push({ row: r + 1, column: c + 1 }); // Convert to 1-indexed
          }
        }
      }

      console.log(
        `✅ Found ${positions.length} matches for "${searchValue}" in sheet: ${sheetName}`
      );
      return positions;
    } catch (error) {
      console.error(
        `❌ Error searching for "${searchValue}" in sheet ${sheetName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Sort a range of cells
   * @param {number} sheetId - The sheet ID
   * @param {number} startRowIndex - Start row index (0-indexed)
   * @param {number} endRowIndex - End row index (0-indexed)
   * @param {number} startColumnIndex - Start column index (0-indexed)
   * @param {number} endColumnIndex - End column index (0-indexed)
   * @param {number} sortColumnIndex - Column index to sort by (0-indexed)
   * @param {boolean} ascending - Sort in ascending order (true) or descending (false)
   * @returns {Promise<void>}
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
    try {
      console.log(
        `🔄 Sorting range from [${startRowIndex},${startColumnIndex}] to [${endRowIndex},${endColumnIndex}] by column ${sortColumnIndex} (${
          ascending ? "ascending" : "descending"
        })`
      );

      const request = {
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
              dimensionIndex: sortColumnIndex - startColumnIndex,
              sortOrder: ascending ? "ASCENDING" : "DESCENDING",
            },
          ],
        },
      };

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [request],
        },
      });

      console.log(`✅ Range sorted successfully`);
    } catch (error) {
      console.error(`❌ Error sorting range:`, error);
      throw error;
    }
  }

  /**
   * Get all sheets in the spreadsheet
   * @returns {Promise<Array<{id: number, title: string}>>} - Array of sheet info
   */
  async getAllSheets() {
    try {
      console.log(`📋 Getting all sheets from spreadsheet`);

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
      });

      const sheets = response.data.sheets.map((sheet) => ({
        id: sheet.properties.sheetId,
        title: sheet.properties.title,
      }));

      console.log(`✅ Found ${sheets.length} sheets`);
      return sheets;
    } catch (error) {
      console.error(`❌ Error getting all sheets:`, error);
      throw error;
    }
  }

  /**
   * Convert a column index to letter (A, B, C, ...)
   * @param {number} columnIndex - The column index (1-indexed)
   * @returns {string} - The column letter
   */
  columnIndexToLetter(columnIndex) {
    let temp,
      letter = "";
    while (columnIndex > 0) {
      temp = (columnIndex - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      columnIndex = (columnIndex - temp - 1) / 26;
    }
    return letter;
  }

  /**
   * Convert a column letter to index (1, 2, 3, ...)
   * @param {string} columnLetter - The column letter (A, B, C, ...)
   * @returns {number} - The column index (1-indexed)
   */
  columnLetterToIndex(columnLetter) {
    let column = 0;
    const length = columnLetter.length;
    for (let i = 0; i < length; i++) {
      column +=
        (columnLetter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
  }

  /**
   * Get sheet metadata
   * @returns {Promise<Array<{sheetId: number, title: string}>>} - Array of sheet metadata
   */
  async getSheetMetadata() {
    try {
      console.log(`📋 Getting sheet metadata`);

      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
      });

      const metadata = response.data.sheets.map((sheet) => ({
        sheetId: sheet.properties.sheetId,
        title: sheet.properties.title,
      }));

      console.log(
        `✅ Found metadata for ${metadata.length} sheets: ${metadata
          .map((m) => m.title)
          .join(", ")}`
      );
      return metadata;
    } catch (error) {
      console.error(`❌ Error getting sheet metadata:`, error);
      throw error;
    }
  }

  /**
   * Perform a batch update operation
   * @param {Object} body - The batch update request body
   * @returns {Promise<void>}
   */
  async batchUpdate(body) {
    try {
      console.log(
        `🔄 Performing batch update with ${body.requests.length} requests`
      );

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: body,
      });

      console.log(`✅ Batch update completed successfully`);
    } catch (error) {
      console.error(`❌ Error performing batch update:`, error);
      throw error;
    }
  }
  async getSpreadsheet() {
    try {
      // Use the existing sheets API client
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
        // Include chart data in the response
        includeGridData: false,
        fields: "sheets.properties,sheets.charts.chartId",
      });

      console.log(`✅ Successfully retrieved spreadsheet data`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error getting spreadsheet with charts:`, error);
      // Return empty object on error
      return {};
    }
  }
}
