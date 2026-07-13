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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaResumenTrabajosInk;
