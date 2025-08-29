import React, { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";

moment.tz.setDefault("America/Mexico_City");
const TalladoEstacionContext = createContext();
const TalladoEstacionProvider = ({ children }) => {
  // Estados para registros, totales y metas
  const [registros, setRegistros] = useState([]);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  const [metasPorHora, setMetasPorHora] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  const [metasTotalesPorTurno, setMetasTotalesPorTurno] = useState({
    matutino: 0,
    vespertino: 0,
    nocturno: 0,
  });
  // Estados para notas por hora
  const [notas, setNotas] = useState({});
  const [notaActiva, setNotaActiva] = useState(null);
  const [editingNota, setEditingNota] = useState("");
  // Estados para las notas de turno
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Arreglo de turnos por hora
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30",
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30",
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00",
  ];
  const calcularRangoHoras = (hora) => {
    const inicio = hora;
    let fin;
    if (hora === "23:00") {
      fin = "00:00";
    } else {
      fin = moment(hora, "HH:mm").add(1, "hour").format("HH:mm");
    }
    return `${inicio} - ${fin}`;
  };
  // Función para cargar notas por hora (sección tallado)
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "tallado", fecha: today },
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
  // Función para cargar notas de turno (sección tallado)
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "bloqueo de tallado", fecha: today },
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
  // Función para obtener metas y registros
  const obtenerDatos = async () => {
    try {
      // 1. Obtener metas para tallado
      const responseMetas = await clienteAxios("/metas/metas-tallados");
      const registrosMetas = responseMetas.data.registros;
      const globalMeta = registrosMetas.find(
        (item) => item.name.toLowerCase() === "global"
      );
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
      // 2. Obtener registros (hits) para tallado
      const responseRegistros = await clienteAxios("/tallado/tallado/actualdia");
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
      calcularTotales(registrosFiltrados, inicioJornada);
      // Cargar las notas (por hora y turno)
      await cargarNotas();
      await cargarNotasTurnos();
    } catch (error) {
      console.error("Error al obtener los datos tallado:", error);
    }
  };
  useEffect(() => {
    obtenerDatos();
  }, []);
  // Función para calcular totales por turno
  const calcularTotales = (registros, inicioJornada) => {
    const totales = { matutino: 0, vespertino: 0, nocturno: 0 };
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
  // Para determinar el bucket de cada hora
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Valor a mostrar en cada bucket/hora
  const getDisplayValue = (horaStr, inicioJornada) => {
    const hitsPorHora = agruparHitsPorHora();
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5;
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Calcular el inicio de la jornada (para los buckets de hora)
  const inicioJornada = (() => {
    let inicio = moment().startOf("day").add(22, "hours");
    if (moment().isBefore(inicio)) {
      inicio.subtract(1, "day");
    }
    return inicio;
  })();
  // Construir las columnas a partir de ordenTurnos (hora, rango y valor)
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora, inicioJornada),
    }))
    .filter((col) => col.valor !== "");
  // Función para definir la clase CSS según si se cumple la meta
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
  // Para determinar la meta por hora según el bucket
  const getMetaParaHora = (horaStr, inicioJornada) => {
    const bucketMoment = getBucketMoment(horaStr, inicioJornada);
    if (
      bucketMoment.isBetween(
        inicioJornada.clone(),
        inicioJornada.clone().add(8, "hours"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.nocturno;
    } else if (
      bucketMoment.isBetween(
        inicioJornada.clone().add(8, "hours").add(30, "minutes"),
        inicioJornada.clone().add(16, "hours"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.matutino;
    } else if (
      bucketMoment.isBetween(
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
  // Funciones para mostrar/ocultar el recuadro de nota por hora
  const toggleNota = (hora) => {
    if (notaActiva === hora) {
      setNotaActiva(null);
    } else {
      setNotaActiva(hora);
      setEditingNota(notas[hora]?.nota || "");
    }
  };
  // Funciones para mostrar/ocultar el recuadro de nota de turno
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Funciones para guardar y editar nota por hora
  const handleGuardarNota = async (hora) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = { fecha: today, hora, seccion: "tallado", nota: editingNota };
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
  // Funciones para guardar y editar la nota de turno
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno, // puede ser "nocturno", "matutino" o "vespertino"
        seccion: "bloqueo de tallado",
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
        console.error("No se encontró la nota de turno para:", turno);
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
    <TalladoEstacionContext.Provider
      value={{
        registros,
        totalesPorTurno,
        metasPorHora,
        metasTotalesPorTurno,
        notas,
        notaActiva,
        editingNota,
        notasTurnos,
        turnoActivo,
        editingTurnoNota,
        ordenTurnos,
        columnas,
        inicioJornada,
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
    </TalladoEstacionContext.Provider>
  );
};
export { TalladoEstacionProvider };
export default TalladoEstacionContext;