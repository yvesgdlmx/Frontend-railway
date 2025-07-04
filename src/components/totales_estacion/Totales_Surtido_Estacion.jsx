import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";
moment.tz.setDefault("America/Mexico_City");
const Totales_Surtido_Estacion = () => {
  const location = useLocation();
  const [registros, setRegistros] = useState([]);
  // Totales de hits por turno (calculados a partir de los registros)
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Meta POR HORA (valor que debe cumplirse en cada bucket)
  const [metasPorHora, setMetasPorHora] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Meta TOTAL por turno (acumulado: metaPorHora x cantidad de horas asignadas al turno)
  const [metasTotalesPorTurno, setMetasTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Array fijo con el orden de los buckets (horas)
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00", // Nocturno
  ];
  // Función para calcular el rango a mostrar en el encabezado (cada bucket dura 1 hora)
  const calcularRangoHoras = (hora) => {
    const inicio = hora;
    let fin;
    if (hora === "23:00") {
      fin = "00:00";
    } else {
      const obj = moment(hora, "HH:mm");
      fin = obj.add(1, "hour").format("HH:mm");
    }
    return `${inicio} - ${fin}`;
  };
  // Efecto para hacer scroll si hay hash en la URL.
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }, 0);
    }
  }, [location]);
  // Efecto para obtener datos desde la API.
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Se obtiene la meta por hora desde la API
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const meta19 = responseMetas.data.registros.find(
          (registro) => registro.name === "19 LENS LOG"
        );
        const meta20 = responseMetas.data.registros.find(
          (registro) => registro.name === "20 LENS LOG"
        );
        // Sumamos las metas por hora de cada turno para ambos registros
        const metaNocturnoPorHora =
          (meta19 ? meta19.meta_nocturno : 0) + (meta20 ? meta20.meta_nocturno : 0);
        const metaMatutinoPorHora =
          (meta19 ? meta19.meta_matutino : 0) + (meta20 ? meta20.meta_matutino : 0);
        const metaVespertinoPorHora =
          (meta19 ? meta19.meta_vespertino : 0) + (meta20 ? meta20.meta_vespertino : 0);
        // Se asignan las metas POR HORA al estado
        setMetasPorHora({
          nocturno: metaNocturnoPorHora,
          matutino: metaMatutinoPorHora,
          vespertino: metaVespertinoPorHora,
        });
        // Se calcula la meta TOTAL (acumulada) por turno según la cantidad de horas:
        // Lógica original: nocturno y matutino: 8 horas; vespertino: 7 horas.
        setMetasTotalesPorTurno({
          nocturno: metaNocturnoPorHora * 8,
          matutino: metaMatutinoPorHora * 8,
          vespertino: metaVespertinoPorHora * 7,
        });
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const registrosLensLog = responseRegistros.data.registros.filter((registro) =>
          registro.name.includes("LENS LOG")
        );
        const ahora = moment();
        // Definición de la jornada: desde las 22:00 del día anterior hasta las 21:30 del día actual.
        let inicioJornada = moment().startOf("day").add(22, "hours");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "day");
        }
        const finJornada = inicioJornada.clone().add(1, "days").subtract(30, "minutes");
        const registrosFiltrados = registrosLensLog.filter((registro) => {
          const fechaHoraRegistro = moment(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)");
        });
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados, inicioJornada);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Función para calcular totales de hits por turno, según la jornada definida.
  const calcularTotalesPorTurno = (registros, inicioJornada) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0,
    };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      // Turno Nocturno: 22:00 a 05:59
      if (
        fechaHoraRegistro.isBetween(
          inicioJornada.clone(),
          inicioJornada.clone().add(8, "hours"),
          null,
          "[)"
        )
      ) {
        totales.nocturno += registro.hits;
      }
      // Turno Matutino: 06:30 a 13:29
      else if (
        fechaHoraRegistro.isBetween(
          inicioJornada.clone().add(8, "hours").add(30, "minutes"),
          inicioJornada.clone().add(16, "hours"),
          null,
          "[)"
        )
      ) {
        totales.matutino += registro.hits;
      }
      // Turno Vespertino: 14:30 a 21:30
      else if (
        fechaHoraRegistro.isBetween(
          inicioJornada.clone().add(16, "hours").add(30, "minutes"),
          inicioJornada.clone().add(23, "hours").add(30, "minutes"),
          null,
          "[)"
        )
      ) {
        totales.vespertino += registro.hits;
      }
    });
    setTotalesPorTurno(totales);
  };
  // Función para agrupar los hits por hora (formato "HH:mm")
  const agruparHitsPorHora = () => {
    const hits = {};
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const horaFormateada = fechaHoraRegistro.format("HH:mm");
      if (hits[horaFormateada]) {
        hits[horaFormateada] += registro.hits;
      } else {
        hits[horaFormateada] = registro.hits;
      }
    });
    return hits;
  };
  const hitsPorHora = agruparHitsPorHora();
  // Función para determinar el bucket (inicio del intervalo) para cada hora, basado en la jornada.
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada
      .clone()
      .set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) {
      bucket.add(1, "day");
    }
    return bucket;
  };
  // Función que devuelve el valor a mostrar para cada bucket (hora)
  const getDisplayValue = (horaStr, inicioJornada) => {
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5; // margen en minutos
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes"))
      ? 0
      : "";
  };
  // Se calcula el inicio de la jornada para usar en los buckets y columnas.
  let inicioJornada = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicioJornada)) {
    inicioJornada.subtract(1, "day");
  }
  // Se crea el arreglo de columnas, filtrando aquellas sin valor.
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora, inicioJornada),
    }))
    .filter((col) => col.valor !== "");
  // Función que retorna la meta POR HORA para cada bucket, en función del turno.
  const getMetaParaHora = (horaStr, inicioJornada) => {
    const bucket = getBucketMoment(horaStr, inicioJornada);
    if (
      bucket.isBetween(
        inicioJornada.clone(),
        inicioJornada.clone().add(8, "hours"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.nocturno;
    } else if (
      bucket.isBetween(
        inicioJornada.clone().add(8, "hours").add(30, "minutes"),
        inicioJornada.clone().add(16, "hours"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.matutino;
    } else if (
      bucket.isBetween(
        inicioJornada.clone().add(16, "hours").add(30, "minutes"),
        inicioJornada.clone().add(23, "hours").add(30, "minutes"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.vespertino;
    }
    return 0;
  };
  // Función para asignar una clase según se cumpla la meta (para cada celda)
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block" id="surtido">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white border-l-2">
              {/* Se aumenta el padding vertical en el encabezado */}
              <th className="py-3 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base"></th>
              {columnas.map((col, i) => (
                <th
                  key={i}
                  className="py-3 px-4 border-b min-w-[150px] whitespace-nowrap text-sm md:text-base"
                >
                  {col.rango}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center bg-white">
            <tr className="font-semibold text-gray-700">
              <td className="py-3">
                <Link to={"/totales_surtido_maquina"} className="link__tabla">
                  <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300 px-4">
                    <img
                      src="./img/ver.png"
                      alt=""
                      width={25}
                      className="relative left-2"
                    />
                    {/* Muestra únicamente "Surtido" */}
                    <div className="py-3 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base">
                      Surtido
                    </div>
                  </div>
                </Link>
              </td>
              {columnas.map((col, i) => {
                const metaParaCol = getMetaParaHora(col.hora, inicioJornada);
                return (
                  <td
                    key={i}
                    className="py-3 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-sm md:text-base bg-white"
                  >
                    <span className={getClassName(col.valor, metaParaCol)}>
                      {col.valor}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        {/* Sección de totales por turno para pantallas grandes:
            Cada recuadro muestra los tres datos (Total, Meta Acumulada y Meta x Hora) en una sola línea */}
        <div className="flex flex-row justify-around mt-4 font-semibold mb-4 gap-6">
          <div className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center">
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno: <span className={getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno.nocturno)}>{formatNumber(totalesPorTurno.nocturno)}</span> / Meta Acumulada: {formatNumber(metasTotalesPorTurno.nocturno)} / Meta x Hora: {metasPorHora.nocturno}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center">
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino: <span className={getClassName(totalesPorTurno.matutino, metasTotalesPorTurno.matutino)}>{formatNumber(totalesPorTurno.matutino)}</span> / Meta Acumulada: {formatNumber(metasTotalesPorTurno.matutino)} / Meta x Hora: {metasPorHora.matutino}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center">
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino: <span className={getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno.vespertino)}>{formatNumber(totalesPorTurno.vespertino)}</span> / Meta Acumulada: {formatNumber(metasTotalesPorTurno.vespertino)} / Meta x Hora: {metasPorHora.vespertino}
            </p>
          </div>
        </div>
      </div>
      {/* Versión para pantallas pequeñas y medianas */}
      <div className="block lg:hidden mt-4">
        <div className="bg-white shadow-md rounded-lg mb-4 p-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-bold text-gray-700">Nombre:</span>
            <span className="font-bold text-gray-700">Surtido</span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">Meta x hora:</span>
            <span className="font-bold text-gray-700">
              Nocturno: {metasPorHora.nocturno} | Matutino: {metasPorHora.matutino} | Vespertino: {metasPorHora.vespertino}
            </span>
          </div>
          <div className="py-4">
            <span className="font-bold text-gray-700">Horas:</span>
            {columnas.map((col, i) => {
              const metaParaCol = getMetaParaHora(col.hora, inicioJornada);
              return (
                <div
                  key={i}
                  className={`flex justify-between py-2 px-4 ${
                    i % 2 === 0 ? "bg-slate-200" : "bg-slate-300"
                  }`}
                >
                  <span className="font-bold text-gray-700">{col.rango}:</span>
                  <span
                    className={`font-bold ${parseInt(col.valor, 10) >= metaParaCol ? "text-green-500" : "text-red-500"}`}
                  >
                    {col.valor}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <Link
              to={"/totales_surtido_maquina"}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              <button className="text-white font-bold uppercase">Ver Detalles</button>
            </Link>
          </div>
          {/* Totales por turno para pantallas pequeñas y medianas */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total Nocturno: <span className={getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno.nocturno)}>{formatNumber(totalesPorTurno.nocturno)}</span> / Meta Acumulada: {formatNumber(metasTotalesPorTurno.nocturno)} / Meta x Hora: {metasPorHora.nocturno}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total Matutino: <span className={getClassName(totalesPorTurno.matutino, metasTotalesPorTurno.matutino)}>{formatNumber(totalesPorTurno.matutino)}</span> / Meta Acumulada: {formatNumber(metasTotalesPorTurno.matutino)} / Meta x Hora: {metasPorHora.matutino}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total Vespertino: <span className={getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno.vespertino)}>{formatNumber(totalesPorTurno.vespertino)}</span> / Meta Acumulada: {formatNumber(metasTotalesPorTurno.vespertino)} / Meta x Hora: {metasPorHora.vespertino}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Totales_Surtido_Estacion;