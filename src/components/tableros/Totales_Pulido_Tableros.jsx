import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";
// Establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");
// Función para determinar la clave de meta según la hora (en formato "HH:mm")
// Se define: nocturno de 22:00 a 05:59, matutino de 06:00 a 13:59 y vespertino de 14:00 a 21:59
const getTurnoMetaKeyForTime = (timeStr) => {
  const t = moment(timeStr, "HH:mm");
  const hour = t.hour();
  if (hour >= 22 || hour < 6) return "meta_nocturno";
  if (hour >= 6 && hour < 14) return "meta_matutino";
  if (hour >= 14 && hour < 22) return "meta_vespertino";
};
const Totales_Pulido_Tableros = () => {
  // Recarga la página cada 5 minutos para reiniciar la tabla cuando inicie la nueva jornada
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);
  // Estados locales
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });
  // Máquinas de interés (normalizadas)
  const ordenCelulas = [
    "254 IFLEX SRVR",
    "255 POLISHR 1",
    "257 POLISHR 3",
    "258 POLISHR 4",
    "259 POLISHR 5",
    "260 POLISHR 6",
    "261 POLISHR 7",
    "262 POLISHR 8",
    "265 POLISHR 12",
    "266 MULTIFLEX 1",
    "267 MULTIFLEX 2",
    "268 MULTIFLEX 3",
    "269 MULTIFLEX 4"
  ].map(n => n.trim().toUpperCase());
  // Arreglo de intervalos fijos en el orden solicitado
  const fixedHoras = [
    "20:30 - 21:30",
    "19:30 - 20:30",
    "18:30 - 19:30",
    "17:30 - 18:30",
    "16:30 - 17:30",
    "15:30 - 16:30",
    "14:30 - 15:30",
    "13:30 - 14:30",
    "12:30 - 13:30",
    "11:30 - 12:30",
    "10:30 - 11:30",
    "09:30 - 10:30",
    "08:30 - 09:30",
    "07:30 - 08:30",
    "06:30 - 07:30",
    "05:00 - 06:00",
    "04:00 - 05:00",
    "03:00 - 04:00",
    "01:00 - 02:00",
    "00:00 - 01:00",
    "23:00 - 00:00",
    "22:00 - 23:00"
  ];
  // Función para obtener el rango del turno: de 22:00 de un día a 21:30 del siguiente
  const getShiftRange = () => {
    let shiftStart = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    const shiftEnd = shiftStart.clone().add(23, "hours").add(30, "minutes");
    return { shiftStart, shiftEnd };
  };
  // Función auxiliar para sumar los hits de un conjunto de registros que caen en un intervalo
  const hitsEnIntervalo = (registros, inicioIntervalo, finIntervalo) => {
    return registros
      .filter((r) => {
        const horaRegistro = moment(r.hour, "HH:mm:ss");
        const startMoment = moment(inicioIntervalo, "HH:mm");
        const endMoment = moment(finIntervalo, "HH:mm");
        if (startMoment.isAfter(endMoment)) {
          return horaRegistro.isSameOrAfter(startMoment) || horaRegistro.isBefore(endMoment);
        } else {
          return horaRegistro.isSameOrAfter(startMoment) && horaRegistro.isBefore(endMoment);
        }
      })
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
  };
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener las metas desde "/metas/metas-pulidos" y normalizarlas.
        // Se espera que cada registro incluya: meta_nocturno, meta_matutino y meta_vespertino
        const responseMetas = await clienteAxios("/metas/metas-pulidos");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            const key = meta.name.trim().toUpperCase().replace(/\s+/g, " ");
            metas[key] = {
              meta_nocturno: parseInt(meta.meta_nocturno, 10),
              meta_matutino: parseInt(meta.meta_matutino, 10),
              meta_vespertino: parseInt(meta.meta_vespertino, 10)
            };
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);
        // Obtener los registros desde "/pulido/pulido/actualdia"
        const responseRegistros = await clienteAxios("/pulido/pulido/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const { shiftStart, shiftEnd } = getShiftRange();
        // Filtrar los registros que se encuentren dentro del turno
        const registrosFiltrados = dataRegistros.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(shiftStart, shiftEnd, null, "[)");
        });
        // Agrupar registros por máquina (usando el primer segmento del nombre)
        const agrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!acc[celula]) {
            acc[celula] = [];
          }
          acc[celula].push(registro);
          return acc;
        }, {});
        setRegistrosAgrupados(agrupados);
        // Calcular totales acumulados por máquina y acumular las horas únicas de registro
        const acumulados = {};
        const conjuntoHoras = new Set();
        registrosFiltrados.forEach(registro => {
          conjuntoHoras.add(registro.hour);
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);
        // Definir las columnas dinámicas usando fixedHoras: filtrar aquellos intervalos en los que,
        // sumando los hits de todas las máquinas, el total es > 0.
        const dynamic = fixedHoras.filter(intervalo => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          Object.values(agrupados).forEach(registros => {
            totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
          });
          return totalIntervalo > 0;
        });
        setHorasUnicas(dynamic);
        // Calcular totales por turno (opcional)
        calcularTotalesPorTurno(registrosFiltrados, shiftStart);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);
  const calcularTotalesPorTurno = (registros, shiftStart) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0
    };
    registros.forEach(registro => {
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      if (fechaHoraRegistro.isBetween(shiftStart, moment(shiftStart).add(8, "hours"), null, "[)")) {
        totales.matutino += parseInt(registro.hits || 0, 10);
      } else if (
        fechaHoraRegistro.isBetween(
          moment(shiftStart).add(8, "hours"),
          moment(shiftStart).add(15, "hours"),
          null,
          "[)"
        )
      ) {
        totales.vespertino += parseInt(registro.hits || 0, 10);
      } else {
        totales.nocturno += parseInt(registro.hits || 0, 10);
      }
    });
    setTotalesPorTurno(totales);
  };
  // Función para obtener la meta acumulada por máquina, sumando para cada columna la meta correspondiente
  // determinada por el turno (según la hora de inicio del intervalo)
  const getMetaAcumuladaPorCelula = (celula) => {
    return horasUnicas.reduce((acum, intervalo) => {
      const [inicio] = intervalo.split(" - ");
      const turnoKey = getTurnoMetaKeyForTime(inicio.trim());
      const metaCol = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKey] : 0;
      return acum + metaCol;
    }, 0);
  };
  // Totales generales acumulados y suma de meta acumulada para todas las máquinas
  const totalAcumuladoGeneral = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const metaGeneral = ordenCelulas.reduce((acc, celula) => acc + getMetaAcumuladaPorCelula(celula), 0);
  const claseTotalGeneral = totalAcumuladoGeneral >= metaGeneral ? "text-green-500" : "text-red-500";
  return (
    <div className="w-full px-4">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white border text-lg font-bold">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-4 px-6 border-b" style={{ minWidth: "250px" }}>Nombre</th>
               <th className="py-4 px-6 border-b whitespace-nowrap">Total Acumulado / meta acumulada</th>
              {horasUnicas.map((hora, index) => (
                <th key={index} className="py-4 px-6 border-b whitespace-nowrap">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {ordenCelulas.map((celula, index) => {
              const registrosCelula = registrosAgrupados[celula] || [];
              const totalAcumulado = totalesAcumulados[celula] || 0;
              const metaAcumulada = getMetaAcumuladaPorCelula(celula);
              const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
              const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
              return (
                <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                  <td className="py-4 px-6 border-b font-bold" style={{ minWidth: "250px" }}>
                    {celula}
                  </td>
                  <td className="py-4 px-6 border-b font-bold">
                    <span className={claseTotalAcumulado}>{totalAcumulado}</span> / {metaAcumulada}
                  </td>
                  {horasUnicas.map((hora, idx) => {
                    const [horaInicio, horaFin] = hora.split(" - ");
                    const totalHits = hitsEnIntervalo(registrosCelula, horaInicio, horaFin);
                    const turnoKeyCol = getTurnoMetaKeyForTime(horaInicio.trim());
                    const metaCol = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKeyCol] : 0;
                    const claseHitsIndividual = totalHits >= metaCol ? "text-green-500" : "text-red-500";
                    return (
                      <td key={idx} className="font-bold py-4 px-6 border-b">
                        <span className={claseHitsIndividual}>{totalHits}</span> / {metaCol}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-4 px-6 border-b font-bold" style={{ minWidth: "250px" }}>
                Totales
              </td>
              <td className="py-4 px-6 border-b font-bold">
                <span className={claseTotalGeneral}>{totalAcumuladoGeneral}</span> / {metaGeneral}
              </td>
              {horasUnicas.map((hora, idx) => {
                const [horaInicio, horaFin] = hora.split(" - ");
                let totalIntervalo = 0;
                Object.values(registrosAgrupados).forEach(registros => {
                  totalIntervalo += hitsEnIntervalo(registros, horaInicio, horaFin);
                });
                const sumaMetas = ordenCelulas.reduce((acc, celula) => {
                  const turnoKeyCol = getTurnoMetaKeyForTime(horaInicio.trim());
                  const meta = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKeyCol] : 0;
                  return acc + meta;
                }, 0);
                const claseIntervalo = totalIntervalo >= sumaMetas ? "text-green-500" : "text-red-500";
                return (
                  <td key={idx} className="font-bold py-4 px-6 border-b">
                    <span className={claseIntervalo}>{totalIntervalo}</span> / {sumaMetas}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Totales_Pulido_Tableros;