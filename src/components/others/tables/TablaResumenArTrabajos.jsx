import React from 'react';

const TablaResumenArTrabajos = ({ datos, formatNumber }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="text-center">
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Sin Surtir
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Antes de AR
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              En AR
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Recalculando
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Breakage
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Total del Día
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {datos.map((fila, index) => {
            const totalDia = fila.en_ar + fila.antes_de_ar + fila.sin_surtir + fila.recalculando + fila.breakage;
            
            return (
              <tr
                key={`${fila.id}-${index}`}
                className={`text-center transition-colors duration-150 hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-gray-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                  {fila.fecha}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                  {formatNumber(fila.sin_surtir)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                  {formatNumber(fila.antes_de_ar)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                  {formatNumber(fila.en_ar)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                  {formatNumber(fila.recalculando)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                  {formatNumber(fila.breakage)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                  {formatNumber(totalDia)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr className="text-center font-semibold">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Total General
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.sin_surtir, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.antes_de_ar, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.en_ar, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.recalculando, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.breakage, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-bold">
              {formatNumber(
                datos.reduce((acc, curr) => {
                  const totalDia = curr.en_ar + curr.antes_de_ar + curr.sin_surtir + curr.recalculando + curr.breakage;
                  return acc + totalDia;
                }, 0)
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default TablaResumenArTrabajos;