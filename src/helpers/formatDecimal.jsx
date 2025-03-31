export const formatDecimal = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "0.00";
    return number.toFixed(2);
  };