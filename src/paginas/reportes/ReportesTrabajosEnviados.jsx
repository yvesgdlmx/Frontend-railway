import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';

const ReportesTrabajosEnviados = () => {
  const [registros, setRegistros] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState('');

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      ahora.setMinutes(35, 0, 0); // Establece la hora al minuto 35
      const horaFormateada = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setUltimaActualizacion(horaFormateada);
    };

    const verificarYActualizar = () => {
      const ahora = new Date();
      const minutos = ahora.getMinutes();
      if (minutos === 35) { // Verifica si es el minuto 35
        actualizarHora();
        window.location.reload();
      }
    };

    actualizarHora(); // Actualiza inmediatamente al cargar
    const intervalo = setInterval(verificarYActualizar, 60000); // Verifica cada minuto
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await clienteAxios.get('/reportes/reportes/enviados');
        setRegistros(respuesta.data.registros); // Accede a la propiedad 'registros'
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    obtenerDatos();
  }, []);

  // Ordenar registros por hora (más reciente primero)
  const registrosOrdenados = [...registros].sort((a, b) => {
    const horaA = a.hora; // Por ejemplo, "16:30:00"
    const horaB = b.hora;
    return horaB.localeCompare(horaA); // Orden descendente (más reciente primero)
  });

  return (
    <>
      <div className='mt-6 md:mt-0'>
        <Heading title="Reportes de Trabajos Enviados" />
      </div>
      <div className="mt-6 lg:mt-0 bg-gray-100 min-h-screen">
        <div className='bg-gray-200 p-4 mb-4 rounded flex justify-between xs:hidden md:flex'>
          <div className='flex gap-1'>
            <img src="/img/clock.png" alt="reloj" width={25} />
            <p className='text-gray-700 font-bold uppercase'>Última actualización: {ultimaActualizacion}</p>
          </div>
          <div>
            <p className='font-medium text-gray-800 uppercase'>Actualización cada hora.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg hidden md:table">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-5 text-left font-semibold">Fecha y Hora</th>
                <th className="py-3 px-5 text-left font-semibold border">Cliente</th>
                <th className="py-3 px-5 text-left font-semibold border">Shipped Jobs</th>
                <th className="py-3 px-5 text-left font-semibold border">Finished Jobs</th>
                <th className="py-3 px-5 text-left font-semibold border">Semi Finished Jobs</th>
              </tr>
            </thead>
            <tbody>
              {registrosOrdenados.map((registro, index) => (
                <tr key={registro.id} className={`border-t border-gray-200 hover:bg-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                  <td className="py-3 px-5 border font-semibold text-gray-500">
                    <div>{registro.fecha}</div>
                    <div className="text-sm text-gray-400">{registro.hora}</div>
                  </td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{registro.cliente}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{registro.shipped_jobs}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{registro.finished_jobs}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{registro.semi_finished_jobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Vista para móviles y pantallas medianas */}
          <div className="md:hidden space-y-4">
            {registrosOrdenados.map((registro) => (
              <div key={registro.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
                <div className="bg-blue-600 text-white p-4">
                  <div className="font-semibold text-lg">{registro.fecha}</div>
                  <div className="text-sm text-white">{registro.hora}</div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-bold text-gray-500">{registro.cliente}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Shipped Jobs:</span>
                    <span className="font-bold text-gray-500">{registro.shipped_jobs}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Finished Jobs:</span>
                    <span className="font-bold text-gray-500">{registro.finished_jobs}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Semi Finished Jobs:</span>
                    <span className="font-bold text-gray-500">{registro.semi_finished_jobs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportesTrabajosEnviados;