export const formatNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
      return '0';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
