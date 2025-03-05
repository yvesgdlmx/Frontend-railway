import React from 'react';
import { format, parseISO, differenceInDays, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatNumber } from '../../../helpers/formatNumber';

const agruparPorSemana = (registros, mes) => {
  if (!registros || registros.length === 0 || !mes) return [];
  const año = new Date().getFullYear();
  const fechaInicio = startOfMonth(new Date(año, mes - 1, 1));
  const fechaFin = endOfMonth(new Date(año, mes - 1, 1));
  const semanas = eachWeekOfInterval(
    { start: fechaInicio, end: fechaFin },
    { weekStartsOn: 1 }
  ).map((inicioSemana, index) => {
    const finSemana = endOfWeek(inicioSemana, { weekStartsOn: 1 });
    return {
      numero: index + 1,
      inicio: inicioSemana,
      fin: finSemana,
      registros: []
    };
  });
  registros.forEach(registro => {
    const fechaRegistro = parseISO(registro.today);
    const semana = semanas.find(s =>
      fechaRegistro >= s.inicio && fechaRegistro <= s.fin
    );
    if (semana) {
      semana.registros.push(registro);
    }
  });
  return semanas;
};
const CardRepoAntiguedad = ({ registros, mes }) => {
  const semanasAgrupadas = agruparPorSemana(registros, mes);
  return (
    <div className="mt-8 mb-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-blue-600">Resumen Semanal</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {semanasAgrupadas.map((semana) => {
          const totalSemana = semana.registros.reduce((total, registro) => {
            const dias = differenceInDays(parseISO(registro.today), parseISO(registro.enter_date)) - 1;
            if (dias >= 3) {
              return total + registro.ink_ip + registro.hoya_ip + registro.nvi_ip;
            }
            return total;
          }, 0);
          return (
            <div key={semana.numero} className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-lg font-medium mb-2 text-blue-500">
                Semana {semana.numero}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {format(semana.inicio, 'dd/MM', { locale: es })} - {format(semana.fin, 'dd/MM', { locale: es })}
              </p>
              <p className="text-gray-700">
                Total (≥ 4 días): <span className="font-semibold">{formatNumber(totalSemana)}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CardRepoAntiguedad;