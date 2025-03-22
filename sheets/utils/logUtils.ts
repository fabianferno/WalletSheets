import { SheetClient } from "../sheets.api";

/**
 * Log event to console only (no longer writes to sheets)
 */
export async function logEvent(sheetClient: SheetClient, message: string) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    // All sheet logging code has been removed to avoid write limits
  } catch (error) {
    console.error(
      "Error logging event:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
