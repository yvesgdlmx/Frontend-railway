import { useState, useEffect, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
import { formatNumber } from '../../helpers/formatNumber';

// Configurar la zona horaria
moment.tz.setDefault("America/Mexico_City");

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

// Componente para sección plegable
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

// Helper: obtiene un objeto moment para el intervalo usando shiftStart y la hora recibida
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const parts = horaStr.split(":");
  const hour = parseInt(parts[0], 10);
  // Si la hora es mayor o igual a 22 se usa shiftStart; de lo contrario se asume que es del día siguiente.
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
};

// Helper: calcula el total de hits en un intervalo dado
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
    .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
};

const Totales_Desbloqueo_Maquina = () => {
  // Efecto para recargar la aplicación: cada 5 minutos y a las 22:00 (reinicio de turno)
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000); // 5 minutos
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

  // Estados locales
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState(0);
  // Ya no usaremos estado para metaAcumulada; la calcularemos de forma dinámica.
  const [totalesAcumulados, setTotalesAcumulados] = useState(0);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  const [metasPorTurno, setMetasPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });

  // Arreglo fijo de franjas horarias (se usa para mostrar desglose de hits)
  const horasFijas = [
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

  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  // Carga de datos: se define la jornada desde las 22:00 (del día anterior o actual, según corresponda)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const ahora = moment().tz("America/Mexico_City");
        let inicioJornada = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "days");
        }
        // Se define el fin de la jornada (por ejemplo, 23 horas y 30 minutos después de inicio)
        const finJornada = inicioJornada.clone().add(23, "hours").add(30, "minutes");
        // Cargar la meta para “DEBLOCKING” (o como lo hayas configurado)
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const metaDeblocking = responseMetas.data.registros.find((reg) =>
          reg.name.includes("DEBLOCKING")
        );
        if (metaDeblocking) {
          setMeta(metaDeblocking.meta);
          // Se definen las metas por turno de acuerdo con la duración (por ejemplo: matutino 7h, vespertino 6h, nocturno 7h)
          setMetasPorTurno({
            matutino: 7 * metaDeblocking.meta,
            vespertino: 6 * metaDeblocking.meta,
            nocturno: 7 * metaDeblocking.meta,
          });
        }
        // Cargar registros filtrados por la jornada y el indicador “DEBLOCKING”
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return (
            fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[]") &&
            registro.name.includes("DEBLOCKING")
          );
        });
        procesarRegistros(registrosFiltrados);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // Función para procesar los registros, calculando totales acumulados y por turno.
  const procesarRegistros = (registrosFiltrados) => {
    let totalAcumulado = 0;
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
    registrosFiltrados.forEach((registro) => {
      totalAcumulado += parseInt(registro.hits || 0, 10);
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      // Turno nocturno: de 22:00 a 06:00 (incluye registros de madrugada)
      if (fechaHoraRegistro.hour() >= 22 || fechaHoraRegistro.hour() < 6) {
        totales.nocturno += parseInt(registro.hits || 0, 10);
      }
      // Turno matutino: de 06:30 a 14:29
      else if (
        fechaHoraRegistro.isSameOrAfter(
          fechaHoraRegistro.clone().set({ hour: 6, minute: 30, second: 0 })
        ) &&
        fechaHoraRegistro.isBefore(
          fechaHoraRegistro.clone().set({ hour: 14, minute: 30, second: 0 })
        )
      ) {
        totales.matutino += parseInt(registro.hits || 0, 10);
      }
      // Turno vespertino: de 14:30 a 21:30
      else if (
        fechaHoraRegistro.isSameOrAfter(
          fechaHoraRegistro.clone().set({ hour: 14, minute: 30, second: 0 })
        ) &&
        fechaHoraRegistro.isBefore(
          fechaHoraRegistro.clone().set({ hour: 21, minute: 30, second: 0 })
        )
      ) {
        totales.vespertino += parseInt(registro.hits || 0, 10);
      }
    });
    setTotalesAcumulados(totalAcumulado);
    setRegistros(registrosFiltrados);
    setTotalesPorTurno(totales);

    // Se elimina el uso de horasFijas para calcular la meta acumulada;
    // en su lugar, esta se calculará dinámicamente en función de las horas transcurridas.
  };

  // useMemo para filtrar las franjas horarias: se muestran solo aquellas que tienen hits > 0.
  const filteredHoras = useMemo(() => {
    return horasFijas.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
      const totalHits = getTotalHitsForInterval(registros, horaInicio, horaFin);
      return totalHits > 0;
    });
  }, [registros]);

  // Para la vista en tabla: calcular la suma de hits en cada franja (usamos las horas filtradas)
  const sumaHitsPorHora = filteredHoras.map((hora) => {
    const [horaInicio, horaFin] = hora.split(" - ");
    return getTotalHitsForInterval(registros, horaInicio, horaFin);
  });

  // Cálculo dinámico de la meta acumulada basado en la cantidad de horas transcurridas desde las 22:00.
  const ahora = moment.tz("America/Mexico_City");
  let shiftStart = moment.tz("America/Mexico_City").startOf("day").add(22, "hours");
  if (ahora.isBefore(shiftStart)) {
    shiftStart.subtract(1, "days");
  }
  const horasTranscurridas = ahora.diff(shiftStart, "hours");
  const dynamicMetaAcumulada = meta * horasTranscurridas;

  // Función para evaluar si el total acumulado cumple la meta acumulada (usada para CSS)
  // Se usa dynamicMetaAcumulada en lugar de filtrar las horas fijas
  const evaluarTotalAcumulado = (total, metaValor, numHoras) => {
    const metaAcumuladaLocal = metaValor * numHoras;
    return total >= metaAcumuladaLocal ? "text-green-500" : "text-red-500";
  };
  const claseTotal = evaluarTotalAcumulado(totalesAcumulados, meta, horasTranscurridas);

  // En la vista se mostrará la meta acumulada calculada dinámicamente
  // Función para determinar la clase según cumplimiento de la meta por turno
  const getClassName = (hits, metaPorTurno) =>
    hits >= metaPorTurno ? "text-green-500" : "text-red-500";

  return (
    <div className="max-w-screen-xl">
      {/* Vista para pantallas pequeñas */}
      <div className="lg:hidden mt-4">
        <SeccionMenu
          titulo="Desbloqueo"
          isOpen={seccionesAbiertas["Desbloqueo"] || false}
          toggle={() => toggleSeccion("Desbloqueo")}
        >
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-700">Total Acumulado:</span>
              <span className={`font-bold ${claseTotal}`}>{formatNumber(totalesAcumulados)}</span>
            </div>
            <div className="flex justify-between border-b py-4">
              <span className="font-bold text-gray-700">Meta:</span>
              <span className="font-bold text-gray-700">{meta || "No definida"}</span>
            </div>
            <div className="flex justify-between border-b py-4">
              <span className="font-bold text-gray-700">Meta Acumulada:</span>
              <span className="font-bold text-gray-700">{formatNumber(dynamicMetaAcumulada)}</span>
            </div>
            <div className="py-4">
              <span className="font-bold text-gray-700">Horas:</span>
              {filteredHoras.map((hora, idx) => {
                const [horaInicio, horaFin] = hora.split(" - ");
                const totalHits = getTotalHitsForInterval(registros, horaInicio, horaFin);
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
      </div>

      {/* Vista para pantallas grandes */}
      <div className="hidden lg:block">
        <Navegacion />
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>
                Nombre
              </th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              <th className="py-2 px-4 border-b">Meta</th>
              <th className="py-2 px-4 border-b">Meta Acumulada</th>
              {filteredHoras.map((hora, index) => (
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">
                  {hora}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            <tr className="font-semibold text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                Desbloqueo
              </td>
              <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>
                {formatNumber(totalesAcumulados)}
              </td>
              <td className="py-2 px-4 border-b font-bold">{meta || "No definida"}</td>
              <td className="py-2 px-4 border-b font-bold">{formatNumber(dynamicMetaAcumulada)}</td>
              {filteredHoras.map((hora, idx) => {
                const [horaInicio, horaFin] = hora.split(" - ");
                const totalHits = getTotalHitsForInterval(registros, horaInicio, horaFin);
                const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                return (
                  <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                    {formatNumber(totalHits)}
                  </td>
                );
              })}
            </tr>
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold">Totales</td>
              <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>{formatNumber(totalesAcumulados)}</td>
              <td className="py-2 px-4 border-b font-bold">{meta}</td>
              <td className="py-2 px-4 border-b font-bold">{dynamicMetaAcumulada}</td>
              {sumaHitsPorHora.map((sumaHits, index) => {
                const claseSumaHits = sumaHits >= meta ? "text-green-500" : "text-red-500";
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

      {/* Sección de totales por turno */}
      <div className="mt-4 font-semibold mb-4">
        {/* Versión para pantallas pequeñas */}
        <div className="lg:hidden space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Nocturno</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className={`text-lg ${getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)}`}>
                {formatNumber(totalesPorTurno.nocturno)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">Meta:</span>
              <span className="text-lg font-bold text-gray-800">{formatNumber(metasPorTurno.nocturno)}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Matutino</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className={`text-lg ${getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)}`}>
                {formatNumber(totalesPorTurno.matutino)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">Meta:</span>
              <span className="text-lg font-bold text-gray-800">{formatNumber(metasPorTurno.matutino)}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Vespertino</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className={`text-lg ${getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)}`}>
                {formatNumber(totalesPorTurno.vespertino)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">Meta:</span>
              <span className="text-lg font-bold text-gray-800">{formatNumber(metasPorTurno.vespertino)}</span>
            </div>
          </div>
        </div>
        {/* Versión para pantallas grandes */}
        <div className="hidden lg:flex lg:flex-row justify-around">
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Nocturno:{" "}
              <span className={getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)}>
                {formatNumber(totalesPorTurno.nocturno)}
              </span>{" "}
              / Meta: <span className="text-gray-600 font-bold">{formatNumber(metasPorTurno.nocturno)}</span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Matutino:{" "}
              <span className={getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)}>
                {formatNumber(totalesPorTurno.matutino)}
              </span>{" "}
              / Meta: <span className="text-gray-600 font-bold">{formatNumber(metasPorTurno.matutino)}</span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Vespertino:{" "}
              <span className={getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)}>
                {formatNumber(totalesPorTurno.vespertino)}
              </span>{" "}
              / Meta: <span className="text-gray-600 font-bold">{formatNumber(metasPorTurno.vespertino)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_Desbloqueo_Maquina;