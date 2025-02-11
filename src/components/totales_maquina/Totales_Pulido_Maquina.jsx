import { useEffect, useState, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
moment.tz.setDefault("America/Mexico_City");

// Función auxiliar para construir un objeto moment usando la fecha base según la hora
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const parts = horaStr.split(":");
  const hour = parseInt(parts[0], 10);
  // Si la hora es mayor o igual a 22, la fecha base es shiftStart; de lo contrario, se suma un día.
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
};

// Función auxiliar para obtener el total de hits en un intervalo dado
const getTotalHitsForInterval = (registros, horaInicio, horaFin) => {
  const ahora = moment.tz("America/Mexico_City");
  let shiftStart = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
  if (ahora.isBefore(shiftStart)) {
    shiftStart.subtract(1, "days");
  }
  const startInterval = getIntervalTimestamp(shiftStart, horaInicio);
  const endInterval = getIntervalTimestamp(shiftStart, horaFin);
  return registros
    .filter((r) => {
      const registroDateTime = moment.tz(
        `${r.fecha} ${r.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      return registroDateTime.isSameOrAfter(startInterval) && registroDateTime.isBefore(endInterval);
    })
    .reduce((acc, curr) => acc + parseInt(curr.hits || "0", 10), 0);
};

// Componente para el título desplegable
const TituloSeccion = ({ titulo, isOpen, toggle }) => (
  <div 
    className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 py-6 cursor-pointer rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-md"
    onClick={toggle}
  >
    <div className="flex items-center space-x-3">
      <CogIcon className="h-6 w-6 text-blue-300" />
      <h2 className="font-semibold text-gray-600">{titulo}</h2>
    </div>
    {isOpen ? (
      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
    ) : (
      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
    )}
  </div>
);

const SeccionMenu = ({ titulo, isOpen, toggle, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);
  return (
    <div className="overflow-hidden mb-4">
      <TituloSeccion 
        titulo={titulo} 
        isOpen={isOpen} 
        toggle={toggle}
      />
      <div 
        ref={contentRef}
        style={{ maxHeight: isOpen ? `${height}px` : "0px" }}
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? "opacity-100 mt-4" : "opacity-0"}
        `}
      >
        {children}
      </div>
    </div>
  );
};

const Totales_Pulido_Maquina = () => {
  // Efecto para recargar la aplicación: cada 5 minutos y en el momento exacto de las 22:00
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // 5 minutos

    const now = moment();
    let target = moment().hour(22).minute(0).second(0);
    if (now.isAfter(target)) {
      target.add(1, "days");
    }
    const delay = target.diff(now);
    const timeout = setTimeout(() => {
      window.location.reload();
    }, delay);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Estados locales
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const [totalesPorTurnoYMaquina, setTotalesPorTurnoYMaquina] = useState({});
  // Se define un arreglo fijo de franjas horarias en el orden deseado
  const fixedHoras = [
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
    "02:00 - 03:00",
    "01:00 - 02:00",
    "00:00 - 01:00",
    "23:00 - 00:00",
    "22:00 - 23:00"
  ];
  const [horasUnicas, setHorasUnicas] = useState(fixedHoras);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  const ordenCelulas = [
    "254 IFLEX SRVR",
    "255 POLISHR 1",
    "256 POLISHR 2",
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

  const toggleSeccion = (celula) => {
    setSeccionesAbiertas(prev => ({ ...prev, [celula]: !prev[celula] }));
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar metas
        const responseMetas = await clienteAxios("/metas/metas-pulidos");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
            // Se elimina espacios de más y se pasa a mayúsculas
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, " ")] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        // Cargar registros de la jornada actual
        const responseRegistros = await clienteAxios("/pulido/pulido/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const ahora = moment();
        let inicioHoy = moment().startOf("day").add(22, "hours"); // Inicio de jornada a las 22:00 del día actual
        let finHoy = moment(inicioHoy).add(1, "days").subtract(30, "minutes"); // Hasta 21:30 del día siguiente
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, "days");
          finHoy.subtract(1, "days");
        }
        // Filtrar registros dentro de la jornada
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[)");
        });
        // Agrupar los registros según la célula (se extrae la parte antes del guión)
        const agrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!acc[celula]) {
            acc[celula] = [];
          }
          acc[celula].push(registro);
          return acc;
        }, {});
        setRegistrosAgrupados(agrupados);

        // Se asigna el arreglo fijo de horas
        setHorasUnicas(fixedHoras);

        // Acumulados totales por célula
        const acumulados = {};
        registrosFiltrados.forEach((registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);

        // Totales por turno y por célula
        const totalesMaquina = calcularTotalesPorTurnoYMaquina(registrosFiltrados, inicioHoy);
        setTotalesPorTurnoYMaquina(totalesMaquina);
        calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // Calcula totales por turno (según la jornada que comienza a las 22:00)
  const calcularTotalesPorTurno = (registros, inicioHoy) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0
    };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      if (fechaHoraRegistro.isBetween(inicioHoy.clone(), inicioHoy.clone().add(8, "hours"), null, "[)")) {
        totales.nocturno += parseInt(registro.hits || 0, 10);
      } else if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone().add(8, "hours").add(30, "minutes"),
          inicioHoy.clone().add(16, "hours"),
          null,
          "[)"
        )
      ) {
        totales.matutino += parseInt(registro.hits || 0, 10);
      } else if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone().add(16, "hours").add(30, "minutes"),
          inicioHoy.clone().add(23, "hours").add(30, "minutes"),
          null,
          "[)"
        )
      ) {
        totales.vespertino += parseInt(registro.hits || 0, 10);
      }
    });
    setTotalesPorTurno(totales);
  };

  const calcularTotalesPorTurnoYMaquina = (registros, inicioHoy) => {
    const totales = {};
    ordenCelulas.forEach((celula) => {
      totales[celula] = { matutino: 0, vespertino: 0, nocturno: 0 };
    });
    registros.forEach((registro) => {
      const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
      if (!totales[celula]) {
        totales[celula] = { matutino: 0, vespertino: 0, nocturno: 0 };
      }
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      if (fechaHoraRegistro.isBetween(inicioHoy.clone(), inicioHoy.clone().add(8, "hours"), null, "[)")) {
        totales[celula].nocturno += parseInt(registro.hits || 0, 10);
      } else if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone().add(8, "hours").add(30, "minutes"),
          inicioHoy.clone().add(16, "hours"),
          null,
          "[)"
        )
      ) {
        totales[celula].matutino += parseInt(registro.hits || 0, 10);
      } else if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone().add(16, "hours").add(30, "minutes"),
          inicioHoy.clone().add(23, "hours").add(30, "minutes"),
          null,
          "[)"
        )
      ) {
        totales[celula].vespertino += parseInt(registro.hits || 0, 10);
      }
    });
    return totales;
  };

  // Sumas totales (en la vista de totales de la tabla)
  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce(
    (acc, celula) => acc + (metasPorMaquina[celula] || 0),
    0
  );
  // Meta final por turno
  const metaMatutinoFinal = sumaTotalMetas * 8;
  const metaVespertinoFinal = sumaTotalMetas * 7;
  const metaNocturnoFinal = sumaTotalMetas * 8;
  const claseSumaTotalAcumulados =
    sumaTotalAcumulados >= (metaMatutinoFinal + metaVespertinoFinal + metaNocturnoFinal)
      ? "text-green-500"
      : "text-red-500";

  // Filtrado de franjas horarias: se conservan solo aquellas donde la suma total de hits (usando fecha + hora completa) sea mayor que 0.
  const filteredHoras = useMemo(() => {
    // Calculamos shiftStart siguiendo la misma lógica de la función auxiliar
    const ahora = moment.tz("America/Mexico_City");
    let shiftStart = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
    if (ahora.isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    return horasUnicas.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
      // Sumamos los hits de todos los registros (utilizando la marca de tiempo completa)
      const totalHits = Object.values(registrosAgrupados)
        .flat()
        .reduce((acc, r) => {
          const registroDateTime = moment.tz(
            `${r.fecha} ${r.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          const startInterval = getIntervalTimestamp(shiftStart, horaInicio);
          const endInterval = getIntervalTimestamp(shiftStart, horaFin);
          if (registroDateTime.isSameOrAfter(startInterval) && registroDateTime.isBefore(endInterval)) {
            return acc + parseInt(r.hits || "0", 10);
          }
          return acc;
        }, 0);
      return totalHits > 0;
    });
  }, [horasUnicas, registrosAgrupados]);

  const getClassName = (hits, metaPorTurno) =>
    hits >= metaPorTurno ? "text-green-500" : "text-red-500";

  return (
    <>
      <div className="max-w-screen-xl">
        {/* Vista en cards para pantallas pequeñas y medianas */}
        <div className="lg:hidden mt-4">
          {ordenCelulas.map((celula, index) => {
            const registrosCelula = registrosAgrupados[celula] || [];
            const totalAcumulado = totalesAcumulados[celula] || 0;
            const meta = metasPorMaquina[celula] || 0;
            const metaAcumulada = meta * horasUnicas.length;
            const claseTotalAcumulado =
              totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
            const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
            const horasMatutino = Math.min(
              moment().diff(moment().startOf("day").add(6, "hours").add(30, "minutes"), "hours"),
              8
            );
            const horasVespertino = Math.min(
              Math.max(moment().diff(moment().startOf("day").add(14, "hours").add(30, "minutes"), "hours"), 0),
              7
            );
            const horasNocturno = Math.min(
              Math.max(moment().diff(moment().startOf("day").add(22, "hours"), "hours"), 0),
              8
            );
            const metaMatutino = meta * horasMatutino;
            const metaVespertino = meta * horasVespertino;
            const metaNocturno = meta * horasNocturno;
            return (
              <SeccionMenu
                key={index}
                titulo={celula}
                isOpen={seccionesAbiertas[celula] || false}
                toggle={() => toggleSeccion(celula)}
              >
                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-bold text-gray-700">Total Acumulado:</span>
                    <span className={`font-bold ${claseTotalAcumulado}`}>{totalAcumulado}</span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">Meta:</span>
                    <span className="font-bold text-gray-700">{meta || "No definida"}</span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">Meta Acumulada:</span>
                    <span className="font-bold text-gray-700">{metaAcumulada}</span>
                  </div>
                  <div className="py-4">
                    <span className="font-bold text-gray-700">Horas:</span>
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const totalHits = registrosCelula
                        .filter((r) => {
                          const registroDateTime = moment.tz(
                            `${r.fecha} ${r.hour}`,
                            "YYYY-MM-DD HH:mm:ss",
                            "America/Mexico_City"
                          );
                          const startMoment = getIntervalTimestamp(
                            moment().tz("America/Mexico_City").startOf("day").add(22, "hours"), 
                            horaInicio
                          );
                          const endMoment = getIntervalTimestamp(
                            moment().tz("America/Mexico_City").startOf("day").add(22, "hours"), 
                            horaFin
                          );
                          return registroDateTime.isSameOrAfter(startMoment) && registroDateTime.isBefore(endMoment);
                        })
                        .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                      const bgColor = idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300";
                      const hitsClass = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                          <span className="font-bold text-gray-700">{hora}:</span>
                          <span className={`font-bold ${hitsClass}`}>{totalHits}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SeccionMenu>
            );
          })}
        </div>

        {/* Vista en tabla para pantallas grandes */}
        <div className="hidden lg:block">
          <Navegacion/>
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>Nombre</th>
                <th className="py-2 px-4 border-b">Total Acumulado</th>
                <th className="py-2 px-4 border-b">Meta</th>
                <th className="py-2 px-4 border-b">Meta Acumulada</th>
                {["nocturno", "matutino", "vespertino"].map((turno) => (
                  <th key={turno} className="py-2 px-4 border-b">
                    {`T. ${turno.charAt(0).toUpperCase() + turno.slice(1)}`}
                  </th>
                ))}
                {filteredHoras.map((hora, index) => (
                  <th key={index} className="py-2 px-4 border-b whitespace-nowrap">{hora}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center">
              {ordenCelulas.map((celula, index) => {
                const registrosCelula = registrosAgrupados[celula] || [];
                const totalAcumulado = totalesAcumulados[celula] || 0;
                const meta = metasPorMaquina[celula] || 0;
                const metaAcumulada = meta * horasUnicas.length;
                const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
                const horasMatutino = Math.min(
                  moment().diff(moment().startOf("day").add(6, "hours").add(30, "minutes"), "hours"),
                  8
                );
                const horasVespertino = Math.min(
                  Math.max(moment().diff(moment().startOf("day").add(14, "hours").add(30, "minutes"), "hours"), 0),
                  7
                );
                const horasNocturno = Math.min(
                  Math.max(moment().diff(moment().startOf("day").add(22, "hours"), "hours"), 0),
                  8
                );
                const metaMatutino = meta * horasMatutino;
                const metaVespertino = meta * horasVespertino;
                const metaNocturno = meta * horasNocturno;
                const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                    <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>{celula}</td>
                    <td className={`py-2 px-4 border-b font-bold ${totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500"}`}>{totalAcumulado}</td>
                    <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
                    <td className="py-2 px-4 border-b font-bold">{metaAcumulada}</td>
                    {["nocturno", "matutino", "vespertino"].map((turno) => (
                      <td
                        key={turno}
                        className={`py-2 px-4 border-b font-bold ${
                          totalesTurno[turno] > 0 &&
                          totalesTurno[turno] >= (turno === "matutino" ? metaMatutino : turno === "vespertino" ? metaVespertino : metaNocturno)
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {totalesTurno[turno] || 0}
                      </td>
                    ))}
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const totalHits = registrosCelula
                        .filter((r) => {
                          const registroDateTime = moment.tz(
                            `${r.fecha} ${r.hour}`,
                            "YYYY-MM-DD HH:mm:ss",
                            "America/Mexico_City"
                          );
                          const startMoment = getIntervalTimestamp(
                            moment().tz("America/Mexico_City").startOf("day").add(22, "hours"),
                            horaInicio
                          );
                          const endMoment = getIntervalTimestamp(
                            moment().tz("America/Mexico_City").startOf("day").add(22, "hours"),
                            horaFin
                          );
                          return registroDateTime.isSameOrAfter(startMoment) && registroDateTime.isBefore(endMoment);
                        })
                        .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                      const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>{totalHits}</td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="font-semibold bg-green-200 text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
                <td className={`py-2 px-4 border-b font-bold ${claseSumaTotalAcumulados}`}>{sumaTotalAcumulados}</td>
                <td className="py-2 px-4 border-b font-bold">{sumaTotalMetas}</td>
                <td className="py-2 px-4 border-b font-bold">{sumaTotalMetas * horasUnicas.length}</td>
                {["nocturno", "matutino", "vespertino"].map((turno) => (
                  <td
                    key={turno}
                    className={`py-2 px-4 border-b font-bold ${
                      totalesPorTurno[turno] > 0 &&
                      totalesPorTurno[turno] >=  (sumaTotalMetas * (turno === "matutino" ? 8 : turno === "vespertino" ? 7 : 8))
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {totalesPorTurno[turno]}
                  </td>
                ))}
                {filteredHoras.map((hora, index) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const totalHits = Object.values(registrosAgrupados)
                    .flat()
                    .filter((r) => {
                      const registroDateTime = moment.tz(
                        `${r.fecha} ${r.hour}`,
                        "YYYY-MM-DD HH:mm:ss",
                        "America/Mexico_City"
                      );
                      const startMoment = getIntervalTimestamp(
                        moment().tz("America/Mexico_City").startOf("day").add(22, "hours"),
                        horaInicio
                      );
                      const endMoment = getIntervalTimestamp(
                        moment().tz("America/Mexico_City").startOf("day").add(22, "hours"),
                        horaFin
                      );
                      return registroDateTime.isSameOrAfter(startMoment) && registroDateTime.isBefore(endMoment);
                    })
                    .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                  const claseSumaHits = totalHits >= sumaTotalMetas ? "text-green-500" : "text-red-500";
                  return (
                    <td key={index} className={`font-bold py-2 px-4 border-b ${claseSumaHits}`}>{totalHits}</td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totales por turno */}
        <div className="mt-4 font-semibold mb-4">
          <div className="lg:hidden space-y-4">
            {["nocturno", "matutino", "vespertino"].map((turno) => (
              <div key={turno} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{`Turno ${turno.charAt(0).toUpperCase() + turno.slice(1)}`}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className={`text-lg ${getClassName(totalesPorTurno[turno], sumaTotalMetas * (turno === "matutino" ? 8 : turno === "vespertino" ? 7 : 8))}`}>
                    {totalesPorTurno[turno]}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Meta:</span>
                  <span className="text-lg font-bold text-gray-800">
                    {sumaTotalMetas * (turno === "matutino" ? 8 : turno === "vespertino" ? 7 : 8)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-row justify-around">
            {["nocturno", "matutino", "vespertino"].map((turno) => (
              <div key={turno} className="bg-white p-2 px-10 rounded-lg">
                <p className="text-gray-600 text-base">
                  {`Total ${turno.charAt(0).toUpperCase() + turno.slice(1)}:`}
                  <span className={getClassName(
                    totalesPorTurno[turno],
                    sumaTotalMetas * (turno === "matutino" ? 8 : turno === "vespertino" ? 7 : 8)
                  )}>
                    {totalesPorTurno[turno]}
                  </span>
                  / Meta:{" "}
                  <span className="text-gray-600 font-bold">
                    {sumaTotalMetas * (turno === "matutino" ? 8 : turno === "vespertino" ? 7 : 8)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Totales_Pulido_Maquina;