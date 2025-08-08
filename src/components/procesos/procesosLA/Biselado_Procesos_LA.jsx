import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../../helpers/formatNumber';
const Biselado_Procesos_LA = () => {
  // Estados generales del componente
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
  // Estados para las notas de turno (se guardarán como "biselado-la")
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Función para cargar las notas de turno usando el endpoint (/notas/notas_turnos)
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "biselado-la", fecha: today },
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
  // Funciones para guardar y editar las notas de turno
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno,
        seccion: "biselado-la",
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
        console.error("No se encontró la nota de turno para:", turno);
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
  // Función para alternar la visualización del recuadro de nota para el turno correspondiente
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Obtención de datos (metas y registros) para el área de biselado
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Definir los patrones de las máquinas deseadas para biselado
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
        // 1. Obtener las metas y filtrar únicamente las de las máquinas solicitadas
        const responseMetas = await clienteAxios.get('/metas/metas-biselados');
        const metasFiltradas = responseMetas.data.registros.filter(meta =>
          patterns.some(pat => meta.name.startsWith(pat))
        );
        const sumaMetaNocturno = metasFiltradas.reduce((acc, curr) => acc + curr.meta_nocturno, 0);
        const sumaMetaMatutino = metasFiltradas.reduce((acc, curr) => acc + curr.meta_matutino, 0);
        const sumaMetaVespertino = metasFiltradas.reduce((acc, curr) => acc + curr.meta_vespertino, 0);
        // 2. Obtener los registros del día y filtrarlos para incluir solo los de las máquinas deseadas
        const responseRegistros = await clienteAxios.get('/biselado/biselado/actualdia');
        const registros = responseRegistros.data.registros;
        const registrosFiltrados = registros.filter(registro =>
          patterns.some(pat => registro.name.startsWith(pat))
        );
        const ahora = moment().tz('America/Mexico_City');
        // 3. Definir intervalos horarios de acuerdo a la jornada
        let inicioNocturno, finNocturno;
        let inicioMatutino, finMatutino;
        let inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Jornada nocturna: de hoy 22:00 a mañana 06:00
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Turnos del día siguiente
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(22, 'hours');
        } else {
          // Jornada actual: se consideran los turnos de hoy
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
        // 4. Filtrar los registros por turno
        const registrosNocturno = registrosFiltrados.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicioNocturno, finNocturno, null, '[)');
        });
        const registrosMatutino = registrosFiltrados.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicioMatutino, finMatutino, null, '[)');
        });
        const registrosVespertino = registrosFiltrados.filter(registro => {
          const fechaHoraRegistro = moment.tz(
            `${registro.fecha} ${registro.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return fechaHoraRegistro.isBetween(inicioVespertino, finVespertino, null, '[)');
        });
        // 5. Calcular los hits por turno
        const hitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(hitsNocturno);
        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
        const total = hitsNocturno + hitsMatutino + hitsVespertino;
        setTotalHits(total);
        // 6. Definir horas fijas de cada turno y asignar las metas totales
        const horasNocturno = 8;
        const horasMatutino = 8;
        const horasVespertino = 7;
        const metaTotalNocturno = horasNocturno * sumaMetaNocturno;
        const metaTotalMatutino = horasMatutino * sumaMetaMatutino;
        const metaTotalVespertino = horasVespertino * sumaMetaVespertino;
        setMetaNocturno(metaTotalNocturno);
        setMetaMatutino(metaTotalMatutino);
        setMetaVespertino(metaTotalVespertino);
        // 7. Calcular la meta acumulada en vivo según el turno en el que se encuentre "ahora"
        let metaAcumulada = 0;
        if (ahora.isBetween(inicioNocturno, finNocturno, null, '[)')) {
          const horasTranscurridasNocturno = ahora.diff(inicioNocturno, 'hours', true);
          metaAcumulada = Math.floor(horasTranscurridasNocturno) * sumaMetaNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, '[)')) {
          metaAcumulada = metaTotalNocturno;
          const horasTranscurridasMatutino = ahora.diff(inicioMatutino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridasMatutino) * sumaMetaMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, '[)')) {
          metaAcumulada = metaTotalNocturno + metaTotalMatutino;
          const horasTranscurridasVespertino = ahora.diff(inicioVespertino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridasVespertino) * sumaMetaVespertino;
        }
        setMeta(metaAcumulada);
        // 8. Obtener el último registro para determinar el corte de la siguiente media hora
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
        // Calcular la siguiente media hora para el próximo corte
        const horaFinal = formattedLastHour.clone().add(30 - (formattedLastHour.minute() % 30), 'minutes');
        const siguienteHoraDate = horaFinal.clone().add(30, 'minutes');
        setSiguienteHora(siguienteHoraDate.format('HH:mm'));
        // Cargar las notas de turno (sección "biselado-la")
        cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);
  // Función para asignar la clase según si se cumple la meta
  const getClassName = (hits, meta) =>
    hits >= meta ? "text-green-700" : "text-red-700";
  return (
    <div className='bg-white p-4 rounded-xl relative'>
      <Link to='/totales_estacion_la#biselado' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Biselado</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <Link to='/totales_estacion_la?seccion=biselado' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Biselado</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de biselado.</p>
      
      {/* Sección de información general */}
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos: <span className={meta > totalHits ? "text-red-700" : "text-green-700"}>{formatNumber(totalHits)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Meta en vivo: <span className='font-semibold xs:text-sm md:text-md'>{formatNumber(meta)}</span>
        </p>
      </div>
      
      {/* Totales por turno con funcionalidad de notas */}
      <div className='flex flex-col md:flex-row items-center justify-around py-4 px-2 border-2 relative'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md cursor-pointer'
           onClick={() => toggleNotaTurno("nocturno")}
           title={notasTurnos.nocturno && notasTurnos.nocturno.comentario ? notasTurnos.nocturno.comentario : "Haz click para agregar un comentario"}
        >
          Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>{formatNumber(hitsNocturno)}</span> / <span>{formatNumber(metaNocturno)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md cursor-pointer'
           onClick={() => toggleNotaTurno("matutino")}
           title={notasTurnos.matutino && notasTurnos.matutino.comentario ? notasTurnos.matutino.comentario : "Haz click para agregar un comentario"}
        >
          Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>{formatNumber(hitsMatutino)}</span> / <span>{formatNumber(metaMatutino)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md cursor-pointer'
           onClick={() => toggleNotaTurno("vespertino")}
           title={notasTurnos.vespertino && notasTurnos.vespertino.comentario ? notasTurnos.vespertino.comentario : "Haz click para agregar un comentario"}
        >
          Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>{formatNumber(hitsVespertino)}</span> / <span>{formatNumber(metaVespertino)}</span>
        </p>
        {turnoActivo !== null && (
          <div
            className="absolute top-[-70px] left-0 z-50 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{notasTurnos[turnoActivo] ? "" : "Agregar un comentario"}</p>
            <textarea
              className="w-full h-16 p-1 border mb-2 text-xs"
              value={editingTurnoNota}
              onChange={(e) => setEditingTurnoNota(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex justify-end space-x-2">
              {notasTurnos[turnoActivo] ? (
                <button
                  className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditarNotaTurno(turnoActivo);
                  }}
                >
                  Guardar Cambios
                </button>
              ) : (
                <button
                  className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGuardarNotaTurno(turnoActivo);
                  }}
                >
                  Guardar
                </button>
              )}
              <button
                className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setTurnoActivo(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Biselado_Procesos_LA;