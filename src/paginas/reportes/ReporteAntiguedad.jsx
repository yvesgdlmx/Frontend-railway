import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import clienteAxios from '../../../config/clienteAxios';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import Heading from '../../components/others/Heading';
import { formatNumber } from '../../helpers/formatNumber';
import CardRepoAntiguedad from '../../components/others/cards/CardRepoAntiguedad';
import TablaRepoAntiguedad from '../../components/others/tables/TablaRepoAntiguedad';

const ReporteAntiguedad = () => {
  const [registros, setRegistros] = useState([]);
  const [mes, setMes] = useState('');
  const [totalRegistrosAntiguos, setTotalRegistrosAntiguos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Definición de nombres de meses
  const nombresMeses = {
    '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
    '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
    '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };
  // Convertir el objeto nombresMeses en un arreglo de opciones para react‑select
  const optionsMeses = Object.entries(nombresMeses).map(([value, label]) => ({
    value,
    label,
  }));
  // Estilos personalizados para react‑select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#D1D5DB',
      boxShadow: 'none',
      '&:hover': { borderColor: '#9CA3AF' },
      height: '40px',
      minHeight: '40px',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '40px',
      padding: '0 6px',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };
  // Función para agrupar registros por día
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
  // Al montar el componente, se establece el mes actual
  useEffect(() => {
    const mesActual = new Date().getMonth() + 1;
    setMes(mesActual.toString());
  }, []);
  // Obtener datos cada vez que se actualice el mes
  useEffect(() => {
    const obtenerDatos = async () => {
      if (mes) {
        setLoading(true);
        setError('');
        try {
          const { data } = await clienteAxios.get(`/reportes/reportes/antiguedad/${mes}`);
          if (data.registros && data.registros.length > 0) {
            setRegistros(data.registros);
            calcularTotalRegistrosAntiguos(data.registros);
          } else {
            setRegistros([]);
            setTotalRegistrosAntiguos(0);
            setError(`No se encontraron registros para el mes de ${nombresMeses[mes]}`);
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
          setRegistros([]);
          setTotalRegistrosAntiguos(0);
          setError(`Error al obtener los datos del mes de ${nombresMeses[mes]}`);
        } finally {
          setLoading(false);
        }
      } else {
        setRegistros([]);
        setTotalRegistrosAntiguos(0);
        setError('Por favor, seleccione un mes para ver los registros');
      }
    };
    obtenerDatos();
  }, [mes]);
  // Actualizar el estado cuando se seleccione un mes mediante react‑select
  const handleMesChange = (selectedOption) => {
    setRegistros([]);
    setTotalRegistrosAntiguos(0);
    setMes(selectedOption.value);
  };
  // Calcular el total de registros "antiguos" (diferencia de días mayor o igual a 3)
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
  return (
    <>
      <div className="mt-6 md:mt-0">
        <Heading title="Reporte Antigüedad de trabajos" />
      </div>
      <div className="mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="mx-auto">
          {/* Select de react‑select para seleccionar el mes */}
          <div className="w-full lg:w-1/3 mb-6">
            <Select
              value={optionsMeses.find(option => option.value === mes) || null}
              onChange={handleMesChange}
              options={optionsMeses}
              placeholder="Selecciona un mes"
              styles={customStyles}
            />
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
              <div className="mb-6 p-4 bg-blue-100 rounded-lg shadow-sm">
                <p className="text-blue-800 font-medium text-center">
                  Total General (Registros ≥ 4 días):
                  <span className="text-blue-600 font-bold ml-2">
                    {totalRegistrosAntiguos}
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diasAgrupados.map(([fecha, registrosDia]) => (
                  <div key={fecha} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                    <h3 className="text-lg font-medium mb-3 bg-blue-600 text-white text-center border-b p-2">
                      {format(parseISO(fecha), 'dd MMMM yyyy', { locale: es })}
                    </h3>
                    <TablaRepoAntiguedad registrosDia={registrosDia} />
                    <div className="mt-4 pt-3 border-t flex justify-end items-center">
                      <p className="text-sm font-medium text-gray-700">
                        Total: (≥ 4 días):{' '}
                        <span className="text-blue-500 font-semibold">
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
              <CardRepoAntiguedad registros={registros} mes={mes} />
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default ReporteAntiguedad;