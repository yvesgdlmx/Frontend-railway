import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../helpers/formatNumber';
const Tallado_Procesos = () => {
  // Estados existentes
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
  // NUEVO: Estados para las notas de turno
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
        // 1. Se obtiene el registro global de metas
        const responseMetas = await clienteAxios.get('/metas/metas-tallados');
        const metaGlobal = responseMetas.data.registros.find(item =>
          item.name.toLowerCase() === 'global'
        );
        if (!metaGlobal) {
          console.error("No se encontró el registro 'global' en las metas");
          return;
        }
        const sumaMetaNocturno = metaGlobal.meta_nocturno;
        const sumaMetaMatutino = metaGlobal.meta_matutino;
        const sumaMetaVespertino = metaGlobal.meta_vespertino;
        // 2. Se obtienen los registros del tallado para el día actual
        const responseRegistros = await clienteAxios.get('/tallado/tallado/actualdia');
        const registros = responseRegistros.data.registros;
        const ahora = moment().tz('America/Mexico_City');
        // 3. Definir intervalos de turno según la jornada
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Nueva jornada:
          // Turno nocturno: hoy 22:00 a mañana 06:00
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Turno matutino: mañana 06:30 a mañana 14:29
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          // Turno vespertino: mañana 14:30 a mañana 21:30
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual:
          // Turno nocturno: ayer 22:00 a hoy 06:00
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          // Turno matutino: hoy 06:30 a hoy 14:29
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          // Turno vespertino: hoy 14:30 a hoy 21:30
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
        // 4. Filtrar los registros para cada turno
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
        // 5. Calcular los hits para cada turno
        const hitsNocturnoCalc = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsMatutinoCalc = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsVespertinoCalc = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(hitsNocturnoCalc);
        setHitsMatutino(hitsMatutinoCalc);
        setHitsVespertino(hitsVespertinoCalc);
        setTotalHits(hitsNocturnoCalc + hitsMatutinoCalc + hitsVespertinoCalc);
        // 6. Calcular las metas totales para cada turno (horas fijas: nocturno y matutino = 8; vespertino = 7)
        const horasNocturno = 8;
        const horasMatutino = 8;
        const horasVespertino = 7;
        const metaTotalNocturno = horasNocturno * sumaMetaNocturno;
        const metaTotalMatutino = horasMatutino * sumaMetaMatutino;
        const metaTotalVespertino = horasVespertino * sumaMetaVespertino;
        setMetaNocturno(metaTotalNocturno);
        setMetaMatutino(metaTotalMatutino);
        setMetaVespertino(metaTotalVespertino);
        // 7. Calcular la meta en vivo de forma acumulativa según el turno activo
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
        // 8. Obtener el último registro para definir la siguiente ventana de 30 minutos
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
        const horaFinal = moment(formattedLastHour);
        horaFinal.add(30 - (horaFinal.minute() % 30), 'minutes');
        const siguienteHoraDate = moment(horaFinal).add(30, 'minutes');
        setSiguienteHora(siguienteHoraDate.format('HH:mm'));
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);
  // useEffect para cargar las notas de turno (sección tallado)
  useEffect(() => {
    const cargarNotasTurnos = async () => {
      try {
        const today = moment().format("YYYY-MM-DD");
        const response = await clienteAxios.get("/notas/notas_turnos", {
          params: { seccion: "tallado", fecha: today },
        });
        const notasTurnosMap = { nocturno: null, matutino: null, vespertino: null };
        if (Array.isArray(response.data)) {
          response.data.forEach((item) => {
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
  // Función para togglear la ventana de nota de turno
  const toggleNotaTurno = (turno) => {
    if (turnoActivo === turno) {
      setTurnoActivo(null);
    } else {
      setTurnoActivo(turno);
      setEditingTurnoNota(notasTurnos[turno]?.comentario || "");
    }
  };
  // Función para guardar una nueva nota
  const handleGuardarNotaTurno = async (turno) => {
    try {
      const today = moment().format("YYYY-MM-DD");
      const payload = {
        fecha: today,
        turno, // "nocturno", "matutino" o "vespertino"
        seccion: "bloqueo de tallado",
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
  // Función para editar una nota ya existente
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
  // Función que asigna la clase según se cumpla la meta
  const getClassName = (hits, meta) => {
    return hits >= meta ? "text-green-700" : "text-red-700";
  };
  return (
    <div className='bg-white p-4 rounded-xl'>
      {/* Enlace para pantallas grandes */}
      <Link to='/totales_estacion#tallado' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Bloqueo de tallado</h2>
          <img 
            src="/img/arrow.png" 
            alt="ver" 
            width={25} 
            style={{ filter: 'invert(100%)' }} 
            className='relative' 
          />
        </div>
      </Link>
      {/* Enlace para pantallas pequeñas y medianas */}
      <Link to='/totales_estacion?seccion=tallado' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Bloqueo de tallado</h2>
          <img 
            src="/img/arrow.png" 
            alt="ver" 
            width={25} 
            style={{ filter: 'invert(100%)' }} 
            className='relative' 
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de Tallado.</p>
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
      {/* Sección de totales por turno con funcionalidad de notas */}
      <div className='flex items-center justify-between py-4 px-2 border-2 relative'>
        {/* Nocturno */}
        <div 
          className="cursor-pointer"
          onClick={() => toggleNotaTurno("nocturno")}
          title={notasTurnos.nocturno && notasTurnos.nocturno.comentario ? notasTurnos.nocturno.comentario : "Haz click para agregar un comentario"}
        >
          <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
            Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>{formatNumber(hitsNocturno)}</span> / <span>{formatNumber(metaNocturno)}</span>
          </p>
          {turnoActivo === "nocturno" && (
            <div
              className="absolute top-[-55px] left-0 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
              onClick={e => e.stopPropagation()}
            >
              {notasTurnos.nocturno ? (<p></p>) : (<p>Agregar un comentario</p>)}
              <textarea
                className="w-full h-16 p-1 border mb-2 text-xs"
                value={editingTurnoNota}
                onChange={e => setEditingTurnoNota(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              <div className="flex justify-end space-x-2">
                {notasTurnos.nocturno ? (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleEditarNotaTurno("nocturno");
                    }}
                  >
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleGuardarNotaTurno("nocturno");
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
        {/* Matutino */}
        <div 
          className="cursor-pointer"
          onClick={() => toggleNotaTurno("matutino")}
          title={notasTurnos.matutino && notasTurnos.matutino.comentario ? notasTurnos.matutino.comentario : "Haz click para agregar un comentario"}
        >
          <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
            Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>{formatNumber(hitsMatutino)}</span> / <span>{formatNumber(metaMatutino)}</span>
          </p>
          {turnoActivo === "matutino" && (
            <div
              className="absolute top-[-55px] left-[33%] bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
              onClick={e => e.stopPropagation()}
            >
              {notasTurnos.matutino ? (<p></p>) : (<p>Agregar un comentario</p>)}
              <textarea
                className="w-full h-16 p-1 border mb-2 text-xs"
                value={editingTurnoNota}
                onChange={e => setEditingTurnoNota(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              <div className="flex justify-end space-x-2">
                {notasTurnos.matutino ? (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleEditarNotaTurno("matutino");
                    }}
                  >
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleGuardarNotaTurno("matutino");
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
        {/* Vespertino */}
        <div 
          className="cursor-pointer"
          onClick={() => toggleNotaTurno("vespertino")}
          title={notasTurnos.vespertino && notasTurnos.vespertino.comentario ? notasTurnos.vespertino.comentario : "Haz click para agregar un comentario"}
        >
          <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
            Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>{formatNumber(hitsVespertino)}</span> / <span>{formatNumber(metaVespertino)}</span>
          </p>
          {turnoActivo === "vespertino" && (
            <div
              className="absolute top-[-55px] right-0 bg-gray-100 p-4 border rounded shadow-md w-64 h-24 text-xs"
              onClick={e => e.stopPropagation()}
            >
              {notasTurnos.vespertino ? (<p></p>) : (<p>Agregar un comentario</p>)}
              <textarea
                className="w-full h-16 p-1 border mb-2 text-xs"
                value={editingTurnoNota}
                onChange={e => setEditingTurnoNota(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              <div className="flex justify-end space-x-2">
                {notasTurnos.vespertino ? (
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded text-xs hover:bg-blue-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleEditarNotaTurno("vespertino");
                    }}
                  >
                    Guardar Cambios
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600"
                    onClick={e => {
                      e.stopPropagation();
                      handleGuardarNotaTurno("vespertino");
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
    </div>
  );
};
export default Tallado_Procesos;