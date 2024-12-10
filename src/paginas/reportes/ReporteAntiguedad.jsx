import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import { 
  format, 
  parseISO, 
  differenceInDays, 
  startOfWeek, 
  endOfWeek, 
  eachWeekOfInterval, 
  startOfMonth, 
  endOfMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

const ReporteAntiguedad = () => {
  const [registros, setRegistros] = useState([]);
  const [mes, setMes] = useState('');
  const [totalRegistrosAntiguos, setTotalRegistrosAntiguos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const nombresMeses = {
    '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
    '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
    '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  useEffect(() => {
    // Establecer el mes actual al montar el componente
    const mesActual = new Date().getMonth() + 1; // getMonth devuelve un índice basado en cero
    setMes(mesActual.toString());
  }, []);

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

  const handleMesChange = (e) => {
    setRegistros([]);
    setTotalRegistrosAntiguos(0);
    setMes(e.target.value);
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

  const agruparPorSemana = (registros, mes) => {
    if (!registros || registros.length === 0 || !mes) return [];
    const año = new Date().getFullYear();
    const fechaInicio = startOfMonth(new Date(año, mes - 1, 1));
    const fechaFin = endOfMonth(new Date(año, mes - 1, 1));
    const semanas = eachWeekOfInterval(
      { start: fechaInicio, end: fechaFin },
      { weekStartsOn: 1 }
    ).map((inicioSemana, index) => {
      const finSemana = endOfWeek(inicioSemana, { weekStartsOn: 1 });
      return {
        numero: index + 1,
        inicio: inicioSemana,
        fin: finSemana,
        registros: []
      };
    });
    registros.forEach(registro => {
      const fechaRegistro = parseISO(registro.today);
      const semana = semanas.find(s => 
        fechaRegistro >= s.inicio && fechaRegistro <= s.fin
      );
      if (semana) {
        semana.registros.push(registro);
      }
    });
    return semanas;
  };

  const ResumenSemanal = ({ registros, mes }) => {
    const semanasAgrupadas = agruparPorSemana(registros, mes);
    return (
      <div className="mt-8 mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">Resumen Semanal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {semanasAgrupadas.map((semana) => {
            const totalSemana = semana.registros.reduce((total, registro) => {
              const dias = differenceInDays(
                parseISO(registro.today), 
                parseISO(registro.enter_date)
              ) - 1;
              if (dias >= 3) {
                return total + registro.ink_ip + registro.hoya_ip + registro.nvi_ip;
              }
              return total;
            }, 0);
            return (
              <div key={semana.numero} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="text-lg font-medium mb-2 text-blue-500">
                  Semana {semana.numero}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {format(semana.inicio, 'dd/MM', { locale: es })} - {format(semana.fin, 'dd/MM', { locale: es })}
                </p>
                <p className="text-gray-700">
                  Total (≥ 4 días): <span className="font-semibold">{totalSemana}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const diasAgrupados = agruparPorDia(registros);
  
  return (
    <div className="mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        <select 
          className="w-full lg:w-1/3 mb-6 p-2 border border-gray-300 rounded-md shadow-sm 
                     focus:border-blue-500 focus:ring focus:ring-blue-200 
                     focus:ring-opacity-50 bg-white"
          value={mes}
          onChange={handleMesChange}
        >
          <option value="">Selecciona un mes</option>
          {Object.entries(nombresMeses).map(([value, nombre]) => (
            <option key={value} value={value}>{nombre}</option>
          ))}
        </select>
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
                <div key={fecha} 
                     className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg 
                              transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-lg font-medium mb-3 bg-blue-600 text-white text-center border-b p-2">
                    {format(parseISO(fecha), 'dd MMMM yyyy', { locale: es })}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Fecha de Entrada
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Fecha de Reporte
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            INK IP
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            HOYA IP
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            NVI IP
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {registrosDia.map((registro, index) => {
                          const diasDiferencia = differenceInDays(
                            parseISO(registro.today), 
                            parseISO(registro.enter_date)
                          ) - 1;
                          const esAntiguo = diasDiferencia >= 3;
                          return (
                            <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${esAntiguo ? 'bg-yellow-50' : ''}`}>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                {format(parseISO(registro.enter_date), 'dd/MM/yyyy')}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                {format(parseISO(registro.today), 'dd/MM/yyyy')}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                {registro.ink_ip}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                {registro.hoya_ip}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                                {registro.nvi_ip}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-3 border-t flex justify-end items-center">
                    <p className="text-sm font-medium text-gray-700">
                      Total: (≥ 4 días): {' '}
                      <span className="text-blue-500 font-semibold">
                        {registrosDia.reduce((total, registro) => {
                          const dias = differenceInDays(
                            parseISO(registro.today), 
                            parseISO(registro.enter_date)
                          ) - 1;
                          if (dias >= 3) {
                            return total + registro.ink_ip + registro.hoya_ip + registro.nvi_ip;
                          }
                          return total;
                        }, 0)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ResumenSemanal registros={registros} mes={mes} />
          </>
        )}
      </div>
    </div>
  );
};

export default ReporteAntiguedad;