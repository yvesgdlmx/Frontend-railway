import { useState, useEffect, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";

// Configurar la zona horaria
moment.tz.setDefault("America/Mexico_City");

// Función auxiliar para construir un objeto moment usando la fecha base según la hora
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const parts = horaStr.split(":");
  const hour = parseInt(parts[0], 10);
  // Si la hora es mayor o igual a 22, la fecha base es shiftStart; de lo contrario, se le suma un día.
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
};

// Función auxiliar para calcular el total de hits en un intervalo de horas usando shiftStart
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

const Totales_AR_Maquina = () => {
  // Lista de máquinas fijas
  const maquinas = ["52 FUSION", "53 1200 D", "55 TLF 1200.1", "56 TLF 1200.2"];

  // Efecto de auto-recarga: cada 5 minutos y al inicio del turno (22:00)
  useEffect(() => {
    // Recarga cada 5 minutos
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000);
    // Calcular tiempo restante hasta las 22:00
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
  const [registros, setRegistros] = useState({});
  const [horasUnicas, setHorasUnicas] = useState([]); // Estas serán nuestras columnas – se inicializan a partir de un arreglo fijo.
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });

  // Toggle para las secciones desplegables
  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  // Al cargar datos, determinar la jornada y filtrar los registros
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const ahora = moment().tz("America/Mexico_City");
        // La jornada se define de 22:00 del día anterior o de hoy según corresponda.
        let inicioHoy = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, "days");
        }
        const finHoy = inicioHoy.clone().add(23, "hours").add(30, "minutes"); // hasta las 21:30

        // Filtrar registros correspondientes a la jornada y que pertenezcan a alguna de las máquinas
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return (
            fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[]") &&
            maquinas.some((maquina) =>
              registro.name.includes(maquina.split(" ")[0])
            )
          );
        });

        // Agrupar registros por máquina
        const registrosPorMaquina = maquinas.reduce((acc, maquina) => {
          acc[maquina] = registrosFiltrados.filter((registro) =>
            registro.name.includes(maquina.split(" ")[0])
          );
          return acc;
        }, {});

        // Calcular totales acumulados por máquina y totales globales por turno
        const totalesAcumuladosPorMaquina = {};
        const totalesTurnoGlobal = { matutino: 0, vespertino: 0, nocturno: 0 };

        maquinas.forEach((maquina) => {
          let totalAcum = 0;
          registrosPorMaquina[maquina].forEach((registro) => {
            totalAcum += parseInt(registro.hits || 0, 10);
            const fechaHoraRegistro = moment.tz(
              `${registro.fecha} ${registro.hour}`,
              "YYYY-MM-DD HH:mm:ss",
              "America/Mexico_City"
            );
            // Turno Nocturno: de 22:00 a 06:00
            if (fechaHoraRegistro.hour() >= 22 || fechaHoraRegistro.hour() < 6) {
              totalesTurnoGlobal.nocturno += parseInt(registro.hits || 0, 10);
            }
            // Turno Matutino: de 06:30 a 14:29
            else if (
              fechaHoraRegistro.isSameOrAfter(
                fechaHoraRegistro.clone().set({ hour: 6, minute: 30, second: 0 })
              ) &&
              fechaHoraRegistro.isBefore(
                fechaHoraRegistro.clone().set({ hour: 14, minute: 30, second: 0 })
              )
            ) {
              totalesTurnoGlobal.matutino += parseInt(registro.hits || 0, 10);
            }
            // Turno Vespertino: de 14:30 a 21:30
            else if (
              fechaHoraRegistro.isSameOrAfter(
                fechaHoraRegistro.clone().set({ hour: 14, minute: 30, second: 0 })
              ) &&
              fechaHoraRegistro.isBefore(
                fechaHoraRegistro.clone().set({ hour: 21, minute: 30, second: 0 })
              )
            ) {
              totalesTurnoGlobal.vespertino += parseInt(registro.hits || 0, 10);
            }
          });
          totalesAcumuladosPorMaquina[maquina] = totalAcum;
        });

        // Arreglo fijo de horas en el orden deseado (de las más recientes a las más antiguas)
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
        
        setHorasUnicas(horasFijas);
        setTotalesAcumulados(totalesAcumuladosPorMaquina);
        setRegistros(registrosPorMaquina);
        setTotalesPorTurno(totalesTurnoGlobal);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // useMemo para filtrar las horas que tienen hits > 0 (evita que se muestren columnas con 0 si se reinició el turno)
  const filteredHoras = useMemo(() => {
    const allRegistros = Object.values(registros).flat();
    return horasUnicas.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
      const totalHits = getTotalHitsForInterval(allRegistros, horaInicio, horaFin);
      return totalHits > 0;
    });
  }, [horasUnicas, registros]);

  // Para la fila de totales por hora en la tabla, se opera sobre filteredHoras
  const sumaHitsPorHora = filteredHoras.map((hora) => {
    const [horaInicio, horaFin] = hora.split(" - ");
    return maquinas.reduce((total, maquina) => {
      return total + getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin);
    }, 0);
  });

  // Función para asignar clase (podrías ajustarla según tus metas)
  const getClassName = (hits, metaPorTurno) =>
    hits >= metaPorTurno ? "text-green-500" : "text-red-500";

  return (
    <div className="max-w-screen-xl">
      {/* Vista en tarjetas para pantallas pequeñas */}
      <div className="lg:hidden mt-4">
        {maquinas.map((maquina) => (
          <SeccionMenu
            key={maquina}
            titulo={maquina}
            isOpen={seccionesAbiertas[maquina] || false}
            toggle={() => toggleSeccion(maquina)}
          >
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-gray-700">Total Acumulado:</span>
                <span className="font-bold">{totalesAcumulados[maquina]}</span>
              </div>
              <div className="py-4">
                <span className="font-bold text-gray-700">Horas:</span>
                {filteredHoras.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const totalHits = getTotalHitsForInterval(
                    registros[maquina] || [],
                    horaInicio,
                    horaFin
                  );
                  const bgColor = idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300";
                  return (
                    <div
                      key={idx}
                      className={`flex justify-between py-2 px-4 ${bgColor}`}
                    >
                      <span className="font-bold text-gray-700">{hora}:</span>
                      <span className="font-bold">{totalHits}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SeccionMenu>
        ))}
      </div>
      
      {/* Vista en tabla para pantallas grandes */}
      <div className="hidden lg:block">
        <Navegacion />
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>
                Nombre
              </th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              {filteredHoras.map((hora, index) => (
                <th
                  key={index}
                  className="py-2 px-4 border-b whitespace-nowrap"
                >
                  {hora}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {maquinas.map((maquina) => (
              <tr key={maquina} className="font-semibold text-gray-700">
                <td
                  className="py-2 px-4 border-b font-bold"
                  style={{ minWidth: "250px" }}
                >
                  {maquina}
                </td>
                <td className="py-2 px-4 border-b font-bold">
                  {totalesAcumulados[maquina]}
                </td>
                {filteredHoras.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const totalHits = getTotalHitsForInterval(
                    registros[maquina] || [],
                    horaInicio,
                    horaFin
                  );
                  return (
                    <td key={idx} className="font-bold py-2 px-4 border-b">
                      {totalHits}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td
                className="py-2 px-4 border-b font-bold"
                style={{ minWidth: "250px" }}
              >
                Totales
              </td>
              <td className="py-2 px-4 border-b font-bold">
                {Object.values(totalesAcumulados).reduce((a, b) => a + b, 0)}
              </td>
              {sumaHitsPorHora.map((sumaHits, index) => (
                <td key={index} className="font-bold py-2 px-4 border-b">
                  {sumaHits}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sección de totales por turno */}
      <div className="mt-4 font-semibold mb-4">
        {/* Vista para pantallas pequeñas */}
        <div className="lg:hidden space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Turno Nocturno
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.nocturno}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Turno Matutino
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.matutino}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Turno Vespertino
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.vespertino}</span>
            </div>
          </div>
        </div>
        {/* Vista para pantallas grandes */}
        <div className="hidden lg:flex lg:flex-row justify-around">
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Nocturno: {totalesPorTurno.nocturno}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Matutino: {totalesPorTurno.matutino}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Total Vespertino: {totalesPorTurno.vespertino}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_AR_Maquina;