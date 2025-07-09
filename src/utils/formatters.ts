function formatCurrencyWithoutSign(number) {
  // Check if the input is a valid number
  if (typeof number !== 'number' || isNaN(number)) {
    return ""; // Return empty for invalid input
  }

  // toLocaleString does all the work for you!
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}