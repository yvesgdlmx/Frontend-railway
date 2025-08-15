import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../helpers/formatNumber';
// Importamos el ícono de comentario de react‑icons
import { FaComment } from 'react-icons/fa';
const Produccion_Procesos = () => {
  // Estados para hits y tiempos
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  const [hitsNocturno, setHitsNocturno] = useState(0);
  // Estados para las metas
  const [meta, setMeta] = useState(0); // Meta en vivo acumulada
  const [metaPorHora, setMetaPorHora] = useState(0); // Meta base por hora
  const [metaMatutino, setMetaMatutino] = useState(0);
  const [metaVespertino, setMetaVespertino] = useState(0);
  const [metaNocturno, setMetaNocturno] = useState(0);
  // NUEVO: Estados para las notas por turno
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
        // 1. Obtención de metas desde '/metas/metas-manuales'
        // Utilizamos el registro global, por ejemplo: "global produccion"
        const responseMetas = await clienteAxios.get('/metas/metas-manuales');
        const metaRegistro = responseMetas.data.registros.find(registro =>
          registro.name.toLowerCase() === 'global produccion'
        );
        const metaBaseNocturno = metaRegistro ? metaRegistro.meta_nocturno : 0;
        const metaBaseMatutino = metaRegistro ? metaRegistro.meta_matutino : 0;
        const metaBaseVespertino = metaRegistro ? metaRegistro.meta_vespertino : 0;
        setMetaPorHora(metaBaseNocturno);
        // Definir las metas totales para cada turno (turnos nocturno y matutino tienen 8 horas, vespertino 7)
        const metaTotalNocturno = 8 * metaBaseNocturno;
        const metaTotalMatutino = 8 * metaBaseMatutino;
        const metaTotalVespertino = 7 * metaBaseVespertino;
        setMetaNocturno(metaTotalNocturno);
        setMetaMatutino(metaTotalMatutino);
        setMetaVespertino(metaTotalVespertino);
        // 2. Obtener los registros de producción desde '/manual/manual/actualdia'
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
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
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
        // 5. Sumar los hits por turno
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
          const horasTranscurridasNocturno = ahora.diff(inicioNocturno, 'hours', true);
          metaAcumulada = Math.floor(horasTranscurridasNocturno) * metaBaseNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, '[)')) {
          metaAcumulada = metaTotalNocturno;
          const horasTranscurridasMatutino = ahora.diff(inicioMatutino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridasMatutino) * metaBaseMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, '[)')) {
          metaAcumulada = metaTotalNocturno + metaTotalMatutino;
          const horasTranscurridasVespertino = ahora.diff(inicioVespertino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridasVespertino) * metaBaseVespertino;
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
  // useEffect para cargar las notas de turno de la sección "produccion"
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
  // Función para togglear la ventana emergente de edición/agregar nota
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Funciones para guardar y editar la nota de turno
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno,         // "nocturno", "matutino" o "vespertino"
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
  const getClassName = (hits, metaTurno) =>
    hits >= metaTurno ? "text-green-700" : "text-red-700";
  return (
    <div className='bg-white p-4 rounded-xl'>
      <Link to='/totales_estacion#produccion' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Producción</h2>
          <img 
            src="/img/arrow.png" 
            alt="ver" 
            width={25} 
            style={{ filter: 'invert(100%)' }} 
            className='relative'
          />
        </div>
      </Link>
      <Link to='/totales_estacion?seccion=produccion' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Producción</h2>
          <img 
            src="/img/arrow.png" 
            alt="ver" 
            width={25} 
            style={{ filter: 'invert(100%)' }} 
            className='relative'
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de producción.</p>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos: <span className={totalHits >= meta ? "text-green-700" : "text-red-700"}>
            {formatNumber(totalHits)}
          </span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Meta en vivo: <span className='font-semibold xs:text-sm md:text-md'>{formatNumber(meta)}</span>
        </p>
      </div>
      {/* Sección de totales por turno con funcionalidad de notas */}
      <div className='flex flex-col gap-4 border-2 py-4 px-2 relative'>
        <div className='flex items-center justify-between'>
          {/* Nocturno */}
          <div 
            className="cursor-pointer"
            onClick={() => toggleNotaTurno("nocturno")}
            title={notasTurnos.nocturno && notasTurnos.nocturno.comentario ? notasTurnos.nocturno.comentario : "Haz click para agregar un comentario"}
          >
            <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
              Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>{formatNumber(hitsNocturno)}</span> / <span>{formatNumber(metaNocturno)}</span>
              {notasTurnos.nocturno && notasTurnos.nocturno.comentario && (
                <FaComment className="inline-block ml-1 text-blue-500" title="Este turno tiene comentario" />
              )}
            </p>
          </div>
          {/* Matutino */}
          <div 
            className="cursor-pointer"
            onClick={() => toggleNotaTurno("matutino")}
            title={notasTurnos.matutino && notasTurnos.matutino.comentario ? notasTurnos.matutino.comentario : "Haz click para agregar un comentario"}
          >
            <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
              Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>{formatNumber(hitsMatutino)}</span> / <span>{formatNumber(metaMatutino)}</span>
              {notasTurnos.matutino && notasTurnos.matutino.comentario && (
                <FaComment className="inline-block ml-1 text-blue-500" title="Este turno tiene comentario" />
              )}
            </p>
          </div>
          {/* Vespertino */}
          <div 
            className="cursor-pointer"
            onClick={() => toggleNotaTurno("vespertino")}
            title={notasTurnos.vespertino && notasTurnos.vespertino.comentario ? notasTurnos.vespertino.comentario : "Haz click para agregar un comentario"}
          >
            <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
              Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>{formatNumber(hitsVespertino)}</span> / <span>{formatNumber(metaVespertino)}</span>
              {notasTurnos.vespertino && notasTurnos.vespertino.comentario && (
                <FaComment className="inline-block ml-1 text-blue-500" title="Este turno tiene comentario" />
              )}
            </p>
          </div>
        </div>
        {/* Ventana emergente para editar o agregar la nota */}
        {turnoActivo && (
          <div className="absolute z-10 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
            style={{
              left: turnoActivo === "nocturno" ? "0" : turnoActivo === "matutino" ? "33%" : "auto",
              right: turnoActivo === "vespertino" ? "0" : "auto",
              top: "-55px",
            }}
            onClick={e => e.stopPropagation()}
          >
            {notasTurnos[turnoActivo] ? (<p></p>) : (<p>Agregar un comentario</p>)}
            <textarea
              className="w-full h-16 p-1 border mb-2 text-xs"
              value={editingTurnoNota}
              onChange={e => setEditingTurnoNota(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            <div className="flex justify-end space-x-2">
              {notasTurnos[turnoActivo] ? (
                <button
                  className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                  onClick={e => {
                    e.stopPropagation();
                    handleEditarNotaTurno(turnoActivo);
                  }}
                >
                  Guardar Cambios
                </button>
              ) : (
                <button
                  className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                  onClick={e => {
                    e.stopPropagation();
                    handleGuardarNotaTurno(turnoActivo);
                  }}
                >
                  Guardar
                </button>
              )}
              <button
                className="bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                onClick={e => {
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
export default Produccion_Procesos;