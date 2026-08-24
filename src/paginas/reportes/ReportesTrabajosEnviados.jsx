import { useEffect, useMemo, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';
import { formatNumber } from '../../helpers/formatNumber';
import Actualizacion from '../../components/others/Actualizacion';

const ReportesTrabajosEnviados = () => {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await clienteAxios.get('/reportes/reportes/enviados');
        setRegistros(respuesta.data.registros);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    obtenerDatos();
  }, []);

  const obtenerValorPorHora = (actual, anterior) => {
    const valorActual = Number(actual) || 0;
    const valorAnterior = Number(anterior) || 0;
    const diferencia = valorActual - valorAnterior;

    return diferencia >= 0 ? diferencia : valorActual;
  };

  const registrosOrdenados = useMemo(() => {
    const ultimosAcumulados = new Map();
    const registrosConTotalesPorHora = [...registros]
      .sort((a, b) => {
        const fechaHoraA = `${a.fecha} ${a.hora}`;
        const fechaHoraB = `${b.fecha} ${b.hora}`;

        return fechaHoraA.localeCompare(fechaHoraB);
      })
      .map((registro) => {
        const llaveRegistro = `${registro.fecha}-${registro.cliente}`;
        const acumuladoAnterior = ultimosAcumulados.get(llaveRegistro) || {};
        const registroConTotales = {
          ...registro,
          shipped_jobs_hora: obtenerValorPorHora(registro.shipped_jobs, acumuladoAnterior.shipped_jobs),
          finished_jobs_hora: obtenerValorPorHora(registro.finished_jobs, acumuladoAnterior.finished_jobs),
          semi_finished_jobs_hora: obtenerValorPorHora(registro.semi_finished_jobs, acumuladoAnterior.semi_finished_jobs),
        };

        ultimosAcumulados.set(llaveRegistro, registro);
        return registroConTotales;
      });

    // Ordenar registros por fecha y hora (más reciente primero)
    return registrosConTotalesPorHora.sort((a, b) => {
      const fechaHoraA = `${a.fecha} ${a.hora}`;
      const fechaHoraB = `${b.fecha} ${b.hora}`;

      return fechaHoraB.localeCompare(fechaHoraA);
    });
  }, [registros]);

  return (
    <>
      <div className='mt-6 md:mt-0'>
        <Heading title="Reportes de Trabajos Enviados" />
      </div>
      <div className="mt-6 lg:mt-0 bg-gray-100 min-h-screen">
        <Actualizacion/>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg hidden md:table">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-3 px-5 text-left font-semibold">Fecha y Hora</th>
                <th className="py-3 px-5 text-left font-semibold border">Cliente</th>
                <th className="py-3 px-5 text-left font-semibold border">Trabajos Enviados</th>
                <th className="py-3 px-5 text-left font-semibold border">Trabajos Enviados (F)</th>
                <th className="py-3 px-5 text-left font-semibold border">Trabajos Enviados (SF)</th>
                <th className="py-3 px-5 text-left font-semibold border">Trabajos Enviados por Hora</th>
                <th className="py-3 px-5 text-left font-semibold border">Trabajos Enviados por Hora (F)</th>
                <th className="py-3 px-5 text-left font-semibold border">Trabajos Enviados por Hora (SF)</th>
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
                  <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.shipped_jobs)}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.finished_jobs)}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.semi_finished_jobs)}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.shipped_jobs_hora)}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.finished_jobs_hora)}</td>
                  <td className="py-3 px-5 border font-semibold text-gray-500">{formatNumber(registro.semi_finished_jobs_hora)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-bold text-gray-500">{registro.cliente}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Trabajos Enviados:</span>
                    <span className="font-bold text-gray-500">{formatNumber(registro.shipped_jobs)}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Trabajos Enviados (F):</span>
                    <span className="font-bold text-gray-500">{formatNumber(registro.finished_jobs)}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Trabajos Enviados (SF):</span>
                    <span className="font-bold text-gray-500">{formatNumber(registro.semi_finished_jobs)}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Trabajos Enviados por Hora:</span>
                    <span className="font-bold text-gray-500">{formatNumber(registro.shipped_jobs_hora)}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Trabajos Enviados por Hora (F):</span>
                    <span className="font-bold text-gray-500">{formatNumber(registro.finished_jobs_hora)}</span>
                  </div>
                  <div className="border-b border-gray-200 pb-2 flex justify-between">
                    <span className="text-gray-600">Trabajos Enviados por Hora (SF):</span>
                    <span className="font-bold text-gray-500">{formatNumber(registro.semi_finished_jobs_hora)}</span>
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
