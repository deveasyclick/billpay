/**
 * Generate a Request ID in the format:
 * YYYYMMDDHHII + random alphanumeric string.
 *
 * - First 12 characters: current date/time in Africa/Lagos timezone (GMT+1)
 * - Total length: at least 12 characters
 */
export function generateRequestId(suffixLength: number = 10): string {
  // Africa/Lagos timezone = GMT+1
  const lagosOffsetMs = 60 * 60 * 1000; // +1 hour in milliseconds
  const now = new Date(Date.now() + lagosOffsetMs);

  // Format date as YYYYMMDDHHII
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const minute = String(now.getUTCMinutes()).padStart(2, '0');
  const datetimePart = `${year}${month}${day}${hour}${minute}`; // 12 chars

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 10; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return datetimePart + randomSuffix;
}
