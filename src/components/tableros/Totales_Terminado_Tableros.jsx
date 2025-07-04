import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";
// Establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");
// Función para determinar la clave de meta según la hora (formato "HH:mm")
// Se define: nocturno de 22:00 a 05:59, matutino de 06:00 a 13:59 y vespertino de 14:00 a 21:59
const getTurnoMetaKeyForTime = (timeStr) => {
  const t = moment(timeStr, "HH:mm");
  const hour = t.hour();
  if (hour >= 22 || hour < 6) return "meta_nocturno";
  if (hour >= 6 && hour < 14) return "meta_matutino";
  if (hour >= 14 && hour < 22) return "meta_vespertino";
};
const Totales_Terminado_Tableros = () => {
  // Estados locales
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [horasDinamicas, setHorasDinamicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  // Orden de celdas (máquinas) de interés (normalizadas)
  const ordenCelulas = [
    "280 FINBLKR 1",
    "281 FINBLKR 2",
    "282 FINBLKR 3",
    "285 C6 WECO"
  ].map(n => n.trim().toUpperCase());
  // Definición de los intervalos fijos en el orden solicitado
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
  // Función para obtener el rango del turno: de 22:00 de un día a 21:30 del día siguiente
  const getShiftRange = () => {
    let shiftStart = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    const shiftEnd = shiftStart.clone().add(23, "hours").add(30, "minutes");
    return { shiftStart, shiftEnd };
  };
  // Función auxiliar para sumar los hits que caen dentro de un intervalo dado
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
  // Recargar la página cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Obtener metas desde "/metas/metas-terminados" y normalizarlas.
        const responseMetas = await clienteAxios("/metas/metas-terminados");
        const metasTemp = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
            const key = meta.name.trim().toUpperCase().replace(/\s+/g, " ");
            metasTemp[key] = {
              meta_nocturno: parseInt(meta.meta_nocturno, 10),
              meta_matutino: parseInt(meta.meta_matutino, 10),
              meta_vespertino: parseInt(meta.meta_vespertino, 10)
            };
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido.");
        }
        setMetasPorMaquina(metasTemp);
        // 2. Obtener registros desde "/terminado/terminado/actualdia"
        const responseRegistros = await clienteAxios("/terminado/terminado/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const { shiftStart, shiftEnd } = getShiftRange();
        // 3. Filtrar registros que se encuentren dentro del turno y que pertenezcan a las máquinas de interés
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase();
          if (!ordenCelulas.includes(celula)) return false;
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(shiftStart, shiftEnd, null, "[)");
        });
        // 4. Agrupar registros por máquina y acumular hits
        const agrupados = {};
        const acumulados = {};
        registrosFiltrados.forEach((registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase();
          if (!agrupados[celula]) {
            agrupados[celula] = [];
          }
          agrupados[celula].push(registro);
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setRegistrosAgrupados(agrupados);
        setTotalesAcumulados(acumulados);
        // 5. De fixedHoras se obtienen los intervalos dinámicos en los que la suma de hits es > 0
        const dynamic = fixedHoras.filter((intervalo) => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          Object.values(agrupados).forEach((registros) => {
            totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
          });
          return totalIntervalo > 0;
        });
        setHorasDinamicas(dynamic);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);
  // Función para obtener la meta acumulada por máquina: suma para cada intervalo la meta correspondiente
  // determinada según el turno (según la hora de inicio del intervalo)
  const getMetaAcumuladaPorCelula = (celula) => {
    return horasDinamicas.reduce((acum, intervalo) => {
      const [inicio] = intervalo.split(" - ");
      const turnoKey = getTurnoMetaKeyForTime(inicio.trim());
      const metaCol = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKey] : 0;
      return acum + metaCol;
    }, 0);
  };
  // Totales generales: total acumulado y suma de la meta acumulada para todas las máquinas
  const totalAcumuladoGeneral = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaMetaAcumulada = ordenCelulas.reduce(
    (acc, celula) => acc + getMetaAcumuladaPorCelula(celula),
    0
  );
  const claseTotalGeneral = totalAcumuladoGeneral >= sumaMetaAcumulada ? "text-green-500" : "text-red-500";
  return (
    <div className="w-full px-4">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>
                Nombre
              </th>
              <th className="py-4 px-6 border-b whitespace-nowrap">Total Acumulado / meta acumulada</th>
              {horasDinamicas.map((hora, index) => (
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">
                  {hora}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {ordenCelulas.map((celula, index) => {
              const registrosCelula = registrosAgrupados[celula] || [];
              const totalAcumulado = totalesAcumulados[celula] || 0;
              const metaAcumulada = getMetaAcumuladaPorCelula(celula);
              const claseTotal = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
              const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
              return (
                <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                  <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                    {celula}
                  </td>
                  <td className="py-2 px-4 border-b font-bold">
                    <span className={claseTotal}>{totalAcumulado}</span> / {metaAcumulada}
                  </td>
                  {horasDinamicas.map((intervalo, idx) => {
                    const [horaInicio, horaFin] = intervalo.split(" - ");
                    const totalHits = hitsEnIntervalo(registrosCelula, horaInicio, horaFin);
                    const turnoKeyCol = getTurnoMetaKeyForTime(horaInicio.trim());
                    const metaCol = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKeyCol] : 0;
                    const claseHits = totalHits >= metaCol ? "text-green-500" : "text-red-500";
                    return (
                      <td key={idx} className="font-bold py-2 px-4 border-b">
                        <span className={claseHits}>{totalHits}</span> / {metaCol}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                Totales
              </td>
              <td className="py-2 px-4 border-b font-bold">
                <span className={claseTotalGeneral}>{totalAcumuladoGeneral}</span> / {sumaMetaAcumulada}
              </td>
              {horasDinamicas.map((intervalo, idx) => {
                const [horaInicio, horaFin] = intervalo.split(" - ");
                let totalIntervalo = 0;
                Object.values(registrosAgrupados).forEach((registros) => {
                  totalIntervalo += hitsEnIntervalo(registros, horaInicio, horaFin);
                });
                const sumaMetas = ordenCelulas.reduce((acc, celula) => {
                  const turnoKeyCol = getTurnoMetaKeyForTime(horaInicio.trim());
                  const meta = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKeyCol] : 0;
                  return acc + meta;
                }, 0);
                const claseIntervalo = totalIntervalo >= sumaMetas ? "text-green-500" : "text-red-500";
                return (
                  <td key={idx} className="font-bold py-2 px-4 border-b">
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
export default Totales_Terminado_Tableros;