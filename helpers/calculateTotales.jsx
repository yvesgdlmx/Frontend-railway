import { formatNumber } from "../src/helpers/formatNumber";
export const calculateTotales = (data, columns) => {
  const totals = {};
  columns.forEach((col) => {
    if (col.accessor === "semana" || col.accessor === "fecha") {
      totals[col.accessor] = "";
      return;
    }
    let sum = 0;
    data.forEach((row) => {
      const valor = parseFloat(String(row[col.accessor]).replace(/[^0-9.-]+/g, ""));
      if (!isNaN(valor)) {
        sum += valor;
      }
    });
    totals[col.accessor] = col.header.includes("$")
      ? "$" + formatNumber(sum)
      : formatNumber(sum);
  });
  return totals;
};