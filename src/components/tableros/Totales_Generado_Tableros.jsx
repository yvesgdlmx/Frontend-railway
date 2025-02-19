import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";

// Establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");

const Totales_Generado_Tableros = () => {
  // Actualiza (re-carga) la página cada 5 minutos para reiniciar la tabla cuando inicia la nueva jornada
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

  // Máquinas de interés (normalizadas tal como se usan en los datos)
  const ordenCelulas = [
    "241 GENERATOR 1",
    "242 GENERATOR 2",
    "250 GENERATOR 3",
    "245 ORBIT 1 LA",
    "246 ORBIT 2 LA",
    "244 ORBIT 3 LA",
    "243 ORBIT 4 LA",
    "247 SCHNIDER 1",
    "248 SCHNIDER 2"
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

  // Función para obtener el rango del turno: de 22:00 de un día a 21:30 del día siguiente
  const getShiftRange = () => {
    let shiftStart = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
    // Si la hora actual es antes de las 22:00, el turno inició el día anterior
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    // Fin del turno: 23 horas y 30 minutos después (es decir, hasta las 21:30 del siguiente día)
    const shiftEnd = shiftStart.clone().add(23, "hours").add(30, "minutes");
    return { shiftStart, shiftEnd };
  };

  // Función para sumar los hits dentro de un intervalo dado 
  const hitsEnIntervalo = (registros, inicioIntervalo, finIntervalo) => {
    return registros.filter((r) => {
      const horaRegistro = moment(r.hour, "HH:mm:ss");
      const startMoment = moment(inicioIntervalo, "HH:mm");
      const endMoment = moment(finIntervalo, "HH:mm");
      // Si el intervalo cruza la medianoche (por ejemplo, de 23:00 a 00:00)
      if (startMoment.isAfter(endMoment)) {
        return horaRegistro.isSameOrAfter(startMoment) || horaRegistro.isBefore(endMoment);
      } else {
        return horaRegistro.isSameOrAfter(startMoment) && horaRegistro.isBefore(endMoment);
      }
    }).reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener las metas de generadores y normalizarlas
        const responseMetas = await clienteAxios("/metas/metas-generadores");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, " ")] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        // Obtener los registros actuales de generadores
        const responseRegistros = await clienteAxios("/generadores/generadores/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];

        // Usar la jornada laboral de 22:00 a 21:30 del siguiente día
        const { shiftStart, shiftEnd } = getShiftRange();

        // Filtrar los registros que caen dentro del turno definido
        const registrosFiltrados = dataRegistros.filter(registro => {
          const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, "YYYY-MM-DD HH:mm:ss", "America/Mexico_City");
          return fechaHoraRegistro.isBetween(shiftStart, shiftEnd, null, "[)");
        });

        // Agrupar los registros por máquina (normalizando el nombre)
        const agrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!acc[celula]) acc[celula] = [];
          acc[celula].push(registro);
          return acc;
        }, {});
        setRegistrosAgrupados(agrupados);

        // Calcular totales acumulados por máquina y recopilar las horas únicas de registro
        const acumulados = {};
        const conjuntoHoras = new Set();
        registrosFiltrados.forEach(registro => {
          conjuntoHoras.add(registro.hour);
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);

        // En lugar de usar las horas registradas para formar intervalos,
        // se usará el arreglo fixedHoras tal cual se definió. Se filtran
        // aquellos intervalos en los que, sumando los hits de todas las máquinas, el total > 0.
        const dynamic = fixedHoras.filter(intervalo => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          Object.values(agrupados).forEach(registros => {
            totalIntervalo += hitsEnIntervalo(registros, inicio, fin);
          });
          return totalIntervalo > 0;
        });
        // Se usa el arreglo "dynamic" sin invertir, de forma que se respete el orden definido en fixedHoras.
        setHorasUnicas(dynamic);

        // Calcular totales por turno (opcional, igual que en los otros componentes)
        calcularTotalesPorTurno(registrosFiltrados, shiftStart);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const calcularTotalesPorTurno = (registros, shiftStart) => {
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
    registros.forEach(registro => {
      const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, "YYYY-MM-DD HH:mm:ss", "America/Mexico_City");
      if (fechaHoraRegistro.isBetween(shiftStart, moment(shiftStart).add(8, "hours"), null, "[)")) {
        totales.matutino += parseInt(registro.hits || 0, 10);
      } else if (
        fechaHoraRegistro.isBetween(moment(shiftStart).add(8, "hours"), moment(shiftStart).add(15, "hours"), null, "[)")
      ) {
        totales.vespertino += parseInt(registro.hits || 0, 10);
      } else {
        totales.nocturno += parseInt(registro.hits || 0, 10);
      }
    });
    setTotalesPorTurno(totales);
  };

  // Para cada máquina se calculará la meta acumulada como:
  // metaAcumulada = meta (definida en las metas) * cantidad de columnas (horasUnicas)
  const totalAcumuladoGeneral = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaMetaAcumulada = ordenCelulas.reduce(
    (acc, celula) => acc + ((metasPorMaquina[celula] || 0) * horasUnicas.length),
    0
  );
  const claseTotalGeneral = totalAcumuladoGeneral >= sumaMetaAcumulada ? "text-green-500" : "text-red-500";

  return (
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
                const sumaMetas = ordenCelulas.reduce((acc, celula) => acc + (metasPorMaquina[celula] || 0), 0);
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
  );
};

export default Totales_Generado_Tableros;