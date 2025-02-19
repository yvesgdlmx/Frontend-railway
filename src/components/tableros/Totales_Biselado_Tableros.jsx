import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import moment from "moment-timezone";

// Se establece la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");

const Totales_Biselado_Tableros = () => {
  // Forzamos la recarga cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => window.location.reload(), 300000);
    return () => clearInterval(interval);
  }, []);
  
  // Estados locales
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [horasDinamicas, setHorasDinamicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  // Orden de las máquinas (células) de interés
  const ordenCelulas = [
    "298 DOUBLER",
    "299 BISPHERA",
    "300 EDGER 1",
    "301 EDGER 2",
    "302 EDGER 3",
    "303 EDGER 4",
    "304 EDGER 5",
    "305 EDGER 6",
    "306 EDGER 7",
    "307 EDGER 8",
    "308 EDGER 9",
    "309 EDGER 10",
    "310 EDGER 11",
  ];

  // Arreglo fijo de intervalos (orden requerido)
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

  // Función para obtener el rango del turno: de 22:00 a 21:30 (día siguiente)
  const getShiftRange = () => {
    let shiftStart = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
    // Si la hora actual es antes de las 22:00, el turno inició el día anterior
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    // El turno dura 23 horas y 30 minutos (fin del turno: 21:30 del día siguiente)
    const shiftEnd = shiftStart.clone().add(23, "hours").add(30, "minutes");
    return { shiftStart, shiftEnd };
  };

  // Función auxiliar para calcular la suma de hits en un intervalo dado
  const hitsEnIntervalo = (registros, inicioIntervalo, finIntervalo) => {
    return registros
      .filter((r) => {
        const horaRegistro = moment(r.hour, "HH:mm:ss");
        const startMoment = moment(inicioIntervalo, "HH:mm");
        const endMoment = moment(finIntervalo, "HH:mm");
        // Si el intervalo cruza la medianoche (por ejemplo, de 23:00 a 00:00)
        if (startMoment.isAfter(endMoment)) {
          return horaRegistro.isSameOrAfter(startMoment) || horaRegistro.isBefore(endMoment);
        }
        return horaRegistro.isSameOrAfter(startMoment) && horaRegistro.isBefore(endMoment);
      })
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
  };

  // Carga de datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Obtener metas para biselados y normalizarlas
        const responseMetas = await clienteAxios("/metas/metas-biselados");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach(meta => {
            const key = meta.name.trim().toUpperCase().replace(/\s+/g, " ");
            metas[key] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        // 2. Obtener registros del endpoint de biselados
        const responseRegistros = await clienteAxios("/biselado/biselado/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];

        // Usar el rango de turno (22:00 a 21:30 del día siguiente)
        const { shiftStart, shiftEnd } = getShiftRange();

        // 3. Filtrar registros pertenecientes al turno
        const registrosFiltrados = dataRegistros.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(shiftStart, shiftEnd, null, "[)");
        });

        // 4. Agrupar registros por máquina (celula)
        const agrupados = {};
        registrosFiltrados.forEach(registro => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!agrupados[celula]) {
            agrupados[celula] = [];
          }
          agrupados[celula].push(registro);
        });
        setRegistrosAgrupados(agrupados);

        // 5. Calcular totales acumulados por máquina
        const acumulados = {};
        registrosFiltrados.forEach(registro => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);

        // 6. Calcular totales por turno (matutino, vespertino y nocturno) usando el rango del turno
        calcularTotalesPorTurno(registrosFiltrados, shiftStart, shiftEnd);

        // 7. Generar las columnas dinámicas: de fixedHoras se seleccionan aquellos intervalos con hits > 0
        const dynamic = fixedHoras.filter(intervalo => {
          const [inicio, fin] = intervalo.split(" - ");
          let totalIntervalo = 0;
          Object.values(agrupados).forEach(registros => {
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

  // Función para calcular los totales por turno usando el rango del turno
  const calcularTotalesPorTurno = (registros, shiftStart, shiftEnd) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0
    };
    // Definir límites: matutino = shiftStart a shiftStart + 8 horas, vespertino = +8 a +15 horas, nocturno = +15 hasta shiftEnd
    const matutinoEnd = shiftStart.clone().add(8, "hours");
    const vespertinoEnd = shiftStart.clone().add(15, "hours");

    registros.forEach(registro => {
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      if (fechaHoraRegistro.isBetween(shiftStart, matutinoEnd, null, "[)")) {
        totales.matutino += parseInt(registro.hits || 0, 10);
      } else if (fechaHoraRegistro.isBetween(matutinoEnd, vespertinoEnd, null, "[)")) {
        totales.vespertino += parseInt(registro.hits || 0, 10);
      } else if (fechaHoraRegistro.isBetween(vespertinoEnd, shiftEnd, null, "[)")) {
        totales.nocturno += parseInt(registro.hits || 0, 10);
      }
    });

    setTotalesPorTurno(totales);
  };

  // Cálculos para totales generales y metas
  const sumaTotalAcumulados = ordenCelulas.reduce(
    (acc, celula) => acc + (totalesAcumulados[celula] || 0),
    0
  );
  const sumaTotalMetas = ordenCelulas.reduce(
    (acc, celula) => acc + (metasPorMaquina[celula] || 0),
    0
  );
  const metaMatutinoFinal = sumaTotalMetas * 8;
  const metaVespertinoFinal = sumaTotalMetas * 7;
  const metaNocturnoFinal = sumaTotalMetas * 4;

  // Sumar hits por cada intervalo dinámico
  const sumaHitsPorHora = horasDinamicas.map(hora => {
    const [horaInicio, horaFin] = hora.split(" - ");
    return Object.values(registrosAgrupados)
      .flat()
      .filter(r => {
        const hourMoment = moment(r.hour, "HH:mm:ss");
        const startMoment = moment(horaInicio, "HH:mm");
        const endMoment = moment(horaFin, "HH:mm");
        if (startMoment.isAfter(endMoment)) {
          return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
        }
        return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
      })
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
  });

  const claseSumaTotalAcumulados =
    sumaTotalAcumulados >= metaMatutinoFinal + metaVespertinoFinal + metaNocturnoFinal
      ? "text-green-500"
      : "text-red-500";

  const getClassName = (hits, metaPorTurno) => {
    return hits >= metaPorTurno ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="w-full px-4">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>
                Nombre
              </th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              <th className="py-2 px-4 border-b">Meta</th>
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
              const meta = metasPorMaquina[celula] || 0;
              const metaAcumulada = meta * horasDinamicas.length;
              const claseTotalAcumulado =
                totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
              const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
              return (
                <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                  <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                    {celula}
                  </td>
                  <td className={`py-2 px-4 border-b font-bold ${claseTotalAcumulado}`}>
                    {totalAcumulado}
                  </td>
                  <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
                  {horasDinamicas.map((hora, idx) => {
                    const [horaInicio, horaFin] = hora.split(" - ");
                    const totalHits = registrosCelula.filter(r => {
                      const hourMoment = moment(r.hour, "HH:mm:ss");
                      const startMoment = moment(horaInicio, "HH:mm");
                      const endMoment = moment(horaFin, "HH:mm");
                      if (startMoment.isAfter(endMoment)) {
                        return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                      }
                      return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                    }).reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                    const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                    return (
                      <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                        {totalHits}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                Subtotal
              </td>
              <td className={`py-2 px-4 border-b fw font-bold ${claseSumaTotalAcumulados}`}>
                {sumaTotalAcumulados}
              </td>
              <td className="py-2 px-4 border-b fw font-bold">{sumaTotalMetas}</td>
              {sumaHitsPorHora.map((sumaHits, index) => {
                const claseSumaHits = sumaHits >= sumaTotalMetas ? "text-green-500" : "text-red-500";
                return (
                  <td key={index} className={`font-bold py-2 px-4 border-b fw ${claseSumaHits}`}>
                    {sumaHits}
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

export default Totales_Biselado_Tableros;