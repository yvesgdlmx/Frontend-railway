import React, { useState, useEffect } from 'react';

const Actualizacion = () => {
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');
  const actualizarHora = () => {
    const ahora = new Date();
    const minutos = ahora.getMinutes();
    let fechaActualizacion = new Date(ahora);
    if (minutos < 35) {
      // Si aún no se ha alcanzado el minuto 35, la última actualización fue la hora anterior a los 35
      fechaActualizacion.setHours(ahora.getHours() - 1);
      fechaActualizacion.setMinutes(35, 0, 0);
    } else {
      // Si pasó el minuto 35, la actualización es en esta misma hora (en el minuto 35)
      fechaActualizacion.setMinutes(35, 0, 0);
    }
    const horaFormateada = fechaActualizacion.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setUltimaActualizacion(horaFormateada);
  };
  useEffect(() => {
    actualizarHora();
    const intervalo = setInterval(() => {
      const ahora = new Date();
      if (ahora.getMinutes() === 35) {
        actualizarHora();
        window.location.reload();
      }
    }, 60000);
    return () => clearInterval(intervalo);
  }, []);
  return (
    <div className="bg-gray-200 p-4 mb-4 rounded flex justify-between xs:hidden md:flex">
      <div className="flex gap-1">
        <img src="/img/clock.png" alt="reloj" width={25} />
        <p className="text-gray-700 font-bold uppercase">
          Última actualización: {ultimaActualizacion}
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-800 uppercase">
          Actualización cada hora.
        </p>
      </div>
    </div>
  );
};
export default Actualizacion;