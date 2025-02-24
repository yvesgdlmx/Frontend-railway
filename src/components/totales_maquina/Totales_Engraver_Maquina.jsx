import { useEffect, useState, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
import { formatNumber } from '../../helpers/formatNumber';

moment.tz.setDefault("America/Mexico_City");

// Constantes fijas para cada turno
const HORAS_MATUTINO = 8;
const HORAS_VESPERTINO = 7;
const HORAS_NOCTURNO = 8;

// Función auxiliar para obtener el shiftStart de la jornada (inicio a las 22:00)
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
  const shiftStart = obtenerShiftStart();
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

// Función para calcular la meta fija por turno a partir de la meta base de cada máquina
const calcularMetasFinales = (metaBase) => ({
  metaMatutino: metaBase * HORAS_MATUTINO,
  metaVespertino: metaBase * HORAS_VESPERTINO,
  metaNocturno: metaBase * HORAS_NOCTURNO,
});

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
        className={`transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 mt-4" : "opacity-0"}`}
      >
        {children}
      </div>
    </div>
  );
};

const Totales_Engraver_Maquina = () => {
  // Efecto para recargar la página cada 5 minutos y también a las 22:00 (o programado para el día siguiente)
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000);
    const now = moment();
    let target = moment().hour(22).minute(0).second(0);
    if (now.isAfter(target)) {
      target.add(1, "days");
    }
    const delay = target.diff(now);
    const timeoutId = setTimeout(() => {
      window.location.reload();
    }, delay);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const toggleSeccion = (celula) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [celula]: !prev[celula] }));
  };

  const [totalesPorTurnoYMaquina, setTotalesPorTurnoYMaquina] = useState({});
  // Arreglo fijo de franjas horarias (orden: las más recientes a la izquierda)
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
    nocturno: 0,
  });
  const ordenCelulas = [
    "270 ENGRVR 1",
    "271 ENGRVR 2",
    "272 ENGRVR 3",
    "273 ENGRVR 4",
  ];

  // Cálculo global: horas transcurridas desde el inicio de la jornada (22:00)
  const ahoraGlobal = moment.tz("America/Mexico_City");
  let inicioJornadaGlobal = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
  if (ahoraGlobal.isBefore(inicioJornadaGlobal)) {
    inicioJornadaGlobal.subtract(1, "days");
  }
  // Sumamos 1 para considerar la hora en curso completa
  const horasTranscurridas = ahoraGlobal.diff(inicioJornadaGlobal, "hours") + 1;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar metas
        const responseMetas = await clienteAxios("/metas/metas-engravers");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, " ")] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        // Cargar registros del día actual (jornada que inicia a las 22:00)
        const responseRegistros = await clienteAxios("/engraver/engraver/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const ahora = moment();
        let inicioHoy = moment().startOf("day").add(22, "hours"); // 22:00 del día actual
        let finHoy = moment(inicioHoy).add(1, "days").subtract(30, "minutes"); // 21:30 del día siguiente
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, "days");
          finHoy.subtract(1, "days");
        }
        // Filtrar registros de la jornada actual
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[)");
        });
        // Agrupar registros por "célula" (tomando la parte del nombre antes del guión)
        const agrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!acc[celula]) {
            acc[celula] = [];
          }
          acc[celula].push(registro);
          return acc;
        }, {});
        setRegistrosAgrupados(agrupados);
        setHorasUnicas(fixedHoras);
        // Calcular totales acumulados por célula
        const acumulados = {};
        registrosFiltrados.forEach((registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);
        // Calcular totales por turno y por máquina (célula)
        const totalesMaquina = calcularTotalesPorTurnoYMaquina(registrosFiltrados, inicioHoy);
        setTotalesPorTurnoYMaquina(totalesMaquina);
        calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const calcularTotalesPorTurno = (registros, inicioHoy) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0,
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

  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0);
  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce(
    (acc, celula) => acc + (metasPorMaquina[celula] || 0),
    0
  );

  // Se calculan las metas globales fijas para cada turno (utilizando los multiplicadores fijos)
  const metaMatutinoFinal = sumaTotalMetas * HORAS_MATUTINO;
  const metaVespertinoFinal = sumaTotalMetas * HORAS_VESPERTINO;
  const metaNocturnoFinal = sumaTotalMetas * HORAS_NOCTURNO;
  const claseSumaTotalAcumulados =
    sumaTotalAcumulados >= (metaMatutinoFinal + metaVespertinoFinal + metaNocturnoFinal)
      ? "text-green-500"
      : "text-red-500";

  // useMemo para filtrar solo las franjas horarias donde la suma total de hits sea mayor a 0
  const filteredHoras = useMemo(() => {
    const shiftStart = obtenerShiftStart();
    return horasUnicas.filter((hora) => {
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
            // Se utiliza la variable horasTranscurridas para el cálculo de la meta acumulada
            const metaAcumulada = meta * horasTranscurridas;
            const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
            const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
            // Se calculan las metas fijas para cada turno a partir de la meta base
            const { metaMatutino, metaVespertino, metaNocturno } = calcularMetasFinales(meta);
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
            // Aunque para comparar con la meta se usan los valores fijos, se muestra también el progreso parcial
            const metaMatutinoParcial = meta * horasMatutino;
            const metaVespertinoParcial = meta * horasVespertino;
            const metaNocturnoParcial = meta * horasNocturno;
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
                    <span className={`font-bold ${claseTotalAcumulado}`}>{formatNumber(totalAcumulado)}</span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">Meta:</span>
                    <span className="font-bold text-gray-700">{meta || "No definida"}</span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">Meta Acumulada:</span>
                    <span className="font-bold text-gray-700">{formatNumber(metaAcumulada)}</span>
                  </div>
                  <div className="py-4">
                    <span className="font-bold text-gray-700">Horas:</span>
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const shiftStart = obtenerShiftStart();
                      const totalHits = registrosCelula
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
                      const bgColor = idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300";
                      const hitsClass = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                          <span className="font-bold text-gray-700">{hora}:</span>
                          <span className={`font-bold ${hitsClass}`}>{formatNumber(totalHits)}</span>
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
          <Navegacion />
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>Nombre</th>
                <th className="py-2 px-4 border-b">Total Acumulado</th>
                <th className="py-2 px-4 border-b whitespace-nowrap">Meta x hora</th>
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
                const metaAcumulada = meta * horasTranscurridas;
                const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
                // Se usan las metas fijas para cada turno
                const { metaMatutino, metaVespertino, metaNocturno } = calcularMetasFinales(meta);
                const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                    <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>{celula}</td>
                    <td className={`py-2 px-4 border-b font-bold ${totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalAcumulado)}
                    </td>
                    <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
                    <td className="py-2 px-4 border-b font-bold">{formatNumber(metaAcumulada)}</td>
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
                        {formatNumber(totalesTurno[turno]) || 0}
                      </td>
                    ))}
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const shiftStart = obtenerShiftStart();
                      const totalHits = registrosCelula
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
                      const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>{formatNumber(totalHits)}</td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="font-semibold bg-green-200 text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
                <td className={`py-2 px-4 border-b font-bold ${claseSumaTotalAcumulados}`}>{formatNumber(sumaTotalAcumulados)}</td>
                <td className="py-2 px-4 border-b font-bold">{formatNumber(sumaTotalMetas)}</td>
                <td className="py-2 px-4 border-b font-bold">{formatNumber(sumaTotalMetas * horasTranscurridas)}</td>
                {["nocturno", "matutino", "vespertino"].map((turno) => (
                  <td
                    key={turno}
                    className={`py-2 px-4 border-b font-bold ${
                      totalesPorTurno[turno] > 0 &&
                      totalesPorTurno[turno] >= (sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO))
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatNumber(totalesPorTurno[turno])}
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
                    <td key={index} className={`font-bold py-2 px-4 border-b ${claseSumaHits}`}>{formatNumber(totalHits)}</td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Totales por turno (vista tipo card para móvil y detalle en pantallas grandes) */}
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
                    {formatNumber(totalesPorTurno[turno])}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Meta:</span>
                  <span className="text-lg font-bold text-gray-800">
                    {formatNumber(sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO))}
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
                    {formatNumber(totalesPorTurno[turno])}
                  </span>
                  / Meta:{" "}
                  <span className="text-gray-600 font-bold">
                    {formatNumber(sumaTotalMetas * (turno === "matutino" ? HORAS_MATUTINO : turno === "vespertino" ? HORAS_VESPERTINO : HORAS_NOCTURNO))}
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

export default Totales_Engraver_Maquina;