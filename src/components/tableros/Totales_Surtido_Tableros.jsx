import React, { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";

// Establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");

const Totales_Surtido_Tableros = () => {
  // Estados locales para almacenar datos
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [dynamicHoras, setDynamicHoras] = useState([]);

  // Definir el orden (o las máquinas) de interés
  const ordenCelulas = ["19 LENS LOG", "20 LENS LOG"];

  // Arreglo de intervalos fijos (puedes ajustarlo o su orden)
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
    // Si la hora actual es antes de las 22:00, el turno inició el día anterior
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    // Fin del turno: 23 horas y 30 minutos después del inicio (21:30 del día siguiente)
    const shiftEnd = shiftStart.clone().add(23, "hours").add(30, "minutes");
    return { shiftStart, shiftEnd };
  };

  // Función auxiliar para calcular la suma de hits dentro de un intervalo dado
  const hitsEnIntervalo = (registros, inicioIntervalo, finIntervalo) => {
    return registros
      .filter((r) => {
        const horaRegistro = moment(r.hour, "HH:mm:ss");
        const startMoment = moment(inicioIntervalo, "HH:mm");
        const endMoment = moment(finIntervalo, "HH:mm");
        // Si el intervalo cruza la medianoche (por ejemplo, de 23:00 a 00:00)
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
        // Obtener las metas y conformar un objeto clave-valor (nombre en mayúsculas)
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const metasTemp = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
            const key = meta.name.trim().toUpperCase();
            metasTemp[key] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido.");
        }
        setMetasPorMaquina(metasTemp);

        // Obtener los registros actuales
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const { shiftStart, shiftEnd } = getShiftRange();

        // Filtrar registros:
        // – Por máquinas de interés (según ordenCelulas)
        // – Que se encuentren dentro del turno (shiftStart <= registro < shiftEnd)
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

        // Agrupar registros por máquina (celula) y calcular totales por cada una
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

        // Recorrer cada intervalo (fixedHoras) y filtrar solo aquellos con hits > 0
        const dynamic = fixedHoras.filter((intervalo) => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          // Sumar los hits de todas las máquinas para este intervalo
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

    // Actualización automática cada 5 minutos
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Calcular totales generales y suma de meta acumulada para todos los equipos
  const totalAcumuladoGeneral = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaMetaAcumulada = ordenCelulas.reduce(
    (acc, celula) => acc + ((metasPorMaquina[celula] || 0) * dynamicHoras.length),
    0
  );
  const claseTotalGeneral = totalAcumuladoGeneral >= sumaMetaAcumulada ? "text-green-500" : "text-red-500";

  return (
    <div className="w-full px-4">
      {/* Vista para pantallas grandes */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>Nombre</th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              <th className="py-2 px-4 border-b">Meta</th>
              <th className="py-2 px-4 border-b">Meta Acumulada</th>
              {dynamicHoras.map((hora, index) => (
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {ordenCelulas.map((celula, index) => {
              // Obtener registros por máquina, total y meta
              const registrosCelula = registrosAgrupados[celula] || [];
              const totalAcumulado = totalesAcumulados[celula] || 0;
              const meta = metasPorMaquina[celula] || 0;
              // Calcular meta acumulada = meta * cantidad de intervalos dinámicos
              const metaAcumulada = meta * dynamicHoras.length;
              // Clase de color según comparación
              const claseTotal = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
              const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";

              return (
                <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                  <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>{celula}</td>
                  <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>{totalAcumulado}</td>
                  <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
                  <td className="py-2 px-4 border-b font-bold">{metaAcumulada}</td>
                  {dynamicHoras.map((intervalo, idx) => {
                    const [inicio, fin] = intervalo.split(" - ");
                    const totalHits = hitsEnIntervalo(registrosCelula, inicio, fin);
                    const claseHits = totalHits >= meta ? "text-green-500" : "text-red-500";
                    return (
                      <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHits}`}>
                        {totalHits}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Fila de totales generales */}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                Totales
              </td>
              <td className={`py-2 px-4 border-b font-bold ${claseTotalGeneral}`}>
                {totalAcumuladoGeneral}
              </td>
              <td className="py-2 px-4 border-b font-bold">
                {ordenCelulas.reduce((acc, celula) => acc + (metasPorMaquina[celula] || 0), 0) || "No definidas"}
              </td>
              <td className="py-2 px-4 border-b font-bold">
                {sumaMetaAcumulada || "No definidas"}
              </td>
              {dynamicHoras.map((intervalo, idx) => {
                const [inicio, fin] = intervalo.split(" - ");
                let totalIntervalo = 0;
                Object.values(registrosAgrupados).forEach((registros) => {
                  totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
                });
                const sumaMetas = ordenCelulas.reduce(
                  (acc, celula) => acc + (metasPorMaquina[celula] || 0),
                  0
                );
                const claseIntervalo = totalIntervalo >= sumaMetas ? "text-green-500" : "text-red-500";
                return (
                  <td key={idx} className={`font-bold py-2 px-4 border-b ${claseIntervalo}`}>
                    {totalIntervalo}
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