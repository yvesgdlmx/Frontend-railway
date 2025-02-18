import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../helpers/formatNumber';

const Desbloqueo_Procesos = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se obtienen las metas desde '/metas/metas-manuales'
        // y se filtran los registros cuyo nombre incluya "DEBLOCKING"
        const responseMetas = await clienteAxios.get('/metas/metas-manuales');
        const metasDesbloqueo = responseMetas.data.registros.filter(registro =>
          registro.name.includes('DEBLOCKING')
        );
        const sumaMetas = metasDesbloqueo.reduce((acc, curr) => acc + curr.meta, 0);

        // Se obtienen los registros desde '/manual/manual/actualdia'
        // filtrando los que contengan "DEBLOCKING"
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const registros = responseRegistros.data.registros.filter(registro =>
          registro.name.includes('DEBLOCKING')
        );

        const ahora = moment().tz('America/Mexico_City');
        // Definir los límites de los turnos según la jornada actual
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Nueva jornada: turno nocturno de hoy 22:00 a mañana 06:00
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Los turnos matutino y vespertino pertenecen al día siguiente
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual: turno nocturno de ayer 22:00 hasta hoy 06:00
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(21, 'hours').add(30, 'minutes');
        }

        // Filtrar registros para cada turno
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

        // Calcular los hits para cada turno
        const hitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(hitsNocturno);
        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
        const total = hitsNocturno + hitsMatutino + hitsVespertino;
        setTotalHits(total);

        // Calcular las metas para cada turno (horas fijas: nocturno y matutino = 8; vespertino = 7)
        const horasNocturno = 8,
          horasMatutino = 8,
          horasVespertino = 7;
        setMetaNocturno(horasNocturno * sumaMetas);
        setMetaMatutino(horasMatutino * sumaMetas);
        setMetaVespertino(horasVespertino * sumaMetas);

        // Calcular la meta en vivo en función de las horas transcurridas desde el inicio del turno nocturno
        const horasTranscurridas = ahora.isAfter(inicioNocturno)
          ? ahora.diff(inicioNocturno, 'hours', true)
          : 0;
        setMeta(Math.round(horasTranscurridas) * sumaMetas);

        // Obtener el último registro para determinar la siguiente ventana de 30 minutos
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
  
  const getClassName = (hits, meta) => {
    return hits >= meta ? "text-green-700" : "text-red-700";
  };

  return (
    <div className='bg-white p-4 rounded-xl'>
      {/* Enlace para pantallas grandes */}
      <Link to='/totales_estacion#desbloqueo' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Desbloqueo</h2>
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
      <Link to='/totales_estacion?seccion=desbloqueo' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Desbloqueo</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de desbloqueo.</p>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos:{' '}
          <span className={meta > totalHits ? "text-red-700" : "text-green-700"}>
            {formatNumber(totalHits)}
          </span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Meta en vivo:{' '}
          <span className='font-semibold xs:text-sm md:text-md'>
            {formatNumber(meta)}
          </span>
        </p>
      </div>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Nocturno:{' '}
          <span className={getClassName(hitsNocturno, metaNocturno)}>
            {formatNumber(hitsNocturno)}
          </span>{' '}
          / <span>{formatNumber(metaNocturno)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Matutino:{' '}
          <span className={getClassName(hitsMatutino, metaMatutino)}>
            {formatNumber(hitsMatutino)}
          </span>{' '}
          / <span>{formatNumber(metaMatutino)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Vespertino:{' '}
          <span className={getClassName(hitsVespertino, metaVespertino)}>
            {formatNumber(hitsVespertino)}
          </span>{' '}
          / <span>{formatNumber(metaVespertino)}</span>
        </p>
      </div>
    </div>
  );
};

export default Desbloqueo_Procesos;