import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";
// Establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");
// Función para determinar el turno (meta) a partir de una hora dada en formato "HH:mm"
const getTurnoMetaKeyForTime = (timeStr) => {
  const t = moment(timeStr, "HH:mm");
  const hour = t.hour();
  if (hour >= 22 || hour < 6) return "meta_nocturno";
  if (hour >= 6 && hour < 14) return "meta_matutino";
  if (hour >= 14 && hour < 22) return "meta_vespertino";
};
// Nota: La función getTurnoMetaKey se usaba para obtener el turno actual (por la hora actual)
// Si necesitáramos esa función, la podemos dejar, pero en este caso usaremos la función anterior para cada columna.
const getTurnoMetaKey = () => {
  const ahora = moment().tz("America/Mexico_City");
  const hora = parseInt(ahora.format("HH"), 10);
  if (hora >= 22 || hora < 6) return "meta_nocturno";
  if (hora >= 6 && hora < 14) return "meta_matutino";
  if (hora >= 14 && hora < 22) return "meta_vespertino";
};
const Totales_Surtido_Tableros = () => {
  // Estados locales para almacenar datos
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [dynamicHoras, setDynamicHoras] = useState([]);
  // Definir el orden de las máquinas de interés
  const ordenCelulas = ["19 LENS LOG", "20 LENS LOG"];
  // Arreglo de intervalos fijos
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
  
  // Función para obtener el inicio y fin del turno (22:00 a 21:30 del día siguiente)
  const getShiftRange = () => {
    let shiftStart = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    const shiftEnd = shiftStart.clone().add(23, "hours").add(30, "minutes");
    return { shiftStart, shiftEnd };
  };
  // Función auxiliar para calcular la suma de hits dentro de un intervalo
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
        // Obtener las metas (con las metas por turno)
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const metasTemp = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
            const key = meta.name.trim().toUpperCase();
            metasTemp[key] = meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido.");
        }
        setMetasPorMaquina(metasTemp);
        // Obtener los registros actuales
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const { shiftStart, shiftEnd } = getShiftRange();
        // Filtrar registros por máquinas de interés y que estén dentro del turno
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
        // Agrupar registros por máquina y calcular totales acumulados
        const agrupados = {};
        const totalesAcum = {};
        registrosFiltrados.forEach((registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase();
          if (!agrupados[celula]) {
            agrupados[celula] = [];
          }
          agrupados[celula].push(registro);
          totalesAcum[celula] = (totalesAcum[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setRegistrosAgrupados(agrupados);
        setTotalesAcumulados(totalesAcum);
        // Definir los intervalos dinámicos en base a los intervalos fijos que tengan hits > 0
        const dynamic = fixedHoras.filter((intervalo) => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          Object.values(agrupados).forEach((registros) => {
            totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
          });
          return totalIntervalo > 0;
        });
        setDynamicHoras(dynamic);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);
  // En vez de usar una meta fija para la fila "Acumulado / Meta Acumulada",
  // sumamos las metas correspondientes a cada columna, según el turno de la hora de inicio.
  const getMetaAcumuladaPorCelula = (celula) => {
    return dynamicHoras.reduce((acum, intervalo) => {
      const [inicio] = intervalo.split(" - ");
      const turnoKeyCol = getTurnoMetaKeyForTime(inicio.trim());
      const metaCol = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKeyCol] : 0;
      return acum + metaCol;
    }, 0);
  };
  // Para el total general recorremos las máquinas y sumamos sus metas acumuladas
  const metaGeneral = ordenCelulas.reduce((acum, celula) => {
    return acum + getMetaAcumuladaPorCelula(celula);
  }, 0);
  const totalGeneral = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const claseTotalGeneral = totalGeneral >= metaGeneral ? "text-green-500" : "text-red-500";
  return (
    <div className="w-full px-4">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>Nombre</th>
              <th className="py-2 px-4 border-b whitespace-nowrap">Total Acumulado / Meta Acumulada</th>
              {dynamicHoras.map((hora, index) => (
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
              const claseTotalRow = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
              const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
              return (
                <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                  <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                    {celula}
                  </td>
                  <td className="py-2 px-4 border-b font-bold">
                    <span className={claseTotalRow}>{totalAcumulado}</span> / {metaAcumulada}
                  </td>
                  {dynamicHoras.map((intervalo, idx) => {
                    const [inicio, fin] = intervalo.split(" - ");
                    const totalHits = hitsEnIntervalo(registrosCelula, inicio, fin);
                    // Aquí, para cada columna usamos la hora de inicio para determinar el turno y su meta
                    const turnoKeyCol = getTurnoMetaKeyForTime(inicio.trim());
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
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
              <td className="py-2 px-4 border-b font-bold">
                <span className={claseTotalGeneral}>{totalGeneral}</span> / {metaGeneral}
              </td>
              {dynamicHoras.map((intervalo, idx) => {
                const [inicio, fin] = intervalo.split(" - ");
                let totalIntervalo = 0;
                Object.values(registrosAgrupados).forEach((registros) => {
                  totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
                });
                const sumaMetasCol = ordenCelulas.reduce((acc, celula) => {
                  const turnoKeyCol = getTurnoMetaKeyForTime(inicio.trim());
                  const meta = metasPorMaquina[celula] ? metasPorMaquina[celula][turnoKeyCol] : 0;
                  return acc + meta;
                }, 0);
                const claseIntervalo = totalIntervalo >= sumaMetasCol ? "text-green-500" : "text-red-500";
                return (
                  <td key={idx} className="font-bold py-2 px-4 border-b">
                    <span className={claseIntervalo}>{totalIntervalo}</span> / {sumaMetasCol}
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
export default Totales_Surtido_Tableros;