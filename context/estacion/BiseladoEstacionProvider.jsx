import React, { useState, useEffect, createContext, useRef } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";
moment.tz.setDefault("America/Mexico_City");
const BiseladoEstacionContext = createContext();
const BiseladoEstacionProvider = ({ children }) => {
  // Estados generales
  const [registros, setRegistros] = useState([]);
  const [totalesPorTurno, setTotalesPorTurno] = useState({
    nocturno: 0,
    matutino: 0,
    vespertino: 0,
  });
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
  // Estados para las notas por hora
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
  // Arreglo de turnos (buckets) en el orden deseado
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00",  // Nocturno
  ];
  // Helper para calcular el rango de horas (por bucket)
  const calcularRangoHoras = (horaInicio) => {
    // Se usa la parte "HH:mm" del string de hora
    const horaInicioFormateada = horaInicio.slice(0, 5);
    const horaFin = moment(horaInicio, "HH:mm").add(1, "hour").format("HH:mm");
    return `${horaInicioFormateada} - ${horaFin}`;
  };
  // Ref para el scroll (usada en el componente de presentación)
  const biseladoRef = useRef(null);
  // Función para cargar las notas por hora para la sección "biselado"
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "biselado", fecha: today },
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
  // Función para cargar las notas de turno para "biselado"
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "biselado", fecha: today },
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
  // Función para obtener metas y registros de la sección "biselado"
  const obtenerDatos = async () => {
    try {
      // 1. Obtener las metas desde "/metas/metas-biselados"
      const responseMetas = await clienteAxios("/metas/metas-biselados");
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
      // 2. Obtener registros (hits) desde "/biselado/biselado/actualdia"
      const responseRegistros = await clienteAxios("/biselado/biselado/actualdia");
      const registrosApi = responseRegistros.data.registros;
      const ahora = moment();
      let inicioJornada = moment().startOf("day").add(22, "hours");
      let finJornada = moment(inicioJornada).add(1, "days").subtract(30, "minutes");
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
      // 3. Cargar las notas (tanto por hora como las de turno)
      await cargarNotas();
      await cargarNotasTurnos();
    } catch (error) {
      console.error("Error al obtener los datos de biselado:", error);
    }
  };
  useEffect(() => {
    obtenerDatos();
  }, []);
  // Función para calcular totales de hits por turno
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
  // Helper: agrupar los hits por hora (bucket)
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
  // Helper: con un string "HH:mm" se obtiene un objeto moment del bucket, en función del inicio de jornada
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Helper: valor a mostrar en cada bucket (hits; si no, 0 o cadena vacía)
  const getDisplayValue = (horaStr, inicioJornada) => {
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5;
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Calcular el inicio de la jornada
  const inicioJornada = (() => {
    let inicio = moment().startOf("day").add(22, "hours");
    if (moment().isBefore(inicio)) {
      inicio.subtract(1, "day");
    }
    return inicio;
  })();
  // Construir las columnas (buckets) a partir de ordenTurnos
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora, inicioJornada),
    }))
    .filter((col) => col.valor !== "");
  // Helper: clase CSS según si se cumple la meta
  const getClassName = (total, meta) =>
    parseInt(total, 10) >= meta ? "text-green-500" : "text-red-500";
  // Helper: obtener la meta por hora (según el bucket, es decir, según el turno)
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
  // Funciones para la funcionalidad de notas por hora
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
        seccion: "biselado",
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
  // Funciones para la funcionalidad de notas de turno
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
        turno, // "nocturno", "matutino" o "vespertino"
        seccion: "biselado",
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
    <BiseladoEstacionContext.Provider
      value={{
        // Estados generales
        registros,
        totalesPorTurno,
        metasPorHora,
        metasTotalesPorTurno,
        // Estados de notas por hora
        notas,
        notaActiva,
        editingNota,
        // Estados de notas de turno
        notasTurnos,
        turnoActivo,
        editingTurnoNota,
        // Helpers y variables
        ordenTurnos,
        columnas,
        inicioJornada,
        getMetaParaHora,
        getClassName,
        // Funciones para notas por hora
        toggleNota,
        handleGuardarNota,
        handleEditarNota,
        setEditingNota,
        // Funciones para notas de turno
        toggleNotaTurno,
        handleGuardarNotaTurno,
        handleEditarNotaTurno,
        setEditingTurnoNota,
        // Ref para scroll
        biseladoRef,
      }}
    >
      {children}
    </BiseladoEstacionContext.Provider>
  );
};
export { BiseladoEstacionProvider };
export default BiseladoEstacionContext;