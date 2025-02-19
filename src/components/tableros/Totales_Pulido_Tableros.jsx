import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";

// Establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");

const Totales_Pulido_Tableros = () => {
  // Recarga la página cada 5 minutos para reiniciar la tabla cuando inicie la nueva jornada
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Estados locales
  const [registros, setRegistros] = useState([]);
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  // Máquinas de interés
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
  ];

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
        // Obtener metas desde "/metas/metas-pulidos" y normalizarlas
        const responseMetas = await clienteAxios("/metas/metas-pulidos");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, " ")] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        // Obtener registros desde "/pulido/pulido/actualdia"
        const responseRegistros = await clienteAxios("/pulido/pulido/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];

        // Usar la nueva jornada laboral
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

        // Calcular totales por máquina y acumular las "horas" en las que hubo registro
        const acumulados = {};
        const conjuntoHoras = new Set();
        registrosFiltrados.forEach(registro => {
          conjuntoHoras.add(registro.hour);
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);

        // En lugar de usar las horas registradas, usaremos el arreglo fixedHoras.
        // Se filtran aquellos intervalos en los que, sumando hits de todas las máquinas, el total > 0.
        const dynamic = fixedHoras.filter(intervalo => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          Object.values(agrupados).forEach(registros => {
            totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
          });
          return totalIntervalo > 0;
        });
        setHorasUnicas(dynamic);

        // Calcular totales por turno (si se requiere usar esta información)
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

  // Se calcula el total acumulado general y la suma de la meta acumulada para todas las máquinas.
  // La "meta acumulada" para cada máquina se define como: meta * número de columnas (horasUnicas.length)
  const totalAcumuladoGeneral = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaMetaAcumulada = ordenCelulas.reduce(
    (acc, celula) => acc + ((metasPorMaquina[celula] || 0) * horasUnicas.length),
    0
  );
  const claseTotalGeneral = totalAcumuladoGeneral >= sumaMetaAcumulada ? "text-green-500" : "text-red-500";

  return (
    <>
      <div className="w-full px-4">
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full bg-white border text-lg font-bold">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-4 px-6 border-b" style={{ minWidth: "250px" }}>Nombre</th>
                <th className="py-4 px-6 border-b">Total Acumulado</th>
                <th className="py-4 px-6 border-b">Meta</th>
                <th className="py-4 px-6 border-b">Meta Acumulada</th>
                {horasUnicas.map((hora, index) => (
                  <th key={index} className="py-4 px-6 border-b whitespace-nowrap">{hora}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center">
              {ordenCelulas.map((celula, index) => {
                const registrosCelula = registrosAgrupados[celula] || [];
                const totalAcumulado = totalesAcumulados[celula] || 0;
                const meta = metasPorMaquina[celula] || 0;
                const metaAcumulada = meta * horasUnicas.length;
                const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
                const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                    <td className="py-4 px-6 border-b font-bold" style={{ minWidth: "250px" }}>{celula}</td>
                    <td className={`py-4 px-6 border-b font-bold ${claseTotalAcumulado}`}>{totalAcumulado}</td>
                    <td className="py-4 px-6 border-b font-bold">{meta || "No definida"}</td>
                    <td className="py-4 px-6 border-b font-bold">{metaAcumulada}</td>
                    {horasUnicas.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const totalHits = registrosCelula.filter(r => {
                        const hourMoment = moment(r.hour, "HH:mm:ss");
                        const startMoment = moment(horaInicio, "HH:mm");
                        const endMoment = moment(horaFin, "HH:mm");
                        if (startMoment.isAfter(endMoment)) {
                          return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                        } else {
                          return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                        }
                      }).reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                      const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <td key={idx} className={`font-bold py-4 px-6 border-b ${claseHitsIndividual}`}>
                          {totalHits}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="font-semibold bg-green-200 text-gray-700">
                <td className="py-4 px-6 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
                <td className={`py-4 px-6 border-b font-bold ${claseTotalGeneral}`}>{totalAcumuladoGeneral}</td>
                <td className="py-4 px-6 border-b font-bold">
                  {ordenCelulas.reduce((acc, celula) => acc + (metasPorMaquina[celula] || 0), 0) || "No definidas"}
                </td>
                <td className="py-4 px-6 border-b font-bold">{sumaMetaAcumulada || "No definidas"}</td>
                {horasUnicas.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  let totalIntervalo = 0;
                  Object.values(registrosAgrupados).forEach(registros => {
                    totalIntervalo += hitsEnIntervalo(registros, horaInicio, horaFin);
                  });
                  const sumaMetas = ordenCelulas.reduce(
                    (acc, celula) => acc + (metasPorMaquina[celula] || 0),
                    0
                  );
                  const claseIntervalo = totalIntervalo >= sumaMetas ? "text-green-500" : "text-red-500";
                  return (
                    <td key={idx} className={`font-bold py-4 px-6 border-b ${claseIntervalo}`}>
                      {totalIntervalo}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Totales_Pulido_Tableros;