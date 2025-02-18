import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../helpers/formatNumber';

const Pulido_Procesos = () => {
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
        const responseMetas = await clienteAxios.get('/metas/metas-pulidos');
        const sumaMetas = responseMetas.data.registros.reduce((acc, curr) => acc + curr.meta, 0);
        const responseRegistros = await clienteAxios.get('/pulido/pulido/actualdia');
        const registros = responseRegistros.data.registros;
        const ahora = moment().tz('America/Mexico_City');

        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;

        // Si la hora actual es 22:00 o mayor, se inicia la nueva jornada
        if (ahora.hour() >= 22) {
          // Turno nocturno: hoy 22:00 hasta mañana 06:00
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Turno matutino: mañana 06:30 hasta mañana 14:29
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          // Turno vespertino: mañana 14:30 hasta mañana 21:30
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual
          // Turno nocturno: ayer 22:00 hasta hoy 06:00
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          // Turno matutino: hoy 06:30 hasta hoy 14:29
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          // Turno vespertino: hoy 14:30 hasta hoy 21:30
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(21, 'hours').add(30, 'minutes');
        }

        // Filtrar registros por turno
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

        // Calcular hits de cada turno
        const hitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);

        setHitsNocturno(hitsNocturno);
        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
        setTotalHits(hitsNocturno + hitsMatutino + hitsVespertino);

        // Calcular metas para cada turno
        const horasNocturno = 8;
        const horasMatutino = 8;
        const horasVespertino = 7;

        setMetaNocturno(horasNocturno * sumaMetas);
        setMetaMatutino(horasMatutino * sumaMetas);
        setMetaVespertino(horasVespertino * sumaMetas);

        // Calcular la meta en vivo a partir del inicio del turno nocturno
        const horasTranscurridas = ahora.isAfter(inicioNocturno)
          ? ahora.diff(inicioNocturno, 'hours', true)
          : 0;
        setMeta(Math.round(horasTranscurridas) * sumaMetas);

        // Obtener el último registro disponible
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

        // Calcular la siguiente media hora para determinar el corte
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
      <Link to='/totales_estacion#pulido' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Pulido</h2>
          <img src="/img/arrow.png" alt="ver" width={25} style={{ filter: 'invert(100%)' }} className='relative' />
        </div>
      </Link>
      {/* Enlace para pantallas pequeñas y medianas */}
      <Link to='/totales_estacion?seccion=pulido' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Pulido</h2>
          <img src="/img/arrow.png" alt="ver" width={25} style={{ filter: 'invert(100%)' }} className='relative' />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de Pulido.</p>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>
            {ultimaHora} - {siguienteHora}
          </span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos: <span className={meta > totalHits ? "text-red-700" : "text-green-700"}>
            {formatNumber(totalHits)}
          </span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Meta en vivo: <span className='font-semibold xs:text-sm md:text-md'>{formatNumber(meta)}</span>
        </p>
      </div>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>
            {formatNumber(hitsNocturno)}
          </span> / <span>{formatNumber(metaNocturno)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>
            {formatNumber(hitsMatutino)}
          </span> / <span>{formatNumber(metaMatutino)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>
            {formatNumber(hitsVespertino)}
          </span> / <span>{formatNumber(metaVespertino)}</span>
        </p>
      </div>
    </div>
  );
};

export default Pulido_Procesos;