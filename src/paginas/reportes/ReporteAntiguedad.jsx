import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import clienteAxios from '../../../config/clienteAxios';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDaysIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Heading from '../../components/others/Heading';
import { formatNumber } from '../../helpers/formatNumber';
import CardRepoAntiguedad from '../../components/others/cards/CardRepoAntiguedad';
import TablaRepoAntiguedad from '../../components/others/tables/TablaRepoAntiguedad';

const ReporteAntiguedad = () => {
  const [registros, setRegistros] = useState([]);
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [totalRegistrosAntiguos, setTotalRegistrosAntiguos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nombresMeses = {
    '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
    '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
    '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  const optionsMeses = Object.entries(nombresMeses).map(([value, label]) => ({
    value,
    label,
  }));

  // Generar opciones de años (últimos 5 años + año actual + próximos 2)
  const generarOpcionesAnios = () => {
    const anioActual = new Date().getFullYear();
    const anios = [];
    for (let i = anioActual - 1; i <= anioActual + 2; i++) {
      anios.push({ value: i.toString(), label: i.toString() });
    }
    return anios.reverse();
  };

  const optionsAnios = generarOpcionesAnios();

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#0891B2' : '#CBD5E1',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(8, 145, 178, 0.12)' : 'none',
      '&:hover': { borderColor: '#0891B2' },
      height: '44px',
      minHeight: '44px',
      backgroundColor: '#FFFFFF',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '44px',
      padding: '0 12px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '44px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
      fontWeight: 600,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94A3B8',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 16px 35px rgba(15, 23, 42, 0.12)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#0891B2' : state.isFocused ? '#ECFEFF' : '#FFFFFF',
      color: state.isSelected ? '#FFFFFF' : '#111827',
      fontWeight: state.isSelected ? 700 : 500,
    }),
  };

  const agruparPorDia = (registros) => {
    if (!registros || registros.length === 0) return [];
    const dias = {};
    registros.forEach(registro => {
      const fecha = format(parseISO(registro.today), 'yyyy-MM-dd');
      if (!dias[fecha]) {
        dias[fecha] = [];
      }
      dias[fecha].push(registro);
    });
    return Object.entries(dias);
  };

  useEffect(() => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    setMes(mesActual.toString());
    setAnio(anioActual.toString());
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      if (mes && anio) {
        setLoading(true);
        setError('');
        try {
          const { data } = await clienteAxios.get(`/reportes/reportes/antiguedad/${mes}/${anio}`);
          if (data.registros && data.registros.length > 0) {
            setRegistros(data.registros);
            calcularTotalRegistrosAntiguos(data.registros);
          } else {
            setRegistros([]);
            setTotalRegistrosAntiguos(0);
            setError(`No se encontraron registros para ${nombresMeses[mes]} ${anio}`);
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
          setRegistros([]);
          setTotalRegistrosAntiguos(0);
          setError(`Error al obtener los datos de ${nombresMeses[mes]} ${anio}`);
        } finally {
          setLoading(false);
        }
      } else {
        setRegistros([]);
        setTotalRegistrosAntiguos(0);
        setError('Por favor, seleccione mes y año para ver los registros');
      }
    };
    obtenerDatos();
  }, [mes, anio]);

  const handleMesChange = (selectedOption) => {
    setRegistros([]);
    setTotalRegistrosAntiguos(0);
    setMes(selectedOption.value);
  };

  const handleAnioChange = (selectedOption) => {
    setRegistros([]);
    setTotalRegistrosAntiguos(0);
    setAnio(selectedOption.value);
  };

  const calcularTotalRegistrosAntiguos = (registros) => {
    const total = registros.reduce((acc, registro) => {
      const dias = differenceInDays(parseISO(registro.today), parseISO(registro.enter_date)) - 1;
      if (dias >= 3) {
        return acc + registro.ink_ip + registro.hoya_ip + registro.nvi_ip;
      }
      return acc;
    }, 0);
    setTotalRegistrosAntiguos(total);
  };

  const diasAgrupados = agruparPorDia(registros);
  diasAgrupados.sort((a, b) => new Date(b[0]) - new Date(a[0]));

  return (
    <>
      <div className="mt-6 md:mt-0">
        <Heading title="Reporte Antigüedad de trabajos" />
      </div>
      <div className="mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="mx-auto">
          {/* Selects para mes y año */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                  <CalendarDaysIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Filtros</p>
                  <p className="text-sm text-gray-500">Selecciona el periodo del reporte</p>
                </div>
              </div>
              {!loading && !error && registros.length > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 lg:min-w-[310px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-700 shadow-sm">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Total general</p>
                      <p className="text-xs font-medium text-cyan-700">Registros ≥ 4 días</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-cyan-900">
                    {formatNumber(totalRegistrosAntiguos)}
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:w-2/3">
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
                <Select
                  value={optionsMeses.find(option => option.value === mes) || null}
                  onChange={handleMesChange}
                  options={optionsMeses}
                  placeholder="Selecciona un mes"
                  styles={customStyles}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
                <Select
                  value={optionsAnios.find(option => option.value === anio) || null}
                  onChange={handleAnioChange}
                  options={optionsAnios}
                  placeholder="Selecciona un año"
                  styles={customStyles}
                />
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-center text-gray-600">Cargando datos...</p>
          )}
          {error && (
            <p className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              {error}
            </p>
          )}
          {!loading && !error && registros.length > 0 && (
            <>
              <div className="hidden">
                <p className="text-blue-800 font-medium text-center">
                  Total General (Registros ≥ 4 días):
                  <span className="text-blue-600 font-bold ml-2">
                    {totalRegistrosAntiguos}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                {diasAgrupados.map(([fecha, registrosDia]) => (
                  <div key={fecha} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <h3 className="bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white">
                      {format(parseISO(fecha), 'dd MMMM yyyy', { locale: es })}
                    </h3>
                    <TablaRepoAntiguedad registrosDia={registrosDia} />
                    <div className="flex justify-end items-center border-t border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Total: (≥ 4 días):{' '}
                        <span className="text-blue-600 font-bold">
                          {formatNumber(registrosDia.reduce((total, registro) => {
                            const dias = differenceInDays(parseISO(registro.today), parseISO(registro.enter_date)) - 1;
                            if (dias >= 3) {
                              return total + registro.ink_ip + registro.hoya_ip + registro.nvi_ip;
                            }
                            return total;
                          }, 0))}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <CardRepoAntiguedad registros={registros} mes={mes} anio={anio} />
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default ReporteAntiguedad;
