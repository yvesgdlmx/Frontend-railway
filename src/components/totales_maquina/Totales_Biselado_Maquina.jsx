import { useEffect, useState, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
import { formatNumber } from '../../helpers/formatNumber';

// Establecer la zona horaria por defecto
moment.tz.setDefault("America/Mexico_City");

// CONSTANTES PARA LAS HORAS FIJAS DE CADA TURNO
const HORAS_NOCTURNO = 8;
const HORAS_MATUTINO = 8;
const HORAS_VESPERTINO = 7;

// Función que determina el inicio de la jornada:
// Si el momento actual es antes de las 22:00 se asume que la jornada inició el día anterior a las 22:00.
const getJornadaInicio = () => {
  let inicio = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicio)) {
    inicio.subtract(1, "days");
  }
  return inicio;
};

// Función auxiliar para construir un objeto moment usando la fecha base según la hora
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const parts = horaStr.split(":");
  const hour = parseInt(parts[0], 10);
  // Si la hora es mayor o igual a 22 se toma shiftStart; de lo contrario, se suma un día.
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
};

// Función auxiliar que calcula el total de hits en un intervalo dado
const getTotalHitsForInterval = (registros, horaInicio, horaFin) => {
  const shiftStart = getJornadaInicio();
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
    .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
};

// Función auxiliar que calcula la meta acumulada en base a las horas transcurridas (en la jornada completa)
const getMetaAcumulada = (meta) => {
  const now = moment.tz("America/Mexico_City");
  let inicioJornada = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
  if (now.isBefore(inicioJornada)) {
    inicioJornada.subtract(1, "days");
  }
  // En este caso se calcula usando el número de horas transcurridas (dinámico)
  const horasTranscurridas = now.diff(inicioJornada, "hours");
  return meta * horasTranscurridas;
};

// Componente para el título plegable de cada sección (célula)
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

// Componente para la sección plegable
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
      <TituloSeccion titulo={titulo} isOpen={isOpen} toggle={toggle} />
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

