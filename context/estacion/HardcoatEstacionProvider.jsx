import React, { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";
moment.tz.setDefault("America/Mexico_City");
const HardcoatEstacionContext = createContext();
const HardcoatEstacionProvider = ({ children }) => {
  // Estados para registros y totales
  const [registros, setRegistros] = useState([]);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Estados para notas por hora
  const [notas, setNotas] = useState({});
  const [notaActiva, setNotaActiva] = useState(null);
  const [editingNota, setEditingNota] = useState("");
  // Estados para notas de turno
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Orden fijo de buckets de hora (igual que en el componente original)
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30",
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30",
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00"
  ];
  // Función para cargar registros y calcular totales
  const obtenerRegistros = async () => {
    try {
      const response = await clienteAxios("/manual/manual/actualdia");
      // Filtrar registros de Hard Coat (utiliza los identificadores correspondientes)
      const registrosHardCoat = response.data.registros.filter((registro) =>
        ["46", "48", "49", "50", "91", "92"].some((num) =>
          registro.name.includes(num)
        )
      );
      const ahora = moment();
      let inicioHoy = moment().startOf("day").add(22, "hours"); // 22:00 del día anterior
      let finHoy = moment(inicioHoy).add(1, "days").subtract(30, "minutes"); // 21:30 del día siguiente
      if (ahora.isBefore(inicioHoy)) {
        inicioHoy.subtract(1, "days");
        finHoy.subtract(1, "days");
      }
      const registrosFiltrados = registrosHardCoat.filter((registro) => {
        const fechaHoraRegistro = moment(
          `${registro.fecha} ${registro.hour}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, "[)");
      });
      setRegistros(registrosFiltrados);
      calcularTotalesPorTurno(registrosFiltrados, inicioHoy);
    } catch (error) {
      console.error("Error al obtener los registros de Hard Coat:", error);
    }
  };
  // Función para calcular totales por turno
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
  // Función para cargar las notas por hora
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "hardcoat", fecha: today },
      });
      const notasMap = {};
      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          notasMap[item.hora] = { id: item.id, nota: item.nota };
        });
      } else {
        console.error("La respuesta de la API de notas no es un array:", response.data);
      }
      setNotas(notasMap);
    } catch (error) {
      console.error("Error al cargar las notas:", error);
    }
  };
  // Función para cargar las notas de turno
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "hardcoat", fecha: today },
      });
      const notasTurnosMap = { nocturno: null, matutino: null, vespertino: null };
      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          notasTurnosMap[item.turno] = { id: item.id, comentario: item.comentario };
        });
      } else {
        console.error("La respuesta de la API de notas de turno no es un array:", response.data);
      }
      setNotasTurnos(notasTurnosMap);
    } catch (error) {
      console.error("Error al cargar las notas de turno:", error);
    }
  };
  // Función para agrupar hits por hora
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
  // Para determinar el bucket de cada hora, similar a AR
  const getBucketMoment = (horaStr, inicioHoy) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioHoy.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Valor a mostrar en cada bucket/hora
  const getDisplayValue = (horaStr) => {
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    let inicioHoy = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicioHoy)) inicioHoy.subtract(1, "day");
    const bucketInicio = getBucketMoment(horaStr, inicioHoy);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5; // minutos
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Construcción de columnas a partir de ordenTurnos y filtrando aquellos buckets con algún valor
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
  // --- Funciones para manejo de notas por hora ---
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
      const payload = { fecha: today, hora, seccion: "hardcoat", nota: editingNota };
      const response = await clienteAxios.post("/notas/notas", payload);
      setNotas((prev) => ({ ...prev, [hora]: { id: response.data.id, nota: response.data.nota } }));
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
      setNotas((prev) => ({ ...prev, [hora]: { id: response.data.id, nota: response.data.nota } }));
      setNotaActiva(null);
    } catch (error) {
      console.error("Error al editar la nota:", error);
    }
  };
  // --- Funciones para manejo de notas de turno ---
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
      const payload = { fecha: today, turno, seccion: "hardcoat", comentario: editingTurnoNota };
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
  // Cargar registros y notas al montar el Provider
  useEffect(() => {
    obtenerRegistros();
    cargarNotas();
    cargarNotasTurnos();
  }, []);
  return (
    <HardcoatEstacionContext.Provider
      value={{
        registros,
        totalesPorTurno,
        notas,
        notaActiva,
        editingNota,
        notasTurnos,
        turnoActivo,
        editingTurnoNota,
        ordenTurnos,
        columnas,
        toggleNota,
        handleGuardarNota,
        handleEditarNota,
        setEditingNota,
        toggleNotaTurno,
        handleGuardarNotaTurno,
        handleEditarNotaTurno,
        setEditingTurnoNota,
      }}
    >
      {children}
    </HardcoatEstacionContext.Provider>
  );
};
export { HardcoatEstacionProvider };
export default HardcoatEstacionContext;