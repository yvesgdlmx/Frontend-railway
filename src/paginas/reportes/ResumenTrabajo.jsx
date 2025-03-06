import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Heading from '../../components/others/Heading';
import formatearHora from '../../../helpers/formatearHora';
import Actualizacion from '../../components/others/Actualizacion';
import SelectWipDiario from '../../components/others/html_personalizado/SelectWipDiario';
import TablaRepoResumen from '../../components/others/tables/TablaRepoResumen';

const ResumenTrabajo = () => {
  const [datosAPI, setDatosAPI] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [dia, setDia] = useState(new Date().getDate());
  const formatNumber = (number) => {
    if (typeof number !== "number" || isNaN(number)) {
      return "0";
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  useEffect(() => {
    const obtenerDatos = async () => {
      setDatosAPI([]);
      try {
        const response = await clienteAxios.get(
          `/reportes/reportes/resumen/${anio}/${mes}/${dia}`
        );
        const resumen = response.data.resumenDia;
        if (!resumen || resumen.length === 0) {
          setDatosAPI([]);
          return;
        }
        const datosAgrupados = agruparPorHora(resumen);
        datosAgrupados.sort((a, b) => b.hora.localeCompare(a.hora));
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
    return Object.keys(datosPorHora).map((hora) => ({
      hora,
      datos: datosPorHora[hora],
    }));
  };
  const toggleExpansion = (hora) => {
    setExpandidos((prev) => ({
      ...prev,
      [hora]: !prev[hora],
    }));
  };
  const fechaFormateada = format(
    new Date(anio, mes - 1, dia),
    "EEEE d 'de' MMMM 'del' yyyy",
    { locale: es }
  );
  const fechaCapitalizada =
    fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  // Opciones para react-select
  const anioOptions = Array.from({ length: 2 }, (_, i) => {
    const year = 2025 - i;
    return { value: year, label: year.toString() };
  });
  const mesOptions = Array.from({ length: 12 }, (_, i) => {
    const currentMes = i + 1;
    return { value: currentMes, label: currentMes.toString() };
  });
  const diaOptions = Array.from({ length: 31 }, (_, i) => {
    const currentDia = i + 1;
    return { value: currentDia, label: currentDia.toString() };
  });
  return (
    <>
      <div className="mt-4 md:mt-0">
        <Heading title="Reporte Resumen de trabajos" />
      </div>
      <Actualizacion />
      <div className="min-h-screen bg-gray-50">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4 mt-4">
            <div className="w-80">
              <SelectWipDiario
                options={anioOptions}
                value={anioOptions.find((option) => option.value === anio)}
                onChange={(option) => setAnio(option.value)}
                placeholder="Año"
              />
            </div>
            <div className="w-80">
              <SelectWipDiario
                options={mesOptions}
                value={mesOptions.find((option) => option.value === mes)}
                onChange={(option) => setMes(option.value)}
                placeholder="Mes"
              />
            </div>
            <div className="w-80">
              <SelectWipDiario
                options={diaOptions}
                value={diaOptions.find((option) => option.value === dia)}
                onChange={(option) => setDia(option.value)}
                placeholder="Día"
              />
            </div>
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
                    <span className="text-white text-lg font-medium">
                      {fechaCapitalizada}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h3 className="text-2xl font-bold text-gray-500">
                          Resumen General - {formatearHora(bloque.hora)}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md">
                            <span className="font-semibold">
                              {formatearHora(bloque.hora)} hrs
                            </span>
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
                          <span className="text-sm font-medium text-gray-600">
                            NVI En Proceso
                          </span>
                          <div className="text-2xl font-bold text-yellow-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.nvi_en_proceso,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            No Surtido Terminado
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.no_surtido_term,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            No Surtido Semiterminado
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.no_surtido_ster,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Surtido Terminado
                          </span>
                          <div className="text-2xl font-bold text-green-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.surtido_term,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Surtido Semiterminado
                          </span>
                          <div className="text-2xl font-bold text-green-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.surtido_ster,
                                0
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          expandidos[bloque.hora]
                            ? "opacity-100 max-h-screen"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <TablaRepoResumen
                          datos={bloque.datos}
                          formatNumber={formatNumber}
                        />
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