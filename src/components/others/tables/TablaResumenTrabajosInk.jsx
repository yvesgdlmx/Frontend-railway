import React from "react";

const columnas = [
  { key: "sin_surtir", label: "Sin Surtir" },
  { key: "sin_surtir_con_ar", label: "Sin Surtir Con AR" },
  { key: "sin_surtir_sin_ar", label: "Sin Surtir Sin AR" },
  { key: "sin_material", label: "Sin Material" },
  { key: "sin_material_con_ar", label: "Sin Material Con AR" },
  { key: "sin_material_sin_ar", label: "Sin Material Sin AR" },
  { key: "surtido", label: "Surtido" },
  { key: "surtido_con_ar", label: "Surtido Con AR" },
  { key: "surtido_sin_ar", label: "Surtido Sin AR" },
  { key: "verde", label: "Verde" },
  { key: "azul", label: "Azul" },
  { key: "blanco", label: "Blanco" },
];

const TablaResumenTrabajosInk = ({ datos, formatNumber }) => {
  const totalFila = (fila) =>
    columnas.reduce((acc, columna) => acc + (Number(fila[columna.key]) || 0), 0);

  const totalColumna = (campo) =>
    datos.reduce((acc, curr) => acc + (Number(curr[campo]) || 0), 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="text-center">
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fecha
            </th>
            {columnas.map((columna) => (
              <th
                key={columna.key}
                className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {columna.label}
              </th>
            ))}
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {datos.map((fila, index) => (
            <tr
              key={`${fila.id}-${index}`}
              className={`text-center transition-colors duration-150 hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-gray-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                {fila.fecha}
              </td>
              {columnas.map((columna) => (
                <td
                  key={columna.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold"
                >
                  {formatNumber(Number(fila[columna.key]) || 0)}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                {formatNumber(totalFila(fila))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-center font-bold bg-blue-50 border-t-2 border-blue-300 shadow-inner">
            <td className="px-6 py-5 whitespace-nowrap text-sm text-blue-800 uppercase">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2">
                Total General
              </div>
            </td>
            {columnas.map((columna) => (
              <td
                key={columna.key}
                className="px-6 py-5 whitespace-nowrap text-sm text-blue-900"
              >
                {formatNumber(totalColumna(columna.key))}
              </td>
            ))}
            <td className="px-6 py-5 whitespace-nowrap text-base">
              <span className="inline-flex min-w-24 items-center justify-center rounded-full bg-green-100 px-4 py-2 font-extrabold text-green-800 ring-1 ring-green-200">
                {formatNumber(datos.reduce((acc, curr) => acc + totalFila(curr), 0))}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default TablaResumenTrabajosInk;
