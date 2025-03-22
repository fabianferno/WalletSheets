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
      await sheetClient.appendRows(LOGS_SHEET, [[timestamp, message]]);
    } catch (error: unknown) {
      console.error(
        "Error writing to logs sheet:",
        error instanceof Error ? error.message : String(error)
      );
    }
  } catch (error: unknown) {
    console.error(
      "Error logging event:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
