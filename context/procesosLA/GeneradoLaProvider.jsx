import React, { createContext, useState, useEffect } from "react";
import clienteAxios from "../../config/clienteAxios";
import moment from "moment-timezone";
// Configuramos moment para usar la zona horaria de México
moment.tz.setDefault("America/Mexico_City");
const GeneradoLaContext = createContext();
const GeneradoLaProvider = ({ children }) => {
  // Estados para registros y métricas
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  const [meta, setMeta] = useState(0);
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  const [hitsNocturno, setHitsNocturno] = useState(0);
  const [metaMatutino, setMetaMatutino] = useState(0);
  const [metaVespertino, setMetaVespertino] = useState(0);
  const [metaNocturno, setMetaNocturno] = useState(0);
  // Estados para las notas de turno
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Función para cargar las notas de turno
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "generado-la", fecha: today },
      });
      const notasTurnosMap = {
        nocturno: null,
        matutino: null,
        vespertino: null,
      };
      if (Array.isArray(response.data)) {
        response.data.forEach((item) => {
          notasTurnosMap[item.turno] = { id: item.id, comentario: item.comentario };
        });
      }
      setNotasTurnos(notasTurnosMap);
    } catch (error) {
      console.error("Error al cargar las notas de turno:", error);
    }
  };
  // Alterna la visualización del recuadro de nota de turno
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Función para guardar una nueva nota de turno (POST)
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno, // "nocturno", "matutino" o "vespertino"
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
  // Función para editar una nota de turno existente (PUT)
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
  // Efecto para cargar la lógica: metas, registros y notas
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Patrones de las máquinas deseadas para este módulo
        const patterns = ["245 ORBIT", "246 ORBIT 2 LA", "244 ORBIT 3 LA", "243 ORBIT 4 LA"];
        // 1. Obtener y filtrar las metas
        const responseMetas = await clienteAxios.get("/metas/metas-generadores");
        const metasFiltradas = responseMetas.data.registros.filter((meta) =>
          patterns.some((pat) => meta.name.startsWith(pat))
        );
        const sumaMetaNocturno = metasFiltradas.reduce(
          (acc, curr) => acc + curr.meta_nocturno,
          0
        );
        const sumaMetaMatutino = metasFiltradas.reduce(
          (acc, curr) => acc + curr.meta_matutino,
          0
        );
        const sumaMetaVespertino = metasFiltradas.reduce(
          (acc, curr) => acc + curr.meta_vespertino,
          0
        );
        // 2. Obtener y filtrar los registros del día
        const responseRegistros = await clienteAxios.get("/generadores/generadores/actualdia");
        const registros = responseRegistros.data.registros;
        const registrosFiltrados = registros.filter((registro) =>
          patterns.some((pat) => registro.name.startsWith(pat))
        );
        const ahora = moment().tz("America/Mexico_City");
        let inicioNocturno, finNocturno;
        let inicioMatutino, finMatutino;
        let inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Jornada nocturna: hoy 22:00 a mañana 06:00 (turnos del día siguiente)
          inicioNocturno = ahora.clone().startOf("day").add(22, "hours");
          finNocturno = ahora.clone().add(1, "day").startOf("day").add(6, "hours");
          inicioMatutino = ahora.clone().add(1, "day").startOf("day").add(6, "hours").add(30, "minutes");
          finMatutino = ahora.clone().add(1, "day").startOf("day").add(14, "hours").add(29, "minutes");
          inicioVespertino = ahora.clone().add(1, "day").startOf("day").add(14, "hours").add(30, "minutes");
          finVespertino = ahora.clone().add(1, "day").startOf("day").add(21, "hours").add(30, "minutes");
        } else {
          // Jornada actual: turnos de hoy
          inicioNocturno = ahora.clone().subtract(1, "day").startOf("day").add(22, "hours");
          finNocturno = ahora.clone().startOf("day").add(6, "hours");
          inicioMatutino = ahora.clone().startOf("day").add(6, "hours").add(30, "minutes");
          finMatutino = ahora.clone().startOf("day").add(14, "hours").add(29, "minutes");
          inicioVespertino = ahora.clone().startOf("day").add(14, "hours").add(30, "minutes");
          finVespertino = ahora.clone().startOf("day").add(22, "hours");
        }
        // 3. Filtrar registros por turno
        const registrosNocturno = registrosFiltrados.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioNocturno, finNocturno, null, "[)");
        });
        const registrosMatutino = registrosFiltrados.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioMatutino, finMatutino, null, "[)");
        });
        const registrosVespertino = registrosFiltrados.filter((registro) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, "[)");
        });
        // 4. Calcular los hits por turno
        const hitsNocturno = registrosNocturno.reduce(
          (acc, curr) => acc + parseInt(curr.hits, 10),
          0
        );
        const hitsMatutino = registrosMatutino.reduce(
          (acc, curr) => acc + parseInt(curr.hits, 10),
          0
        );
        const hitsVespertino = registrosVespertino.reduce(
          (acc, curr) => acc + parseInt(curr.hits, 10),
          0
        );
        setHitsNocturno(hitsNocturno);
        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
        const total = hitsNocturno + hitsMatutino + hitsVespertino;
        setTotalHits(total);
        // 5. Calcular las metas totales por turno
        const horasNocturno = 8, horasMatutino = 8, horasVespertino = 7;
        const metaTotalNocturno = horasNocturno * sumaMetaNocturno;
        const metaTotalMatutino = horasMatutino * sumaMetaMatutino;
        const metaTotalVespertino = horasVespertino * sumaMetaVespertino;
        setMetaNocturno(metaTotalNocturno);
        setMetaMatutino(metaTotalMatutino);
        setMetaVespertino(metaTotalVespertino);
        // 6. Calcular la meta en vivo acumulada según el turno actual
        let metaAcumulada = 0;
        if (ahora.isBetween(inicioNocturno, finNocturno, null, "[)")) {
          const horasTranscurridasNocturno = ahora.diff(inicioNocturno, "hours", true);
          metaAcumulada = Math.floor(horasTranscurridasNocturno) * sumaMetaNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, "[)")) {
          metaAcumulada = metaTotalNocturno;
          const horasTranscurridasMatutino = ahora.diff(inicioMatutino, "hours", true);
          metaAcumulada += Math.floor(horasTranscurridasMatutino) * sumaMetaMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, "[)")) {
          metaAcumulada = metaTotalNocturno + metaTotalMatutino;
          const horasTranscurridasVespertino = ahora.diff(inicioVespertino, "hours", true);
          metaAcumulada += Math.floor(horasTranscurridasVespertino) * sumaMetaVespertino;
        }
        setMeta(metaAcumulada);
        // 7. Obtener el último registro para calcular el corte de la siguiente media hora
        const ultimoRegistro = registros.reduce((ultimo, actual) => {
          const horaActual = moment.tz(
            `${actual.fecha} ${actual.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          const ultimoHora = moment.tz(
            `${ultimo.fecha} ${ultimo.hour}`,
            "YYYY-MM-DD HH:mm:ss",
            "America/Mexico_City"
          );
          return horaActual.isAfter(ultimoHora) ? actual : ultimo;
        }, registros[0]);
        const formattedLastHour = moment.tz(
          `${ultimoRegistro.fecha} ${ultimoRegistro.hour}`,
          "YYYY-MM-DD HH:mm:ss",
          "America/Mexico_City"
        );
        setUltimaHora(formattedLastHour.format("HH:mm"));
        const horaFinal = formattedLastHour.clone().add(30 - (formattedLastHour.minute() % 30), "minutes");
        const siguienteHoraDate = horaFinal.clone().add(30, "minutes");
        setSiguienteHora(siguienteHoraDate.format("HH:mm"));
        // 8. Cargar las notas de turno
        cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <GeneradoLaContext.Provider
      value={{
        totalHits,
        ultimaHora,
        siguienteHora,
        meta,
        hitsMatutino,
        hitsVespertino,
        hitsNocturno,
        metaMatutino,
        metaVespertino,
        metaNocturno,
        notasTurnos,
        turnoActivo,
        editingTurnoNota,
        setEditingTurnoNota,
        toggleNotaTurno,
        handleGuardarNotaTurno,
        handleEditarNotaTurno,
      }}
    >
      {children}
    </GeneradoLaContext.Provider>
  );
};
export { GeneradoLaProvider };
export default GeneradoLaContext;