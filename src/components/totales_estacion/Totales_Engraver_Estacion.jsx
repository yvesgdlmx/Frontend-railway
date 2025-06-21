import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import formatearHora from "../../../helpers/formatearHora";
import { formatNumber } from "../../helpers/formatNumber";
moment.tz.setDefault("America/Mexico_City");
const Totales_Engraver_Estacion = () => {
  const location = useLocation();
  const engraverRef = useRef(null);
  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState(0);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });
  const [metasPorTurno, setMetasPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0
  });
  // Arreglo fijo con el orden de los buckets (horas)
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00"  // Nocturno
  ];
  // Efecto para hacer scroll si existe hash en la URL
  useEffect(() => {
    if (location.hash === "#engraver" && engraverRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = engraverRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  // Función para calcular el rango de horas de un bucket (de 1 hora)
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
  // Obtención de datos (metas y registros) y filtrado según la jornada definida (22:00 del día anterior a 21:30 del día siguiente)
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const responseMetas = await clienteAxios("/metas/metas-engravers");
        const sumaMetas = responseMetas.data.registros.reduce(
          (acc, curr) => acc + curr.meta,
          0
        );
        setMeta(sumaMetas);
        const responseRegistros = await clienteAxios("/engraver/engraver/actualdia");
        const registrosAPI = responseRegistros.data.registros;
        const ahora = moment();
        let inicioHoy = moment().startOf("day").add(22, "hours"); // 22:00 del día anterior
        let finHoy = moment(inicioHoy).add(1, "days").subtract(30, "minutes"); // 21:30 del día siguiente
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, "days");
          finHoy.subtract(1, "days");
        }
        const registrosFiltrados = registrosAPI.filter((registro) => {
          const fechaHoraRegistro = moment(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[)");
        });
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
        calcularMetasPorTurno(sumaMetas);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Función para calcular totales por turno (Nocturno, Matutino, Vespertino)
  const calcularTotalesPorTurno = (registros, inicioHoy) => {
    const totales = {
      matutino: 0,
      vespertino: 0,
      nocturno: 0
    };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      // Turno Nocturno: 22:00 a 05:59
      if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone(),
          inicioHoy.clone().add(8, "hours"),
          null,
          "[)"
        )
      ) {
        totales.nocturno += registro.hits;
      }
      // Turno Matutino: 06:30 a 13:29
      else if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone().add(8, "hours").add(30, "minutes"),
          inicioHoy.clone().add(16, "hours"),
          null,
          "[)"
        )
      ) {
        totales.matutino += registro.hits;
      }
      // Turno Vespertino: 14:30 a 21:30
      else if (
        fechaHoraRegistro.isBetween(
          inicioHoy.clone().add(16, "hours").add(30, "minutes"),
          inicioHoy.clone().add(23, "hours").add(30, "minutes"),
          null,
          "[)"
        )
      ) {
        totales.vespertino += registro.hits;
      }
    });
    setTotalesPorTurno(totales);
  };
  // Función para calcular las metas por turno a partir de la meta por hora
  const calcularMetasPorTurno = (metaPorHora) => {
    setMetasPorTurno({
      matutino: 8 * metaPorHora,
      vespertino: 7 * metaPorHora,
      nocturno: 8 * metaPorHora
    });
  };
  // Función para agrupar los hits por hora a partir de todos los registros
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
  // Función que retorna el objeto moment del bucket (inicio) a partir de la hora y el inicio de la jornada
  const getBucketMoment = (horaStr, inicioHoy) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioHoy
      .clone()
      .set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) {
      bucket.add(1, "day");
    }
    return bucket;
  };
  /* 
    Función que retorna el valor a mostrar en cada bucket:
    - Si existe un valor en hitsPorHora se retorna ese valor.
    - De lo contrario, se calcula el bucket (inicio y fin) y, si el tiempo actual (con margen de 5 minutos) es mayor al fin del bucket, se retorna 0.
      En caso contrario, se retorna una cadena vacía para no mostrar la columna.
  */
  const getDisplayValue = (horaStr) => {
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    let inicioHoy = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicioHoy)) {
      inicioHoy.subtract(1, "day");
    }
    const bucketInicio = getBucketMoment(horaStr, inicioHoy);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5; // minutos de margen
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes"))
      ? 0
      : "";
  };
  // Se arma un arreglo de columnas a partir de ordenTurnos, mostrando solo aquellas con algún valor (número o 0)
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora)
    }))
    .filter((col) => col.valor !== "");
  // Función para asignar la clase (color) según se cumpla la meta
  const getClassName = (hits, metaPorHora) =>
    hits >= metaPorHora ? "text-green-500" : "text-red-500";
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block" ref={engraverRef}>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white border-l-2">
              <th className="py-2 px-4 min-w-[150px] whitespace-nowrap"></th>
              {columnas.map((col, i) => (
                <th
                  key={i}
                  className="py-2 px-4 border-b min-w-[150px] whitespace-nowrap"
                >
                  {col.rango}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="font-semibold text-gray-700">
              <Link to={"/totales_engraver_maquina"} className="link__tabla">
                <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300 px-4">
                  <img
                    src="./img/ver.png"
                    alt=""
                    width={25}
                    className="relative left-2"
                  />
                  <div className="py-2 px-4 border-b min-w-[150px] whitespace-nowrap text-center">
                    Engraver <br />
                    <span className="text-gray-500">
                      Meta por hora: <span>{meta}</span>
                    </span>
                  </div>
                </div>
              </Link>
              {columnas.map((col, i) => (
                <td
                  key={i}
                  className="py-2 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-center"
                >
                  <span className={getClassName(col.valor, meta)}>
                    {col.valor}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {/* Sección de totales por turno para versión desktop */}
        <div className="flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4">
          <div className="bg-white p-2 px-10 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno Acumulado:{" "}
              <span className={`${getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)} ml-1 font-bold`}>
                {formatNumber(totalesPorTurno.nocturno)}
              </span>
              <span className="text-gray-600 font-semibold block">
                Meta Acumulada: {formatNumber(metasPorTurno.nocturno)}
              </span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino Acumulado:{" "}
              <span className={`${getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)} ml-1 font-bold`}>
                {formatNumber(totalesPorTurno.matutino)}
              </span>
              <span className="text-gray-600 font-semibold block">
                Meta Acumulada: {formatNumber(metasPorTurno.matutino)}
              </span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino Acumulado:{" "}
              <span className={`${getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)} ml-1 font-bold`}>
                {formatNumber(totalesPorTurno.vespertino)}
              </span>
              <span className="text-gray-600 font-semibold block">
                Meta acumulada: {formatNumber(metasPorTurno.vespertino)}
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* Diseño tipo card para pantallas pequeñas y medianas */}
      <div className="block lg:hidden mt-4">
        <div className="bg-white shadow-md rounded-lg mb-4 p-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-bold text-gray-700">Nombre:</span>
            <span className="font-bold text-gray-700">Engraver</span>
          </div>
          <div className="flex justify-between border-b py-4">
            <span className="font-bold text-gray-700">Meta:</span>
            <span className="font-bold text-gray-700">{meta || "No definida"}</span>
          </div>
          <div className="py-4">
            <span className="font-bold text-gray-700">Horas:</span>
            {columnas.map((col, idx) => (
              <div
                key={idx}
                className={`flex justify-between py-2 px-4 ${
                  idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300"
                }`}
              >
                <span className="font-bold text-gray-700">{col.rango}:</span>
                <span
                  className={`font-bold ${
                    col.valor >= meta ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {col.valor}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Link
              to={"/totales_engraver_maquina"}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              <button className="text-white font-bold uppercase">Ver Detalles</button>
            </Link>
          </div>
          {/* Totales por turno para versión mobile */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-gray-600">Nocturno: </span>
                  <span className={`font-semibold text-md ${getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)}`}>
                    {formatNumber(totalesPorTurno.nocturno)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    / Meta: {formatNumber(metasPorTurno.nocturno)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-600">Matutino: </span>
                  <span className={`font-semibold text-md ${getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)}`}>
                    {formatNumber(totalesPorTurno.matutino)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    / Meta: {formatNumber(metasPorTurno.matutino)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-600">Vespertino: </span>
                  <span className={`text-md font-semibold ${getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)}`}>
                    {formatNumber(totalesPorTurno.vespertino)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    / Meta: {formatNumber(metasPorTurno.vespertino)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Totales_Engraver_Estacion;