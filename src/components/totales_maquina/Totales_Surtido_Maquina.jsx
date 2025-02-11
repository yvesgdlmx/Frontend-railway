import { useState, useEffect, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import Navegacion from "../others/Navegacion";
import moment from "moment-timezone";
import { ChevronDownIcon, ChevronUpIcon, CogIcon } from "@heroicons/react/24/solid";
moment.tz.setDefault("America/Mexico_City");

// Arreglo de horas fijas en el orden requerido.
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

// Función auxiliar para crear el timestamp de un intervalo según el turno.
const getIntervalTimestamp = (shiftStart, horaStr) => {
  const [hora] = horaStr.split(":");
  const hour = parseInt(hora, 10);
  // Si la hora es >=22 se considera la fecha del turno actual; de lo contrario, se le suma un día.
  const fechaBase = hour >= 22 ? shiftStart.clone() : shiftStart.clone().add(1, "days");
  return moment.tz(
    `${fechaBase.format("YYYY-MM-DD")} ${horaStr}:00`,
    "YYYY-MM-DD HH:mm:ss",
    "America/Mexico_City"
  );
};

// Componente para el título plegable.
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

// Componente para sección plegable.
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

const Totales_Surtido_Maquina = () => {
  // Reinicio automático de la página cada 5 minutos y también a las 22:00 (inicio de turno).
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

  // Estados locales
  const [seccionAbierta, setSeccionAbierta] = useState(false);
  const [registros, setRegistros] = useState([]);
  // Este estado se usará para mostrar dinámicamente solo las columnas (horas) que tengan registros.
  const [horasUnicas, setHorasUnicas] = useState([]);
  const [meta19, setMeta19] = useState(0);
  const [meta20, setMeta20] = useState(0);
  const [totalesAcumulados, setTotalesAcumulados] = useState(0);
  const [registrosPorTipo, setRegistrosPorTipo] = useState({
    "19 LENS LOG-SF": [],
    "20 LENS LOG-FIN": []
  });
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });

  const toggleSeccion = () => {
    setSeccionAbierta(!seccionAbierta);
  };

  // Determina el inicio del turno (inicia a las 22:00). Si la hora actual es anterior, se toma el turno del día anterior.
  const getShiftStart = () => {
    let shiftStart = moment().tz("America/Mexico_City").startOf("day").add(22, "hours");
    if (moment().isBefore(shiftStart)) {
      shiftStart.subtract(1, "days");
    }
    return shiftStart;
  };

  // Función para calcular las horas transcurridas reales desde el inicio del turno.
  const calcularHorasTranscurridas = () => {
    const shiftStart = getShiftStart();
    const ahora = moment();
    const diffHoras = ahora.diff(shiftStart, "hours", true);
    return diffHoras > 0 ? Math.floor(diffHoras) : 0;
  };

  // Cargar datos: metas y registros.
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar metas.
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const meta19Obj = responseMetas.data.registros.find(
          (meta) => meta.name.trim() === "19 LENS LOG"
        );
        const meta20Obj = responseMetas.data.registros.find(
          (meta) => meta.name.trim() === "20 LENS LOG"
        );
        setMeta19(meta19Obj ? meta19Obj.meta : 0);
        setMeta20(meta20Obj ? meta20Obj.meta : 0);

        // Cargar registros.
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const dataRegistros = responseRegistros.data.registros || [];
        const shiftStart = getShiftStart();
        const finJornada = shiftStart.clone().add(1, "days").subtract(30, "minutes");
        const registrosFiltrados = dataRegistros.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(shiftStart, finJornada, null, "[)");
        });
        procesarRegistros(registrosFiltrados, shiftStart);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // Función para procesar los registros filtrados y establecer los estados.
  // Además, se calcula dinámicamente qué columnas (horas) mostrar según los registros.
  const procesarRegistros = (registrosFiltrados, shiftStart) => {
    let totalAcumulado = 0;
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
    const registrosPorTipoTemp = {
      "19 LENS LOG-SF": [],
      "20 LENS LOG-FIN": []
    };

    registrosFiltrados.forEach((registro) => {
      const hits = parseInt(registro.hits || 0, 10);
      totalAcumulado += hits;
      if (registro.name.includes("19 LENS LOG-SF")) {
        registrosPorTipoTemp["19 LENS LOG-SF"].push(registro);
      } else if (registro.name.includes("20 LENS LOG-FIN")) {
        registrosPorTipoTemp["20 LENS LOG-FIN"].push(registro);
      }
      const fechaHoraRegistro = moment.tz(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss",
        "America/Mexico_City"
      );
      if (
        fechaHoraRegistro.isBetween(
          getIntervalTimestamp(shiftStart, "22:00"),
          getIntervalTimestamp(shiftStart, "06:00"),
          null,
          "[)"
        )
      ) {
        totales.nocturno += hits;
      } else if (
        fechaHoraRegistro.isBetween(
          getIntervalTimestamp(shiftStart, "06:30"),
          getIntervalTimestamp(shiftStart, "14:30"),
          null,
          "[)"
        )
      ) {
        totales.matutino += hits;
      } else if (
        fechaHoraRegistro.isBetween(
          getIntervalTimestamp(shiftStart, "14:30"),
          getIntervalTimestamp(shiftStart, "21:30"),
          null,
          "[)"
        )
      ) {
        totales.vespertino += hits;
      }
    });

    // Ahora se determina dinámicamente qué columnas (intervalos de hora) tienen registros.
    const dynamicHoras = fixedHoras.filter((intervalo) => {
      const [horaInicio, horaFin] = intervalo.split(" - ");
      let totalIntervalo = 0;
      Object.values(registrosPorTipoTemp).forEach((registrosArr) => {
        registrosArr.forEach((r) => {
          const hourMoment = moment(r.hour, "HH:mm:ss");
          const startMoment = moment(horaInicio, "HH:mm");
          const endMoment = moment(horaFin, "HH:mm");
          let coincide = false;
          if (startMoment.isAfter(endMoment)) {
            coincide = hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
          } else {
            coincide = hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
          }
          if (coincide) {
            totalIntervalo += parseInt(r.hits || 0, 10);
          }
        });
      });
      return totalIntervalo > 0;
    });

    setTotalesAcumulados(totalAcumulado);
    setRegistros(registrosFiltrados);
    setTotalesPorTurno(totales);
    setRegistrosPorTipo(registrosPorTipoTemp);
    // Se utiliza el arreglo dinámico para mostrar las columnas que tengan al menos un registro.
    setHorasUnicas(dynamicHoras);
  };

  // Función que evalúa la clase de color según si el total acumulado cumple o no la meta acumulada.
  // Se utiliza ahora el parámetro "horasTranscurridas" basado en la hora real transcurrida desde el inicio del turno.
  const evaluarTotalAcumulado = (total, meta, horasTranscurridas) => {
    const metaAcumulada = meta * horasTranscurridas;
    return total >= metaAcumulada ? "text-green-500" : "text-red-500";
  };

  // Calculamos las horas transcurridas reales desde el inicio del turno.
  const horasTranscurridas = calcularHorasTranscurridas();
  const sumaMetas = meta19 + meta20;
  
  // Se calculan las metas acumuladas para cada tipo usando las horas transcurridas reales.
  const metaAcumuladaTotal19 = horasTranscurridas * meta19;
  const metaAcumuladaTotal20 = horasTranscurridas * meta20;

  // Evaluamos la clase de color para el total acumulado.
  const claseTotal = evaluarTotalAcumulado(totalesAcumulados, sumaMetas, horasTranscurridas);

  return (
    <div className="max-w-screen-xl">
      {/* Vista para pantallas pequeñas */}
      <div className="lg:hidden mt-4">
        <SeccionMenu titulo="Surtido" isOpen={seccionAbierta} toggle={toggleSeccion}>
          <div className="bg-white shadow-md rounded-lg p-6">
            {["19 LENS LOG-SF", "20 LENS LOG-FIN"].map((tipo, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-bold text-gray-700 mb-2">{tipo}</h3>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-bold text-gray-700">Total:</span>
                  <span className={`font-bold ${claseTotal}`}>
                    {registrosPorTipo[tipo].reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SeccionMenu>
      </div>
      {/* Vista para pantallas grandes */}
      <div className="hidden lg:block">
        <Navegacion />
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-2 px-4 border-b" style={{ minWidth: "150px" }}>Nombre</th>
              <th className="py-2 px-4 border-b">Total Acumulado</th>
              <th className="py-2 px-4 border-b">Meta</th>
              <th className="py-2 px-4 border-b">Meta Acumulada</th>
              {horasUnicas.length > 0 &&
                horasUnicas.map((hora, index) => (
                  <th key={index} className="py-2 px-4 border-b whitespace-nowrap">
                    {hora}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="text-center">
            {["19 LENS LOG-SF", "20 LENS LOG-FIN"].map((tipo, index) => (
              <tr key={index} className="font-semibold text-gray-700">
                <td className="py-2 px-4 border-b font-bold" style={{ minWidth: "150px" }}>
                  {tipo}
                </td>
                <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>
                  {registrosPorTipo[tipo].reduce((acc, curr) => acc + parseInt(curr.hits || 0, 10), 0)}
                </td>
                <td className="py-2 px-4 border-b font-bold">
                  {tipo === "19 LENS LOG-SF" ? meta19 : (meta20 || "No definida")}
                </td>
                <td className="py-2 px-4 border-b font-bold">
                  {tipo === "19 LENS LOG-SF" ? metaAcumuladaTotal19 : metaAcumuladaTotal20}
                </td>
                {horasUnicas.length > 0 &&
                  horasUnicas.map((hora, idx) => {
                    const [horaInicio, horaFin] = hora.split(" - ");
                    const totalHits = registrosPorTipo[tipo]
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
                    const claseHitsIndividual =
                      totalHits >= (tipo === "19 LENS LOG-SF" ? meta19 : meta20)
                        ? "text-green-500"
                        : "text-red-500";
                    return (
                      <td key={idx} className={`font-bold py-2 px-4 border-b ${claseHitsIndividual}`}>
                        {totalHits}
                      </td>
                    );
                  })}
              </tr>
            ))}
            <tr className="font-semibold bg-green-200 text-gray-700">
              <td className="py-2 px-4 border-b font-bold">Totales</td>
              <td className={`py-2 px-4 border-b font-bold ${claseTotal}`}>
                {totalesAcumulados}
              </td>
              <td className="py-2 px-4 border-b font-bold">{sumaMetas}</td>
              <td className="py-2 px-4 border-b font-bold">
                {metaAcumuladaTotal19 + metaAcumuladaTotal20}
              </td>
              {horasUnicas.length > 0 &&
                horasUnicas.map((hora, idx) => {
                  const totalHora = Object.values(registrosPorTipo).reduce((acc, registros) => {
                    return (
                      acc +
                      registros
                        .filter((r) => {
                          const [horaInicio, horaFin] = hora.split(" - ");
                          const hourMoment = moment(r.hour, "HH:mm:ss");
                          const startMoment = moment(horaInicio, "HH:mm");
                          const endMoment = moment(horaFin, "HH:mm");
                          if (startMoment.isAfter(endMoment)) {
                            return hourMoment.isSameOrAfter(startMoment) || hourMoment.isBefore(endMoment);
                          } else {
                            return hourMoment.isSameOrAfter(startMoment) && hourMoment.isBefore(endMoment);
                          }
                        })
                        .reduce((sum, curr) => sum + parseInt(curr.hits || 0, 10), 0)
                    );
                  }, 0);
                  return (
                    <td key={idx} className={`font-bold py-2 px-4 border-b ${totalHora >= sumaMetas ? "text-green-500" : "text-red-500"}`}>
                      {totalHora}
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

export default Totales_Surtido_Maquina;