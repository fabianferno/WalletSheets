import { SheetClient } from "../sheets.api";
import { LOGS_SHEET } from "./sheetUtils";

/**
 * Log event to the Logs sheet
 */
export async function logEvent(sheetClient: SheetClient, message: string) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);

    // Append to Logs sheet if it exists
    try {
      // Check if the Logs sheet exists
      try {
        await sheetClient.getSheetValues(LOGS_SHEET);
      } catch (sheetError) {
        // Logs sheet doesn't exist, try to create it
        console.log(`Logs sheet not found, attempting to create it`);
        try {
          await sheetClient.createSheet(LOGS_SHEET);
          await sheetClient.setRangeValues(`${LOGS_SHEET}!A1:B1`, [
            ["Timestamp", "Message"],
          ]);
          console.log(`Created Logs sheet successfully`);
        } catch (createError) {
          console.error(
            `Failed to create Logs sheet: ${
              createError instanceof Error
                ? createError.message
                : String(createError)
            }`
          );
          return; // Exit if we can't create the sheet
        }
      }

      // Now try to append the log entry
      try {
        await sheetClient.appendRows(LOGS_SHEET, [[timestamp, message]]);
      } catch (appendError) {
        console.error(
          `Error appending to Logs sheet: ${
            appendError instanceof Error
              ? appendError.message
              : String(appendError)
          }`
        );

        // As a fallback, try to manually add to a specific cell if sheet exists but append fails
        try {
          const rows = await sheetClient.getSheetValues(LOGS_SHEET);
          const newRowIndex = rows.length + 1;
          await sheetClient.setCellValue(
            LOGS_SHEET,
            newRowIndex,
            "A",
            timestamp
          );
          await sheetClient.setCellValue(LOGS_SHEET, newRowIndex, "B", message);
        } catch (fallbackError) {
          console.error(
            `Fallback logging also failed: ${
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError)
            }`
          );
        }
      }
    } catch (error) {
      console.error(
        "Error writing to logs sheet:",
        error instanceof Error ? error.message : String(error)
      );
    }
  } catch (error) {
    console.error(
      "Error logging event:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
