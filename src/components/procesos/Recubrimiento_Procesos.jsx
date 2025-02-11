import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';

const Recubrimiento_Procesos = () => {
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  const [hitsNocturno, setHitsNocturno] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se obtienen los registros del endpoint y se filtran con base en los números definidos para Recubrimiento (60 y 61)
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const numerosFiltrados = [60, 61];
        const registros = responseRegistros.data.registros.filter(registro => {
          const num = parseInt(registro.name.split(' ')[0], 10);
          return numerosFiltrados.includes(num);
        });
        
        const ahora = moment().tz('America/Mexico_City');
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;
        
        if (ahora.hour() >= 22) {
          // Nueva jornada: turno nocturno va de hoy 22:00 a mañana 06:00.
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Los turnos matutino y vespertino corresponden al día siguiente.
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual: turno nocturno de ayer 22:00 hasta hoy 06:00.
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(21, 'hours').add(30, 'minutes');
        }
        
        // Se filtran los registros según cada turno usando la fecha y hora del registro
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
        
        // Obtener el último registro para calcular el próximo corte de 30 minutos
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
        
        // Calcular el siguiente corte en bloques de 30 minutos
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
      {/* Enlace para pantallas grandes */}
      <Link to='/totales_estacion#recubrimiento' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Recubrimiento</h2>
          <img 
            src='/img/arrow.png' 
            alt='ver' 
            width={25} 
            style={{ filter: 'invert(100%)' }} 
            className='relative'
          />
        </div>
      </Link>
      {/* Enlace para pantallas pequeñas y medianas */}
      <Link to='/totales_estacion?seccion=recubrimiento' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Recubrimiento</h2>
          <img 
            src='/img/arrow.png' 
            alt='ver' 
            width={25} 
            style={{ filter: 'invert(100%)' }} 
            className='relative'
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de Recubrimiento.</p>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos: <span className='font-semibold text-red-700 xs:text-sm md:text-md'>{totalHits}</span>
        </p>
      </div>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Nocturno: <span className='font-semibold text-green-700 xs:text-sm md:text-md'>{hitsNocturno}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Matutino: <span className='font-semibold text-red-700 xs:text-sm md:text-md'>{hitsMatutino}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Vespertino: <span className='font-semibold text-red-700 xs:text-sm md:text-md'>{hitsVespertino}</span>
        </p>
      </div>
    </div>
  );
};

export default Recubrimiento_Procesos;