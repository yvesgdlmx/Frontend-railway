import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";
moment.tz.setDefault("America/Mexico_City");
const Totales_Engraver_Estacion = () => {
  const location = useLocation();
  const engraverRef = useRef(null);
  // Estados para los registros (hits)
  const [registros, setRegistros] = useState([]);
  // Estados para la meta por hora y la meta acumulada por turno
  const [metasPorHora, setMetasPorHora] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  const [metasTotalesPorTurno, setMetasTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  // Estado para los totales de hits por turno
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  // Estados para el sistema de notas por hora (ya existente)
  const [notas, setNotas] = useState({});
  const [notaActiva, setNotaActiva] = useState(null);
  const [editingNota, setEditingNota] = useState("");
  // NUEVO: Estados para las notas de turno
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Arreglo fijo con el orden de los buckets (horas)
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00"  // Nocturno
  ];
  // Efecto para hacer scroll si existe el hash "#engraver"
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
  // Función para calcular el rango de horas de cada bucket (1 hora)
  const calcularRangoHoras = (hora) => {
    let fin;
    if (hora === "23:00") {
      fin = "00:00";
    } else {
      fin = moment(hora, "HH:mm").add(1, "hour").format("HH:mm");
    }
    return `${hora} - ${fin}`;
  };
  // Obtención de datos: metas (por turno), registros y notas
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const responseMetas = await clienteAxios("/metas/metas-engravers");
        const registrosMetas = responseMetas.data.registros;
        const globalMeta = registrosMetas.find(item => item.name.toLowerCase() === "global");
        const metaNocturnoBase = globalMeta ? globalMeta.meta_nocturno : 0;
        const metaMatutinoBase = globalMeta ? globalMeta.meta_matutino : 0;
        const metaVespertinoBase = globalMeta ? globalMeta.meta_vespertino : 0;
        setMetasPorHora({
          nocturno: metaNocturnoBase,
          matutino: metaMatutinoBase,
          vespertino: metaVespertinoBase,
        });
        setMetasTotalesPorTurno({
          nocturno: metaNocturnoBase * 8,
          matutino: metaMatutinoBase * 8,
          vespertino: metaVespertinoBase * 7,
        });
        const responseRegistros = await clienteAxios("/engraver/engraver/actualdia");
        const registrosAPI = responseRegistros.data.registros;
        const ahora = moment();
        let inicioJornada = moment().startOf("day").add(22, "hours");
        let finJornada = moment(inicioJornada).add(1, "days").subtract(30, "minutes");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "day");
          finJornada.subtract(1, "day");
        }
        const registrosFiltrados = registrosAPI.filter((registro) => {
          const fechaHoraRegistro = moment(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)");
        });
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados, inicioJornada);
        cargarNotas();
        cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Función para calcular totales de hits por turno usando la lógica de la jornada
  const calcularTotalesPorTurno = (registros, inicioJornada) => {
    const totales = { nocturno: 0, matutino: 0, vespertino: 0 };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      if (
        fechaHoraRegistro.isBetween(
          inicioJornada.clone(),
          inicioJornada.clone().add(8, "hours"),
          null,
          "[)"
        )
      ) {
        totales.nocturno += registro.hits;
      } else if (
        fechaHoraRegistro.isBetween(
          inicioJornada.clone().add(8, "hours").add(30, "minutes"),
          inicioJornada.clone().add(16, "hours"),
          null,
          "[)"
        )
      ) {
        totales.matutino += registro.hits;
      } else if (
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
  // Función para obtener el objeto moment correspondiente al inicio del bucket
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
    Función que retorna el valor a mostrar para cada bucket:
    - Si existe un valor registrado en hitsPorHora, se retorna ese valor.
    - Si no existe, se verifica si el bucket ya cerró (con un margen de 5 minutos);
      en ese caso se retorna 0, o bien una cadena vacía si aún no se debe mostrar.
  */
  const getDisplayValue = (horaStr) => {
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    let inicioJornada = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5;
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora),
    }))
    .filter((col) => col.valor !== "");
  // Función para determinar la clase (color) según se cumpla o no la meta
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
  let inicioJornada = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
  // Retorna la meta por hora correspondiente según el turno
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
  // --- Funciones para el manejo de notas por hora (existentes) ---
  const toggleNota = (hora) => {
    if (notaActiva === hora) {
      setNotaActiva(null);
    } else {
      setNotaActiva(hora);
      setEditingNota(notas[hora]?.nota || "");
    }
  };
  const handleGuardarNota = async (hora) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        hora,
        seccion: "engraver",
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
  const handleEditarNota = async (hora) => {
    try {
      const notaActual = notas[hora];
      if (!notaActual || !notaActual.id) {
        console.error("No se encontró la nota para la hora:", hora);
        return;
      }
      const payload = { id: notaActual.id, nota: editingNota };
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
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "engraver", fecha: today },
      });
      const notasMap = {};
      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          notasMap[item.hora] = { id: item.id, nota: item.nota };
        });
      } else {
        console.error("La respuesta de la API no es un array:", response.data);
      }
      setNotas(notasMap);
    } catch (error) {
      console.error("Error al cargar las notas:", error);
    }
  };
  // --- NUEVO: Funciones para el manejo de notas de turno ---
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "engraver", fecha: today },
      });
      const notasTurnosMap = { nocturno: null, matutino: null, vespertino: null };
      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          notasTurnosMap[item.turno] = { id: item.id, comentario: item.comentario };
        });
      } else {
        console.error("La respuesta de la API no es un array:", response.data);
      }
      setNotasTurnos(notasTurnosMap);
    } catch (error) {
      console.error("Error al cargar las notas de turno:", error);
    }
  };
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno,
        seccion: "engraver",
        comentario: editingTurnoNota,
      };
      const response = await clienteAxios.post("/notas/notas_turnos", payload);
      setNotasTurnos((prev) => ({
        ...prev,
        [turno]: { id: response.data.id, comentario: response.data.comentario },
      }));
      setTurnoActivo(null);
    } catch (error) {
      console.error("Error al guardar la nota de turno:", error);
    }
  };
  const handleEditarNotaTurno = async (turno) => {
    try {
      const notaActual = notasTurnos[turno];
      if (!notaActual || !notaActual.id) {
        console.error("No se encontró la nota para el turno:", turno);
        return;
      }
      const payload = { id: notaActual.id, comentario: editingTurnoNota };
      const response = await clienteAxios.put("/notas/notas_turnos", payload);
      setNotasTurnos((prev) => ({
        ...prev,
        [turno]: { id: response.data.id, comentario: response.data.comentario },
      }));
      setTurnoActivo(null);
    } catch (error) {
      console.error("Error al editar la nota de turno:", error);
    }
  };
  return (
    <div className="max-w-screen-xl rounded-lg">
      {/* Versión para pantallas grandes */}
      <div className="hidden lg:block" ref={engraverRef}>
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-blue-500 text-white border-l-2">
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
          <tbody className="bg-white text-center">
            <tr className="font-semibold text-gray-700">
              <td className="py-3">
                <Link to={"/totales_engraver_maquina"} className="link__tabla">
                  <div className="flex items-center justify-center hover:scale-105 transition-transform duration-300 px-4">
                    <img
                      src="./img/ver.png"
                      alt=""
                      width={25}
                      className="relative left-2"
                    />
                    <div className="py-3 px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base">
                      Engraver
                    </div>
                  </div>
                </Link>
              </td>
              {columnas.map((col, i) => {
                const metaCol = getMetaParaHora(col.hora, inicioJornada);
                return (
                  <td
                    key={i}
                    title={
                      notas[col.hora] && notas[col.hora].nota
                        ? notas[col.hora].nota
                        : "Haz click para agregar un comentario"
                    }
                    className="py-3 px-4 border-b font-bold border-l-2 border-gray-200 min-w-[150px] whitespace-nowrap text-sm md:text-base bg-white relative cursor-pointer"
                    onClick={() => toggleNota(col.hora)}
                  >
                    <span className={getClassName(col.valor, metaCol)}>
                      {col.valor}
                    </span>
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
                );
              })}
            </tr>
          </tbody>
        </table>
        {/* Totales por turno (Versión Desktop) */}
        <div className="flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4 gap-6">
          <div
            className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center relative cursor-pointer"
            title={
              notasTurnos.nocturno && notasTurnos.nocturno.comentario
                ? notasTurnos.nocturno.comentario
                : "Haz click para agregar un comentario"
            }
            onClick={() => toggleNotaTurno("nocturno")}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno:{" "}
              <span className={getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno.nocturno)}>
                {formatNumber(totalesPorTurno.nocturno)}
              </span>{" "}
              / Meta Acumulada: {formatNumber(metasTotalesPorTurno.nocturno)} / Meta x Hora: {metasPorHora.nocturno}
            </p>
            {turnoActivo === "nocturno" && (
              <div
                className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {notasTurnos.nocturno ? (
                  <p></p>
                ) : (
                  <p>Agregar un comentario</p>
                )}
                <textarea
                  className="w-full h-16 p-1 border mb-2 text-xs"
                  value={editingTurnoNota}
                  onChange={(e) => setEditingTurnoNota(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex justify-end space-x-2">
                  {notasTurnos.nocturno ? (
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarNotaTurno("nocturno");
                      }}
                    >
                      Guardar Cambios
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGuardarNotaTurno("nocturno");
                      }}
                    >
                      Guardar
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTurnoActivo(null);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center relative cursor-pointer"
            title={
              notasTurnos.matutino && notasTurnos.matutino.comentario
                ? notasTurnos.matutino.comentario
                : "Haz click para agregar un comentario"
            }
            onClick={() => toggleNotaTurno("matutino")}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino:{" "}
              <span className={getClassName(totalesPorTurno.matutino, metasTotalesPorTurno.matutino)}>
                {formatNumber(totalesPorTurno.matutino)}
              </span>{" "}
              / Meta Acumulada: {formatNumber(metasTotalesPorTurno.matutino)} / Meta x Hora: {metasPorHora.matutino}
            </p>
            {turnoActivo === "matutino" && (
              <div
                className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {notasTurnos.matutino ? (
                  <p></p>
                ) : (
                  <p>Agregar un comentario</p>
                )}
                <textarea
                  className="w-full h-16 p-1 border mb-2 text-xs"
                  value={editingTurnoNota}
                  onChange={(e) => setEditingTurnoNota(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex justify-end space-x-2">
                  {notasTurnos.matutino ? (
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarNotaTurno("matutino");
                      }}
                    >
                      Guardar Cambios
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGuardarNotaTurno("matutino");
                      }}
                    >
                      Guardar
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTurnoActivo(null);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className="bg-white p-2 px-10 rounded-lg shadow-md flex items-center relative cursor-pointer"
            title={
              notasTurnos.vespertino && notasTurnos.vespertino.comentario
                ? notasTurnos.vespertino.comentario
                : "Haz click para agregar un comentario"
            }
            onClick={() => toggleNotaTurno("vespertino")}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino:{" "}
              <span className={getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno.vespertino)}>
                {formatNumber(totalesPorTurno.vespertino)}
              </span>{" "}
              / Meta Acumulada: {formatNumber(metasTotalesPorTurno.vespertino)} / Meta x Hora: {metasPorHora.vespertino}
            </p>
            {turnoActivo === "vespertino" && (
              <div
                className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {notasTurnos.vespertino ? (
                  <p></p>
                ) : (
                  <p>Agregar un comentario</p>
                )}
                <textarea
                  className="w-full h-16 p-1 border mb-2 text-xs"
                  value={editingTurnoNota}
                  onChange={(e) => setEditingTurnoNota(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex justify-end space-x-2">
                  {notasTurnos.vespertino ? (
                    <button
                      className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarNotaTurno("vespertino");
                      }}
                    >
                      Guardar Cambios
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGuardarNotaTurno("vespertino");
                      }}
                    >
                      Guardar
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTurnoActivo(null);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Versión para pantallas pequeñas/medianas */}
      <div className="block lg:hidden mt-4">
        <div className="bg-white shadow-md rounded-lg mb-4 p-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-bold text-gray-700">Nombre:</span>
            <span className="font-bold text-gray-700">Engraver</span>
          </div>
          <div className="py-4">
            <span className="font-bold text-gray-700">Horas:</span>
            {columnas.map((col, idx) => {
              const metaCol = getMetaParaHora(col.hora, inicioJornada);
              return (
                <div
                  key={idx}
                  className={`relative flex flex-col py-2 px-4 ${idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300"}`}
                  title={
                    notas[col.hora] && notas[col.hora].nota
                      ? notas[col.hora].nota
                      : "Haz click para agregar un comentario"
                  }
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleNota(col.hora)}
                  >
                    <span className="font-bold text-gray-700">{col.rango}:</span>
                    <span
                      className={`font-bold ${
                        parseInt(col.valor, 10) >= metaCol ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {col.valor}
                    </span>
                  </div>
                  {notaActiva === col.hora && (
                    <div
                      className="mt-2 bg-gray-100 p-2 rounded shadow-md"
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
                </div>
              );
            })}
          </div>
          <div className="flex justify-center mt-4">
            <Link
              to={"/totales_engraver_maquina"}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              <button className="text-white font-bold uppercase">
                Ver Detalles
              </button>
            </Link>
          </div>
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
              <div className="grid grid-cols-1 gap-4">
                {/* Tarjeta para turno Nocturno */}
                <div
                  className="relative border p-3 rounded shadow-sm bg-white cursor-pointer"
                  onClick={() => toggleNotaTurno("nocturno")}
                  title={
                    notasTurnos.nocturno && notasTurnos.nocturno.comentario
                      ? notasTurnos.nocturno.comentario
                      : "Haz click para agregar un comentario"
                  }
                >
                  {/* Fila 1: Total */}
                  <p className="text-gray-600 text-sm md:text-base">
                    <strong>Total Nocturno:</strong>{" "}
                    <span className={getClassName(totalesPorTurno.nocturno, metasTotalesPorTurno.nocturno)}>
                      {formatNumber(totalesPorTurno.nocturno)}
                    </span>
                  </p>
                  {/* Fila 2: Meta Acumulada y Meta x Hora */}
                  <div className="flex justify-between mt-1 text-gray-500 text-xs">
                    <p>Meta Nocturno: {formatNumber(metasTotalesPorTurno.nocturno)}</p>
                    <p>Meta x Hora: {metasPorHora.nocturno}</p>
                  </div>
                  {turnoActivo === "nocturno" && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notasTurnos.nocturno ? (
                        <p></p>
                      ) : (
                        <p>Agregar un comentario</p>
                      )}
                      <textarea
                        className="w-full h-12 p-1 border mb-2 text-xs"
                        value={editingTurnoNota}
                        onChange={(e) => setEditingTurnoNota(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex justify-end space-x-2">
                        {notasTurnos.nocturno ? (
                          <button
                            className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarNotaTurno("nocturno");
                            }}
                          >
                            Guardar Cambios
                          </button>
                        ) : (
                          <button
                            className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGuardarNotaTurno("nocturno");
                            }}
                          >
                            Guardar
                          </button>
                        )}
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTurnoActivo(null);
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Tarjeta para turno Matutino */}
                <div
                  className="relative border p-3 rounded shadow-sm bg-white cursor-pointer"
                  onClick={() => toggleNotaTurno("matutino")}
                  title={
                    notasTurnos.matutino && notasTurnos.matutino.comentario
                      ? notasTurnos.matutino.comentario
                      : "Haz click para agregar un comentario"
                  }
                >
                  {/* Fila 1: Total */}
                  <p className="text-gray-600 text-sm md:text-base">
                    <strong>Total Matutino:</strong>{" "}
                    <span className={getClassName(totalesPorTurno.matutino, metasTotalesPorTurno.matutino)}>
                      {formatNumber(totalesPorTurno.matutino)}
                    </span>
                  </p>
                  {/* Fila 2: Meta Acumulada y Meta x Hora */}
                  <div className="flex justify-between mt-1 text-gray-500 text-xs">
                    <p>Meta Matutino: {formatNumber(metasTotalesPorTurno.matutino)}</p>
                    <p>Meta x Hora: {metasPorHora.matutino}</p>
                  </div>
                  {turnoActivo === "matutino" && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notasTurnos.matutino ? (
                        <p></p>
                      ) : (
                        <p>Agregar un comentario</p>
                      )}
                      <textarea
                        className="w-full h-12 p-1 border mb-2 text-xs"
                        value={editingTurnoNota}
                        onChange={(e) => setEditingTurnoNota(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex justify-end space-x-2">
                        {notasTurnos.matutino ? (
                          <button
                            className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarNotaTurno("matutino");
                            }}
                          >
                            Guardar Cambios
                          </button>
                        ) : (
                          <button
                            className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGuardarNotaTurno("matutino");
                            }}
                          >
                            Guardar
                          </button>
                        )}
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTurnoActivo(null);
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Tarjeta para turno Vespertino */}
                <div
                  className="relative border p-3 rounded shadow-sm bg-white cursor-pointer"
                  onClick={() => toggleNotaTurno("vespertino")}
                  title={
                    notasTurnos.vespertino && notasTurnos.vespertino.comentario
                      ? notasTurnos.vespertino.comentario
                      : "Haz click para agregar un comentario"
                  }
                >
                  {/* Fila 1: Total */}
                  <p className="text-gray-600 text-sm md:text-base">
                    <strong>Total Vespertino:</strong>{" "}
                    <span className={getClassName(totalesPorTurno.vespertino, metasTotalesPorTurno.vespertino)}>
                      {formatNumber(totalesPorTurno.vespertino)}
                    </span>
                  </p>
                  {/* Fila 2: Meta Acumulada y Meta x Hora */}
                  <div className="flex justify-between mt-1 text-gray-500 text-xs">
                    <p>Meta Vespertino: {formatNumber(metasTotalesPorTurno.vespertino)}</p>
                    <p>Meta x Hora: {metasPorHora.vespertino}</p>
                  </div>
                  {turnoActivo === "vespertino" && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notasTurnos.vespertino ? (
                        <p></p>
                      ) : (
                        <p>Agregar un comentario</p>
                      )}
                      <textarea
                        className="w-full h-12 p-1 border mb-2 text-xs"
                        value={editingTurnoNota}
                        onChange={(e) => setEditingTurnoNota(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex justify-end space-x-2">
                        {notasTurnos.vespertino ? (
                          <button
                            className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarNotaTurno("vespertino");
                            }}
                          >
                            Guardar Cambios
                          </button>
                        ) : (
                          <button
                            className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGuardarNotaTurno("vespertino");
                            }}
                          >
                            Guardar
                          </button>
                        )}
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTurnoActivo(null);
                          }}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
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