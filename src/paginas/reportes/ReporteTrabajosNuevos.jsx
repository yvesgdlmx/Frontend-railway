import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';
import { formatNumber } from '../../helpers/formatNumber';
import Actualizacion from '../../components/others/Actualizacion';

const ReporteTrabajosNuevos = () => {
  const [registros, setRegistros] = useState([]);

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

  // Calcular los totales
  const calcularTotales = () => {
    return registros.reduce((totales, registro) => {
      return {
        total_new_jobs: totales.total_new_jobs + registro.total_new_jobs,
        ink_jobs: totales.ink_jobs + registro.ink_jobs,
        ink_no_ar: totales.ink_no_ar + registro.ink_no_ar,
        ink_ar: totales.ink_ar + registro.ink_ar,
        hoya_jobs: totales.hoya_jobs + registro.hoya_jobs,
        hoya_no_ar: totales.hoya_no_ar + registro.hoya_no_ar,
        hoya_ar: totales.hoya_ar + registro.hoya_ar,
        nvi_jobs: totales.nvi_jobs + registro.nvi_jobs,
        nvi_no_ar: totales.nvi_no_ar + registro.nvi_no_ar,
        nvi_ar: totales.nvi_ar + registro.nvi_ar,
      };
    }, {
      total_new_jobs: 0,
      ink_jobs: 0,
      ink_no_ar: 0,
      ink_ar: 0,
      hoya_jobs: 0,
      hoya_no_ar: 0,
      hoya_ar: 0,
      nvi_jobs: 0,
      nvi_no_ar: 0,
      nvi_ar: 0,
    });
  };

  const totales = calcularTotales();

  // Ordenar registros por hora (más reciente primero)
  const registrosOrdenados = [...registros].sort((a, b) => {
    const horaA = a.hora; // Por ejemplo, "06:30:00"
    const horaB = b.hora;

    // Comparar las horas como cadenas de texto directamente, ya que están en formato HH:mm:ss
    return horaB.localeCompare(horaA); // Orden descendente (más reciente primero)
  });

  return (
    <>
    <div className='mt-6 md:mt-0'>
      <Heading title="Reporte trabajos nuevos" />
    </div>
    <div className="mt-6 lg:mt-0 bg-gray-100 min-h-screen">
      <Actualizacion/>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg hidden md:table">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-3 px-5 text-left font-semibold">Fecha y Hora</th>
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
            {registrosOrdenados.map((registro, index) => (
              <tr key={registro.id} className={`border-t border-gray-200 hover:bg-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                <td className="py-3 px-5 border font-semibold text-gray-500">
                  <div>{registro.fecha}</div>
                  <div className="text-sm text-gray-400">{registro.hora}</div>
                </td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.total_new_jobs)}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.ink_jobs}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.ink_no_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.ink_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.hoya_jobs}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.hoya_no_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{registro.hoya_ar}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.nvi_jobs)}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.nvi_no_ar)}</td>
                <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.nvi_ar)}</td>
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
          {registrosOrdenados.map((registro) => (
            <div key={registro.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
              <div className="bg-blue-500 text-white p-4">
                <div className="font-semibold text-lg">{registro.fecha}</div>
                <div className="text-sm text-white">{registro.hora}</div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Total New Jobs:</span>
                  <span className="font-bold text-gray-500">{formatNumber(registro.total_new_jobs)}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Ink Jobs:</span>
                  <span className="font-bold text-gray-500">{registro.ink_jobs}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Ink No AR:</span>
                  <span className="font-bold text-gray-500">{registro.ink_no_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Ink AR:</span>
                  <span className="font-bold text-gray-500">{registro.ink_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Hoya Jobs:</span>
                  <span className="font-bold text-gray-500">{registro.hoya_jobs}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Hoya No AR:</span>
                  <span className="font-bold text-gray-500">{registro.hoya_no_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">Hoya AR:</span>
                  <span className="font-bold text-gray-500">{registro.hoya_ar}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">NVI Jobs:</span>
                  <span className="font-bold text-gray-500">{formatNumber(registro.nvi_jobs)}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">NVI No AR:</span>
                  <span className="font-bold text-gray-500">{formatNumber(registro.nvi_no_ar)}</span>
                </div>
                <div className="border-b border-gray-200 pb-2 flex justify-between">
                  <span className="text-gray-600">NVI AR:</span>
                  <span className="font-bold text-gray-500">{formatNumber(registro.nvi_ar)}</span>
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

export default ReporteTrabajosNuevos;
