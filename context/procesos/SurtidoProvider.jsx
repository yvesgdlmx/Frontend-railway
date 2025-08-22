import { useState, useEffect, createContext } from 'react';
import clienteAxios from '../../config/clienteAxios';
import moment from 'moment-timezone';
const SurtidoContext = createContext();
const SurtidoProvider = ({ children }) => {
  // Estados para datos generales
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  const [meta, setMeta] = useState(0);
  // Estados para cada turno
  const [hitsNocturno, setHitsNocturno] = useState(0);
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  const [metaNocturno, setMetaNocturno] = useState(0);
  const [metaMatutino, setMetaMatutino] = useState(0);
  const [metaVespertino, setMetaVespertino] = useState(0);
  // Estados para notas de turno y manejo de edición
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Obtener y calcular hits, metas y tiempos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener el registro global de metas
        const responseMetas = await clienteAxios.get('/metas/metas-manuales');
        const metaGlobal = responseMetas.data.registros.find(item =>
          item.name.toLowerCase().includes("global surtido")
        );
        if (!metaGlobal) {
          console.error("No se encontró el registro 'global surtido' en las metas");
          return;
        }
        const sumaMetaNocturno = metaGlobal.meta_nocturno;
        const sumaMetaMatutino = metaGlobal.meta_matutino;
        const sumaMetaVespertino = metaGlobal.meta_vespertino;
        // 2. Obtener los registros para el día actual
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const registros = responseRegistros.data.registros.filter(registro =>
          registro.name.toLowerCase().includes('lens log')
        );
        const ahora = moment().tz('America/Mexico_City');
        // 3. Definir intervalos de turno según la hora actual
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
        // 4. Filtrar los registros por turno
        const filtrarPorTurno = (registro, inicio, fin) => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicio, fin, null, '[)');
        };
        const registrosNocturno = registros.filter(registro =>
          filtrarPorTurno(registro, inicioNocturno, finNocturno)
        );
        const registrosMatutino = registros.filter(registro =>
          filtrarPorTurno(registro, inicioMatutino, finMatutino)
        );
        const registrosVespertino = registros.filter(registro =>
          filtrarPorTurno(registro, inicioVespertino, finVespertino)
        );
        // 5. Calcular los hits para cada turno
        const hitsNocturnoCalc = registrosNocturno.reduce(
          (acc, curr) => acc + parseInt(curr.hits, 10),
          0
        );
        const hitsMatutinoCalc = registrosMatutino.reduce(
          (acc, curr) => acc + parseInt(curr.hits, 10),
          0
        );
        const hitsVespertinoCalc = registrosVespertino.reduce(
          (acc, curr) => acc + parseInt(curr.hits, 10),
          0
        );
        setHitsNocturno(hitsNocturnoCalc);
        setHitsMatutino(hitsMatutinoCalc);
        setHitsVespertino(hitsVespertinoCalc);
        setTotalHits(hitsNocturnoCalc + hitsMatutinoCalc + hitsVespertinoCalc);
        // 6. Calcular metas totales por turno
        const horasNocturno = 8, horasMatutino = 8, horasVespertino = 7;
        setMetaNocturno(horasNocturno * sumaMetaNocturno);
        setMetaMatutino(horasMatutino * sumaMetaMatutino);
        setMetaVespertino(horasVespertino * sumaMetaVespertino);
        // 7. Calcular meta en vivo (acumulada) según el turno activo
        let metaAcumulada = 0;
        if (ahora.isBetween(inicioNocturno, finNocturno, null, '[)')) {
          const horasTranscurridas = ahora.diff(inicioNocturno, 'hours', true);
          metaAcumulada = Math.floor(horasTranscurridas) * sumaMetaNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, '[)')) {
          metaAcumulada = (horasNocturno * sumaMetaNocturno) +
            Math.floor(ahora.diff(inicioMatutino, 'hours', true)) * sumaMetaMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, '[)')) {
          metaAcumulada = (horasNocturno * sumaMetaNocturno) +
            (horasMatutino * sumaMetaMatutino) +
            Math.floor(ahora.diff(inicioVespertino, 'hours', true)) * sumaMetaVespertino;
        }
        setMeta(metaAcumulada);
        // 8. Obtener el último registro para determinar el corte de 30 minutos
        const ultimoRegistro = registros.reduce((ultimo, actual) => {
          const horaActual = moment.tz(
            `${actual.fecha} ${actual.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return horaActual.isAfter(
            moment.tz(`${ultimo.fecha} ${ultimo.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City')
          )
            ? actual
            : ultimo;
        }, registros[0]);
        const formattedLastHour = moment.tz(
          `${ultimoRegistro.fecha} ${ultimoRegistro.hour}`,
          'YYYY-MM-DD HH:mm:ss',
          'America/Mexico_City'
        );
        setUltimaHora(formattedLastHour.format('HH:mm'));
        let horaFinal = formattedLastHour.clone().add(30 - (formattedLastHour.minute() % 30), 'minutes');
        const siguienteHoraDate = horaFinal.clone().add(30, 'minutes');
        setSiguienteHora(siguienteHoraDate.format('HH:mm'));
      } catch (error) {
        console.error("Error al obtener los datos de surtido:", error);
      }
    };
    fetchData();
  }, []);
  // Cargar las notas de turno
  useEffect(() => {
    const cargarNotasTurnos = async () => {
      try {
        const today = moment().format("YYYY-MM-DD");
        const response = await clienteAxios.get("/notas/notas_turnos", {
          params: { seccion: "surtido", fecha: today },
        });
        const notasMap = { nocturno: null, matutino: null, vespertino: null };
        if (Array.isArray(response.data)) {
          response.data.forEach((item) => {
            notasMap[item.turno] = { id: item.id, comentario: item.comentario };
          });
        } else {
          console.error("La respuesta de la API no es un array:", response.data);
        }
        setNotasTurnos(notasMap);
      } catch (error) {
        console.error("Error al cargar las notas de turno:", error);
      }
    };
    cargarNotasTurnos();
  }, []);
  // Funciones para manejar las notas de turno
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
  return (
    <SurtidoContext.Provider
      value={{
        totalHits,
        ultimaHora,
        siguienteHora,
        meta,
        hitsNocturno,
        hitsMatutino,
        hitsVespertino,
        metaNocturno,
        metaMatutino,
        metaVespertino,
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
    </SurtidoContext.Provider>
  );
};
export { SurtidoProvider };
export default SurtidoContext;