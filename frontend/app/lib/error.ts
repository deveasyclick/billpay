/**
 * TEAM_002: Utility to extract error messages from the backend's standardized error response.
 */
export function getErrorMessage(
  json: any,
  defaultMessage = "An unexpected error occurred"
): string {
  if (!json) return defaultMessage;

  // The AllExceptionsFilter returns: { statusCode, message, data, error, timestamp, path }
  if (json.message) {
    return json.message;
  }

  // Fallback for cases where it's not our standard format
  if (json.error && typeof json.error === "string") {
    return json.error;
  }

  if (json.details) {
    if (typeof json.details === "string") return json.details;
    if (json.details.message) return json.details.message;
    if (json.details.response?.details) return json.details.response.details;
  }

  return defaultMessage;
}
