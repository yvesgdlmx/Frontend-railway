import React from 'react';
const TablaRepoResumen = ({ datos, formatNumber }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="text-center">
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI En Proceso
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI Total Term
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI Total Ster
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              No Surtido Terminado
            </th>
            {/* Nuevas columnas entre las dos siguientes */}
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              No Surtido AR Semi
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              No Surtido Sin AR Semi
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              No Surtido Semiterminado
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Surtido Terminado
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Surtido Semiterminado
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI AR Term
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI AR Semi
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI Sin Ar
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI SinAR Term
            </th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              NVI SinAR Semi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {datos.map((fila, index) => (
            <tr
              key={`${fila.fecha}-${index}`}
              className={`text-center transition-colors duration-150 hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-gray-50" : ""
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                {fila.fecha}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_en_proceso)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_total_term)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_total_ster)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                {formatNumber(fila.no_surtido_term)}
              </td>
              {/* Nuevas columnas */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.no_surtido_ar_semi)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.no_surtido_sin_ar_semi)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                {formatNumber(fila.no_surtido_ster)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                {formatNumber(fila.surtido_term)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                {formatNumber(fila.surtido_ster)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_ar_term)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_ar_semi)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_sin_ar)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_sin_ar_term)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                {formatNumber(fila.nvi_sin_ar_semi)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr className="text-center font-semibold">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Total
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_en_proceso, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_total_term, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_total_ster, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.no_surtido_term, 0)
              )}
            </td>
            {/* Totales de las nuevas columnas */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.no_surtido_ar_semi, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.no_surtido_sin_ar_semi, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.no_surtido_ster, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.surtido_term, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.surtido_ster, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_ar_term, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_ar_semi, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_sin_ar, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_sin_ar_term, 0)
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              {formatNumber(
                datos.reduce((acc, curr) => acc + curr.nvi_sin_ar_semi, 0)
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
export default TablaRepoResumen;