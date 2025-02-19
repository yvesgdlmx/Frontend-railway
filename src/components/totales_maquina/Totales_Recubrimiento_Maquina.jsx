import { useState, useEffect, useRef, useMemo } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
import { formatNumber } from '../../helpers/formatNumber';

// Componente de título
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
    if (isOpen && contentRef.current) {
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

const Totales_Recubrimiento_Maquina = () => {
  // Usamos useMemo para definir el array de máquinas y que su referencia se mantenga estable
  const maquinas = useMemo(
    () => ["60 AR ENTRADA", "61 AR SALIDA"],
    []
  );

  // RELOAD: recargar cada 5 minutos y al comenzar nuevo turno (22:00)
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // 5 min
    const ahora = moment().tz("America/Mexico_City");
    let target = moment().tz("America/Mexico_City").hour(22).minute(0).second(0);
    if (ahora.isAfter(target)) {
      target.add(1, "days");
    }
    const delay = target.diff(ahora);
    const timeoutId = setTimeout(() => {
      window.location.reload();
    }, delay);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  // Estado para secciones colapsables
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  // Estados para registros y totales
  const [registros, setRegistros] = useState({});
  const [totalesAcumulados, setTotalesAcumulados] = useState({});
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });

  // Arreglo fijo de franjas horarias (orden deseado: las más recientes a la izquierda)
  const fixedHours = [
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

  // Función para calcular total de hits en un intervalo
  const getTotalHitsForInterval = (arrRegistros, horaInicio, horaFin) => {
    return arrRegistros
      .filter((r) => {
        const registroTime = moment(r.hour, "HH:mm:ss");
        const startMoment = moment(horaInicio, "HH:mm");
        const endMoment = moment(horaFin, "HH:mm");
        if (startMoment.isAfter(endMoment)) {
          return (
            registroTime.isSameOrAfter(startMoment) ||
            registroTime.isBefore(endMoment)
          );
        } else {
          return (
            registroTime.isSameOrAfter(startMoment) &&
            registroTime.isBefore(endMoment)
          );
        }
      })
      .reduce((sum, curr) => sum + parseInt(curr.hits || 0, 10), 0);
  };

  // Filtrar solo aquellas franjas horarias con algún registro (evita mostrar horas con 0)
  const filteredHours = useMemo(() => {
    return fixedHours.filter((hora) => {
      const [horaInicio, horaFin] = hora.split(" - ");
      const totalHits = maquinas.reduce((acc, maquina) => {
        return (
          acc + getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin)
        );
      }, 0);
      return totalHits > 0;
    });
  }, [fixedHours, maquinas, registros]);

  // Carga de datos y procesamiento
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        // Definimos la jornada a partir de las 22:00 (si es antes, se resta 1 día)
        const ahora = moment().tz("America/Mexico_City");
        let inicioJornada = moment()
          .tz("America/Mexico_City")
          .startOf("day")
          .add(22, "hours");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "days");
        }
        let finJornada = moment(inicioJornada).add(1, "days");
        // Filtrar registros de la jornada actual y que pertenezcan a las máquinas definidas
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return (
            fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)") &&
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
        // Calcular totales acumulados y totales por turno
        const totalesAcumuladosPorMaquina = {};
        const totalesTurno = { matutino: 0, vespertino: 0, nocturno: 0 };
        maquinas.forEach((maquina) => {
          let totalAcumulado = 0;
          (registrosPorMaquina[maquina] || []).forEach((registro) => {
            totalAcumulado += parseInt(registro.hits || 0, 10);
            const fechaHoraRegistro = moment.tz(
              `${registro.fecha} ${registro.hour}`,
              "YYYY-MM-DD HH:mm:ss",
              "America/Mexico_City"
            );
            // Turnos definidos:
            // Nocturno: de 22:00 a 06:00
            // Matutino: de 06:30 a 14:29 (aprox.)
            // Vespertino: de 14:30 a 21:30
            if (
              fechaHoraRegistro.isBetween(inicioJornada, moment(inicioJornada).add(8, "hours"), null, "[)")
            ) {
              totalesTurno.nocturno += parseInt(registro.hits || 0, 10);
            } else if (
              fechaHoraRegistro.isBetween(
                moment(inicioJornada).add(8, "hours").add(30, "minutes"),
                moment(inicioJornada).add(16, "hours"),
                null,
                "[)"
              )
            ) {
              totalesTurno.matutino += parseInt(registro.hits || 0, 10);
            } else if (
              fechaHoraRegistro.isBetween(
                moment(inicioJornada).add(16, "hours").add(30, "minutes"),
                moment(inicioJornada).add(23, "hours").add(30, "minutes"),
                null,
                "[)"
              )
            ) {
              totalesTurno.vespertino += parseInt(registro.hits || 0, 10);
            }
          });
          totalesAcumuladosPorMaquina[maquina] = totalAcumulado;
        });
        setRegistros(registrosPorMaquina);
        setTotalesAcumulados(totalesAcumuladosPorMaquina);
        setTotalesPorTurno(totalesTurno);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, [maquinas]);

  // Cálculo de totales por hora (usando las franjas filtradas)
  const sumaHitsPorHora = filteredHours.map((hora) => {
    const [horaInicio, horaFin] = hora.split(" - ");
    return maquinas.reduce((total, maquina) => {
      return (
        total +
        ((registros[maquina] || []).filter((r) => {
          const hourMoment = moment(r.hour, "HH:mm:ss");
          const startMoment = moment(horaInicio, "HH:mm");
          const endMoment = moment(horaFin, "HH:mm");
          if (startMoment.isAfter(endMoment)) {
            return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
          } else {
            return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
          }
        })).reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0)
      );
    }, 0);
  });

  return (
    <div className="max-w-screen-xl">
      {/* Diseño para pantallas pequeñas y medianas */}
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
                <span className="font-bold">{formatNumber(totalesAcumulados[maquina])}</span>
              </div>
              <div className="py-4">
                <span className="font-bold text-gray-700">Horas:</span>
                {filteredHours.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const totalHits = getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin);
                  const bgColor = idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300";
                  return (
                    <div key={idx} className={`flex justify-between py-2 px-4 ${bgColor}`}>
                      <span className="font-bold text-gray-700">{hora}:</span>
                      <span className="font-bold">{formatNumber(totalHits)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SeccionMenu>
        ))}
      </div>
      {/* Diseño de tabla para pantallas grandes */}
      <div className="hidden lg:block">
        <Navegacion />
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "250px" }}>
                Nombre
              </th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              {filteredHours.map((hora, index) => (
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
                <td className="py-2 px-4 border-b font-bold">{formatNumber(totalesAcumulados[maquina])}</td>
                {filteredHours.map((hora, idx) => {
                  const [horaInicio, horaFin] = hora.split(" - ");
                  const totalHits = getTotalHitsForInterval(registros[maquina] || [], horaInicio, horaFin);
                  return (
                    <td key={idx} className="font-bold py-2 px-4 border-b">
                      {formatNumber(totalHits)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "250px" }}>
                Totales
              </td>
              <td className="py-2 px-4 border-b font-bold">
                {formatNumber(maquinas.reduce((acumulado, maquina) => acumulado + (totalesAcumulados[maquina] || 0), 0))}
              </td>
              {sumaHitsPorHora.map((sumaHits, index) => (
                <td key={index} className="font-bold py-2 px-4 border-b">
                  {formatNumber(sumaHits)}
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
              <span className="text-lg">{formatNumber(totalesPorTurno.nocturno)}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Matutino</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{formatNumber(totalesPorTurno.matutino)}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Turno Vespertino</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="text-lg">{formatNumber(totalesPorTurno.vespertino)}</span>
            </div>
          </div>
        </div>
        {/* Vista para pantallas grandes */}
        <div className="hidden lg:flex lg:flex-row justify-around">
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">Total Nocturno: {formatNumber(totalesPorTurno.nocturno)}</p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">Total Matutino: {formatNumber(totalesPorTurno.matutino)}</p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg">
            <p className="text-gray-600 text-base">Total Vespertino: {formatNumber(totalesPorTurno.vespertino)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totales_Recubrimiento_Maquina;