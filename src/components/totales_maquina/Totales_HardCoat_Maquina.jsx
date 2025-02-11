import { useState, useEffect, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";

moment.tz.setDefault("America/Mexico_City");

// Función auxiliar para construir un objeto moment usando la fecha base según la hora
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const parts = horaStr.split(":");
  const hour = parseInt(parts[0], 10);
  // Si la hora es mayor o igual a 22 se toma el día base; de lo contrario, se agrega un día.
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
};

// Función auxiliar que calcula el total de hits en un intervalo de horas
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

const Totales_HardCoat_Maquina = () => {
  const maquinas = [
    "46 MR3.4",
    "48 MR3.1",
    "49 MR3.2",
    "50 MR3.3",
    "91 VELOCITY 1",
    "92 VELOCITY 2"
  ];

  // Reinicio automático: cada 5 minutos y al iniciar el nuevo turno (22:00)
  useEffect(() => {
    const intervalId = setInterval(() => {
      window.location.reload();
    }, 300000); // cada 5 minutos
    const now = moment();
    let target = moment().hour(22).minute(0).second(0);
    if (now.isAfter(target)) target.add(1, "days");
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
  const toggleSeccion = (seccion) =>
    setSeccionesAbiertas((prev) => ({ ...prev, [seccion]: !prev[seccion] }));

  // Lista fija de intervalos (ordenada de manera que el intervalo más reciente se muestra primero)
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
    "22:00 - 23:00"
  ];
  const [horasUnicas, setHorasUnicas] = useState([]);

  const [registros, setRegistros] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const ahora = moment().tz("America/Mexico_City");
        // Jornada: de 22:00 a 21:30 del día siguiente
        let inicioJornada = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
        let finJornada = moment(inicioJornada).add(1, "days").subtract(30, "minutes");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "days");
          finJornada.subtract(1, "days");
        }
        // Filtrar registros para la jornada y para las máquinas indicadas (comparando por el primer token)
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return (
            fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)") &&
            maquinas.some((maquina) => registro.name.includes(maquina.split(" ")[0]))
          );
        });
        // Agrupar por máquina
        const registrosPorMaquina = maquinas.reduce((acc, maquina) => {
          acc[maquina] = registrosFiltrados.filter((registro) =>
            registro.name.includes(maquina.split(" ")[0])
          );
          return acc;
        }, {});
        setRegistros(registrosPorMaquina);
        // Asignamos la lista fija de horas
        setHorasUnicas(horasFijas);
        // Calcular totales acumulados y totales por turno
        let totalesAcumuladosPorMaquina = {};
        let totalesPorTurnoGlobal = { nocturno: 0, matutino: 0, vespertino: 0 };
        maquinas.forEach((maquina) => {
          let totalAcumulado = 0;
          registrosPorMaquina[maquina].forEach((registro) => {
            const hits = parseInt(registro.hits || 0);
            totalAcumulado += hits;
            const fechaHoraRegistro = moment.tz(
              `${registro.fecha} ${registro.hour}`,
              "YYYY-MM-DD HH:mm:ss",
              "America/Mexico_City"
            );
            // Definición de turnos:
            // Nocturno: de inicioJornada (22:00) a +8 horas (06:00)
            // Matutino: de +8h +30min (06:30) a +16h +30min (14:30)
            // Vespertino: de +16h +30min (14:30) a +23h +30min (21:30)
            if (
              fechaHoraRegistro.isBetween(inicioJornada, inicioJornada.clone().add(8, "hours"), null, "[)")
            ) {
              totalesPorTurnoGlobal.nocturno += hits;
            } else if (
              fechaHoraRegistro.isBetween(
                inicioJornada.clone().add(8, "hours").add(30, "minutes"),
                inicioJornada.clone().add(16, "hours").add(30, "minutes"),
                null,
                "[)"
              )
            ) {
              totalesPorTurnoGlobal.matutino += hits;
            } else if (
              fechaHoraRegistro.isBetween(
                inicioJornada.clone().add(16, "hours").add(30, "minutes"),
                inicioJornada.clone().add(23, "hours").add(30, "minutes"),
                null,
                "[)"
              )
            ) {
              totalesPorTurnoGlobal.vespertino += hits;
            }
          });
          totalesAcumuladosPorMaquina[maquina] = totalAcumulado;
        });
        setTotalesAcumulados(totalesAcumuladosPorMaquina);
        setTotalesPorTurno(totalesPorTurnoGlobal);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, [maquinas]);

  // Filtramos los intervalos para mostrar solo aquellos en que se hayan registrado hits (> 0)
  const filteredHoras = useMemo(() => {
    // Unificamos todos los registros de todas las máquinas
    const allRegistros = maquinas.reduce((acc, maquina) => {
      return acc.concat(registros[maquina] || []);
    }, []);
    return horasUnicas.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
      return getTotalHitsForInterval(allRegistros, horaInicio, horaFin) > 0;
    });
  }, [horasUnicas, registros, maquinas]);

  // Suma total acumulada global
  const sumaTotalAcumulados = Object.values(totalesAcumulados).reduce(
    (acc, curr) => acc + curr,
    0
  );

  // Suma de hits por intervalo según la lista filtrada
  const sumaHitsPorHora = filteredHoras.map((hora) => {
    const [horaInicio, horaFin] = hora.split(" - ");
    return maquinas.reduce((total, maquina) => {
      return total + getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin);
    }, 0);
  });

  return (
    <div className="max-w-screen-xl">
      {/* Vista tipo card para pantallas pequeñas y medianas */}
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
                  const totalHits = getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin);
                  const bgColor = idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300";
                  return (
                    <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
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
                <th key={index} className="py-2 px-4 border-b whitespace-nowrap">
                  {hora}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {maquinas.map((maquina) => (
              <tr key={maquina} className="font-semibold text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                  {maquina}
                </td>
                <td className="py-2 px-4 border-b font-bold">
                  {totalesAcumulados[maquina]}
                </td>
                {filteredHoras.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const totalHits = getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin);
                  return (
                    <td key={idx} className="font-bold py-2 px-4 border-b">
                      {totalHits}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                Totales
              </td>
              <td className="py-2 px-4 border-b font-bold">{sumaTotalAcumulados}</td>
              {sumaHitsPorHora.map((sumaHits, index) => (
                <td key={index} className="font-bold py-2 px-4 border-b">
                  {sumaHits}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Totales por turno */}
      <div className="mt-4 font-semibold mb-4">
        {/* Vista para pantallas pequeñas y medianas */}
        <div className="lg:hidden space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Nocturno</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.nocturno}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Matutino</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{totalesPorTurno.matutino}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Vespertino</h3>
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
              Turno Nocturno: <span className="font-bold">{totalesPorTurno.nocturno}</span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Turno Matutino: <span className="font-bold">{totalesPorTurno.matutino}</span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">
              Turno Vespertino: <span className="font-bold">{totalesPorTurno.vespertino}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_HardCoat_Maquina;