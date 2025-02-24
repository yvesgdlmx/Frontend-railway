import { useState, useEffect, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
import { formatNumber } from '../../helpers/formatNumber';

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

// Componente para sección desplegable
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

// Función para calcular la meta acumulada en función de las horas transcurridas desde el inicio de la jornada (22:00)
const getMetaAcumulada = (meta) => {
  const now = moment.tz("America/Mexico_City");
  let inicioJornada = moment.tz("America/Mexico_City").startOf("day").set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
  if (now.isBefore(inicioJornada)) {
    inicioJornada.subtract(1, "days");
  }
  const horasTranscurridas = now.diff(inicioJornada, "hours");
  return meta * horasTranscurridas;
};

const Totales_Produccion_Maquina = () => {
  // Reiniciar automáticamente la página cada 5 minutos y al iniciar nuevo turno (22:00)
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000);
    const now = moment();
    let target = moment().set({ hour: 22, minute: 0, second: 0 });
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

  // Estados generales
  const [seccionAbierta, setSeccionAbierta] = useState(false);
  const toggleSeccion = () => setSeccionAbierta(!seccionAbierta);
  const [registros, setRegistros] = useState([]);
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [meta, setMeta] = useState(0);
  const [totalesAcumulados, setTotalesAcumulados] = useState(0);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  const [metasPorTurno, setMetasPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });

  // Arreglo fijo de horas (ordenado de forma que la primera sea la más reciente)
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
    "22:00 - 23:00",
  ];
  useEffect(() => {
    setHorasUnicas(fixedHoras);
  }, []);

  // Cargar la meta, los registros y calcular totales por turno
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Se obtiene la meta desde el endpoint correspondiente
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const metasJobComplete = responseMetas.data.registros.filter((m) =>
          m.name.includes("JOB COMPLETE")
        );
        const sumaMetas = metasJobComplete.reduce((acc, m) => acc + m.meta, 0);
        setMeta(sumaMetas);
        // Según el nuevo horario:
        // Matutino: 06:30 a 14:29 -> 8 h
        // Vespertino: 14:30 a 21:30 -> 7 h
        // Nocturno: 22:00 a 06:00 -> 8 h
        setMetasPorTurno({
          matutino: 8 * sumaMetas,
          vespertino: 7 * sumaMetas,
          nocturno: 8 * sumaMetas,
        });
        // Cálculo del inicio del turno a las 22:00
        let ahora = moment().tz("America/Mexico_City");
        let produccionInicio =
          ahora.hour() < 22
            ? ahora.clone().subtract(1, "day").set({ hour: 22, minute: 0, second: 0, millisecond: 0 })
            : ahora.clone().set({ hour: 22, minute: 0, second: 0, millisecond: 0 });
        // Jornada: de 22:00 hasta las 21:30 del día siguiente
        const nocturnoInicio = produccionInicio.clone(); // 22:00
        const nocturnoFin = produccionInicio.clone().add(8, "hours"); // 06:00
        const matutinoInicio = produccionInicio.clone().add(8, "hours").add(30, "minutes"); // 06:30
        const matutinoFin = produccionInicio.clone().add(16, "hours").add(30, "minutes"); // 14:30
        const vespertinoInicio = produccionInicio.clone().add(16, "hours").add(30, "minutes");
        const vespertinoFin = produccionInicio.clone().add(23, "hours").add(30, "minutes"); // 21:30
        // Obtener los registros
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        // Filtrar los registros correspondientes a la jornada actual (de 22:00 hasta 21:30)
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHora = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return (
            fechaHora.isBetween(nocturnoInicio, vespertinoFin, null, "[]") &&
            registro.name.includes("JOB COMPLETE")
          );
        });
        // Calcular totales
        let totalAcumulado = 0;
        const totales = { nocturno: 0, matutino: 0, vespertino: 0 };
        registrosFiltrados.forEach((registro) => {
          const hits = parseInt(registro.hits || 0);
          totalAcumulado += hits;
          const fechaHora = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          if (fechaHora.isBetween(nocturnoInicio, nocturnoFin, null, "[)")) {
            totales.nocturno += hits;
          } else if (fechaHora.isBetween(matutinoInicio, matutinoFin, null, "[)")) {
            totales.matutino += hits;
          } else if (fechaHora.isBetween(vespertinoInicio, vespertinoFin, null, "[)")) {
            totales.vespertino += hits;
          }
        });
        setTotalesAcumulados(totalAcumulado);
        setRegistros(registrosFiltrados);
        setTotalesPorTurno(totales);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // Filtrar intervalos en los cuales se hayan registrado hits (> 0)
  const filteredHoras = useMemo(() => {
    return horasUnicas.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
      const total = registros
        .filter((r) => {
          const hourMoment = moment(r.hour, "HH:mm:ss");
          const startMoment = moment(horaInicio, "HH:mm");
          const endMoment = moment(horaFin, "HH:mm");
          if (startMoment.isAfter(endMoment)) {
            return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
          } else {
            return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
          }
        })
        .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
      return total > 0;
    });
  }, [horasUnicas, registros]);

  // Sumar los hits por cada franja horaria usando filteredHoras
  const sumaHitsPorHora = filteredHoras.map((hora) => {
    const [horaInicio, horaFin] = hora.split(" - ");
    return registros
      .filter((r) => {
        const hourMoment = moment(r.hour, "HH:mm:ss");
        const startMoment = moment(horaInicio, "HH:mm");
        const endMoment = moment(horaFin, "HH:mm");
        if (startMoment.isAfter(endMoment)) {
          return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
        } else {
          return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
        }
      })
      .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
  });

  const claseSumaTotalAcumulados =
    totalesAcumulados >= metasPorTurno.nocturno + metasPorTurno.matutino + metasPorTurno.vespertino
      ? "text-green-500"
      : "text-red-500";

  const getClassName = (hits, metaTurno) => (hits >= metaTurno ? "text-green-500" : "text-red-500");

  return (
    <div className="max-w-screen-xl">
      {/* Diseño para pantallas pequeñas y medianas */}
      <div className="lg:hidden mt-4">
        <SeccionMenu titulo="Producción" isOpen={seccionAbierta} toggle={toggleSeccion}>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-gray-700">Total Acumulado:</span>
              <span className={`font-bold ${claseSumaTotalAcumulados}`}>{formatNumber(totalesAcumulados)}</span>
            </div>
            <div className="flex justify-between border-b py-4">
              <span className="font-bold text-gray-700">Meta:</span>
              <span className="font-bold text-gray-700">{formatNumber(meta) || "No definida"}</span>
            </div>
            <div className="flex justify-between border-b py-4">
              <span className="font-bold text-gray-700">Meta Acumulada:</span>
              {/* Se reemplaza meta * horasUnicas.length por getMetaAcumulada(meta) */}
              <span className="font-bold text-gray-700">{formatNumber(getMetaAcumulada(meta))}</span>
            </div>
            <div className="py-4">
              <span className="font-bold text-gray-700">Horas:</span>
              {filteredHoras.map((hora, idx) => {
                const [horaInicio, horaFin] = hora.split(" - ");
                const totalHits = registros
                  .filter((r) => {
                    const hourMoment = moment(r.hour, "HH:mm:ss");
                    const startMoment = moment(horaInicio, "HH:mm");
                    const endMoment = moment(horaFin, "HH:mm");
                    if (startMoment.isAfter(endMoment)) {
                      return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                    } else {
                      return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                    }
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
      </div>
      {/* Diseño para pantallas grandes */}
      <div className="hidden lg:block">
        <Navegacion />
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>Nombre</th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              <th className="py-2 px-4 border-b whitespace-nowrap">Meta x hora</th>
              <th className="py-2 px-4 border-b">Meta Acumulada</th>
              {filteredHoras.map((hora, index) => (
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">{hora}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            <tr className="font-semibold text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Producción</td>
              <td className={`py-2 px-4 border-b font-bold ${claseSumaTotalAcumulados}`}>{formatNumber(totalesAcumulados)}</td>
              <td className="py-2 px-4 border-b font-bold">{formatNumber(meta) || "No definida"}</td>
              {/* Se reemplaza meta * horasUnicas.length por getMetaAcumulada(meta) */}
              <td className="py-2 px-4 border-b font-bold">{formatNumber(getMetaAcumulada(meta))}</td>
              {filteredHoras.map((hora, idx) => {
                const [horaInicio, horaFin] = hora.split(" - ");
                const totalHits = registros
                  .filter((r) => {
                    const hourMoment = moment(r.hour, "HH:mm:ss");
                    const startMoment = moment(horaInicio, "HH:mm");
                    const endMoment = moment(horaFin, "HH:mm");
                    if (startMoment.isAfter(endMoment)) {
                      return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                    } else {
                      return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                    }
                  })
                  .reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0);
                const claseHitsIndividual = totalHits >= meta ? "text-green-500" : "text-red-500";
                return (
                  <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                    {formatNumber(totalHits)}
                  </td>
                );
              })}
            </tr>
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>Totales</td>
              <td className={`py-2 px-4 border-b font-bold ${claseSumaTotalAcumulados}`}>{formatNumber(totalesAcumulados)}</td>
              <td className="py-2 px-4 border-b font-bold">{formatNumber(meta)}</td>
              <td className="py-2 px-4 border-b font-bold">{formatNumber(getMetaAcumulada(meta))}</td>
              {sumaHitsPorHora.map((sumaHits, index) => {
                const claseSumaHits = sumaHits >= meta ? "text-green-500" : "text-red-500";
                return (
                  <td key={index} className={`font-bold py-2 px-4 border-b ${claseSumaHits}`}>
                    {sumaHits}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Sección de totales por turno */}
      <div className="mt-4 font-semibold mb-4">
        {/* Diseño para pantallas pequeñas y medianas */}
        <div className="lg:hidden space-y-4">
          {["nocturno", "matutino", "vespertino"].map((turno) => (
            <div key={turno} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {`Turno ${turno.charAt(0).toUpperCase() + turno.slice(1)}`}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className={`text-lg ${getClassName(totalesPorTurno[turno], metasPorTurno[turno])}`}>
                  {formatNumber(totalesPorTurno[turno])}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600">Meta:</span>
                <span className="text-lg font-bold text-gray-800">{formatNumber(metasPorTurno[turno])}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Diseño para pantallas grandes */}
        <div className="hidden lg:flex lg:flex-row justify-around">
          {["nocturno", "matutino", "vespertino"].map((turno) => (
            <div key={turno} className="bg-white p-2 px-10 rounded-lg">
              <p className="text-gray-600 text-base">
                Total {turno.charAt(0).toUpperCase() + turno.slice(1)}:{" "}
                <span className={getClassName(totalesPorTurno[turno], metasPorTurno[turno])}>
                  {formatNumber(totalesPorTurno[turno])}
                </span>{" "}
                / Meta:{" "}
                <span className="text-gray-600 font-bold">{formatNumber(metasPorTurno[turno])}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Totales_Produccion_Maquina;