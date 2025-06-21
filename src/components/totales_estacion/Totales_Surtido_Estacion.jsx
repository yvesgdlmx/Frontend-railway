import { useEffect, useState } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";
moment.tz.setDefault("America/Mexico_City");
const Totales_Surtido_Estacion = () => {
  const location = useLocation();
  const [registros, setRegistros] = useState([]);
  const [metaTotal, setMetaTotal] = useState(0);
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
  // Función para hacer scroll si hay hash en la URL.
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
  // Efecto para obtener datos desde el API.
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const meta19 = responseMetas.data.registros.find(
          (registro) => registro.name === "19 LENS LOG"
        );
        const meta20 = responseMetas.data.registros.find(
          (registro) => registro.name === "20 LENS LOG"
        );
        const sumaMeta = (meta19 ? meta19.meta : 0) + (meta20 ? meta20.meta : 0);
        setMetaTotal(sumaMeta);
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
        calcularMetasPorTurno(sumaMeta);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Función para calcular totales por turno (lógica actual)
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
  // Función para calcular las metas por turno.
  const calcularMetasPorTurno = (metaTotal) => {
    setMetasPorTurno({
      matutino: 8 * metaTotal,
      vespertino: 7 * metaTotal,
      nocturno: 8 * metaTotal,
    });
  };
  // Función para agrupar los hits por hora (formato "HH:mm").
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
  // Obtenemos el objeto con los hits agrupados.
  const hitsPorHora = agruparHitsPorHora();
  // Función para calcular el bucket (inicio del intervalo) para cada hora dado el inicio de la jornada.
  // Si la hora es menor a 22, se considera que pertenece al día siguiente.
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
  /* 
    Función que devuelve el valor a mostrar para cada bucket:
    - Si existe registro en hitsPorHora, se muestra ese valor.
    - Si no existe, se verifica si el bucket ya debió haber cerrado.
      Se calcula bucketInicio y bucketFin (bucketFin = bucketInicio + 1 hora).
      Se agrega un margen de 5 minutos (podés ajustar este valor).
    - Si el bucket aún no se ha cerrado, se devuelve "" y la columna se filtrará.
    - Si ya se cerró, se devuelve 0.
  */
  const getDisplayValue = (horaStr) => {
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    let inicioJornada = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicioJornada)) {
      inicioJornada.subtract(1, "day");
    }
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5; // minutos
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes"))
      ? 0
      : "";
  };
  // Se crea un arreglo de columnas (objetos con hora, rango y valor)
  // y se filtran aquellas columnas cuyo valor es ""
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora),
    }))
    .filter((col) => col.valor !== "");
  // Función para asignar una clase según se cumpla la meta (para cada celda)
  const getClassName = (hits, metaPorHora) =>
    hits >= metaPorHora ? "text-green-500" : "text-red-500";
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block" id="surtido">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white border-l-2">
              <th className="py-2 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base"></th>
              {columnas.map((col, i) => (
                <th
                  key={i}
                  className="py-2 px-4 border-b min-w-[150px] whitespace-nowrap text-sm md:text-base"
                >
                  {col.rango}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-center bg-white">
            <tr className="font-semibold text-gray-700">
              <td>
                <Link to={"/totales_surtido_maquina"} className="link__tabla">
                  <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300 px-4">
                    <img
                      src="./img/ver.png"
                      alt=""
                      width={25}
                      className="relative left-2"
                    />
                    <div className="py-2 px-4 border-b min-w-[150px] whitespace-nowrap text-sm md:text-base">
                      Surtido <br />
                      <span className="text-gray-500">
                        Meta por hora: <span>{metaTotal}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </td>
              {columnas.map((col, i) => (
                <td
                  key={i}
                  className="py-2 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-sm md:text-base bg-white"
                >
                  <span className={getClassName(col.valor, metaTotal)}>
                    {col.valor}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {/* Totales por turno para pantallas grandes */}
        <div className="flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4">
          <div className="bg-white p-2 px-10 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno:{" "}
              <span className={`${getClassName(totalesPorTurno.nocturno, metasPorTurno.nocturno)} ml-1 font-bold`}>
                {formatNumber(totalesPorTurno.nocturno)}
              </span>{" "}
              / Meta:{" "}
              <span className="text-gray-600 font-bold ml-1">
                {formatNumber(metasPorTurno.nocturno)}
              </span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino:{" "}
              <span className={`${getClassName(totalesPorTurno.matutino, metasPorTurno.matutino)} ml-1 font-bold`}>
                {formatNumber(totalesPorTurno.matutino)}
              </span>{" "}
              / Meta:{" "}
              <span className="text-gray-600 font-bold ml-1">
                {formatNumber(metasPorTurno.matutino)}
              </span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino:{" "}
              <span className={`${getClassName(totalesPorTurno.vespertino, metasPorTurno.vespertino)} ml-1 font-bold`}>
                {formatNumber(totalesPorTurno.vespertino)}
              </span>{" "}
              / Meta:{" "}
              <span className="text-gray-600 font-bold ml-1">
                {formatNumber(metasPorTurno.vespertino)}
              </span>
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
            <span className="font-bold text-gray-700">Meta:</span>
            <span className="font-bold text-gray-700">{metaTotal || "No definida"}</span>
          </div>
          <div className="py-4">
            <span className="font-bold text-gray-700">Horas:</span>
            {columnas.map((col, i) => (
              <div
                key={i}
                className={`flex justify-between py-2 px-4 ${
                  i % 2 === 0 ? "bg-slate-200" : "bg-slate-300"
                }`}
              >
                <span className="font-bold text-gray-700">{col.rango}:</span>
                <span
                  className={`font-bold ${
                    col.valor >= metaTotal ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {col.valor}
                </span>
              </div>
            ))}
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
export default Totales_Surtido_Estacion;