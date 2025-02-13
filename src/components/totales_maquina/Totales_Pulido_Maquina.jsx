import { useEffect, useState, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
moment.tz.setDefault("America/Mexico_City");

// CONSTANTES FIJAS PARA LOS TURNOS
const HORAS_NOCTURNO = 8;
const HORAS_MATUTINO = 8;
const HORAS_VESPERTINO = 7;

// Función que calcula las metas fijas por turno para una máquina en base a su meta base.
const calcularMetasFinales = (metaBase) => ({
  metaNocturno: metaBase * HORAS_NOCTURNO,
  metaMatutino: metaBase * HORAS_MATUTINO,
  metaVespertino: metaBase * HORAS_VESPERTINO,
});

// Función auxiliar para obtener el shiftStart de la jornada de 22:00
const obtenerShiftStart = () => {
  const ahora = moment.tz("America/Mexico_City");
  let shiftStart = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
  if (ahora.isBefore(shiftStart)) {
    shiftStart.subtract(1, "days");
  }
  return shiftStart;
};

// Función auxiliar para construir un objeto moment usando la fecha base según la hora
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const parts = horaStr.split(":");
  const hour = parseInt(parts[0], 10);
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
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
      <TituloSeccion titulo={titulo} isOpen={isOpen} toggle={toggle}/>
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
  // Recargar la aplicación cada 5 minutos y en el momento exacto de las 22:00
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // cada 5 minutos
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
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

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
  const [horasFijas, setHorasFijas] = useState(fixedHoras);
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

  // Cálculo de las horas transcurridas desde el inicio de la jornada (22:00)
  const ahoraGlobal = moment.tz("America/Mexico_City");
  let inicioJornadaGlobal = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
  if (ahoraGlobal.isBefore(inicioJornadaGlobal)) {
    inicioJornadaGlobal.subtract(1, "days");
  }
  const horasTranscurridas = ahoraGlobal.diff(inicioJornadaGlobal, "hours") + 1;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar metas
        const responseMetas = await clienteAxios("/metas/metas-pulidos");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
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
        let inicioHoy = moment().startOf("day").add(22, "hours");
        let finHoy = moment(inicioHoy).add(1, "days").subtract(30, "minutes");
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, "days");
          finHoy.subtract(1, "days");
        }
        // Filtrar registros
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[)");
        });
        // Agrupar por célula
        const agrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!acc[celula]) acc[celula] = [];
          acc[celula].push(registro);
          return acc;
        }, {});
        setRegistrosAgrupados(agrupados);
        setHorasFijas(fixedHoras);
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

  // Función para calcular totales por turno (de la jornada que inicia a las 22:00)
  const calcularTotalesPorTurno = (registros, inicioHoy) => {
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
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
      if (!totales[celula]) totales[celula] = { matutino: 0, vespertino: 0, nocturno: 0 };
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

  // Totales globales
  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce(
    (acc, celula) => acc + (metasPorMaquina[celula] || 0),
    0
  );
  // Utilizamos la suma total y las constantes para calcular las metas globales fijas por turno
  const metaMatutinoFinal = sumaTotalMetas * HORAS_MATUTINO;
  const metaVespertinoFinal = sumaTotalMetas * HORAS_VESPERTINO;
  const metaNocturnoFinal = sumaTotalMetas * HORAS_NOCTURNO;
  const claseSumaTotalAcumulados =
    sumaTotalAcumulados >= (metaMatutinoFinal + metaVespertinoFinal + metaNocturnoFinal)
      ? "text-green-500"
      : "text-red-500";

  // useMemo para filtrar las franjas horarias donde la suma total de hits sea mayor que 0
  const filteredHoras = useMemo(() => {
    const shiftStart = obtenerShiftStart();
    return horasFijas.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
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
  }, [horasFijas, registrosAgrupados]);

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
            const metaAcumulada = meta * horasTranscurridas;
            const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
            // Aquí usamos la función calcularMetasFinales para obtener las metas fijas por turno
            const { metaNocturno, metaMatutino, metaVespertino } = calcularMetasFinales(meta);
            const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
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
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">T. Nocturno:</span>
                    <span className={`font-bold ${totalesTurno.nocturno >= metaNocturno ? "text-green-500" : "text-red-500"}`}>
                      {totalesTurno.nocturno}
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">T. Matutino:</span>
                    <span className={`font-bold ${totalesTurno.matutino >= metaMatutino ? "text-green-500" : "text-red-500"}`}>
                      {totalesTurno.matutino}
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">T. Vespertino:</span>
                    <span className={`font-bold ${totalesTurno.vespertino >= metaVespertino ? "text-green-500" : "text-red-500"}`}>
                      {totalesTurno.vespertino}
                    </span>
                  </div>
                  <div className="py-4">
                    <span className="font-bold text-gray-700">Horas:</span>
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const shiftStart = obtenerShiftStart();
                      const totalHits = registrosCelula.filter((r) => {
                        const registroDateTime = moment.tz(
                          `${r.fecha} ${r.hour}`,
                          "YYYY-MM-DD HH:mm:ss",
                          "America/Mexico_City"
                        );
                        const startMoment = getIntervalTimestamp(shiftStart, horaInicio);
                        const endMoment = getIntervalTimestamp(shiftStart, horaFin);
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
                  <th key={turno} className="py-2 px-4 border-b">{`T. ${turno.charAt(0).toUpperCase() + turno.slice(1)}`}</th>
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
                const metaAcumulada = meta * horasTranscurridas;
                const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
                // Uso de la función para obtener las metas fijas por turno
                const { metaNocturno, metaMatutino, metaVespertino } = calcularMetasFinales(meta);
                const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                    <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>{celula}</td>
                    <td className={`py-2 px-4 border-b font-bold ${totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500"}`}>
                      {totalAcumulado}
                    </td>
                    <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
                    <td className="py-2 px-4 border-b font-bold">{metaAcumulada}</td>
                    {["nocturno", "matutino", "vespertino"].map((turno) => (
                      <td
                        key={turno}
                        className={`py-2 px-4 border-b font-bold ${
                          totalesTurno[turno] > 0 && totalesTurno[turno] >= 
                          (turno === "matutino" ? metaMatutino : turno === "vespertino" ? metaVespertino : metaNocturno)
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {totalesTurno[turno] || 0}
                      </td>
                    ))}
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const shiftStart = obtenerShiftStart();
                      const totalHits = registrosCelula.filter((r) => {
                        const registroDateTime = moment.tz(
                          `${r.fecha} ${r.hour}`,
                          "YYYY-MM-DD HH:mm:ss",
                          "America/Mexico_City"
                        );
                        const startMoment = getIntervalTimestamp(shiftStart, horaInicio);
                        const endMoment = getIntervalTimestamp(shiftStart, horaFin);
                        return registroDateTime.isSameOrAfter(startMoment) && registroDateTime.isBefore(endMoment);
                      })
                      .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
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
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
                <td className={`py-2 px-4 border-b font-bold ${claseSumaTotalAcumulados}`}>{sumaTotalAcumulados}</td>
                <td className="py-2 px-4 border-b font-bold">{sumaTotalMetas}</td>
                <td className="py-2 px-4 border-b font-bold">{sumaTotalMetas * horasTranscurridas}</td>
                {["nocturno", "matutino", "vespertino"].map((turno) => (
                  <td
                    key={turno}
                    className={`py-2 px-4 border-b font-bold ${
                      totalesPorTurno[turno] > 0 &&
                      totalesPorTurno[turno] >=
                        (sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO))
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {totalesPorTurno[turno]}
                  </td>
                ))}
                {filteredHoras.map((hora, index) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const shiftStart = obtenerShiftStart();
                  const totalHits = Object.values(registrosAgrupados)
                    .flat()
                    .filter((r) => {
                      const registroDateTime = moment.tz(
                        `${r.fecha} ${r.hour}`,
                        "YYYY-MM-DD HH:mm:ss",
                        "America/Mexico_City"
                      );
                      const startMoment = getIntervalTimestamp(shiftStart, horaInicio);
                      const endMoment = getIntervalTimestamp(shiftStart, horaFin);
                      return registroDateTime.isSameOrAfter(startMoment) && registroDateTime.isBefore(endMoment);
                    })
                    .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                  const claseSumaHits = totalHits >= sumaTotalMetas ? "text-green-500" : "text-red-500";
                  return (
                    <td key={index} className={`font-bold py-2 px-4 border-b ${claseSumaHits}`}>
                      {totalHits}
                    </td>
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
                  <span className={`text-lg ${getClassName(
                    totalesPorTurno[turno],
                    sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO)
                  )}`}>
                    {totalesPorTurno[turno]}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Meta:</span>
                  <span className="text-lg font-bold text-gray-800">
                    {sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO)}
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
                    sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO)
                  )}>
                    {totalesPorTurno[turno]}
                  </span>
                  / Meta:{" "}
                  <span className="text-gray-600 font-bold">
                    {sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO)}
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