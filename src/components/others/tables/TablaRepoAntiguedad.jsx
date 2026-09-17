import React from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '../../../helpers/formatNumber';

const TablaRepoAntiguedad = ({ registrosDia }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-xs">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-2 py-3 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100">
              Entrada
            </th>
            <th className="px-2 py-3 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100">
              Reporte
            </th>
            <th className="px-2 py-3 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100">
              INK IP
            </th>
            <th className="px-2 py-3 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100">
              HOYA IP
            </th>
            <th className="px-2 py-3 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wide border-b border-blue-100">
              NVI IP
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {registrosDia.map((registro, index) => {
            const diasDiferencia = differenceInDays(
              parseISO(registro.today),
              parseISO(registro.enter_date)
            ) - 1;
            const esAntiguo = diasDiferencia >= 3;
            return (
              <tr
                key={index}
                className={`transition-colors duration-150 hover:bg-blue-50/60 ${
                  esAntiguo ? 'bg-amber-50/70' : ''
                }`}
              >
                <td className="px-2 py-3 whitespace-nowrap text-center font-medium text-gray-600">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <CalendarDaysIcon className="h-3.5 w-3.5 flex-none text-blue-500" />
                    {format(parseISO(registro.enter_date), 'dd/MM/yyyy')}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-center font-medium text-gray-600">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <CalendarDaysIcon className="h-3.5 w-3.5 flex-none text-blue-500" />
                    {format(parseISO(registro.today), 'dd/MM/yyyy')}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-center font-semibold text-gray-600">
                  {formatNumber(registro.ink_ip)}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-center font-semibold text-gray-600">
                  {formatNumber(registro.hoya_ip)}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-center font-semibold text-gray-600">
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
