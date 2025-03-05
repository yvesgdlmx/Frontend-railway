import React from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { formatNumber } from '../../../helpers/formatNumber';

const TablaRepoAntiguedad = ({ registrosDia }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Fecha de Entrada
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Fecha de Reporte
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              INK IP
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              HOYA IP
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              NVI IP
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {registrosDia.map((registro, index) => {
            const diasDiferencia = differenceInDays(
              parseISO(registro.today),
              parseISO(registro.enter_date)
            ) - 1;
            const esAntiguo = diasDiferencia >= 3;
            return (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  esAntiguo ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {format(parseISO(registro.enter_date), 'dd/MM/yyyy')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {format(parseISO(registro.today), 'dd/MM/yyyy')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {formatNumber(registro.ink_ip)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {formatNumber(registro.hoya_ip)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                  {formatNumber(registro.nvi_ip)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default TablaRepoAntiguedad;