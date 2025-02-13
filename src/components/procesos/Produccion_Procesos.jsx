import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteAxios from '../../../config/clienteAxios';
import moment from 'moment-timezone';

const Produccion_Procesos = () => {
  // Estados para los hits y tiempos
  const [totalHits, setTotalHits] = useState(0);
  const [ultimaHora, setUltimaHora] = useState("");
  const [siguienteHora, setSiguienteHora] = useState("");
  const [hitsMatutino, setHitsMatutino] = useState(0);
  const [hitsVespertino, setHitsVespertino] = useState(0);
  const [hitsNocturno, setHitsNocturno] = useState(0);

  // Estados para las metas
  const [meta, setMeta] = useState(0); // Meta en vivo acumulada
  const [metaPorHora, setMetaPorHora] = useState(0); // meta base por hora
  const [metaMatutino, setMetaMatutino] = useState(0);
  const [metaVespertino, setMetaVespertino] = useState(0);
  const [metaNocturno, setMetaNocturno] = useState(0);

  // Función para definir la clase según la comparación de hits vs meta
  const getClassName = (hits, metaTurno) => {
    return hits >= metaTurno ? "text-green-700" : "text-red-700";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener la meta por hora para producción desde '/metas/metas-manuales'
        const responseMetas = await clienteAxios.get('/metas/metas-manuales');
        const metaRegistro = responseMetas.data.registros.find(registro => registro.name === '32 JOB COMPLETE');
        const metaBase = metaRegistro ? metaRegistro.meta : 0;
        setMetaPorHora(metaBase);
        // Definir multiplicadores para cada turno:
        // Aquí puedes ajustar los valores según tu lógica (en Terminado se usan 8, 8 y 7)
        setMetaNocturno(8 * metaBase);
        setMetaMatutino(8 * metaBase);
        setMetaVespertino(7 * metaBase);

        // 2. Obtener los registros y filtrarlos (en este ejemplo se usan registros de producción)
        const responseRegistros = await clienteAxios.get('/manual/manual/actualdia');
        const registros = responseRegistros.data.registros.filter(registro =>
          registro.name.includes('JOB COMPLETE')
        );

        const ahora = moment().tz('America/Mexico_City');
        let inicioNocturno, finNocturno, inicioMatutino, finMatutino, inicioVespertino, finVespertino;

        if (ahora.hour() >= 22) {
          // Nueva jornada: turno nocturno de hoy 22:00 a mañana 06:00 
          // y turnos matutino y vespertino corresponden al día siguiente.
          inicioNocturno = ahora.clone().startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().add(1, 'day').startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().add(1, 'day').startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().add(1, 'day').startOf('day').add(21, 'hours').add(30, 'minutes');
        } else {
          // Jornada actual: turno nocturno de ayer 22:00 a hoy 06:00,
          // y turnos matutino y vespertino corresponden al día actual.
          inicioNocturno = ahora.clone().subtract(1, 'day').startOf('day').add(22, 'hours');
          finNocturno = ahora.clone().startOf('day').add(6, 'hours');
          inicioMatutino = ahora.clone().startOf('day').add(6, 'hours').add(30, 'minutes');
          finMatutino = ahora.clone().startOf('day').add(14, 'hours').add(29, 'minutes');
          inicioVespertino = ahora.clone().startOf('day').add(14, 'hours').add(30, 'minutes');
          finVespertino = ahora.clone().startOf('day').add(21, 'hours').add(30, 'minutes');
        }

        // 3. Filtrar los registros según cada turno
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

        // 4. Sumar los hits por turno
        const sumaHitsNocturno = registrosNocturno.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const sumaHitsMatutino = registrosMatutino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        const sumaHitsVespertino = registrosVespertino.reduce((acc, curr) => acc + parseInt(curr.hits, 10), 0);
        setHitsNocturno(sumaHitsNocturno);
        setHitsMatutino(sumaHitsMatutino);
        setHitsVespertino(sumaHitsVespertino);
        setTotalHits(sumaHitsNocturno + sumaHitsMatutino + sumaHitsVespertino);

        // 5. Calcular la meta en vivo a partir del inicio del turno nocturno
        let horasTranscurridas = 0;
        if (ahora.isAfter(inicioNocturno)) {
          horasTranscurridas = ahora.diff(inicioNocturno, 'hours', true);
        }
        setMeta(Math.round(horasTranscurridas) * metaBase);

        // 6. Obtener el último registro y calcular el corte de la siguiente media hora
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

  return (
    <div className='bg-white p-4 rounded-xl'>
      {/* Enlaces para pantalla grande y chiquita */}
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
      
      {/* FILA SUPERIOR: Último registro, Trabajos y Meta en vivo */}
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Último registro: <span className='font-semibold xs:text-sm md:text-md'>{ultimaHora} - {siguienteHora}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Trabajos: <span className={totalHits >= meta ? "text-green-700" : "text-red-700"}>{totalHits}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Meta en vivo: <span className='font-semibold xs:text-sm md:text-md'>{meta}</span>
        </p>
      </div>
      
      {/* FILA INFERIOR: Hits y metas por turno */}
      <div className='flex items-center justify-between py-4 px-2 border-2'>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Nocturno: <span className={getClassName(hitsNocturno, metaNocturno)}>{hitsNocturno}</span> / <span>{metaNocturno}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Matutino: <span className={getClassName(hitsMatutino, metaMatutino)}>{hitsMatutino}</span> / <span>{metaMatutino}</span>
        </p>
        <p className='font-bold text-gray-700 xs:text-sm md:text-md'>
          Vespertino: <span className={getClassName(hitsVespertino, metaVespertino)}>{hitsVespertino}</span> / <span>{metaVespertino}</span>
        </p>
      </div>
    </div>
  );
};

export default Produccion_Procesos;