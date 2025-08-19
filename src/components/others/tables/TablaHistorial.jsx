import React from "react";
import moment from "moment";
import { formatNumber } from "../../../helpers/formatNumber";
import { FaComment } from "react-icons/fa";
const TablaHistorial = ({ seccion, nombres, items, metas, notas = [] }) => {
  console.log("TablaHistorial -> seccion recibida:", seccion);
  console.log("TablaHistorial -> notas recibidas:", notas);
  
  const getMetaNocturno = (machineName) =>
    Number(metas[machineName.trim()]?.meta_nocturno) || 0;
  const getMetaMatutino = (machineName) =>
    Number(metas[machineName.trim()]?.meta_matutino) || 0;
  const getMetaVespertino = (machineName) =>
    Number(metas[machineName.trim()]?.meta_vespertino) || 0;
  
  const groupByName = (arr) => {
    const groups = {};
    nombres.forEach((machine) => {
      groups[machine] = {
        name: machine,
        hits: 0,
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
      if (totalMinutes >= 1320 || totalMinutes < 360) {
        totalNocturno += Number(item.hits);
      } else if (totalMinutes >= 390 && totalMinutes <= 869) {
        totalMatutino += Number(item.hits);
      } else if (totalMinutes >= 870 && totalMinutes < 1320) {
        totalVespertino += Number(item.hits);
      }
    });
    return { totalNocturno, totalMatutino, totalVespertino };
  };
  const agrupados = groupByName(items);
  const { totalNocturno, totalMatutino, totalVespertino } = calcularTotalesPorTurno(items);
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
  const getClassName = (total, meta) => {
    if (typeof meta !== "number") return "text-gray-500";
    return total >= meta ? "text-green-600" : "text-red-600";
  };
  // Función para obtener el mensaje para cada turno.
  // Se utiliza includes para ver si la seccion en la nota contiene la seccion del componente.
  const mensajeTurno = (turno) => {
    const turnoParam = turno.trim().toLowerCase();
    const seccionComp = seccion.trim().toLowerCase();
    const notasPorTurno = notas.filter((nota) => {
      const turnoNota = nota.turno.trim().toLowerCase();
      const seccionNota = nota.seccion.trim().toLowerCase();
      return turnoNota === turnoParam && seccionNota.includes(seccionComp);
    });
    console.log(
      `mensajeTurno -> Turno: ${turno}, SeccionComponente: "${seccion}" => Notas:`,
      notasPorTurno
    );
    return notasPorTurno.length > 0
      ? notasPorTurno.map((nota) => nota.comentario).join(" | ")
      : "No hay comentarios para este turno";
  };
  const cardClasses =
    seccion.trim().toLowerCase() === "producción" ||
    seccion.trim().toLowerCase() === "produccion"
      ? "bg-white shadow-md rounded overflow-hidden flex flex-col h-auto self-start"
      : "bg-white shadow-md rounded overflow-hidden flex flex-col h-full";
  return (
    <div className={cardClasses}>
      <div className="flex-grow">
        <h2 className="text-xl font-bold p-4 text-gray-500 text-center">
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
              const metaNocturnoTurno = item.metaNocturno * 8;
              const metaMatutinoTurno = item.metaMatutino * 8;
              const metaVespertinoTurno = item.metaVespertino * 7;
              const metaJornada = metaNocturnoTurno + metaMatutinoTurno + metaVespertinoTurno;
              return (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-blue-100"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-[11px] xl:text-[13.5px] text-gray-900">
                    {item.name}
                  </td>
                  <td className={`font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13px] ${getClassName(item.hits, metaJornada)}`}>
                    {formatNumber(item.hits)}
                    {mensajeTurno(item.name.toLowerCase()) !== "No hay comentarios para este turno" && (
                      <FaComment className="inline text-blue-500 ml-2" size={14} />
                    )}
                    <span className="text-gray-500">
                      {" "}
                      / {formatNumber(metaJornada)}
                    </span>
                    <br />
                    <span className="text-[12.5px] text-gray-500">hits / meta</span>
                  </td>
                  <td className="font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13.5px] text-gray-500">
                    {formatNumber(metaNocturnoTurno)}
                  </td>
                  <td className="font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13.5px] text-gray-500">
                    {formatNumber(metaMatutinoTurno)}
                  </td>
                  <td className="font-semibold px-6 py-4 whitespace-nowrap text-[11.5px] xl:text-[13.5px] text-gray-500">
                    {formatNumber(metaVespertinoTurno)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Resumen General con tooltips por turno */}
      <div className="bg-slate-50 p-4 border-t border-white rounded-b">
        <p className="text-center text-sm font-semibold text-gray-500 mb-2">
          Resumen General
        </p>
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <div
            className="text-center p-2 border border-gray-400 rounded"
            title={mensajeTurno("nocturno")}
          >
            <p className="text-xs text-gray-600">Total Nocturno / Meta Nocturno</p>
            <p className="text-lg font-bold">
              <span className={getClassName(totalNocturno, metaNocturnoGeneral)}>
                {formatNumber(totalNocturno)}
              </span>{" "}
              <span className="text-gray-500">
                / {formatNumber(metaNocturnoGeneral)}
              </span>
              {mensajeTurno("nocturno") !== "No hay comentarios para este turno" && (
                <FaComment className="inline text-blue-500 ml-4 mb-1" size={14} />
              )}
            </p>
          </div>
          <div
            className="text-center p-2 border border-gray-400 rounded"
            title={mensajeTurno("matutino")}
          >
            <p className="text-xs text-gray-600">Total Matutino / Meta Matutino</p>
            <p className="text-lg font-bold">
              <span className={getClassName(totalMatutino, metaMatutinoGeneral)}>
                {formatNumber(totalMatutino)}
              </span>{" "}
              <span className="text-gray-500">
                / {formatNumber(metaMatutinoGeneral)}
              </span>
              {mensajeTurno("matutino") !== "No hay comentarios para este turno" && (
                <FaComment className="inline text-blue-500 ml-4 mb-1" size={14} />
              )}
            </p>
          </div>
          <div
            className="text-center p-2 border border-gray-400 rounded"
            title={mensajeTurno("vespertino")}
          >
            <p className="text-xs text-gray-600">Total Vespertino / Meta Vespertino</p>
            <p className="text-lg font-bold">
              <span className={getClassName(totalVespertino, metaVespertinoGeneral)}>
                {formatNumber(totalVespertino)}
              </span>{" "}
              <span className="text-gray-500">
                / {formatNumber(metaVespertinoGeneral)}
              </span>
              {mensajeTurno("vespertino") !== "No hay comentarios para este turno" && (
                <FaComment className="inline text-blue-500 ml-4 mb-1" size={14} />
              )}
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
              <span className="text-gray-500">
                / {formatNumber(metaGeneral)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TablaHistorial;