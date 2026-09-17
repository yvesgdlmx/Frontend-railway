import React from 'react';
import { format, parseISO, differenceInDays, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '../../../helpers/formatNumber';

const agruparPorSemana = (registros, mes, anio) => {
  if (!registros || registros.length === 0 || !mes || !anio) return [];
  const fechaInicio = startOfMonth(new Date(anio, mes - 1, 1));
  const fechaFin = endOfMonth(new Date(anio, mes - 1, 1));
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

const CardRepoAntiguedad = ({ registros, mes, anio }) => {
  const semanasAgrupadas = agruparPorSemana(registros, mes, anio);
  return (
    <div className="mt-8 mb-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ChartBarIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Resumen semanal</p>
            <p className="text-sm text-gray-500">Total de registros con antigüedad por semana</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          <CalendarDaysIcon className="h-4 w-4" />
          {semanasAgrupadas.length} semanas
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {semanasAgrupadas.map((semana) => {
          const totalSemana = semana.registros.reduce((total, registro) => {
            const dias = differenceInDays(parseISO(registro.today), parseISO(registro.enter_date)) - 1;
            if (dias >= 3) {
              return total + registro.ink_ip + registro.hoya_ip + registro.nvi_ip;
            }
            return total;
          }, 0);
          return (
            <div key={semana.numero} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-blue-700">
                    Semana {semana.numero}
                  </h4>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-blue-600 shadow-sm">
                    ≥ 4 días
                  </span>
                </div>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
                  <span>{format(semana.inicio, 'dd/MM', { locale: es })} - {format(semana.fin, 'dd/MM', { locale: es })}</span>
                </div>
                <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {formatNumber(totalSemana)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CardRepoAntiguedad;
