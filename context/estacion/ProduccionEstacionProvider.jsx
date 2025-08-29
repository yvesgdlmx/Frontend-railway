import React, { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";
moment.tz.setDefault("America/Mexico_City");
const ProduccionEstacionContext = createContext();
const ProduccionEstacionProvider = ({ children }) => {
  // Estados para registros, metas y totales
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
  // Orden de buckets
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30", // Vespertino
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30", // Matutino
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00"  // Nocturno
  ];
  // Función para calcular rango de horas (bucket de 1 hora)
  const calcularRangoHoras = (horaInicio) => {
    const inicio = moment(horaInicio, "HH:mm");
    const fin = inicio.clone().add(1, "hour");
    return `${inicio.format("HH:mm")} - ${fin.format("HH:mm")}`;
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
  // Función para obtener el instante (bucket) de la hora
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Valor a mostrar en cada bucket: si ya debió cerrarse regresa 0; sino, cadena vacía
  const getDisplayValue = (horaStr) => {
    const hitsPorHora = agruparHitsPorHora();
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    let inicio = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicio)) inicio.subtract(1, "day");
    const bucketInicio = getBucketMoment(horaStr, inicio);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5;
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Función para calcular totales por turno según la lógica de jornada
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
  // Funciones para cargar notas
  // Función para cargar las notas por hora para la sección "produccion"
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "produccion", fecha: today },
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
  // Función para cargar las notas de turno para la sección "produccion"
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "produccion", fecha: today },
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
  // Función para obtener datos: metas, registros y notas
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // 1. Obtener metas para producción (se asume que la API es /metas/metas-manuales)
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const registrosMetas = responseMetas.data.registros;
        const globalMeta = registrosMetas.find(
          (item) => item.name.toLowerCase() === "global produccion"
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
        // 2. Obtener registros (filtrando "JOB COMPLETE")
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const registrosCompleto = responseRegistros.data.registros;
        const registrosProduccion = registrosCompleto.filter((registro) =>
          registro.name.includes("JOB COMPLETE")
        );
        const ahora = moment();
        let inicioJornada = moment().startOf("day").add(22, "hours");
        let finJornada = moment(inicioJornada).add(1, "days").subtract(30, "minutes");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "day");
          finJornada.subtract(1, "day");
        }
        const registrosFiltrados = registrosProduccion.filter((registro) => {
          const fechaHoraRegistro = moment(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)");
        });
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados, inicioJornada);
        // 3. Cargar notas (por hora)
        await cargarNotas();
        // 4. Cargar notas de turno
        await cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos de producción:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Funcionalidad para notas por hora
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
        seccion: "produccion",
        nota: editingNota,
      };
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
  // Funcionalidad para notas de turno
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
        seccion: "produccion",
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
  // Definir el inicio de la jornada (para agrupar buckets)
  let inicioJornada = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
  // Construir columnas a partir de ordenTurnos
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora),
    }))
    .filter((col) => col.valor !== "");
  // Clase para indicar si se cumple la meta
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
  // Función para asignar la meta por hora según el bucket
  const getMetaParaHora = (horaStr) => {
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
  return (
    <ProduccionEstacionContext.Provider
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
    </ProduccionEstacionContext.Provider>
  );
};
export { ProduccionEstacionProvider };
export default ProduccionEstacionContext;