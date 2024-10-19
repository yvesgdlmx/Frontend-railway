import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';

const Surtido_procesos = () => {
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
        const responseMetas = await clienteAxios.get('/metas/metas-manuales');
        const metasLensLog = responseMetas.data.registros.filter(registro => registro.name.includes('LENS LOG'));
        const sumaMetas = metasLensLog.reduce((acc, curr) => acc + curr.meta, 0);
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const registros = responseRegistros.data.registros.filter(registro => registro.name.includes('LENS LOG'));

        // Obtener la fecha y hora actual
        const ahora = moment().tz('America/Mexico_City');

        // Determinar el inicio y fin del período de interés
        let inicioHoy = moment().tz('America/Mexico_City').startOf('day').add(6, 'hours').add(29, 'minutes');
        let finHoy = moment(inicioHoy).add(1, 'days');

        // Si la hora actual es antes de las 06:29, ajustar al día anterior
        if (ahora.isBefore(inicioHoy)) {
          inicioHoy.subtract(1, 'days');
          finHoy.subtract(1, 'days');
        }

        // Filtrar los registros del día actual en el intervalo de 06:29 a 06:29
        const registrosFiltrados = registros.filter(registro => {
          const fechaHoraRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return fechaHoraRegistro.isBetween(inicioHoy, finHoy, null, '[)');
        });

        const total = registrosFiltrados.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setTotalHits(total);

        // Calcular la última hora dentro del rango actual
        const ultimoRegistro = registrosFiltrados.reduce((ultimo, actual) => {
          const horaActual = moment.tz(`${actual.fecha} ${actual.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return horaActual.isAfter(moment.tz(`${ultimo.fecha} ${ultimo.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City')) ? actual : ultimo;
        }, registrosFiltrados[0]);
        
        const formattedLastHour = moment.tz(`${ultimoRegistro.fecha} ${ultimoRegistro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
        setUltimaHora(formattedLastHour.format('HH:mm'));

        const horaFinal = moment(formattedLastHour);
        horaFinal.add(30 - (horaFinal.minute() % 30), 'minutes');
        const horasTranscurridas = horaFinal.diff(inicioHoy, 'hours', true);
        setMeta(Math.round(horasTranscurridas) * sumaMetas);

        const siguienteHoraDate = moment(horaFinal).add(30, 'minutes');
        setSiguienteHora(siguienteHoraDate.format('HH:mm'));

        // Calcular los hits por turno
        const hitsMatutino = registrosFiltrados.filter(registro => {
          const horaRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return horaRegistro.isBetween(inicioHoy, inicioHoy.clone().add(8, 'hours'));
        }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);

        const hitsVespertino = registrosFiltrados.filter(registro => {
          const horaRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return horaRegistro.isBetween(inicioHoy.clone().add(8, 'hours'), inicioHoy.clone().add(15, 'hours'));
        }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);

        const hitsNocturno = registrosFiltrados.filter(registro => {
          const horaRegistro = moment.tz(`${registro.fecha} ${registro.hour}`, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');
          return horaRegistro.isBetween(inicioHoy.clone().add(15, 'hours'), finHoy);
        }).reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);

        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
        setHitsNocturno(hitsNocturno);

        const horasMatutino = 8; // 8 horas para el turno matutino
        const horasVespertino = 7; // 7 horas para el turno vespertino
        const horasNocturno = 9; // 8 horas para el turno nocturno
        setMetaMatutino(horasMatutino * sumaMetas);
        setMetaVespertino(horasVespertino * sumaMetas);
        setMetaNocturno(horasNocturno * sumaMetas);
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
      <Link to={'/totales_estacion'}>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Surtido</h2>
          <img src="/img/arrow.png" alt="ver" width={25} style={{ filter: 'invert(100%)' }} className='relative' />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de surtido.</p>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span></p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>Trabajos: <span className={meta > totalHits ? "text-red-700" : "text-green-700"}>{totalHits}</span></p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>Meta: <span className='font-semibold xs:text-sm md:text-md'>{meta}</span></p>
      </div>
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>{hitsMatutino}</span></p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>{hitsVespertino}</span></p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>{hitsNocturno}</span></p>
      </div>
    </div>
  );
};

export default Surtido_procesos;