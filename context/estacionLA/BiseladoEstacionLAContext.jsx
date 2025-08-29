import React, { createContext, useState, useEffect, useRef } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";

moment.tz.setDefault("America/Mexico_City");
const BiseladoEstacionLAContext = createContext();
const BiseladoEstacionLAProvider = ({ children }) => {
  // --- Estados locales ---
  // Registros (hits)
  const [registros, setRegistros] = useState([]);
  // Metas por hora y acumuladas
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
  // Totales por turno obtenidos de los registros
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
  // Orden fijo de buckets (horas) – recuerda que el orden aquí define el bucket: vespertino, matutino, nocturno
  const ordenTurnos = [
    "21:30", "20:30", "19:30", "18:30", "17:30", "16:30", "15:30", "14:30",
    "13:30", "12:30", "11:30", "10:30", "09:30", "08:30", "07:30", "06:30",
    "05:00", "04:00", "03:00", "02:00", "01:00", "00:00", "23:00", "22:00"
  ];
  // Patrones (nombres/máquinas deseadas)
  const patterns = [
    "228 DOUBLER 2",
    "229 DOUBLER 3",
    "230 DOUBLER 4",
    "231 DOUBLER 5",
    "232 DOUBLER 6",
    "298 DOUBLER",
    "312 RAZR",
    "318 HSE 1",
    "319 HSE 2"
  ];
  // --- Funciones auxiliares ---
  const calcularRangoHoras = (hora) => {
    let fin;
    if (hora === "23:00") {
      fin = "00:00";
    } else {
      fin = moment(hora, "HH:mm").add(1, "hour").format("HH:mm");
    }
    return `${hora} - ${fin}`;
  };
  // A partir de registros ya obtenidos, agrupar hits por hora (bucket)
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
  // Función para obtener un objeto moment en función del bucket
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada.clone().set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Función que retorna el valor a mostrar para cada bucket/hora; si ya hay hits, se muestran, de lo contrario, se valida el margen
  const getDisplayValue = (horaStr) => {
    const hitsPorHora = agruparHitsPorHora();
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    // Calcular el inicio de la jornada
    let inicioJornada = moment().startOf("day").add(22, "hours");
    if (ahora.isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5; // en minutos
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes")) ? 0 : "";
  };
  // Construir columnas (buckets) a partir del orden de turnos
  const columnas = ordenTurnos
    .map((hora) => ({
      hora,
      rango: calcularRangoHoras(hora),
      valor: getDisplayValue(hora)
    }))
    .filter((col) => col.valor !== "");
  // Función para calcular totales de hits por turno – según periodos de tiempo
  const calcularTotalesPorTurno = (registros, inicioJornada) => {
    const totales = { nocturno: 0, matutino: 0, vespertino: 0 };
    registros.forEach((registro) => {
      const fechaHoraRegistro = moment(
        `${registro.fecha} ${registro.hour}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      if (
        fechaHoraRegistro.isBetween(inicioJornada.clone(), inicioJornada.clone().add(8, "hours"), null, "[)")
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
  // --- Notas por Hora – Funciones para toggle, guardar y editar nota de hora ---
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
        seccion: "biselado-la",
        nota: editingNota
      };
      const response = await clienteAxios.post("/notas/notas", payload);
      setNotas((prev) => ({
        ...prev,
        [hora]: { id: response.data.id, nota: response.data.nota }
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
        seccion: "biselado-la"
      };
      const response = await clienteAxios.put("/notas/notas", payload);
      setNotas((prev) => ({
        ...prev,
        [hora]: { id: response.data.id, nota: response.data.nota }
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
        params: { seccion: "biselado-la", fecha: today }
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
  // --- Notas de Turno – Funciones para toggle, guardar y editar nota de turno ---
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
        seccion: "biselado-la",
        comentario: editingTurnoNota
      };
      const response = await clienteAxios.post("/notas/notas_turnos", payload);
      setNotasTurnos((prev) => ({
        ...prev,
        [turno]: { id: response.data.id, comentario: response.data.comentario }
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
        [turno]: { id: response.data.id, comentario: response.data.comentario }
      }));
      setTurnoActivo(null);
    } catch (error) {
      console.error("Error al editar la nota de turno:", error);
    }
  };
  // --- Efectos para obtener la información inicial ---
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // 1. Obtener las metas para biselados desde "/metas/metas-biselados"
        const responseMetas = await clienteAxios("/metas/metas-biselados");
        const registrosMetas = responseMetas.data.registros;
        // Filtrar solo las metas que cumplan con alguno de los patrones deseados
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
        // 2. Obtener los registros (hits) desde "/biselado/biselado/actualdia"
        const responseRegistros = await clienteAxios("/biselado/biselado/actualdia");
        const registrosAPI = responseRegistros.data.registros;
        const ahora = moment();
        // La jornada inicia a las 22:00 del día anterior y finaliza a las 21:30 del día siguiente
        let inicioJornada = moment().startOf("day").add(22, "hours");
        let finJornada = moment(inicioJornada).add(1, "days").subtract(30, "minutes");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "day");
          finJornada.subtract(1, "day");
        }
        // Filtro registros por fecha y también por el pattern deseado
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
        await cargarNotas();
        await cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos de biselado:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Calcular el inicio de la jornada (usado por algunas funciones, como getMetaParaHora)
  let inicioJornada = moment().startOf("day").add(22, "hours");
  if (moment().isBefore(inicioJornada)) inicioJornada.subtract(1, "day");
  // Función que dado un bucket (hora) retorna la meta por hora correspondiente, según el turno
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
  // Función para definir la clase CSS según si se cumple la meta
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
  return (
    <BiseladoEstacionLAContext.Provider
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
    </BiseladoEstacionLAContext.Provider>
  );
};
export { BiseladoEstacionLAProvider };
export default BiseladoEstacionLAContext;