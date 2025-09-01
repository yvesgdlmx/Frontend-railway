import React, { createContext, useState, useEffect, useRef } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";

moment.tz.setDefault("America/Mexico_City");
const GeneradoEstacionLAContext = createContext();
const GeneradoEstacionLAProvider = ({ children }) => {
  // Estados para registros y totales
  const [registros, setRegistros] = useState([]);
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
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
  // Estados para notas por hora y de turno
  const [notas, setNotas] = useState({});
  const [notaActiva, setNotaActiva] = useState(null);
  const [editingNota, setEditingNota] = useState("");
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Orden de buckets (horas)
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30",
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30",
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00",
  ];
  // Patrones (máquinas deseadas)
  const patterns = [
    "245 ORBIT",
    "246 ORBIT 2 LA",
    "244 ORBIT 3 LA",
    "243 ORBIT 4 LA",
  ];
  // Función para calcular el rango de hora (bucket de 1 hora)
  const calcularRangoHoras = (hora) => {
    let fin;
    if (hora === "23:00") {
      fin = "00:00";
    } else {
      fin = moment(hora, "HH:mm").add(1, "hour").format("HH:mm");
    }
    return `${hora} - ${fin}`;
  };
  // Función para agrupar hits por hora (bucket)
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
  // Función para obtener el objeto moment correspondiente al bucket
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Función que devuelve el valor a mostrar en cada bucket
  const getDisplayValue = (horaStr) => {
    const hitsPorHora = agruparHitsPorHora();
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    let inicioJornada = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5; // minutos
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Armar columnas a partir de ordenTurnos
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora),
    }))
    .filter((col) => col.valor !== "");
  // Calcular totales de hits por turno
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
  // Funciones para las notas por hora
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
        seccion: "generado-la",
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
      const payload = {
        id: notaActual.id,
        nota: editingNota,
        seccion: "generado-la",
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

  // Cargar las notas de hora (GET)
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "generado-la", fecha: today }
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
  // Funciones para notas de turno
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
        seccion: "generado-la",
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
      const payload = {
        id: notaActual.id,
        comentario: editingTurnoNota,
      };
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

  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "generado-la", fecha: today }
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

  // Efecto para obtener datos (metas, registros, notas y notas de turno)
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // 1. Obtener la meta de generadores filtrando las máquinas deseadas
        const responseMetas = await clienteAxios("/metas/metas-generadores");
        const registrosMetas = responseMetas.data.registros;
        const metasFiltradas = registrosMetas.filter((meta) =>
          patterns.some((pat) => meta.name.startsWith(pat))
        );
        const sumaNocturno = metasFiltradas.reduce(
          (acc, curr) => acc + curr.meta_nocturno,
          0
        );
        const sumaMatutino = metasFiltradas.reduce(
          (acc, curr) => acc + curr.meta_matutino,
          0
        );
        const sumaVespertino = metasFiltradas.reduce(
          (acc, curr) => acc + curr.meta_vespertino,
          0
        );
        setMetasPorHora({
          nocturno: sumaNocturno,
          matutino: sumaMatutino,
          vespertino: sumaVespertino,
        });
        setMetasTotalesPorTurno({
          nocturno: sumaNocturno * 8,
          matutino: sumaMatutino * 8,
          vespertino: sumaVespertino * 7,
        });
        // 2. Obtener registros (hits) filtrados por fecha y máquina
        const responseRegistros = await clienteAxios("/generadores/generadores/actualdia");
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
          return (
            fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)") &&
            patterns.some((pat) => registro.name.startsWith(pat))
          );
        });
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados, inicioJornada);
        // Cargar notas y notas de turno para la sección "generado-la"
        await cargarNotas();
        await cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos de generado:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Definir el inicio de la jornada
  let inicioJornada = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
  // Función que retorna la meta por hora según el turno
  const getMetaParaHora = (horaStr, inicioJornadaRef = inicioJornada) => {
    const bucketMoment = getBucketMoment(horaStr, inicioJornadaRef);
    if (
      bucketMoment.isBetween(
        inicioJornadaRef.clone(),
        inicioJornadaRef.clone().add(8, "hours"),
        null,
        "[)"
      )
    )
      return metasPorHora.nocturno;
    else if (
      bucketMoment.isBetween(
        inicioJornadaRef.clone().add(8, "hours").add(30, "minutes"),
        inicioJornadaRef.clone().add(16, "hours"),
        null,
        "[)"
      )
    )
      return metasPorHora.matutino;
    else if (
      bucketMoment.isBetween(
        inicioJornadaRef.clone().add(16, "hours").add(30, "minutes"),
        inicioJornadaRef.clone().add(23, "hours").add(30, "minutes"),
        null,
        "[)"
      )
    )
      return metasPorHora.vespertino;
    return 0;
  };
  // Función para asignar clase (color) en función de la meta
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
  return (
    <GeneradoEstacionLAContext.Provider
      value={{
        registros,
        metasPorHora,
        metasTotalesPorTurno,
        totalesPorTurno,
        notas,
        notaActiva,
        editingNota,
        notasTurnos,
        turnoActivo,
        editingTurnoNota,
        ordenTurnos,
        columnas,
        inicioJornada,
        getDisplayValue,
        getBucketMoment,
        calcularRangoHoras,
        calcularTotalesPorTurno,
        getMetaParaHora,
        getClassName,
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
    </GeneradoEstacionLAContext.Provider>
  );
};
export { GeneradoEstacionLAProvider };
export default GeneradoEstacionLAContext;