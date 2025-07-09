import React from "react";
import moment from "moment";
import { formatNumber } from "../../../helpers/formatNumber";
import { seccionesOrdenadas } from "../../../../utilidades/SeccionesOrdenadas";
const nombreMostrar = {
  "19 LENS LOG": "19 LENS LOG SF",
  "20 LENS LOG": "20 LENS LOG FIN"
};
const CardHistorial = ({ selectedYear, selectedMonth, selectedDay, registros, metas }) => {
  // Rango de fecha de la jornada
  const fechaFin = moment(`${selectedYear}-${selectedMonth}-${selectedDay}`, "YYYY-MM-DD").set({ hour: 21, minute: 59, second: 0 });
  const fechaInicio = moment(`${selectedYear}-${selectedMonth}-${selectedDay}`, "YYYY-MM-DD")
    .subtract(1, "days")
    .set({ hour: 22, minute: 0, second: 0 });
  const fechaInicioStr = fechaInicio.format("YYYY-MM-DD HH:mm");
  const fechaFinStr = fechaFin.format("YYYY-MM-DD HH:mm");
  // Función para obtener la meta de jornada de una máquina
  // (meta_nocturno x 8) + (meta_matutino x 8) + (meta_vespertino x 7)
  const getMetaJornada = (machineName) => {
    const metaObj = metas[machineName.trim()];
    if (!metaObj) return 0;
    return (Number(metaObj.meta_nocturno) || 0) * 8 +
           (Number(metaObj.meta_matutino) || 0) * 8 +
           (Number(metaObj.meta_vespertino) || 0) * 7;
  };
  // Agrupamos los registros por máquina y separamos los hits por turno
  const registrosAgrupados = registros.reduce((acc, registro) => {
    const { name, hits, hour } = registro;
    if (!acc[name]) {
      acc[name] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    }
    acc[name].hits += Number(hits);
    const horaRegistro = moment(hour, "HH:mm:ss");
    if (horaRegistro.isBetween(moment("06:30", "HH:mm"), moment("14:30", "HH:mm"), null, "[)")) {
      acc[name].turnos.matutino += Number(hits);
    } else if (horaRegistro.isBetween(moment("14:30", "HH:mm"), moment("21:30", "HH:mm"), null, "[)")) {
      acc[name].turnos.vespertino += Number(hits);
    } else {
      acc[name].turnos.nocturno += Number(hits);
    }
    return acc;
  }, {});
  // Creamos un objeto de registros para cada máquina
  const completeRegistros = {};
  seccionesOrdenadas.forEach((seccionObj) => {
    const { nombres } = seccionObj;
    if (Array.isArray(nombres)) {
      nombres.forEach((maquina) => {
        if (!completeRegistros[maquina]) {
          completeRegistros[maquina] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
        }
        if (registrosAgrupados[maquina]) {
          completeRegistros[maquina] = registrosAgrupados[maquina];
        }
      });
    }
  });
  // Calculamos los totales por sección (suma de hits y turnos)
  const totalesPorSeccion = {};
  seccionesOrdenadas.forEach((seccionObj) => {
    const { seccion, nombres } = seccionObj;
    totalesPorSeccion[seccion] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    if (Array.isArray(nombres)) {
      nombres.forEach((maquina) => {
        if (completeRegistros[maquina]) {
          totalesPorSeccion[seccion].hits += completeRegistros[maquina].hits;
          totalesPorSeccion[seccion].turnos.matutino += completeRegistros[maquina].turnos.matutino;
          totalesPorSeccion[seccion].turnos.vespertino += completeRegistros[maquina].turnos.vespertino;
          totalesPorSeccion[seccion].turnos.nocturno += completeRegistros[maquina].turnos.nocturno;
        }
      });
    }
  });
  // Calculamos las metas totales y por turno para cada sección
  const totalMetaSeccion = (nombres) =>
    nombres.reduce((total, maquina) => total + getMetaJornada(maquina), 0);
  const metaNocturnoSeccion = (nombres) =>
    nombres.reduce((total, maquina) => {
      const metaObj = metas[maquina.trim()];
      return total + ((Number(metaObj?.meta_nocturno) || 0) * 8);
    }, 0);
  const metaMatutinoSeccion = (nombres) =>
    nombres.reduce((total, maquina) => {
      const metaObj = metas[maquina.trim()];
      return total + ((Number(metaObj?.meta_matutino) || 0) * 8);
    }, 0);
  const metaVespertinoSeccion = (nombres) =>
    nombres.reduce((total, maquina) => {
      const metaObj = metas[maquina.trim()];
      return total + ((Number(metaObj?.meta_vespertino) || 0) * 7);
    }, 0);
  // Función para asignar la clase CSS según el cumplimiento de la meta
  const getClassName = (hits, meta) => (hits >= meta ? "text-green-600" : "text-red-600");
  return (
    <div>
      {seccionesOrdenadas.map((seccionObj) => {
        const { seccion, nombres } = seccionObj;
        if (!Array.isArray(nombres)) return null;
        const registrosSeccion = nombres.map((maquina) => ({
          maquina,
          registro: completeRegistros[maquina]
        }));
        const totalHitsSeccion = registrosSeccion.reduce((total, { registro }) => total + registro.hits, 0);
        if (totalHitsSeccion === 0) return null;
        
        const totalMeta = totalMetaSeccion(nombres);
        const claseMetaTotal = getClassName(totalHitsSeccion, totalMeta);
        const turnosSeccion = totalesPorSeccion[seccion].turnos;
        const metaNocturno = metaNocturnoSeccion(nombres);
        const metaMatutino = metaMatutinoSeccion(nombres);
        const metaVespertino = metaVespertinoSeccion(nombres);
        return (
          <div key={seccion} className="mb-8">
            <p className="text-center mb-2 text-sm text-gray-600">
              Rango de Fecha: {fechaInicioStr} - {fechaFinStr}
            </p>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{seccion}</h3>
              </div>
              <div className="p-4 space-y-4">
                {registrosSeccion.map(({ maquina, registro }, index) => {
                  const metaJornada = getMetaJornada(maquina);
                  const claseMeta = getClassName(registro.hits, metaJornada);
                  const nombreMostrarMaquina = nombreMostrar[maquina] || maquina;
                  return (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-700">{nombreMostrarMaquina}</span>
                      <div className="text-right">
                        <span className="block">
                          <span className={claseMeta}>{formatNumber(registro.hits)}</span>
                          <span className="text-gray-600"> / {formatNumber(metaJornada)}</span>
                        </span>
                        <span className="text-xs text-gray-500">Hits / Meta</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-700">Total Hits / Meta</span>
                  <span className="font-bold">
                    <span className={claseMetaTotal}>{formatNumber(totalHitsSeccion)}</span>
                    <span className="text-gray-600"> / {formatNumber(totalMeta)}</span>
                  </span>
                </div>
              </div>
              {/* Sección de turnos */}
              <div className="bg-green-50 p-4 border-t border-gray-200">
                <h4 className="font-semibold text-green-700 mb-2">Turnos</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="block text-gray-600">Nocturno</span>
                    <span className={`font-bold ${getClassName(turnosSeccion.nocturno, metaNocturno)}`}>
                      {formatNumber(turnosSeccion.nocturno)}
                    </span>
                    <span className="inline text-gray-500 text-xs">
                      / {formatNumber(metaNocturno)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-600">Matutino</span>
                    <span className={`font-bold ${getClassName(turnosSeccion.matutino, metaMatutino)}`}>
                      {formatNumber(turnosSeccion.matutino)}
                    </span>
                    <span className="inline text-gray-500 text-xs">
                      / {formatNumber(metaMatutino)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-600">Vespertino</span>
                    <span className={`font-bold ${getClassName(turnosSeccion.vespertino, metaVespertino)}`}>
                      {formatNumber(turnosSeccion.vespertino)}
                    </span>
                    <span className="inline text-gray-500 text-xs">
                      / {formatNumber(metaVespertino)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default CardHistorial;