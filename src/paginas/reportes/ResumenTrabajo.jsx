import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Heading from '../../components/others/Heading';
import formatearHora from '../../../helpers/formatearHora';
import Actualizacion from '../../components/others/Actualizacion';

const ResumenTrabajo = () => {
  const [datosAPI, setDatosAPI] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [dia, setDia] = useState(new Date().getDate());

  const formatNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
      return '0';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      // Reiniciamos el estado para evitar mostrar datos previos
      setDatosAPI([]);
      try {
        const response = await clienteAxios.get(`/reportes/reportes/resumen/${anio}/${mes}/${dia}`);
        console.log('Datos originales:', response.data.resumenDia);
        // Verificamos que la respuesta tenga datos
        if (!response.data.resumenDia || response.data.resumenDia.length === 0) {
          setDatosAPI([]);
          return;
        }
        const datosAgrupados = agruparPorHora(response.data.resumenDia);
        // Ordenamos los datos por hora de forma descendente
        datosAgrupados.sort((a, b) => b.hora.localeCompare(a.hora));
        console.log('Datos agrupados y ordenados:', datosAgrupados);
        setDatosAPI(datosAgrupados);
      } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
      }
    };

    obtenerDatos();
  }, [anio, mes, dia]);

  const agruparPorHora = (resumenDia) => {
    const datosPorHora = resumenDia.reduce((acc, item) => {
      const hora = item.hora_insercion;
      if (!acc[hora]) {
        acc[hora] = [];
      }
      acc[hora].push(item);
      return acc;
    }, {});
    return Object.keys(datosPorHora).map(hora => ({
      hora,
      datos: datosPorHora[hora]
    }));
  };

  const toggleExpansion = (hora) => {
    setExpandidos((prev) => ({
      ...prev,
      [hora]: !prev[hora]
    }));
  };

  // Construimos la fecha a partir de los filtros seleccionados
  const fechaFormateada = format(new Date(anio, mes - 1, dia), "EEEE d 'de' MMMM 'del' yyyy", { locale: es });
  const fechaCapitalizada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

  return (
    <>
      <div className='mt-4 md:mt-0'>
        <Heading title="Reporte Resumen de trabajos" />
      </div>
      <Actualizacion/>
      <div className="min-h-screen bg-gray-50">
        <div className='py-6 px-4 sm:px-6 lg:px-8'>
          <div className="flex justify-center space-x-4 mt-4">
            <select
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg p-2"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={2025 - i}>{2025 - i}</option>
              ))}
            </select>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg p-2"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              value={dia}
              onChange={(e) => setDia(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg p-2"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {datosAPI.length === 0 ? (
            <div className="mt-8 mx-auto text-center text-red-600 font-semibold text-xl">
              No hay registros disponibles para la fecha {fechaCapitalizada}
            </div>
          ) : (
            <div className="mt-8 mx-auto space-y-6">
              {datosAPI.map((bloque) => (
                <div
                  key={bloque.hora}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-3 px-6">
                    <span className="text-white text-lg font-medium">{fechaCapitalizada}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h3 className="text-2xl font-bold text-gray-500">
                          Resumen General - {formatearHora(bloque.hora)}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md">
                            <span className="font-semibold">{formatearHora(bloque.hora)} hrs</span>
                          </div>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            onClick={() => toggleExpansion(bloque.hora)}
                          >
                            {expandidos[bloque.hora] ? (
                              <ChevronUpIcon className="h-6 w-6 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="h-6 w-6 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-6">
                        <div className="bg-yellow-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">NVI En Proceso</span>
                          <div className="text-2xl font-bold text-yellow-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce((acc, curr) => acc + curr.nvi_en_proceso, 0)
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">No Surtido Terminado</span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce((acc, curr) => acc + curr.no_surtido_term, 0)
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">No Surtido Semiterminado</span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce((acc, curr) => acc + curr.no_surtido_ster, 0)
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">Surtido Terminado</span>
                          <div className="text-2xl font-bold text-green-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce((acc, curr) => acc + curr.surtido_term, 0)
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">Surtido Semiterminado</span>
                          <div className="text-2xl font-bold text-green-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce((acc, curr) => acc + curr.surtido_ster, 0)
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          expandidos[bloque.hora]
                            ? 'opacity-100 max-h-screen'
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr className="text-center">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Fecha
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI En Proceso
                                </th>
                                {/* Columna "NVI F/S" eliminada */}
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI Total Term
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI Total Ster
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  No Surtido Terminado
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  No Surtido Semiterminado
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Surtido Terminado
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Surtido Semiterminado
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI AR Term
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI AR Semi
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI Sin Ar
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI SinAR Term
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  NVI SinAR Semi
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bloque.datos.map((fila, index) => (
                                <tr
                                  key={`${fila.fecha}-${index}`}
                                  className={`text-center transition-colors duration-150 hover:bg-gray-50 ${
                                    index % 2 === 0 ? 'bg-gray-50' : ''
                                  }`}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                    {fila.fecha}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_en_proceso)}
                                  </td>
                                  {/* Columna "NVI F/S" eliminada */}
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_total_term)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_total_ster)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                    {formatNumber(fila.no_surtido_term)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                    {formatNumber(fila.no_surtido_ster)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                    {formatNumber(fila.surtido_term)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                    {formatNumber(fila.surtido_ster)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_ar_term)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_ar_semi)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_sin_ar)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_sin_ar_term)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                    {formatNumber(fila.nvi_sin_ar_semi)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr className="text-center font-semibold">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Total</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_en_proceso, 0))}
                                </td>
                                {/* Columna "NVI F/S" eliminada */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_total_term, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_total_ster, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.no_surtido_term, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.no_surtido_ster, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.surtido_term, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.surtido_ster, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_ar_term, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_ar_semi, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_sin_ar, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_sin_ar_term, 0))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {formatNumber(bloque.datos.reduce((acc, curr) => acc + curr.nvi_sin_ar_semi, 0))}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResumenTrabajo;