/**
 * Shortens a bundle name to a maximum character length by appending
 * additional full words until the limit is reached or exceeded.
 *
 * Useful when you want to abbreviate long product or bundle names
 * while preserving whole words (not cutting through them).
 *
 * @param name - The original full bundle name.
 * @param maxLength - Maximum allowed length for the formatted name (default: 20).
 * @returns A shortened version of the name that contains as many full words
 *          as possible without exceeding the max length.
 *
 * @example
 * formatBundleName("MTN 10GB Monthly Data Plan", 20)
 * // "MTN 10GB Monthly"
 *
 * @example
 * formatBundleName("Airtel 500MB Daily", 10)
 * // "Airtel"
 */
export const formatBundleName = (name: string, maxLength = 20): string => {
  // Return the original name if it’s already within the limit
  if (name.length <= maxLength) return name;

  const words = name.split(" ");

  // If name has no spaces or is a single long word → hard cut
  if (words.length === 1) {
    return words[0].slice(0, maxLength);
  }

  let result = words[0];

  // Add more words until adding another would exceed maxLength
  for (let i = 1; i < words.length; i++) {
    const next = result + " " + words[i];
    if (next.length > maxLength) break;
    result = next;
  }

  return result;
};
