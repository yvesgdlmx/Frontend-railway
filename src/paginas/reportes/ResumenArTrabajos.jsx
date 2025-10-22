import React, { useState, useEffect } from "react";
import clienteAxios from "../../../config/clienteAxios";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Heading from "../../components/others/Heading";
import formatearHora from "../../../helpers/formatearHora";
import Actualizacion from "../../components/others/Actualizacion";
import SelectWipDiario from "../../components/others/html_personalizado/SelectWipDiario";
import TablaResumenArTrabajos from "../../components/others/tables/TablaResumenArTrabajos";

const ResumenArTrabajos = () => {
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
          `/reportes/reportes_ar/resumen/${anio}/${mes}/${dia}`
        );

        if (!response.data.registros || response.data.registros.length === 0) {
          setDatosAPI([]);
          return;
        }

        const datosAgrupados = agruparPorHora(response.data.registros);
        datosAgrupados.sort((a, b) => b.hora.localeCompare(a.hora));
        setDatosAPI(datosAgrupados);
      } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
        setDatosAPI([]);
      }
    };
    obtenerDatos();
  }, [anio, mes, dia]);

  const agruparPorHora = (registros) => {
    const datosPorHora = registros.reduce((acc, item) => {
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
        <Heading title="Reporte Resumen AR Por Área" />
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
                          Resumen AR Trabajos - {formatearHora(bloque.hora)}
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
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Sin Surtir
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.sin_surtir,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Antes de AR
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.antes_de_ar,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            En AR
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.en_ar,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Recalculando
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.recalculando,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Breakage
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.breakage,
                                0
                              )
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <span className="text-sm font-medium text-gray-600">
                            Después de ar
                          </span>
                          <div className="text-2xl font-bold text-blue-700 mt-1">
                            {formatNumber(
                              bloque.datos.reduce(
                                (acc, curr) => acc + curr.despues_de_ar,
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
                        <TablaResumenArTrabajos
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

export default ResumenArTrabajos;
