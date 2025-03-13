import React from "react";
import moment from "moment";
import { formatNumber } from "../../../helpers/formatNumber";

// Este componente recibe: seccion, nombres (arreglo de nombres esperado) e items (registros)
const TablaHistorialRangos = ({ seccion, nombres, items }) => {
  // Función para agrupar los registros por nombre acumulando los hits
  const groupByName = (arr) => {
    const groups = arr.reduce((acc, item) => {
      if (acc[item.name]) {
        acc[item.name].hits += Number(item.hits);
      } else {
        acc[item.name] = { name: item.name, hits: Number(item.hits) };
      }
      return acc;
    }, {});
    return Object.values(groups);
  };
  // Función para calcular totales por turno
  const calcularTotalesPorTurno = (items) => {
    let totalNocturno = 0,
      totalMatutino = 0,
      totalVespertino = 0;
    items.forEach((item) => {
      let m = item.hour
        ? moment(item.hour, "HH:mm")
        : moment(item.fecha, "YYYY-MM-DD HH:mm:ss");
      const t = m.hour() * 60 + m.minute();
      const hitValue = Number(item.hits);
      if (t >= 1320 || t <= 360) {
        totalNocturno += hitValue;
      } else if (t >= 390 && t <= 869) {
        totalMatutino += hitValue;
      } else if (t >= 870 && t <= 1319) {
        totalVespertino += hitValue;
      }
    });
    return { totalNocturno, totalMatutino, totalVespertino };
  };
  const agrupados = groupByName(items);
  const { totalNocturno, totalMatutino, totalVespertino } = calcularTotalesPorTurno(items);
  const totalGeneral = totalNocturno + totalMatutino + totalVespertino;
  // Utilizamos la misma lógica que en TablaHistorial para asignar clases
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
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Hits por Jornada
              </th>
            </tr>
          </thead>
          <tbody>
            {agrupados.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-100"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(item.hits)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Resumen General de Turnos */}
      <div className="bg-slate-50 p-4 border-t border-white rounded-b">
        <p className="text-center text-sm font-semibold text-gray-500 mb-2">
          Resumen General
        </p>
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Nocturno</p>
            <p className="text-lg font-bold text-gray-500">{formatNumber(totalNocturno)}</p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Matutino</p>
            <p className="text-lg font-bold text-gray-500">{formatNumber(totalMatutino)}</p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Vespertino</p>
            <p className="text-lg font-bold text-gray-500">{formatNumber(totalVespertino)}</p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total General</p>
            <p className="text-lg font-bold text-gray-500">{formatNumber(totalGeneral)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TablaHistorialRangos;