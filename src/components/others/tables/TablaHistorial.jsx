import React from "react";
import moment from "moment";
import { formatNumber } from "../../../helpers/formatNumber";
const TablaHistorial = ({ seccion, nombres, items, metas }) => {
  // Funciones para obtener la meta de cada turno (meta por hora, que se multiplicará luego)
  const getMetaNocturno = (machineName) =>
    Number(metas[machineName.trim()]?.meta_nocturno) || 0;
  const getMetaMatutino = (machineName) =>
    Number(metas[machineName.trim()]?.meta_matutino) || 0;
  const getMetaVespertino = (machineName) =>
    Number(metas[machineName.trim()]?.meta_vespertino) || 0;
  // Agrupar los registros por nombre, iniciando con los nombres definidos en “nombres”
  const groupByName = (arr) => {
    const groups = {};
    nombres.forEach((machine) => {
      groups[machine] = {
        name: machine,
        hits: 0,
        // Se guarda la meta por hora para cada turno
        metaNocturno: getMetaNocturno(machine),
        metaMatutino: getMetaMatutino(machine),
        metaVespertino: getMetaVespertino(machine),
      };
    });
    arr.forEach((item) => {
      if (groups[item.name] !== undefined) {
        groups[item.name].hits += Number(item.hits);
      } else {
        groups[item.name] = {
          name: item.name,
          hits: Number(item.hits),
          metaNocturno: getMetaNocturno(item.name),
          metaMatutino: getMetaMatutino(item.name),
          metaVespertino: getMetaVespertino(item.name),
        };
      }
    });
    return Object.values(groups);
  };
  // Calcular totales de hits por turno según la hora del registro
  const calcularTotalesPorTurno = (items) => {
    let totalNocturno = 0,
      totalMatutino = 0,
      totalVespertino = 0;
    items.forEach((item) => {
      if (!item.hour) return;
      const [hrStr, minStr] = item.hour.split(":");
      const hr = parseInt(hrStr, 10);
      const min = parseInt(minStr, 10);
      const totalMinutes = hr * 60 + min;
      // Turno nocturno: de 22:00 (1320) a 23:59 y de 00:00 a antes de 06:00 (360)
      if (totalMinutes >= 1320 || totalMinutes < 360) {
        totalNocturno += Number(item.hits);
      }
      // Turno matutino: de 06:30 (390) a 14:29 (869)
      else if (totalMinutes >= 390 && totalMinutes <= 869) {
        totalMatutino += Number(item.hits);
      }
      // Turno vespertino: de 14:30 (870) a 21:59 (1319)
      else if (totalMinutes >= 870 && totalMinutes < 1320) {
        totalVespertino += Number(item.hits);
      }
    });
    return { totalNocturno, totalMatutino, totalVespertino };
  };
  const agrupados = groupByName(items);
  const { totalNocturno, totalMatutino, totalVespertino } = calcularTotalesPorTurno(items);
  // Calcular metas generales para cada turno:
  // Se usa la fórmula: meta_por_hora * (horas del turno)
  const metaNocturnoGeneral = nombres.reduce(
    (sum, maquina) => sum + (getMetaNocturno(maquina) * 8),
    0
  );
  const metaMatutinoGeneral = nombres.reduce(
    (sum, maquina) => sum + (getMetaMatutino(maquina) * 8),
    0
  );
  const metaVespertinoGeneral = nombres.reduce(
    (sum, maquina) => sum + (getMetaVespertino(maquina) * 7),
    0
  );
  const metaGeneral = metaNocturnoGeneral + metaMatutinoGeneral + metaVespertinoGeneral;
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
        <table className="min-w-full divide-y divide-gray-200 text-center">
          <thead className="bg-blue-500">
            <tr className="text-[11px] xl:text-[12px]">
              <th className="px-3 xl:px-6 py-3 font-medium text-white uppercase">
                Nombre
              </th>
              <th className="px-3 xl:px-6 py-3 font-medium text-white uppercase">
                Total Jornada
              </th>
              <th className="px-3 xl:px-6 py-3 font-medium text-white uppercase">
                Meta Nocturno
              </th>
              <th className="px-3 xl:px-6 py-3 font-medium text-white uppercase">
                Meta Matutino
              </th>
              <th className="px-3 xl:px-6 py-3 font-medium text-white uppercase">
                Meta Vespertino
              </th>
            </tr>
          </thead>
          <tbody>
            {agrupados.map((item, idx) => {
              // Calculamos la meta por turno multiplicando la meta base (por hora)
              // por las horas correspondientes de cada turno
              const metaNocturnoTurno = item.metaNocturno * 8;
              const metaMatutinoTurno = item.metaMatutino * 8;
              const metaVespertinoTurno = item.metaVespertino * 7;
              // Suma total de la meta por jornada para esta máquina
              const metaJornada = metaNocturnoTurno + metaMatutinoTurno + metaVespertinoTurno;
              return (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-100"}>
                  <td className="px-6 py-4 whitespace-nowrap text-[11px] xl:text-[13.5px] text-gray-900">
                    {item.name}
                  </td>
                  <td className={`font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13px] ${getClassName(item.hits, metaJornada)}`}>
                    {formatNumber(item.hits)} / {formatNumber(metaJornada)}
                    <br />
                    <span className="text-[12.5px] text-gray-500">hits / meta</span>
                  </td>
                  <td className="font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13.5px] text-gray-900">
                    {formatNumber(metaNocturnoTurno)}
                  </td>
                  <td className="font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13.5px] text-gray-900">
                    {formatNumber(metaMatutinoTurno)}
                  </td>
                  <td className="font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13.5px] text-gray-900">
                    {formatNumber(metaVespertinoTurno)}
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
            <p className="text-xs text-gray-600">Total Nocturno / Meta Nocturno</p>
            <p className="text-lg font-bold">
              <span className={getClassName(totalNocturno, metaNocturnoGeneral)}>
                {formatNumber(totalNocturno)}
              </span>{" "}
              <span className="text-gray-500">
                / {formatNumber(metaNocturnoGeneral)}
              </span>
            </p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total Matutino / Meta Matutino</p>
            <p className="text-lg font-bold">
              <span className={getClassName(totalMatutino, metaMatutinoGeneral)}>
                {formatNumber(totalMatutino)}
              </span>{" "}
              <span className="text-gray-500">
                / {formatNumber(metaMatutinoGeneral)}
              </span>
            </p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">
              Total Vespertino / Meta Vespertino
            </p>
            <p className="text-lg font-bold">
              <span className={getClassName(totalVespertino, metaVespertinoGeneral)}>
                {formatNumber(totalVespertino)}
              </span>{" "}
              <span className="text-gray-500">
                / {formatNumber(metaVespertinoGeneral)}
              </span>
            </p>
          </div>
          <div className="text-center p-2 border border-gray-400 rounded">
            <p className="text-xs text-gray-600">Total General / Meta General</p>
            <p className="text-lg font-bold">
              <span
                className={getClassName(
                  totalNocturno + totalMatutino + totalVespertino,
                  metaGeneral
                )}
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