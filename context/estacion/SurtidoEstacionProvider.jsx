import React, { useState, useEffect, createContext } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";

moment.tz.setDefault("America/Mexico_City");
const SurtidoEstacionContext = createContext();
const SurtidoEstacionProvider = ({ children }) => {
  // Estados para datos generales
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
  // Arreglo de horas (orden de turnos)
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
    "23:00", // Nocturno
    "22:00",
  ];
  // Función para calcular el rango de horas
  const calcularRangoHoras = (hora) => {
    const inicio = hora;
    let fin;
    if (hora === "23:00") {
      fin = "00:00";
    } else {
      const obj = moment(hora, "HH:mm");
      fin = obj.add(1, "hour").format("HH:mm");
    }
    return `${inicio} - ${fin}`;
  };
  // Función para cargar las notas por hora
  const cargarNotas = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas", {
        params: { seccion: "surtido", fecha: today },
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
        params: { seccion: "surtido", fecha: today },
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
  // Obtención de datos (metas, registros y notas)
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // 1. Obtener metas para surtido desde '/metas/metas-manuales'
        const responseMetas = await clienteAxios("/metas/metas-manuales");
        const registrosMetas = responseMetas.data.registros;
        const globalMeta = registrosMetas.find(
          (item) => item.name.toLowerCase() === "global surtido"
        );
        const metaNocturnoPorHora = globalMeta ? globalMeta.meta_nocturno : 0;
        const metaMatutinoPorHora = globalMeta ? globalMeta.meta_matutino : 0;
        const metaVespertinoPorHora = globalMeta ? globalMeta.meta_vespertino : 0;
        setMetasPorHora({
          nocturno: metaNocturnoPorHora,
          matutino: metaMatutinoPorHora,
          vespertino: metaVespertinoPorHora,
        });
        setMetasTotalesPorTurno({
          nocturno: metaNocturnoPorHora * 8,
          matutino: metaMatutinoPorHora * 8,
          vespertino: metaVespertinoPorHora * 7,
        });
        // 2. Obtener registros (hits) del día actual desde '/manual/manual/actualdia'
        const responseRegistros = await clienteAxios("/manual/manual/actualdia");
        const registrosLensLog = responseRegistros.data.registros.filter((registro) =>
          registro.name.includes("LENS LOG")
        );
        const ahora = moment();
        let inicioJornada = moment().startOf("day").add(22, "hours");
        if (ahora.isBefore(inicioJornada)) {
          inicioJornada.subtract(1, "day");
        }
        const finJornada = inicioJornada.clone().add(1, "days").subtract(30, "minutes");
        const registrosFiltrados = registrosLensLog.filter((registro) => {
          const fechaHoraRegistro = moment(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss"
          );
          return fechaHoraRegistro.isBetween(inicioJornada, finJornada, null, "[)");
        });
        setRegistros(registrosFiltrados);
        calcularTotalesPorTurno(registrosFiltrados, inicioJornada);
        // Cargar las notas por hora y de turno
        await cargarNotas();
        await cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    obtenerDatos();
  }, []);
  // Función para calcular totales (hits) por turno a partir de los registros
  const calcularTotalesPorTurno = (registros, inicioJornada) => {
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
  // Función para agrupar los hits por hora
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
  // Función para convertir una hora (string) en un objeto moment basado en el inicio de jornada
  const getBucketMoment = (horaStr, inicioJornada) => {
    const [h, m] = horaStr.split(":").map(Number);
    let bucket = inicioJornada
      .clone()
      .set({ hour: h, minute: m, second: 0, millisecond: 0 });
    if (h < 22) bucket.add(1, "day");
    return bucket;
  };
  // Función que retorna el valor a mostrar por hora (hits o 0/blanco)
  const getDisplayValue = (horaStr, inicioJornada) => {
    const hitsPorHora = agruparHitsPorHora();
    if (hitsPorHora[horaStr] !== undefined) return hitsPorHora[horaStr];
    const ahora = moment();
    const bucketInicio = getBucketMoment(horaStr, inicioJornada);
    const bucketFin = bucketInicio.clone().add(1, "hour");
    const margen = 5;
    return ahora.isAfter(bucketFin.clone().add(margen, "minutes"))
      ? 0
      : "";
  };
  // Función que determina la meta (por hora) según el bucket en el que caiga
  const getMetaParaHora = (horaStr, inicioJornada) => {
    const bucket = getBucketMoment(horaStr, inicioJornada);
    if (
      bucket.isBetween(
        inicioJornada.clone(),
        inicioJornada.clone().add(8, "hours"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.nocturno;
    } else if (
      bucket.isBetween(
        inicioJornada.clone().add(8, "hours").add(30, "minutes"),
        inicioJornada.clone().add(16, "hours"),
        null,
        "[)"
      )
    ) {
      return metasPorHora.matutino;
    } else if (
      bucket.isBetween(
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
  // Función para asignar la clase CSS según si los hits cumplen con la meta
  const getClassName = (hits, meta) =>
    parseInt(hits, 10) >= meta ? "text-green-500" : "text-red-500";
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
        seccion: "surtido",
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
  // Funciones para las notas de turno
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
        seccion: "surtido",
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
  return (
    <SurtidoEstacionContext.Provider
      value={{
        // Estados generales
        registros,
        totalesPorTurno,
        metasPorHora,
        metasTotalesPorTurno,
        // Notas por hora
        notas,
        notaActiva,
        editingNota,
        // Notas de turno
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
      }}
    >
      {children}
    </SurtidoEstacionContext.Provider>
  );
};
export { SurtidoEstacionProvider };
export default SurtidoEstacionContext;