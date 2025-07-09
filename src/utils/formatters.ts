/**
 * Formats a number to a currency string (e.g., "1,234.56")
 * using the US English number format, without a currency sign.
 *
 * @param {number} number - The number to format.
 * @returns {string} The formatted number string, or an empty string for invalid input.
 */
export const formatCurrency = (number) => {
  // Check if the input is a valid number
  if (typeof number !== 'number' || isNaN(number)) {
    return "";
  }

  // Use toLocaleString for robust, locale-aware formatting.
  // 'en-US' uses a comma for thousands and a period for decimals.
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// You can export other related functions from the same file
// export const anotherFunction = () => { ... };