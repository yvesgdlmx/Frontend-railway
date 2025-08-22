import { useState, useEffect, createContext } from 'react';
import clienteAxios from '../../config/clienteAxios';
import moment from 'moment-timezone';
const ProduccionContext = createContext();
const ProduccionProvider = ({ children }) => {
  // Estados para hits y tiempos
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  
  // Estados para hits por turno
  const [hitsNocturno, setHitsNocturno] = useState(0);
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  // Estados para metas: meta en vivo acumulada, meta base por hora y metas totales por turno.
  const [meta, setMeta] = useState(0);
  const [metaPorHora, setMetaPorHora] = useState(0);
  const [metaNocturno, setMetaNocturno] = useState(0);
  const [metaMatutino, setMetaMatutino] = useState(0);
  const [metaVespertino, setMetaVespertino] = useState(0);
  
  // Estados para las notas por turno
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener las metas desde el endpoint "/metas/metas-manuales"
        // Se busca el registro global correspondiente a "global produccion"
        const responseMetas = await clienteAxios.get('/metas/metas-manuales');
        const metaRegistro = responseMetas.data.registros.find(registro =>
          registro.name.toLowerCase() === 'global produccion'
        );
        const metaBaseNocturno = metaRegistro ? metaRegistro.meta_nocturno : 0;
        const metaBaseMatutino = metaRegistro ? metaRegistro.meta_matutino : 0;
        const metaBaseVespertino = metaRegistro ? metaRegistro.meta_vespertino : 0;
        setMetaPorHora(metaBaseNocturno);
        // Definir las metas totales para cada turno
        const _metaNocturno = 8 * metaBaseNocturno;
        const _metaMatutino = 8 * metaBaseMatutino;
        const _metaVespertino = 7 * metaBaseVespertino;
        setMetaNocturno(_metaNocturno);
        setMetaMatutino(_metaMatutino);
        setMetaVespertino(_metaVespertino);
        // 2. Obtener los registros de producción desde "/manual/manual/actualdia"
        // Se filtran los registros que incluyan "JOB COMPLETE"
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const registros = responseRegistros.data.registros.filter(registro =>
          registro.name.includes('JOB COMPLETE')
        );
        const ahora = moment().tz('America/Mexico_City');
        // 3. Definir intervalos horarios según la jornada
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(29, 'minutes');
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(22, 'hours');
        } else {
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours').add(29, 'minutes');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
        // 4. Filtrar registros por turno
        const registrosNocturno = registros.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicioNocturno, finNocturno, null, '[)');
        });
        const registrosMatutino = registros.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicioMatutino, finMatutino, null, '[)');
        });
        const registrosVespertino = registros.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, '[)');
        });
        // 5. Sumar los hits por turno y actualizar los estados
        const sumaHitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const sumaHitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const sumaHitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(sumaHitsNocturno);
        setHitsMatutino(sumaHitsMatutino);
        setHitsVespertino(sumaHitsVespertino);
        setTotalHits(sumaHitsNocturno + sumaHitsMatutino + sumaHitsVespertino);
        // 6. Calcular la meta en vivo acumulada para el turno en curso
        let metaAcumulada = 0;
        if (ahora.isBetween(inicioNocturno, finNocturno, null, '[)')) {
          const horasTranscurridas = ahora.diff(inicioNocturno, 'hours', true);
          metaAcumulada = Math.floor(horasTranscurridas) * metaBaseNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, '[)')) {
          metaAcumulada = _metaNocturno; // metas ya completadas en turno nocturno
          const horasTranscurridas = ahora.diff(inicioMatutino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridas) * metaBaseMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, '[)')) {
          metaAcumulada = _metaNocturno + _metaMatutino;
          const horasTranscurridas = ahora.diff(inicioVespertino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridas) * metaBaseVespertino;
        }
        setMeta(metaAcumulada);
        // 7. Obtener el último registro para determinar el corte de la siguiente media hora
        const ultimoRegistro = registros.reduce((ultimo, actual) => {
          const horaActual = moment.tz(
            `${actual.fecha} ${actual.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return horaActual.isAfter(
            moment.tz(`${ultimo.fecha} ${ultimo.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City')
          ) ? actual : ultimo;
        }, registros[0]);
        const formattedLastHour = moment.tz(
          `${ultimoRegistro.fecha} ${ultimoRegistro.hour}`,
          'YYYY-MM-DD HH:mm:ss',
          'America/Mexico_City'
        );
        setUltimaHora(formattedLastHour.format('HH:mm'));
        const horaFinal = formattedLastHour.clone().add(30 - (formattedLastHour.minute() % 30), 'minutes');
        const siguienteHoraDate = horaFinal.clone().add(30, 'minutes');
        setSiguienteHora(siguienteHoraDate.format('HH:mm'));
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);
  // Cargar las notas de turno para "produccion"
  useEffect(() => {
    const cargarNotasTurnos = async () => {
      try {
        const today = moment().format("YYYY-MM-DD");
        const response = await clienteAxios.get("/notas/notas_turnos", {
          params: { seccion: "produccion", fecha: today },
        });
        const notasTurnosMap = { nocturno: null, matutino: null, vespertino: null };
        if (Array.isArray(response.data)) {
          response.data.forEach(item => {
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
    cargarNotasTurnos();
  }, []);
  // Funciones para gestionar las notas por turno
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
        seccion: "producción",
        comentario: editingTurnoNota,
      };
      const response = await clienteAxios.post("/notas/notas_turnos", payload);
      setNotasTurnos(prev => ({
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
        console.error("No se encontró la nota para el turno:", turno);
        return;
      }
      const payload = {
        id: notaActual.id,
        comentario: editingTurnoNota,
      };
      const response = await clienteAxios.put("/notas/notas_turnos", payload);
      setNotasTurnos(prev => ({
        ...prev,
        [turno]: { id: response.data.id, comentario: response.data.comentario }
      }));
      setTurnoActivo(null);
    } catch (error) {
      console.error("Error al editar la nota de turno:", error);
    }
  };
  return (
    <ProduccionContext.Provider value={{
      totalHits,
      ultimaHora,
      siguienteHora,
      meta,
      metaPorHora,
      metaNocturno,
      metaMatutino,
      metaVespertino,
      hitsNocturno,
      hitsMatutino,
      hitsVespertino,
      notasTurnos,
      turnoActivo,
      editingTurnoNota,
      setEditingTurnoNota,
      toggleNotaTurno,
      handleGuardarNotaTurno,
      handleEditarNotaTurno
    }}>
      {children}
    </ProduccionContext.Provider>
  );
};
export { ProduccionProvider };
export default ProduccionContext;