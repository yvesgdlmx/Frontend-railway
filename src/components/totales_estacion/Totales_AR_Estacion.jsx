import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";
moment.tz.setDefault("America/Mexico_City");
const Totales_AR_Estacion = () => {
  const location = useLocation();
  const arRef = useRef(null);
  const [registros, setRegistros] = useState([]);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Estados para la funcionalidad de notas: se almacena un objeto donde la clave es la hora
  // y su valor es { id, nota }
  const [notas, setNotas] = useState({});
  const [notaActiva, setNotaActiva] = useState(null);
  const [editingNota, setEditingNota] = useState("");
  // Arreglo fijo con el orden de los buckets (horas)
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30",
    "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30",
    "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00",
    "00:00", "23:00", "22:00",  // Nocturno
  ];
  // Efecto para hacer scroll si existe hash en la URL
  useEffect(() => {
    if (location.hash === "#ar" && arRef.current) {
      setTimeout(() => {
        const yOffset = -90;
        const element = arRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }, [location]);
  // Cargar las notas para la sección "ar"
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const { data } = await clienteAxios.get(`/notas/notas?fecha=${today}&seccion=ar`);
      let notasMap = {};
      
      // Verificamos si "data" es un array, ya que la API retorna un array de notas
      if (Array.isArray(data)) {
        data.forEach((item) => {
          notasMap[item.hora] = { id: item.id, nota: item.nota };
        });
      } else {
        console.error("La respuesta de la API no es un array:", data);
      }
      
      setNotas(notasMap);
    } catch (error) {
      console.error("Error al cargar las notas:", error);
    }
  };
  // Obtención de registros filtrando la jornada
  useEffect(() => {
    const obtenerRegistros = async () => {
      const { data } = await clienteAxios(`/manual/manual/actualdia`);
      const registrosAR = data.registros.filter((registro) =>
        ["52", "53", "54", "55", "56"].some((num) => registro.name.includes(num))
      );
      const ahora = moment();
      let inicioHoy = moment().startOf("day").add(22, "hours"); // 22:00 del día anterior
      let finHoy = moment(inicioHoy).add(1, "days").subtract(30, "minutes"); // 21:30 del día siguiente
      if (ahora.isBefore(inicioHoy)) {
        inicioHoy.subtract(1, "days");
        finHoy.subtract(1, "days");
      }
      const registrosFiltrados = registrosAR.filter((registro) => {
        const fechaHoraRegistro = moment(
          `${registro.fecha} ${registro.hour}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[)");
      });
      setRegistros(registrosFiltrados);
      calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
      cargarNotas();
    };
    obtenerRegistros();
  }, []);
  // Calcular totales por turno (Nocturno, Matutino, Vespertino)
  const calcularTotalesPorTurno = (registros, inicioHoy) => {
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
  // Agrupar los hits por hora
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
  // Función que retorna el objeto moment del bucket a partir de la hora y el inicio de jornada.
  const getBucketMoment = (horaStr, inicioHoy) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioHoy.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) {
      bucket.add(1, "day");
    }
    return bucket;
  };
  /*  
      Función que retorna el valor a mostrar para cada bucket:
       - Si existe un valor en hitsPorHora se retorna ese valor.
       - De lo contrario, se calcula el bucket (inicio y fin) y se revisa si ya debió concluir (con margen de 5 minutos).
         Si es así se retorna 0; de lo contrario, se retorna cadena vacía.
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
    const margen = 5; // minutos
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Se arma un arreglo de columnas a partir de ordenTurnos usando getDisplayValue, filtrando las que tienen valor a mostrar
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: (() => {
        const inicio = moment(hora, "HH:mm");
        const fin = moment(hora, "HH:mm").add(1, "hour");
        return `${inicio.format("HH:mm")} - ${fin.format("HH:mm")}`;
      })(),
      valor: getDisplayValue(hora),
    }))
    .filter((col) => col.valor !== "");
  // Función para mostrar/ocultar el recuadro de nota
  const toggleNota = (hora) => {
    if (notaActiva === hora) {
      setNotaActiva(null);
    } else {
      setNotaActiva(hora);
      setEditingNota(notas[hora]?.nota || "");
    }
  };
  // Función para guardar la nota (POST) en la sección "ar"
  const handleGuardarNota = async (hora) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        hora,
        seccion: "ar",
        nota: editingNota,
      };
      const response = await clienteAxios.post("/notas/notas", payload);
      setNotas((prev) => ({
        ...prev,
        [hora]: { id: response.data.id, nota: response.data.nota },
      }));
      setNotaActiva(null);
    } catch (error) {
      console.error("Error al guardar la nota:", error);
    }
  };
  // Función para editar la nota (PUT) enviando el id y la nueva nota
  const handleEditarNota = async (hora) => {
    try {
      const notaActual = notas[hora];
      if (!notaActual || !notaActual.id) {
        console.error("No se encontró la nota con id para la hora:", hora);
        return;
      }
      const payload = {
        id: notaActual.id,
        nota: editingNota,
      };
      const response = await clienteAxios.put("/notas/notas", payload);
      setNotas((prev) => ({
        ...prev,
        [hora]: { id: response.data.id, nota: response.data.nota },
      }));
      setNotaActiva(null);
    } catch (error) {
      console.error("Error al editar la nota:", error);
    }
  };
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block relative" ref={arRef}>
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
              <td className="py-6 px-4 min-w-[150px] text-center">
                <Link to={"/totales_ar_maquina"} className="link__tabla">
                  <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300">
                    <img src="./img/ver.png" alt="" width={25} className="relative left-3" />
                    <div className="px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base">AR</div>
                  </div>
                </Link>
              </td>
              {columnas.map((col, i) => (
                <td
                  key={i}
                  className="py-2 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] text-center relative cursor-pointer"
                  onClick={() => toggleNota(col.hora)}
                >
                  <span>{col.valor}</span>
                  {notaActiva === col.hora && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea
                        className="w-full h-16 p-1 border mb-2 text-xs"
                        value={editingNota}
                        onChange={(e) => setEditingNota(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          disabled={!!notas[col.hora]?.nota}
                          className={`py-1 px-3 rounded text-xs ${
                            notas[col.hora]?.nota
                              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                          onClick={(e) => {
                            if (!notas[col.hora]?.nota) {
                              e.stopPropagation();
                              handleGuardarNota(col.hora);
                            }
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarNota(col.hora);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotaActiva(null);
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {/* Totales por Turno - Versión Desktop */}
        <div className="flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4">
          <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno Acumulado:
              <span className="ml-1 font-bold text-gray-700">
                {formatNumber(totalesPorTurno.nocturno)}
              </span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino Acumulado:
              <span className="ml-1 font-bold text-gray-700">
                {formatNumber(totalesPorTurno.matutino)}
              </span>
            </p>
          </div>
          <div className="bg-white p-2 px-10 rounded-lg shadow-md">
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino Acumulado:
              <span className="ml-1 font-bold text-gray-700">
                {formatNumber(totalesPorTurno.vespertino)}
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* Versión tipo card para pantallas pequeñas y medianas */}
      <div className="block lg:hidden mt-4">
        <div className="bg-white shadow-md rounded-lg mb-4 p-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-bold text-gray-700">Nombre:</span>
            <span className="font-bold text-gray-700">AR</span>
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
                <span className="font-bold">{col.valor}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Link
              to={"/totales_ar_maquina"}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              <button className="text-white font-bold uppercase">
                Ver Detalles
              </button>
            </Link>
          </div>
          {/* Totales por Turno - Versión Mobile */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="block text-gray-600">Nocturno: </span>
                  <span className="font-semibold text-md text-gray-700">
                    {formatNumber(totalesPorTurno.nocturno)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-600">Matutino: </span>
                  <span className="font-semibold text-md text-gray-700">
                    {formatNumber(totalesPorTurno.matutino)}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-600">Vespertino: </span>
                  <span className="font-semibold text-md text-gray-700">
                    {formatNumber(totalesPorTurno.vespertino)}
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
export default Totales_AR_Estacion;