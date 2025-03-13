import React from "react";
import moment from "moment";
// Definición de las estaciones y nombres a mostrar (puedes adaptarlo a lo que tengas definido)
const estaciones = {
  "Surtido": ["19 LENS LOG", "20 LENS LOG"],
  "Bloqueo de tallado": ["220 SRFBLK 1", "221 SRFBLK 2", "222 SRFBLK 3", "223 SRFBLK 4", "224 SRFBLK 5", "225 SRFBLK 6"],
  "Generado": ["241 GENERATOR 1", "242 GENERATOR 2", "250 GENERATOR 3", "245 ORBIT 1 LA", "246 ORBIT 2 LA", "244 ORBIT 3 LA", "243 ORBIT 4 LA", "247 SCHNIDER 1", "248 SCHNIDER 2"],
  "Pulido": ["255 POLISHR 1", "257 POLISHR 3", "259 POLISHR 5", "262 POLISHR 8", "265 POLISHR 12", "266 MULTIFLEX 1", "267 MULTIFLEX 2", "268 MULTIFLEX 3", "269 MULTIFLEX 4", "254 IFLEX SRVR"],
  "Engraver": ["270 ENGRVR 1", "271 ENGRVR 2", "272 ENGRVR 3", "273 ENGRVR 4"],
  "Desbloqueo": ["320 DEBLOCKING 1"],
  "AntiReflejante": ["91 VELOCITY 1", "92 VELOCITY 2", "52 FUSION", "53 1200 D", "55 TLF 1200.1", "56 TLF 1200.2"],
  "Bloqueo de terminado": ["280 FINBLKR 1", "281 FINBLKR 2", "282 FINBLKR 3"],
  "Biselado": ["298 DOUBLER", "299 BISPHERA", "300 EDGER 1", "301 EDGER 2", "302 EDGER 3", "303 EDGER 4", "304 EDGER 5", "305 EDGER 6", "306 EDGER 7", "307 EDGER 8", "308 EDGER 9", "309 EDGER 10", "310 EDGER 11", "311 EDFGER 12", "313 EDGER 13", "314 EDGER 14", "316 EDGER 15", "317 EDGER 16", "327 EDGER 17", "328 EDGER 18", "329 EDGER 19", "330 EDGER 20", "331 EDGER 21", "332 EDGER 22", "333 EDGER 23", "334 EDGER 24", "312 RAZR", "318 HSE 1", "319 HSE 2"],
  "Producción": ["32 JOB COMPLETE"],
};
const nombreMostrar = {
  "19 LENS LOG": "19 LENS LOG SF",
  "20 LENS LOG": "20 LENS LOG FIN"
};
const CardHistorialRangos = ({ selectedYear, selectedMonth, selectedDay, registros }) => {
  // Calculamos el rango de fecha de la jornada (inicio y fin) utilizando los props recibidos
  const fechaFin = moment(`${selectedYear}-${selectedMonth}-${selectedDay}`, 'YYYY-MM-DD').set({ hour: 21, minute: 59, second: 0 });
  const fechaInicio = moment(`${selectedYear}-${selectedMonth}-${selectedDay}`, 'YYYY-MM-DD')
    .subtract(1, 'days')
    .set({ hour: 22, minute: 0, second: 0 });
  const fechaInicioStr = fechaInicio.format('YYYY-MM-DD HH:mm');
  const fechaFinStr = fechaFin.format('YYYY-MM-DD HH:mm');
  // Agrupar los registros por máquina y desglosar por turnos
  const registrosAgrupados = registros.reduce((acc, registro) => {
    const { name, hits, hour } = registro;
    if (!acc[name]) {
      acc[name] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    }
    acc[name].hits += Number(hits);
    const horaRegistro = moment(hour, "HH:mm:ss");
    // Definir intervalos:
    // matutino: de 06:30 a 14:29, vespertino: de 14:30 a 21:29 y nocturno para el resto.
    if (horaRegistro.isBetween(moment("06:30", "HH:mm"), moment("14:30", "HH:mm"), null, "[)")) {
      acc[name].turnos.matutino += Number(hits);
    } else if (horaRegistro.isBetween(moment("14:30", "HH:mm"), moment("21:30", "HH:mm"), null, "[)")) {
      acc[name].turnos.vespertino += Number(hits);
    } else {
      acc[name].turnos.nocturno += Number(hits);
    }
    return acc;
  }, {});
  // Garantizamos que para cada máquina definida en las estaciones haya un registro (incluso en 0)
  const completeRegistros = {};
  Object.entries(estaciones).forEach(([nombreEstacion, maquinas]) => {
    maquinas.forEach((maquina) => {
      if (!completeRegistros[maquina]) {
        completeRegistros[maquina] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
      }
      if (registrosAgrupados[maquina]) {
        completeRegistros[maquina] = registrosAgrupados[maquina];
      }
    });
  });
  // Calcular totales de hits y turnos por estación
  const totalesPorEstacion = Object.entries(estaciones).reduce((acc, [nombreEstacion, maquinas]) => {
    acc[nombreEstacion] = { hits: 0, turnos: { matutino: 0, vespertino: 0, nocturno: 0 } };
    maquinas.forEach(maquina => {
      if (completeRegistros[maquina]) {
        acc[nombreEstacion].hits += completeRegistros[maquina].hits;
        acc[nombreEstacion].turnos.matutino += completeRegistros[maquina].turnos.matutino;
        acc[nombreEstacion].turnos.vespertino += completeRegistros[maquina].turnos.vespertino;
        acc[nombreEstacion].turnos.nocturno += completeRegistros[maquina].turnos.nocturno;
      }
    });
    return acc;
  }, {});
  return (
    <div>
      {Object.entries(estaciones).map(([nombreEstacion, maquinas]) => {
        // Creamos un arreglo con los datos por máquina para la estación actual
        const registrosEstacion = maquinas.map((maquina) => ({
          maquina,
          registro: completeRegistros[maquina]
        }));
        // Si no se registró ningún hit para todas las máquinas de la estación, se opta por no mostrar la tarjeta
        const totalHitsEstacion = registrosEstacion.reduce((total, { registro }) => total + registro.hits, 0);
        if (totalHitsEstacion === 0) return null;
        const turnosEstacion = totalesPorEstacion[nombreEstacion].turnos;
        return (
          <div key={nombreEstacion} className="mb-8">
            <p className="text-center mb-2 text-sm text-gray-600">
              Rango de Fecha: {fechaInicioStr} - {fechaFinStr}
            </p>
            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-500 text-white p-3">
                <h3 className="text-lg font-semibold">{nombreEstacion}</h3>
              </div>
              <div className="p-4 space-y-4">
                {registrosEstacion.map(({ maquina, registro }, index) => {
                  const nombreMostrarMaquina = nombreMostrar[maquina] || maquina;
                  return (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-500">{nombreMostrarMaquina}</span>
                      <span className="font-bold text-gray-500">{registro.hits}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-gray-500">Total</span>
                  <span className="font-bold text-gray-500">{totalHitsEstacion}</span>
                </div>
              </div>
              <div className="bg-green-50 p-4 border-t border-gray-200">
                <h4 className="font-semibold text-green-700 mb-2">Turnos</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="block text-gray-600">Nocturno</span>
                    <span className="font-bold text-gray-500">{turnosEstacion.nocturno}</span>
                  </div>
                  <div>
                    <span className="block text-gray-600">Matutino</span>
                    <span className="font-bold text-gray-500">{turnosEstacion.matutino}</span>
                  </div>
                  <div>
                    <span className="block text-gray-600">Vespertino</span>
                    <span className="font-bold text-gray-500">{turnosEstacion.vespertino}</span>
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
export default CardHistorialRangos;