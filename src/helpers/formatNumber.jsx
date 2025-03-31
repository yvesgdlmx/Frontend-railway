export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  // Si el número tiene decimales, se formatea con 2 decimales
  const formatted = (number % 1 !== 0) ? number.toFixed(2) : number.toString();
  
  // Separa la parte entera de la decimal
  const parts = formatted.split(".");
  // Agrega comas a la parte entera
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Une ambas partes (si existe la decimal)
  return parts.join(".");
};