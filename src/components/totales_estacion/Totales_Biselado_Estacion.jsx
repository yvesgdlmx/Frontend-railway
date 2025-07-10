import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";
moment.tz.setDefault("America/Mexico_City");
const Totales_Biselado_Estacion = () => {
  const location = useLocation();
  const biseladoRef = useRef(null);
  // Estados para los registros (hits)
  const [registros, setRegistros] = useState([]);
  // Estado para las metas por hora (por turno) que se obtienen del endpoint
  const [metasPorHora, setMetasPorHora] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  // Estado para las metas acumuladas por turno (calculadas: nocturno y matutino 8 horas, vespertino 7 horas)
  const [metasTotalesPorTurno, setMetasTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  // Estado para los totales de hits por turno
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Arreglo fijo de buckets (horas) en el orden deseado
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00"  // Nocturno
  ];
  // Efecto para hacer scroll si la URL contiene el hash "#biselado"
  useEffect(() => {
    if (location.hash === "#biselado" && biseladoRef.current) {
      setTimeout(() => {
        const yOffset = -100;
        const element = biseladoRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  // Obtener datos: metas y registros (hits)
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Se espera que el endpoint retorne para cada registro las propiedades:
        // meta_nocturno, meta_matutino y meta_vespertino
        const responseMetas = await clienteAxios("/metas/metas-biselados");
        const registrosMetas = responseMetas.data.registros;
        let sumaNocturno = 0, sumaMatutino = 0, sumaVespertino = 0;
        registrosMetas.forEach((item) => {
          sumaNocturno += item.meta_nocturno;
          sumaMatutino += item.meta_matutino;
          sumaVespertino += item.meta_vespertino;
        });
        // Asignar la meta por hora para cada turno
        setMetasPorHora({
          nocturno: sumaNocturno,
          matutino: sumaMatutino,
          vespertino: sumaVespertino,
        });
        // Calcular la meta acumulada según la cantidad de horas asignada por turno
        setMetasTotalesPorTurno({
          nocturno: sumaNocturno * 8,
          matutino: sumaMatutino * 8,
          vespertino: sumaVespertino * 7,
        });
        // Obtener registros (hits) para la jornada actual
        const responseRegistros = await clienteAxios("/biselado/biselado/actualdia");
        const registrosApi = responseRegistros.data.registros;
        const ahora = moment();
        let inicioJornada = moment().startOf("day").add(22, "hours"); // inicia a las 22:00 del día anterior
        let finJornada = moment(inicioJornada).add(1, "days").subtract(30, "minutes"); // finaliza a las 21:30 del día siguiente
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "day");
          finJornada.subtract(1, "day");
        }
        const registrosFiltrados = registrosApi.filter((registro) => {
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
  // Calcular totales de hits por turno usando la lógica de la jornada
  const calcularTotalesPorTurno = (registros, inicioJornada) => {
    const totales = { nocturno: 0, matutino: 0, vespertino: 0 };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      // Turno Nocturno: desde inicioJornada hasta inicioJornada + 8 horas
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
      // Turno Matutino: de inicioJornada + 8 horas + 30 minutos hasta inicioJornada + 16 horas
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
      // Turno Vespertino: de inicioJornada + 16 horas + 30 minutos hasta inicioJornada + 23 horas + 30 minutos
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
  // Función para agrupar los hits por hora (bucket)
  const agruparHitsPorHora = () => {
    const hits = {};
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const horaFormateada = fechaHoraRegistro.format("HH:mm");
      hits[horaFormateada] = (hits[horaFormateada] || 0) + registro.hits;
    });
    return hits;
  };
  const hitsPorHora = agruparHitsPorHora();
  // Función para calcular el rango de horas de cada bucket (se suma 1 hora al inicio)
  const calcularRangoHoras = (horaInicio) => {
    const horaInicioFormateada = horaInicio.slice(0, 5);
    const horaFin = moment(horaInicio, "HH:mm").add(1, "hour").format("HH:mm");
    return `${horaInicioFormateada} - ${horaFin}`;
  };
  // Función que obtiene el instante inicial de un bucket dado, a partir de "HH:mm" y el inicio de la jornada
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) {
      bucket.add(1, "day"); // si es menor a 22 pertenece al día siguiente
    }
    return bucket;
  };
  /*  
    Función que devuelve el valor a mostrar para cada bucket:
      - Si en hitsPorHora existe un valor para esa hora se retorna.
      - Si no existe y el bucket ya cerró (margen de 5 minutos) se retorna 0.
      - Sino se retorna "" para no mostrar esa columna.
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
    const margen = 5; // minutos de margen
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Construir columnas a partir del arreglo fijo usando getDisplayValue
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora),
    }))
    .filter((col) => col.valor !== "");
  // Función que, dado un bucket, retorna la meta por hora para el turno correspondiente
  const getMetaParaHora = (horaStr, inicioJornada) => {
    const bucketMoment = getBucketMoment(horaStr, inicioJornada);
    if (
      bucketMoment.isBetween(
        inicioJornada.clone(),
        inicioJornada.clone().add(8, "hours"),
        null,
        "[)"
      )
    )
      return metasPorHora.nocturno;
    else if (
      bucketMoment.isBetween(
        inicioJornada.clone().add(8, "hours").add(30, "minutes"),
        inicioJornada.clone().add(16, "hours"),
        null,
        "[)"
      )
    )
      return metasPorHora.matutino;
    else if (
      bucketMoment.isBetween(
        inicioJornada.clone().add(16, "hours").add(30, "minutes"),
        inicioJornada.clone().add(23, "hours").add(30, "minutes"),
        null,
        "[)"
      )
    )
      return metasPorHora.vespertino;
    return 0;
  };
  // Definir el inicio de la jornada (igual para el cálculo de registros)
  let inicioJornada = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
  // Función para asignar la clase de color según se cumpla la meta.
  // En esta versión se compara el total de cada turno con la meta acumulada.
  const getClassName = (total, metaAcumulada) =>
    total >= metaAcumulada ? "text-green-500" : "text-red-500";
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block" ref={biseladoRef}>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white border-l-2">
              {/* Primer TH permanece vacío, tal como en el original */}
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
              {/* Primera celda con el enlace con ícono y nombre "Biselado" (sin leyenda de meta por hora) */}
              <td className="py-3 px-4 border-b min-w-[150px] whitespace-nowrap text-center">
                <Link to={"/totales_biselado_maquina"} className="link__tabla">
                  <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300">
                    <img src="./img/ver.png" alt="" width={25} className="relative left-3" />
                    <span className="py-3 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base">Biselado</span>
                  </div>
                </Link>
              </td>
              {columnas.map((col, i) => {
                const metaCol = getMetaParaHora(col.hora, inicioJornada);
                return (
                  <td
                    key={i}
                    className="py-3 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-sm md:text-base"
                  >
                    <span className={getClassName(col.valor, metaCol)}>
                      {col.valor}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        {/* Sección de totales para pantallas grandes.
            Aquí se compara cada total con la meta acumulada de ese turno */}
        <div className="flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4 gap-6">
          <div className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center">
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno:{" "}
              <span className={getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno.nocturno)}>
                {formatNumber(totalesPorTurno.nocturno)}
              </span>{" "}
              / Meta Acumulada: {formatNumber(metasTotalesPorTurno.nocturno)} / Meta x Hora: {metasPorHora.nocturno}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center">
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino:{" "}
              <span className={getClassName(totalesPorTurno.matutino, metasTotalesPorTurno.matutino)}>
                {formatNumber(totalesPorTurno.matutino)}
              </span>{" "}
              / Meta Acumulada: {formatNumber(metasTotalesPorTurno.matutino)} / Meta x Hora: {metasPorHora.matutino}
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center">
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino:{" "}
              <span className={getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno.vespertino)}>
                {formatNumber(totalesPorTurno.vespertino)}
              </span>{" "}
              / Meta Acumulada: {formatNumber(metasTotalesPorTurno.vespertino)} / Meta x Hora: {metasPorHora.vespertino}
            </p>
          </div>
        </div>
      </div>
      {/* Diseño tipo card para pantallas pequeñas y medianas */}
      <div className="block lg:hidden mt-4">
        <div className="bg-white shadow-md rounded-lg mb-4 p-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-bold text-gray-700">Nombre:</span>
            <span className="font-bold text-gray-700">Biselado</span>
          </div>
          <div className="py-4">
            <span className="font-bold text-gray-700">Horas:</span>
            {columnas.map((col, idx) => {
              const metaCol = getMetaParaHora(col.hora, inicioJornada);
              return (
                <div
                  key={idx}
                  className={`flex justify-between py-2 px-4 ${
                    idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300"
                  }`}
                >
                  <span className="font-bold text-gray-700">{col.rango}:</span>
                  <span className={`font-bold ${parseInt(col.valor, 10) >= metaCol ? "text-green-500" : "text-red-500"}`}>
                    {col.valor}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <Link to={"/totales_biselado_maquina"} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
              <button className="text-white font-bold uppercase">Ver Detalles</button>
            </Link>
          </div>
          {/* Totales por turno para pantallas pequeñas/medianas.
              Se compara cada total con la meta acumulada */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total Nocturno:{" "}
                    <span className={getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno.nocturno)}>
                      {formatNumber(totalesPorTurno.nocturno)}
                    </span>{" "}
                    / Meta Acumulada: {formatNumber(metasTotalesPorTurno.nocturno)} / Meta x Hora: {metasPorHora.nocturno}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total Matutino:{" "}
                    <span className={getClassName(totalesPorTurno.matutino, metasTotalesPorTurno.matutino)}>
                      {formatNumber(totalesPorTurno.matutino)}
                    </span>{" "}
                    / Meta Acumulada: {formatNumber(metasTotalesPorTurno.matutino)} / Meta x Hora: {metasPorHora.matutino}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total Vespertino:{" "}
                    <span className={getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno.vespertino)}>
                      {formatNumber(totalesPorTurno.vespertino)}
                    </span>{" "}
                    / Meta Acumulada: {formatNumber(metasTotalesPorTurno.vespertino)} / Meta x Hora: {metasPorHora.vespertino}
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
export default Totales_Biselado_Estacion;