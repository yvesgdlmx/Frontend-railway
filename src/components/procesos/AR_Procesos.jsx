import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../helpers/formatNumber';

const AR_Procesos = () => {
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  const [hitsNocturno, setHitsNocturno] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener registros del área AR: se filtran los que tengan un número en el nombre entre 52 y 56
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const registros = responseRegistros.data.registros.filter(registro => {
          const num = parseInt(registro.name.split(' ')[0], 10);
          return num >= 52 && num <= 56;
        });

        const ahora = moment().tz('America/Mexico_City');
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
  
        // Si ya es igual o mayor a las 22:00 se usa la nueva jornada,
        // de lo contrario, se toma la jornada actual.
        if (ahora.hour() >= 22) {
          // Nueva jornada: turno nocturno va de hoy 22:00 a mañana 06:00.
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Turnos matutino y vespertino para el día siguiente.
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual: turno nocturno se define de ayer 22:00 a hoy 06:00.
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
  
        // Filtrar registros de cada turno según su fecha y hora
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
  
        // Calcular hits para cada turno
        const hitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
  
        setHitsNocturno(hitsNocturno);
        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
  
        // Total de hits
        const total = hitsNocturno + hitsMatutino + hitsVespertino;
        setTotalHits(total);
  
        // Se obtiene el último registro para definir el intervalo de corte de media hora
        const ultimoRegistro = registros.reduce((ultimo, actual) => {
          const horaActual = moment.tz(`${actual.fecha} ${actual.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return horaActual.isAfter(
            moment.tz(`${ultimo.fecha} ${ultimo.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City')
          ) ? actual : ultimo;
        }, registros[0]);
  
        const formattedLastHour = moment.tz(`${ultimoRegistro.fecha} ${ultimoRegistro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
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
  
  return (
    <div className='bg-white p-4 rounded-xl'>
      <Link to='/totales_estacion#ar' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>AR</h2>
          <img src='/img/arrow.png' alt='ver' width={25} style={{ filter: 'invert(100%)' }} className='relative' />
        </div>
      </Link>
      <Link to='/totales_estacion?seccion=ar' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>AR</h2>
          <img src='/img/arrow.png' alt='ver' width={25} style={{ filter: 'invert(100%)' }} className='relative' />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de AR.</p>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos: <span className='font-semibold text-red-700 xs:text-sm md:text-md'>{formatNumber(totalHits)}</span>
        </p>
      </div>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Nocturno: <span className='font-semibold text-green-700 xs:text-sm md:text-md'>{formatNumber(hitsNocturno)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Matutino: <span className='font-semibold text-red-700 xs:text-sm md:text-md'>{formatNumber(hitsMatutino)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Vespertino: <span className='font-semibold text-red-700 xs:text-sm md:text-md'>{formatNumber(hitsVespertino)}</span>
        </p>
      </div>
    </div>
  );
};

export default AR_Procesos;