import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AiFillFileExcel } from "react-icons/ai";  // Importamos el ícono
const FinanzasWeek = ({ data, columns, filename = "export.xlsx" }) => {
  // Filtramos las columnas comunes (sin subheader)
  const commonColumns = columns.filter(col => !col.subHeader);
  // Filtramos las columnas según cliente
  const nviColumns = columns.filter(col => col.subHeader && col.subHeader.includes("(NVI)"));
  const hoyaColumns = columns.filter(col => col.subHeader && col.subHeader.includes("(HOYA)"));
  const inkColumns = columns.filter(col => col.subHeader && col.subHeader.includes("(INK)"));
  // Función para fusionar las columnas comunes con las del cliente
  const mergeColumns = (clientColumns) => {
    return [...commonColumns, ...clientColumns];
  };
  const nviExportColumns = mergeColumns(nviColumns);
  const hoyaExportColumns = mergeColumns(hoyaColumns);
  const inkExportColumns = mergeColumns(inkColumns);
  // Función para crear los datos de exportación filtrando solo las columnas deseadas.
  const createExportDataForColumns = (exportColumns) => {
    return data.map(row => {
      const newRow = {};
      exportColumns.forEach(col => {
        newRow[col.header] = row[col.accessor] || "";
      });
      return newRow;
    });
  };
  const nviExportData = createExportDataForColumns(nviExportColumns);
  const hoyaExportData = createExportDataForColumns(hoyaExportColumns);
  const inkExportData = createExportDataForColumns(inkExportColumns);
  const handleExport = () => {
    // Crear hojas para cada cliente
    const worksheetNVI = XLSX.utils.json_to_sheet(nviExportData);
    const worksheetHOYA = XLSX.utils.json_to_sheet(hoyaExportData);
    const worksheetINK = XLSX.utils.json_to_sheet(inkExportData);
    // Crear un nuevo libro y agregar cada hoja con nombre de cliente
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetNVI, "NVI");
    XLSX.utils.book_append_sheet(workbook, worksheetHOYA, "HOYA");
    XLSX.utils.book_append_sheet(workbook, worksheetINK, "INK");
    // Escribir el libro y disparar la descarga
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, filename);
  };
  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors mb-4 flex items-center gap-2"
    >
      {/* Ícono de Excel */}
      <AiFillFileExcel size={20} />
      Exportar Excel
    </button>
  );
};
export default FinanzasWeek;