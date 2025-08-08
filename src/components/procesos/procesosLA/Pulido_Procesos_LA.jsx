import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../../helpers/formatNumber';
const Pulido_Procesos_LA = () => {
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
  // Estados para las notas de turno
  const [notasTurnos, setNotasTurnos] = useState({
    nocturno: null,
    matutino: null,
    vespertino: null,
  });
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [editingTurnoNota, setEditingTurnoNota] = useState("");
  // Función para cargar las notas de turno del endpoint
  const cargarNotasTurnos = async () => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const response = await clienteAxios.get("/notas/notas_turnos", {
        params: { seccion: "pulido-la", fecha: today },
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
        seccion: "pulido-la",
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
  // Función que muestra/oculta el recuadro de edición de la nota de turno
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Función para obtener datos, metas y registros
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Definir patrones de las máquinas deseadas
        const patterns = [
          "266 MULTIFLEX 1",
          "267 MULTIFLEX 2",
          "268 MULTIFLEX 3",
          "269 MULTIFLEX 4"
        ];
        // 1. Obtener las metas de pulido y filtrar únicamente las deseadas
        const responseMetas = await clienteAxios.get('/metas/metas-pulidos');
        const metasFiltradas = responseMetas.data.registros.filter(meta =>
          patterns.some(pat => meta.name.startsWith(pat))
        );
        const sumaMetaNocturno = metasFiltradas.reduce((acc, curr) => acc + curr.meta_nocturno, 0);
        const sumaMetaMatutino = metasFiltradas.reduce((acc, curr) => acc + curr.meta_matutino, 0);
        const sumaMetaVespertino = metasFiltradas.reduce((acc, curr) => acc + curr.meta_vespertino, 0);
        // 2. Obtener los registros del día actual y filtrar por máquinas
        const responseRegistros = await clienteAxios.get('/pulido/pulido/actualdia');
        const registros = responseRegistros.data.registros;
        const registrosFiltrados = registros.filter(registro =>
          patterns.some(pat => registro.name.startsWith(pat))
        );
        const ahora = moment().tz('America/Mexico_City');
        // 3. Definir los intervalos de tiempo para cada turno
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Jornada nocturna: hoy 22:00 hasta mañana 06:00
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Turnos del día siguiente
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual: se consideran turnos de hoy
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
        // 4. Filtrar registros según cada turno
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
        // 5. Calcular los hits obtenidos por turno
        const totalHitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const totalHitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const totalHitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(totalHitsNocturno);
        setHitsMatutino(totalHitsMatutino);
        setHitsVespertino(totalHitsVespertino);
        const total = totalHitsNocturno + totalHitsMatutino + totalHitsVespertino;
        setTotalHits(total);
        // 6. Calcular las metas totales de cada turno (horas fijas)
        const horasNocturno = 8;
        const horasMatutino = 8;
        const horasVespertino = 7;
        const metaTotalNocturno = horasNocturno * sumaMetaNocturno;
        const metaTotalMatutino = horasMatutino * sumaMetaMatutino;
        const metaTotalVespertino = horasVespertino * sumaMetaVespertino;
        setMetaNocturno(metaTotalNocturno);
        setMetaMatutino(metaTotalMatutino);
        setMetaVespertino(metaTotalVespertino);
        // 7. Calcular la meta acumulada en vivo según en qué turno se encuentre “ahora”
        let metaAcumulada = 0;
        if (ahora.isBetween(inicioNocturno, finNocturno, null, '[)')) {
          const horasTranscurridas = ahora.diff(inicioNocturno, 'hours', true);
          metaAcumulada = Math.floor(horasTranscurridas) * sumaMetaNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, '[)')) {
          metaAcumulada = metaTotalNocturno;
          const horasTranscurridas = ahora.diff(inicioMatutino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridas) * sumaMetaMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, '[)')) {
          metaAcumulada = metaTotalNocturno + metaTotalMatutino;
          const horasTranscurridas = ahora.diff(inicioVespertino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridas) * sumaMetaVespertino;
        }
        setMeta(metaAcumulada);
        // 8. Determinar el último registro para calcular el corte de la siguiente media hora
        const ultimoRegistro = registros.reduce((ultimo, actual) => {
          const horaUltimo = moment.tz(
            `${ultimo.fecha} ${ultimo.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          const horaActual = moment.tz(
            `${actual.fecha} ${actual.hour}`,
            'YYYY-MM-DD HH:mm:ss',
            'America/Mexico_City'
          );
          return horaActual.isAfter(horaUltimo) ? actual : ultimo;
        }, registros[0]);
        const formattedLastHour = moment.tz(
          `${ultimoRegistro.fecha} ${ultimoRegistro.hour}`,
          'YYYY-MM-DD HH:mm:ss',
          'America/Mexico_City'
        );
        setUltimaHora(formattedLastHour.format('HH:mm'));
        // Calcular la siguiente media hora para el próximo corte
        const minuto = formattedLastHour.minute();
        const agregarMinutos = 30 - (minuto % 30);
        const horaFinal = formattedLastHour.clone().add(agregarMinutos, 'minutes');
        const siguienteHoraDate = horaFinal.clone().add(30, 'minutes');
        setSiguienteHora(siguienteHoraDate.format('HH:mm'));
        // Cargar las notas de turno
        cargarNotasTurnos();
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);
  // Función para definir el estilo según si se cumple la meta
  const getClassName = (hits, meta) => (hits >= meta ? "text-green-700" : "text-red-700");
  return (
    <div className='bg-white p-4 rounded-xl relative'>
      <Link to='/totales_estacion_la#pulido' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Pulido</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <Link to='/totales_estacion_la?seccion=pulido' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Pulido</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de pulido.</p>
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
      <div className='flex items-center justify-between py-4 px-2 border-2 relative'>
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
export default Pulido_Procesos_LA;