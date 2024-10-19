import React, { useState, useEffect } from 'react';
import Generado_Procesos from '../components/procesos/Generado_Procesos';
import Surtido_procesos from '../components/procesos/Surtido_procesos';
import Tallado_Procesos from '../components/procesos/Tallado_Procesos';
import Pulido_Procesos from '../components/procesos/Pulido_Procesos';
import Engraver_Procesos from '../components/procesos/Engraver_Procesos';
import AR_Procesos from '../components/procesos/AR_Procesos';
import Desbloqueo_Procesos from '../components/procesos/Desbloqueo_Procesos';
import Terminado_Procesos from '../components/procesos/Terminado_Procesos';
import Biselado_Procesos from '../components/procesos/Biselado_Procesos';
import Produccion_Procesos from '../components/procesos/Produccion_Procesos';

const Procesos = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 300000); // Actualiza cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  const [ultimaActualizacion, setUltimaActualizacion] = useState('');

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      const minutos = ahora.getMinutes();
      const minutosRedondeados = Math.floor(minutos / 15) * 15 + 5;
      ahora.setMinutes(minutosRedondeados, 0, 0);
      const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setUltimaActualizacion(horaFormateada);
    };
  
    actualizarHora();
    const intervalo = setInterval(() => {
      actualizarHora();
      window.location.reload();
    }, 15 * 60 * 1000); // Actualiza cada 15 minutos
  
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div>
      <div className='bg-gray-200 p-4 mb-4 rounded flex justify-between xs:hidden md:flex'>
        <div className='flex gap-1'>
          <img src="/img/clock.png" alt="clock" width={25}/>
          <p className='text-gray-700 font-bold uppercase'>Última actualización: {ultimaActualizacion}</p>
        </div>
        <div>
          <p className='font-medium text-gray-800 uppercase'>Actualización cada 15 minutos.</p>
        </div>
      </div>
      <div className='grid md:grid-cols-1 lg:grid-cols-2 gap-2 mt-6'>
        <Surtido_procesos />
        <Tallado_Procesos />
        <Generado_Procesos />
        <Pulido_Procesos />
        <Engraver_Procesos />
        <AR_Procesos />
        <Desbloqueo_Procesos />
        <Terminado_Procesos />
        <Biselado_Procesos />
        <Produccion_Procesos />
      </div>
    </div>
  );
};

export default Procesos;