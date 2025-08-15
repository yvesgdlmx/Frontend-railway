import { useEffect, useState, useRef } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { Link, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import { formatNumber } from "../../helpers/formatNumber";
import { FaComment } from "react-icons/fa"; // Importamos el ícono
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
  // Estados para notas por hora (ya existentes)
  const [notas, setNotas] = useState({});
  const [notaActiva, setNotaActiva] = useState(null);
  const [editingNota, setEditingNota] = useState("");
  // NUEVO: Estados para las notas de turno para la sección "ar"
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  const ordenTurnos = [
    "21:30",
    "20:30",
    "19:30",
    "18:30",
    "17:30",
    "16:30",
    "15:30",
    "14:30", // Vespertino
    "13:30",
    "12:30",
    "11:30",
    "10:30",
    "09:30",
    "08:30",
    "07:30",
    "06:30", // Matutino
    "05:00",
    "04:00",
    "03:00",
    "02:00",
    "01:00",
    "00:00",
    "23:00",
    "22:00", // Nocturno
  ];
  // Efecto para hacer scroll si la URL contiene "#ar"
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
  // Función para cargar las notas por hora de la sección "ar"
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const { data } = await clienteAxios.get(`/notas/notas?fecha=${today}&seccion=ar`);
      let notasMap = {};
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
  // NUEVO: Función para cargar las notas de turno para la sección "ar"
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const { data } = await clienteAxios.get(`/notas/notas_turnos?fecha=${today}&seccion=ar`);
      let notasTurnosMap = { nocturno: null, matutino: null, vespertino: null };
      if (Array.isArray(data)) {
        data.forEach((item) => {
          notasTurnosMap[item.turno] = {
            id: item.id,
            comentario: item.comentario,
          };
        });
      } else {
        console.error("La respuesta de la API no es un array:", data);
      }
      setNotasTurnos(notasTurnosMap);
    } catch (error) {
      console.error("Error al cargar las notas de turno:", error);
    }
  };
  // Obtención de registros y cálculo de totales por turno
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
      cargarNotasTurnos();
    };
    obtenerRegistros();
  }, []);
  // Función de cálculo de totales por turno
  const calcularTotalesPorTurno = (registros, inicioHoy) => {
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
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
  // Función que retorna el objeto moment (bucket) a partir de la hora y el inicio de jornada
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
  // Función que retorna el valor a mostrar para cada bucket
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
  // Armar el arreglo de columnas a partir de ordenTurnos
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
  // Función para mostrar/ocultar el recuadro de nota por hora
  const toggleNota = (hora) => {
    if (notaActiva === hora) {
      setNotaActiva(null);
    } else {
      setNotaActiva(hora);
      setEditingNota(notas[hora]?.nota || "");
    }
  };
  // NUEVO: Función para mostrar/ocultar el recuadro de notas de turno
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Funciones para guardar y editar nota por hora (ya existentes)
  const handleGuardarNota = async (hora) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = { fecha: today, hora, seccion: "ar", nota: editingNota };
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
        console.error("No se encontró la nota con id para la hora:", hora);
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
  // NUEVO: Funciones para guardar y editar la nota de turno
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno,
        seccion: "ar",
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
                    <img
                      src="./img/ver.png"
                      alt=""
                      width={25}
                      className="relative left-3"
                    />
                    <div className="px-4 min-w-[150px] whitespace-nowrap text-sm md:text-base">
                      AR
                    </div>
                  </div>
                </Link>
              </td>
              {columnas.map((col, i) => (
                <td
                  key={i}
                  title={
                    notas[col.hora] && notas[col.hora].nota
                      ? notas[col.hora].nota
                      : "Haz click para agregar un comentario"
                  }
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
        {/* Sección Totales por Turno (Desktop) con notas de turno */}
        <div className="flex flex-col md:flex-row justify-around mt-4 font-semibold mb-4">
          {/* Tarjeta para Total Nocturno */}
          <div
            className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md relative cursor-pointer"
            title={
              notasTurnos.nocturno && notasTurnos.nocturno.comentario
                ? notasTurnos.nocturno.comentario
                : "Haz click para agregar un comentario"
            }
            onClick={() => toggleNotaTurno("nocturno")}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Total Nocturno Acumulado:{" "}
              <span className="font-bold text-gray-700">
                {formatNumber(totalesPorTurno.nocturno)}
              </span>
              {notasTurnos.nocturno && notasTurnos.nocturno.comentario ? (
                <FaComment size={12} className="inline ml-2 text-blue-500" />
              ) : null}
            </p>
            {turnoActivo === "nocturno" && (
              <div
                className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {notasTurnos.nocturno ? <p></p> : <p>Agregar un comentario</p>}
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
          {/* Tarjeta para Total Matutino */}
          <div
            className="bg-white p-2 px-10 rounded-lg mb-2 md:mb-0 shadow-md relative cursor-pointer"
            title={
              notasTurnos.matutino && notasTurnos.matutino.comentario
                ? notasTurnos.matutino.comentario
                : "Haz click para agregar un comentario"
            }
            onClick={() => toggleNotaTurno("matutino")}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Total Matutino Acumulado:{" "}
              <span className="font-bold text-gray-700">
                {formatNumber(totalesPorTurno.matutino)}
              </span>
              {notasTurnos.matutino && notasTurnos.matutino.comentario ? (
                <FaComment size={12} className="inline ml-2 text-blue-500" />
              ) : null}
            </p>
            {turnoActivo === "matutino" && (
              <div
                className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {notasTurnos.matutino ? <p></p> : <p>Agregar un comentario</p>}
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
          {/* Tarjeta para Total Vespertino */}
          <div
            className="bg-white p-2 px-10 rounded-lg shadow-md relative cursor-pointer"
            title={
              notasTurnos.vespertino && notasTurnos.vespertino.comentario
                ? notasTurnos.vespertino.comentario
                : "Haz click para agregar un comentario"
            }
            onClick={() => toggleNotaTurno("vespertino")}
          >
            <p className="text-gray-600 text-sm md:text-base">
              Total Vespertino Acumulado:{" "}
              <span className="font-bold text-gray-700">
                {formatNumber(totalesPorTurno.vespertino)}
              </span>
              {notasTurnos.vespertino && notasTurnos.vespertino.comentario ? (
                <FaComment size={12} className="inline ml-2 text-blue-500" />
              ) : null}
            </p>
            {turnoActivo === "vespertino" && (
              <div
                className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {notasTurnos.vespertino ? <p></p> : <p>Agregar un comentario</p>}
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
                className={`flex flex-col py-2 px-4 ${
                  idx % 2 === 0 ? "bg-slate-200" : "bg-slate-300"
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleNota(col.hora)}
                >
                  <span className="font-bold text-gray-700">{col.rango}:</span>
                  <span className="font-bold">{col.valor}</span>
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
          {/* Totales por Turno - Versión Mobile con funcionalidad de notas */}
          <div className="mt-6 border-t pt-4">
            <div className="bg-green-50 p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-green-700 mb-2">Totales por Turno</h4>
              <div className="space-y-4">
                {/* Turno Nocturno */}
                <div
                  className="relative bg-white p-2 rounded shadow cursor-pointer"
                  onClick={() => toggleNotaTurno("nocturno")}
                  title={
                    notasTurnos.nocturno && notasTurnos.nocturno.comentario
                      ? notasTurnos.nocturno.comentario
                      : "Haz click para agregar un comentario"
                  }
                >
                  <span className="block text-gray-600">Total Nocturno:</span>
                  <span className="block text-black font-bold">
                    {formatNumber(totalesPorTurno.nocturno)}
                  </span>
                  {notasTurnos.nocturno && notasTurnos.nocturno.comentario ? (
                    <FaComment size={12} className="inline ml-2 text-blue-500" />
                  ) : null}
                  {turnoActivo === "nocturno" && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notasTurnos.nocturno ? (
                        <p>{notasTurnos.nocturno.comentario}</p>
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
                {/* Turno Matutino */}
                <div
                  className="relative bg-white p-2 rounded shadow cursor-pointer"
                  onClick={() => toggleNotaTurno("matutino")}
                  title={
                    notasTurnos.matutino && notasTurnos.matutino.comentario
                      ? notasTurnos.matutino.comentario
                      : "Haz click para agregar un comentario"
                  }
                >
                  <span className="block text-gray-600">Total Matutino:</span>
                  <span className="block text-black font-bold">
                    {formatNumber(totalesPorTurno.matutino)}
                  </span>
                  {notasTurnos.matutino && notasTurnos.matutino.comentario ? (
                    <FaComment size={12} className="inline ml-2 text-blue-500" />
                  ) : null}
                  {turnoActivo === "matutino" && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notasTurnos.matutino ? (
                        <p>{notasTurnos.matutino.comentario}</p>
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
                {/* Turno Vespertino */}
                <div
                  className="relative bg-white p-2 rounded shadow cursor-pointer"
                  onClick={() => toggleNotaTurno("vespertino")}
                  title={
                    notasTurnos.vespertino && notasTurnos.vespertino.comentario
                      ? notasTurnos.vespertino.comentario
                      : "Haz click para agregar un comentario"
                  }
                >
                  <span className="block text-gray-600">Total Vespertino:</span>
                  <span className="block text-black font-bold">
                    {formatNumber(totalesPorTurno.vespertino)}
                  </span>
                  {notasTurnos.vespertino && notasTurnos.vespertino.comentario ? (
                    <FaComment size={12} className="inline ml-2 text-blue-500" />
                  ) : null}
                  {turnoActivo === "vespertino" && (
                    <div
                      className="absolute top-[-10px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-full sm:w-64 h-24 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {notasTurnos.vespertino ? (
                        <p>{notasTurnos.vespertino.comentario}</p>
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
export default Totales_AR_Estacion;