const Totales_Biselado_Maquina = () => {
  // Recargar la página cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Estados principales
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const [totalesPorTurnoYMaquina, setTotalesPorTurnoYMaquina] = useState({});
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [metasPorMaquina, setMetasPorMaquina] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [registrosAgrupados, setRegistrosAgrupados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });

  // Lista fija de franjas horarias
  const listaHoras = [
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
    "22:00 - 23:00",
  ];

  // Actualizamos el estado de horas a partir de la lista fija
  useEffect(() => {
    setHorasUnicas(listaHoras);
  }, []);

  // Orden de las máquinas/células
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
    "311 EDGER 12",
    "313 EDGER 13",
    "314 EDGER 14",
    "316 EDGER 15",
    "317 EDGER 16",
    "327 EDGER 17",
    "328 EDGER 18",
    "329 EDGER 19",
    "330 EDGER 20",
    "331 EDGER 21",
    "332 EDGER 22",
    "333 EDGER 23",
    "334 EDGER 24",
    "336 EDGER 25",
    "337 EDGER 26",
    "338 EDGER 28",
    "347 EDGER 27",
    "312 RAZR",
    "318 HSE 1",
    "319 HSE 2",
  ];

  // Función para abrir/cerrar sección
  const toggleSeccion = (celula) =>
    setSeccionesAbiertas((prev) => ({ ...prev, [celula]: !prev[celula] }));

  // Carga de datos y filtrado según la jornada laboral
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Cargar metas desde el endpoint
        const responseMetas = await clienteAxios("/metas/metas-biselados");
        const metas = {};
        if (Array.isArray(responseMetas.data.registros)) {
          responseMetas.data.registros.forEach((meta) => {
            metas[meta.name.trim().toUpperCase().replace(/\s+/g, " ")] = meta.meta;
          });
        } else {
          console.error("La respuesta de las metas no contiene un array válido:", responseMetas.data);
        }
        setMetasPorMaquina(metas);

        // 2. Definir el rango de fecha/hora de la jornada
        const ahora = moment().tz("America/Mexico_City");
        let inicioFiltro = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
        let finFiltro = moment(inicioFiltro).add(1, "days").subtract(30, "minutes");
        if (ahora.isBefore(inicioFiltro)) {
          inicioFiltro.subtract(1, "days");
          finFiltro.subtract(1, "days");
        }

        // 3. Cargar registros desde el endpoint
        const responseRegistros = await clienteAxios("/biselado/biselado/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];

        // 4. Filtrar registros según el rango definido
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioFiltro, finFiltro, null, "[)");
        });

        // 5. Agrupar los registros por célula
        const agrupados = registrosFiltrados.reduce((acc, registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          if (!acc[celula]) acc[celula] = [];
          acc[celula].push(registro);
          return acc;
        }, {});
        setRegistrosAgrupados(agrupados);

        // 6. Calcular totales acumulados por célula
        const acumulados = {};
        registrosFiltrados.forEach((registro) => {
          const celula = registro.name.split("-")[0].trim().toUpperCase().replace(/\s+/g, " ");
          acumulados[celula] = (acumulados[celula] || 0) + parseInt(registro.hits || 0, 10);
        });
        setTotalesAcumulados(acumulados);

        // 7. Calcular totales globales por turno y por máquina
        calcularTotalesPorTurno(registrosFiltrados);
        const totalesXMaquina = calcularTotalesPorTurnoYMaquina(registrosFiltrados);
        setTotalesPorTurnoYMaquina(totalesXMaquina);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  /**************** Funciones de Cálculo ****************/
  // Calcular totales globales por turno usando la lógica definida.
  const calcularTotalesPorTurno = (registros) => {
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      const hora = fechaHoraRegistro.hour();
      if (hora >= 22 || hora < 6) {
        totales.nocturno += parseInt(registro.hits || 0, 10);
      } else {
        const inicioMatutino = fechaHoraRegistro.clone().startOf("day").add(6, "hours").add(30, "minutes");
        const inicioVespertino = fechaHoraRegistro.clone().startOf("day").add(14, "hours").add(30, "minutes");
        const finVespertino = fechaHoraRegistro.clone().startOf("day").add(21, "hours").add(30, "minutes");
        if (fechaHoraRegistro.isBetween(inicioMatutino, inicioVespertino, null, "[)")) {
          totales.matutino += parseInt(registro.hits || 0, 10);
        } else if (fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, "[)")) {
          totales.vespertino += parseInt(registro.hits || 0, 10);
        }
      }
    });
    setTotalesPorTurno(totales);
  };

  // Calcular totales por turno para cada máquina
  const calcularTotalesPorTurnoYMaquina = (registros) => {
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
      const hora = fechaHoraRegistro.hour();
      if (hora >= 22 || hora < 6) {
        totales[celula].nocturno += parseInt(registro.hits || 0, 10);
      } else {
        const inicioMatutino = fechaHoraRegistro.clone().startOf("day").add(6, "hours").add(30, "minutes");
        const inicioVespertino = fechaHoraRegistro.clone().startOf("day").add(14, "hours").add(30, "minutes");
        const finVespertino = fechaHoraRegistro.clone().startOf("day").add(21, "hours").add(30, "minutes");
        if (fechaHoraRegistro.isBetween(inicioMatutino, inicioVespertino, null, "[)")) {
          totales[celula].matutino += parseInt(registro.hits || 0, 10);
        } else if (fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, "[)")) {
          totales[celula].vespertino += parseInt(registro.hits || 0, 10);
        }
      }
    });
    return totales;
  };

  // Meta total (suma de las metas de cada máquina)
  const sumaTotalMetas = Object.keys(metasPorMaquina).reduce(
    (acc, celula) => acc + (metasPorMaquina[celula] || 0),
    0
  );
  const metaNocturnoFinal = sumaTotalMetas * HORAS_NOCTURNO;
  const metaMatutinoFinal = sumaTotalMetas * HORAS_MATUTINO;
  const metaVespertinoFinal = sumaTotalMetas * HORAS_VESPERTINO;

  // Función para determinar la clase según se cumpla la meta parcial
  const getClassName = (hits, metaPorTurno) =>
    hits >= metaPorTurno ? "text-green-500" : "text-red-500";

  // Adaptamos el filtrado de las franjas horarias usando la función auxiliar getTotalHitsForInterval
  const filteredHoras = useMemo(() => {
    return listaHoras.filter((horaIntervalo) => {
      const [inicioIntervalo, finIntervalo] = horaIntervalo.split(" - ");
      const allRegistros = Object.values(registrosAgrupados).flat();
      const totalHits = getTotalHitsForInterval(allRegistros, inicioIntervalo, finIntervalo);
      return totalHits > 0;
    });
  }, [listaHoras, registrosAgrupados]);

  // Función auxiliar para obtener la clase del total acumulado (fila final)
  const totalAcumuladoClass = (acumulados, metas) => {
    const totalAcum = Object.values(acumulados).reduce((acc, curr) => acc + curr, 0);
    const metaGlobalAcumulada = Object.keys(metas).reduce((acc, celula) => acc + getMetaAcumulada(metas[celula]), 0);
    return totalAcum >= metaGlobalAcumulada ? "text-green-500" : "text-red-500";
  };

  return (
    <>
      <div className="max-w-screen-xl">
        {/* Vista en formato card para pantallas pequeñas */}
        <div className="lg:hidden mt-4">
          {ordenCelulas.map((celula, index) => {
            const registrosCelula = registrosAgrupados[celula] || [];
            const totalAcumulado = totalesAcumulados[celula] || 0;
            const meta = metasPorMaquina[celula] || 0;
            // Se calcula la meta acumulada de forma dinámica (para mostrar la suma hasta el momento)
            const metaAcumulada = getMetaAcumulada(meta);
            const claseTotalAcumulado = totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500";
            // Aquí se calculan las metas fijas por turno usando las constantes
            const metaNocturno = meta * HORAS_NOCTURNO;
            const metaMatutino = meta * HORAS_MATUTINO;
            const metaVespertino = meta * HORAS_VESPERTINO;
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
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">T. Nocturno:</span>
                    <span className={`font-bold ${totalesTurno.nocturno >= metaNocturno ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalesTurno.nocturno)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">T. Matutino:</span>
                    <span className={`font-bold ${totalesTurno.matutino >= metaMatutino ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalesTurno.matutino)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b py-4">
                    <span className="font-bold text-gray-700">T. Vespertino:</span>
                    <span className={`font-bold ${totalesTurno.vespertino >= metaVespertino ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalesTurno.vespertino)}
                    </span>
                  </div>
                  <div className="py-4">
                    <span className="font-bold text-gray-700">Horas:</span>
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const totalHits = getTotalHitsForInterval(registrosCelula, horaInicio, horaFin);
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
                <th className="py-2 px-4 border-b">T. Nocturno</th>
                <th className="py-2 px-4 border-b">T. Matutino</th>
                <th className="py-2 px-4 border-b">T. Vespertino</th>
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
                const metaAcumulada = getMetaAcumulada(meta);
                const totalesTurno = totalesPorTurnoYMaquina[celula] || { matutino: 0, vespertino: 0, nocturno: 0 };
                const bgColor = index % 2 === 0 ? "bg-gray-200" : "bg-white";
                const metaNocturno = meta * HORAS_NOCTURNO;
                const metaMatutino = meta * HORAS_MATUTINO;
                const metaVespertino = meta * HORAS_VESPERTINO;
                return (
                  <tr key={index} className={`font-semibold text-gray-700 ${bgColor}`}>
                    <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>{celula}</td>
                    <td className={`py-2 px-4 border-b font-bold ${totalAcumulado >= metaAcumulada ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalAcumulado)}
                    </td>
                    <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
                    <td className="py-2 px-4 border-b font-bold">{formatNumber(metaAcumulada)}</td>
                    <td className={`py-2 px-4 border-b font-bold ${totalesTurno.nocturno >= metaNocturno ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalesTurno.nocturno)}
                    </td>
                    <td className={`py-2 px-4 border-b font-bold ${totalesTurno.matutino >= metaMatutino ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalesTurno.matutino)}
                    </td>
                    <td className={`py-2 px-4 border-b font-bold ${totalesTurno.vespertino >= metaVespertino ? "text-green-500" : "text-red-500"}`}>
                      {formatNumber(totalesTurno.vespertino)}
                    </td>
                    {filteredHoras.map((hora, idx) => {
                      const [horaInicio, horaFin] = hora.split(" - ");
                      const totalHits = getTotalHitsForInterval(registrosCelula, horaInicio, horaFin);
                      const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                      return (
                        <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                          {formatNumber(totalHits)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Fila de totales */}
              <tr className="font-semibold bg-green-200 text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
                <td className={`py-2 px-4 border-b font-bold ${totalAcumuladoClass(totalesAcumulados, metasPorMaquina)}`}>
                  {formatNumber(Object.values(totalesAcumulados).reduce((acc, curr) => acc + curr, 0))}
                </td>
                <td className="py-2 px-4 border-b font-bold">{Object.keys(metasPorMaquina).reduce((acc, celula) => acc + (metasPorMaquina[celula] || 0), 0)}</td>
                <td className="py-2 px-4 border-b font-bold">
                  {formatNumber(Object.keys(metasPorMaquina).reduce((acc, celula) => acc + getMetaAcumulada(metasPorMaquina[celula]), 0))}
                </td>
                <td className={`py-2 px-4 border-b font-bold ${totalesPorTurno.nocturno >= metaNocturnoFinal ? "text-green-500" : "text-red-500"}`}>
                  {formatNumber(totalesPorTurno.nocturno)}
                </td>
                <td className={`py-2 px-4 border-b font-bold ${totalesPorTurno.matutino >= metaMatutinoFinal ? "text-green-500" : "text-red-500"}`}>
                  {formatNumber(totalesPorTurno.matutino)}
                </td>
                <td className={`py-2 px-4 border-b font-bold ${totalesPorTurno.vespertino >= metaVespertinoFinal ? "text-green-500" : "text-red-500"}`}>
                  {formatNumber(totalesPorTurno.vespertino)}
                </td>
                {filteredHoras.map((hora, index) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const sumaHits = Object.values(registrosAgrupados)
                    .flat()
                    .filter((r) => getTotalHitsForInterval([r], horaInicio, horaFin) > 0)
                    .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                  const claseSumaHits = sumaHits >= Object.keys(metasPorMaquina).reduce((acc, celula) => acc + (metasPorMaquina[celula] || 0), 0)
                    ? "text-green-500"
                    : "text-red-500";
                  return (
                    <td key={index} className={`font-bold py-2 px-4 border-b ${claseSumaHits}`}>
                      {formatNumber(sumaHits)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Sección resumen de totales por turno */}
        <div className="mt-4 font-semibold mb-4">
          <div className="lg:hidden space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Nocturno</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className={`text-lg ${getClassName(totalesPorTurno.nocturno, metaNocturnoFinal)}`}>
                  {formatNumber(totalesPorTurno.nocturno)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Meta:</span>
                <span className="text-lg font-bold text-gray-800">{formatNumber(metaNocturnoFinal)}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Matutino</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className={`text-lg ${getClassName(totalesPorTurno.matutino, metaMatutinoFinal)}`}>
                  {formatNumber(totalesPorTurno.matutino)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Meta:</span>
                <span className="text-lg font-bold text-gray-800">{formatNumber(metaMatutinoFinal)}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Vespertino</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className={`text-lg ${getClassName(totalesPorTurno.vespertino, metaVespertinoFinal)}`}>
                  {formatNumber(totalesPorTurno.vespertino)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Meta:</span>
                <span className="text-lg font-bold text-gray-800">{formatNumber(metaVespertinoFinal)}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:flex-row justify-around">
            <div className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total Nocturno:{" "}
                <span className={getClassName(totalesPorTurno.nocturno, metaNocturnoFinal)}>
                  {formatNumber(totalesPorTurno.nocturno)}
                </span>{" "}
                / Meta: <span className="text-gray-600 font-bold">{formatNumber(metaNocturnoFinal)}</span>
              </p>
            </div>
            <div className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total Matutino:{" "}
                <span className={getClassName(totalesPorTurno.matutino, metaMatutinoFinal)}>
                  {formatNumber(totalesPorTurno.matutino)}
                </span>{" "}
                / Meta: <span className="text-gray-600 font-bold">{formatNumber(metaMatutinoFinal)}</span>
              </p>
            </div>
            <div className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total Vespertino:{" "}
                <span className={getClassName(totalesPorTurno.vespertino, metaVespertinoFinal)}>
                  {formatNumber(totalesPorTurno.vespertino)}
                </span>{" "}
                / Meta: <span className="text-gray-600 font-bold">{formatNumber(metaVespertinoFinal)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Totales_Biselado_Maquina;