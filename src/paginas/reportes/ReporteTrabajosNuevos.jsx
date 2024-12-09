import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';

const ReporteTrabajosNuevos = () => {
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
        const respuesta = await clienteAxios.get('/reportes/reportes/nuevos');
        setRegistros(respuesta.data.registros); // Accede a la propiedad 'registros'
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    obtenerDatos();
  }, []);

  return (
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
              <th className="py-3 px-5 text-left font-semibold">Fecha</th>
              <th className="py-3 px-5 text-left font-semibold border">Total New Jobs</th>
              <th className="py-3 px-5 text-left font-semibold border">Ink Jobs</th>
              <th className="py-3 px-5 text-left font-semibold border">Ink No AR</th>
              <th className="py-3 px-5 text-left font-semibold border">Ink AR</th>
              <th className="py-3 px-5 text-left font-semibold border">Hoya Jobs</th>
              <th className="py-3 px-5 text-left font-semibold border">Hoya No AR</th>
              <th className="py-3 px-5 text-left font-semibold border">Hoya AR</th>
              <th className="py-3 px-5 text-left font-semibold border">NVI Jobs</th>
              <th className="py-3 px-5 text-left font-semibold border">NVI No AR</th>
              <th className="py-3 px-5 text-left font-semibold border">NVI AR</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro, index) => (
              <tr key={registro.id} className={`border-t border-gray-200 hover:bg-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                <td className="py-3 px-5 border font-semibold text-gray-500">{`${registro.fecha} / ${registro.hora}`}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.total_new_jobs}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.ink_jobs}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.ink_no_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.ink_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.hoya_jobs}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.hoya_no_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.hoya_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.nvi_jobs}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.nvi_no_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.nvi_ar}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hidden lg:block mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Notas importantes: </h3>
          <p className="text-gray-600">
            Este reporte se actualiza automáticamente cada hora al minuto 35.
          </p>
          <p className='text-gray-600'>
            Este reporte muestra los trabajos nuevos recibidos cada hora.
          </p>
        </div>
        {/* Vista para móviles y pantallas medianas */}
        <div className="md:hidden space-y-4">
          {registros.map((registro) => (
            <div key={registro.id} className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-blue-600 text-white p-4">
                <div className="font-semibold">Fecha: {`${registro.fecha} / ${registro.hora}`}</div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Total New Jobs:</span>
                  <span className="font-bold text-gray-700">{registro.total_new_jobs}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Ink Jobs:</span>
                  <span className="font-bold text-gray-700">{registro.ink_jobs}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Ink No AR:</span>
                  <span className="font-bold text-gray-700">{registro.ink_no_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Ink AR:</span>
                  <span className="font-bold text-gray-700">{registro.ink_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Hoya Jobs:</span>
                  <span className="font-bold text-gray-700">{registro.hoya_jobs}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Hoya No AR:</span>
                  <span className="font-bold text-gray-700">{registro.hoya_no_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Hoya AR:</span>
                  <span className="font-bold text-gray-700">{registro.hoya_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">NVI Jobs:</span>
                  <span className="font-bold text-gray-700">{registro.nvi_jobs}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">NVI No AR:</span>
                  <span className="font-bold text-gray-700">{registro.nvi_no_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">NVI AR:</span>
                  <span className="font-bold text-gray-700">{registro.nvi_ar}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReporteTrabajosNuevos;