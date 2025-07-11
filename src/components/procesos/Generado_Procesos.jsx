import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';
import { formatNumber } from '../../helpers/formatNumber';
const Generado_Procesos = () => {
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
        // 1. Obtener las metas del endpoint y sumarlas por turno
        const responseMetas = await clienteAxios.get('/metas/metas-generadores');
        const sumaMetaNocturno = responseMetas.data.registros.reduce((acc, curr) => acc + curr.meta_nocturno, 0);
        const sumaMetaMatutino = responseMetas.data.registros.reduce((acc, curr) => acc + curr.meta_matutino, 0);
        const sumaMetaVespertino = responseMetas.data.registros.reduce((acc, curr) => acc + curr.meta_vespertino, 0);
        // 2. Obtener los registros del día
        const responseRegistros = await clienteAxios.get('/generadores/generadores/actualdia');
        const registros = responseRegistros.data.registros;
        const ahora = moment().tz('America/Mexico_City');
        // 3. Definir los intervalos horarias de acuerdo a la jornada
        let inicioNocturno, finNocturno;
        let inicioMatutino, finMatutino;
        let inicioVespertino, finVespertino;
        if (ahora.hour() >= 22) {
          // Si es después de las 22:00, la jornada nocturna empieza hoy y se extiende hasta mañana 06:00
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          // Los turnos de mañana se programan para el día siguiente
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Antes de las 22:00: se considera la jornada actual
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(22, 'hours');
        }
        // 4. Filtrar los registros por turno
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
        // 5. Calcular los hits de cada turno
        const hitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const hitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(hitsNocturno);
        setHitsMatutino(hitsMatutino);
        setHitsVespertino(hitsVespertino);
        // Calcular el total de hits
        const total = hitsNocturno + hitsMatutino + hitsVespertino;
        setTotalHits(total);
        // 6. Definir horas fijas de cada turno y asignar las metas totales (usando suma de metas)
        const horasNocturno = 8;
        const horasMatutino = 8;
        const horasVespertino = 7;
        const metaTotalNocturno = horasNocturno * sumaMetaNocturno;
        const metaTotalMatutino = horasMatutino * sumaMetaMatutino;
        const metaTotalVespertino = horasVespertino * sumaMetaVespertino;
        setMetaNocturno(metaTotalNocturno);
        setMetaMatutino(metaTotalMatutino);
        setMetaVespertino(metaTotalVespertino);
        // 7. Calcular la meta en vivo acumulada según en qué turno se encuentre "ahora"
        let metaAcumulada = 0;
        if (ahora.isBetween(inicioNocturno, finNocturno, null, '[)')) {
          // Turno nocturno: calcular horas transcurridas a partir del inicio
          const horasTranscurridasNocturno = ahora.diff(inicioNocturno, 'hours', true);
          metaAcumulada = Math.floor(horasTranscurridasNocturno) * sumaMetaNocturno;
        } else if (ahora.isBetween(inicioMatutino, finMatutino, null, '[)')) {
          // Turno nocturno completado y durante el matutino: se suma la meta completa del nocturno
          metaAcumulada = metaTotalNocturno;
          const horasTranscurridasMatutino = ahora.diff(inicioMatutino, 'hours', true);
          metaAcumulada += Math.floor(horasTranscurridasMatutino) * sumaMetaMatutino;
        } else if (ahora.isBetween(inicioVespertino, finVespertino, null, '[)')) {
          // Turnos nocturno y matutino completados y durante el vespertino: se suman las metas completas de los dos turnos y la parcial del vespertino
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
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, []);
  const getClassName = (hits, meta) => (hits >= meta ? "text-green-700" : "text-red-700");
  return (
    <div className='bg-white p-4 rounded-xl'>
      <Link to='/totales_estacion#generado' className='hidden lg:block'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Generadores</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <Link to='/totales_estacion?seccion=generado' className='block lg:hidden'>
        <div className='bg-blue-500 p-2 mb-2 flex items-center justify-between'>
          <h2 className='text-white font-bold uppercase'>Generadores</h2>
          <img
            src="/img/arrow.png"
            alt="ver"
            width={25}
            style={{ filter: 'invert(100%)' }}
            className='relative'
          />
        </div>
      </Link>
      <p className='font-light mb-2'>Mostrando información del área de generado.</p>
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
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>{formatNumber(hitsNocturno)}</span> / <span>{formatNumber(metaNocturno)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>{formatNumber(hitsMatutino)}</span> / <span>{formatNumber(metaMatutino)}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>{formatNumber(hitsVespertino)}</span> / <span>{formatNumber(metaVespertino)}</span>
        </p>
      </div>
    </div>
  );
};
export default Generado_Procesos;