import React from "react";
import moment from "moment";
import { formatNumber } from "../../../helpers/formatNumber";
const TablaHistorial = ({ seccion, nombres, items, metas }) => {
  // Función para obtener la meta por hora usando el nombre exacto
  const getMetaPorHora = (machineName) => {
    return Number(metas[machineName.trim()]) || 0;
  };
  // Función para agrupar los registros por nombre, iniciando con todos los nombres definidos
  // en “nombres” (con hits 0 y su respectiva meta)
  const groupByName = (arr) => {
    const groups = {};
    nombres.forEach((machine) => {
      groups[machine] = { name: machine, hits: 0, metaPorHora: getMetaPorHora(machine) };
    });
    arr.forEach((item) => {
      if (groups[item.name] !== undefined) {
        groups[item.name].hits += Number(item.hits);
      } else {
        groups[item.name] = { name: item.name, hits: Number(item.hits), metaPorHora: getMetaPorHora(item.name) };
      }
    });
    return Object.values(groups);
  };
  // Función para calcular totales de hits por turno
  const calcularTotalesPorTurno = (items) => {
    let totalNocturno = 0,
      totalMatutino = 0,
      totalVespertino = 0;
    items.forEach((item) => {
      if (!item.hour) return;
      const [hrStr, minStr] = item.hour.split(":");
      const hr = parseInt(hrStr, 10);
      const min = parseInt(minStr, 10);
      const total = hr * 60 + min;
      // Turno nocturno: desde las 22:00 (1320) hasta 23:59 y de 00:00 hasta antes de 06:00 (360)
      if (total >= 1320 || total < 360) {
        totalNocturno += Number(item.hits);
      }
      // Turno matutino: de 06:30 (390) a 14:29 (869)
      else if (total >= 390 && total <= 869) {
        totalMatutino += Number(item.hits);
      }
      // Turno vespertino: de 14:30 (870) a 21:59 (1319)
      else if (total >= 870 && total < 1320) {
        totalVespertino += Number(item.hits);
      }
    });
    return { totalNocturno, totalMatutino, totalVespertino };
  };
  const agrupados = groupByName(items);
  const { totalNocturno, totalMatutino, totalVespertino } = calcularTotalesPorTurno(items);
  // Cálculo de metas generales
  const metaMatutinoGeneral = nombres.reduce((sum, maquina) => sum + (getMetaPorHora(maquina) * 8), 0);
  const metaNocturnoGeneral = nombres.reduce((sum, maquina) => sum + (getMetaPorHora(maquina) * 8), 0);
  const metaVespertinoGeneral = nombres.reduce((sum, maquina) => sum + (getMetaPorHora(maquina) * 7), 0);
  const metaGeneral = nombres.reduce((sum, maquina) => sum + (getMetaPorHora(maquina) * 24), 0);
  // Función para asignar clases CSS según la comparación de hits con la meta
  const getClassName = (total, meta) => {
    if (typeof meta !== "number") return "text-gray-500";
    return total >= meta ? "text-green-600" : "text-red-600";
  };
  const cardClasses =
    seccion === "Producción"
      ? "bg-white shadow-md rounded overflow-hidden flex flex-col h-auto self-start"
      : "bg-white shadow-md rounded overflow-hidden flex flex-col h-full";
  return (
    <div className={cardClasses}>
      <div className="flex-grow">
        <h2 className="text-xl font-semibold p-4 bg-slate-200 text-gray-500 text-center">
          {seccion}
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-500">
            <tr className="text-xs ssm:text-sm">
              <th className="px-6 py-3 text-left font-medium text-white uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left font-medium text-white uppercase tracking-wider">
                Hits por jornada
              </th>
              <th className="px-6 py-3 text-left font-medium text-white uppercase tracking-wider">
                Meta por Hora
              </th>
              <th className="px-6 py-3 text-left font-medium text-white uppercase tracking-wider">
                Meta por Jornada
              </th>
            </tr>
          </thead>
          <tbody>
            {agrupados.map((item, idx) => {
              const metaHora = getMetaPorHora(item.name);
              const metaJornada = metaHora * 24;
              return (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-100"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getClassName(item.hits, metaJornada)}`}>
                    {formatNumber(item.hits)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metaHora}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(metaJornada)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Resumen General */}
      <div className="bg-slate-50 p-4 border-t border-white rounded-b">
        <p className="text-center text-sm font-semibold text-gray-500 mb-2">
          Resumen General
        </p>
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Nocturno / Meta nocturno</p>
            <p className="text-lg font-bold">
              <span className={`${getClassName(totalNocturno, metaNocturnoGeneral)}`}>
                {formatNumber(totalNocturno)}
              </span>{" "}
              <span className="text-gray-500">/ {formatNumber(metaNocturnoGeneral)}</span>
            </p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Matutino / Meta matutino</p>
            <p className="text-lg font-bold">
              <span className={`${getClassName(totalMatutino, metaMatutinoGeneral)}`}>
                {formatNumber(totalMatutino)}
              </span>{" "}
              <span className="text-gray-500">/ {formatNumber(metaMatutinoGeneral)}</span>
            </p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Vespertino / Meta vespertino</p>
            <p className="text-lg font-bold">
              <span className={`${getClassName(totalVespertino, metaVespertinoGeneral)}`}>
                {formatNumber(totalVespertino)}
              </span>{" "}
              <span className="text-gray-500">/ {formatNumber(metaVespertinoGeneral)}</span>
            </p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total General / Meta general</p>
            <p className="text-lg font-bold">
              <span
                className={`${getClassName(
                  totalNocturno + totalMatutino + totalVespertino,
                  metaGeneral
                )}`}
              >
                {formatNumber(totalNocturno + totalMatutino + totalVespertino)}
              </span>{" "}
              <span className="text-gray-500">/ {formatNumber(metaGeneral)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TablaHistorial;