import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';

const ReporteWipDiario = () => {
  // Obtener la fecha actual
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
  const currentDay = String(today.getDate()).padStart(2, '0');
  const [anio, setAnio] = useState(currentYear.toString());
  const [mes, setMes] = useState(currentMonth);
  const [dia, setDia] = useState(currentDay);
  const [data, setData] = useState([]);
  
  const handleAnioChange = (e) => setAnio(e.target.value);
  const handleMesChange = (e) => setMes(e.target.value);
  const handleDiaChange = (e) => setDia(e.target.value);

  const fetchData = async () => {
    try {
      const response = await clienteAxios.get(`/reportes/reportes/wiptotal/${anio}/${mes}/${dia}`);
      setData(response.data.registros || []); // Asegúrate de que sea un arreglo
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setData([]); // En caso de error, también establece data como un arreglo vacío
    }
  };

  useEffect(() => {
    fetchData();
  }, [anio, mes, dia]);

  // Calcular WIP y otros campos para cada cliente
  const calculateWIP = () => {
    if (!data || data.length === 0) return {
      nvi: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0, semifinish: 0, finished: 0 },
      hoya: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0 },
      ink: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0 },
    };

    const totals = {
      nvi: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0, semifinish: 0, finished: 0 },
      hoya: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0 },
      ink: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0 },
    };

    data.forEach(item => {
      if (item.accion === 'wip total') {
        totals.nvi.inicial = item.total_nvi;
        totals.hoya.inicial = item.total_hoya;
        totals.ink.inicial = item.total_ink;
      } else if (item.accion === 'recibidos') {
        totals.nvi.recibidos = item.total_nvi;
        totals.hoya.recibidos = item.total_hoya;
        totals.ink.recibidos = item.total_ink;
      } else if (item.accion === 'enviados') {
        totals.nvi.enviados = item.total_nvi;
        totals.nvi.semifinish = item.semifinish_nvi; // Guardar semifinish para NVI
        totals.nvi.finished = item.finished_nvi; // Guardar finished para NVI
        totals.hoya.enviados = item.total_hoya;
        totals.ink.enviados = item.total_ink;
      } else if (item.accion === 'cancelados') {
        totals.nvi.cancelados = item.total_nvi;
        totals.hoya.cancelados = item.total_hoya;
        totals.ink.cancelados = item.total_ink;
      }
    });

    // Calcular WIP Inicial
    totals.nvi.inicial -= totals.nvi.recibidos; // WIP Inicial = WIP Total - Recibidos
    totals.hoya.inicial -= totals.hoya.recibidos;
    totals.ink.inicial -= totals.ink.recibidos;

    // Calcular WIP Final
    totals.nvi.final = totals.nvi.inicial + totals.nvi.recibidos - totals.nvi.enviados - totals.nvi.cancelados; // WIP Final = WIP Inicial + Recibidos - Enviados - Cancelados
    totals.hoya.final = totals.hoya.inicial + totals.hoya.recibidos - totals.hoya.enviados - totals.hoya.cancelados;
    totals.ink.final = totals.ink.inicial + totals.ink.recibidos - totals.ink.enviados - totals.ink.cancelados;

    return totals;
  };

  const wipTotals = calculateWIP();

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">
      {/* Selectores de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Año</label>
          <select
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg"
            value={anio}
            onChange={handleAnioChange}
          >
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Mes</label>
          <select
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg"
            value={mes}
            onChange={handleMesChange}
          >
            {Array.from({ length: 12 }, (v, i) => (
              <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                {new Date(2021, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 sm:mb-2 text-gray-600">Día</label>
          <select
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg"
            value={dia}
            onChange={handleDiaChange}
          >
            {[...Array(31).keys()].map((day) => (
              <option key={day + 1} value={(day + 1).toString().padStart(2, '0')}>
                {day + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Mensaje si no hay datos */}
      {data.length === 0 && (
        <div className="text-red-600 text-center mb-4">
          No hay registros disponibles para la fecha seleccionada.
        </div>
      )}
      {/* Tablas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tabla NVI */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold text-center bg-blue-600 text-white py-4">NVI</h2>
          <table className="min-w-full bg-white">
            <tbody>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">WIP Inicial</td>
                <td className="py-3 px-6 border-b">{wipTotals.nvi.inicial}</td>
              </tr>
              <tr className="text-gray-700">
                <td className="py-3 px-6 font-semibold border-b">Recibidos <span className='text-sm text-gray-500 ml-2 font-normal'>(Semiterminado: {data.find(item => item.accion === 'recibidos')?.semifinish_nvi}, Terminado: {data.find(item => item.accion === 'recibidos')?.finished_nvi})</span></td>
                <td className="py-3 px-6 border-b">{wipTotals.nvi.recibidos}</td>
              </tr>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">Enviados <span className='text-sm text-gray-500 ml-2 font-normal'>(Semiterminado: {wipTotals.nvi.semifinish}, Terminado: {wipTotals.nvi.finished})</span></td>
                <td className="py-3 px-6 border-b">{wipTotals.nvi.enviados}</td>
              </tr>
              <tr className="text-gray-700">
                <td className="py-3 px-6 font-semibold border-b">Cancelados</td>
                <td className="py-3 px-6 border-b">{wipTotals.nvi.cancelados}</td>
              </tr>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">WIP Final</td>
                <td className="py-3 px-6 border-b">{wipTotals.nvi.final}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Tabla HOYA */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold text-center bg-blue-600 text-white py-4">HOYA</h2>
          <table className="min-w-full bg-white">
            <tbody>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">WIP Inicial</td>
                <td className="py-3 px-6 border-b">{wipTotals.hoya.inicial}</td>
              </tr>
              <tr className="text-gray-700">
                <td className="py-3 px-6 font-semibold border-b">Recibidos</td>
                <td className="py-3 px-6 border-b">{wipTotals.hoya.recibidos}</td>
              </tr>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">Enviados</td>
                <td className="py-3 px-6 border-b">{wipTotals.hoya.enviados}</td>
              </tr>
              <tr className="text-gray-700">
                <td className="py-3 px-6 font-semibold border-b">Cancelados</td>
                <td className="py-3 px-6 border-b">{wipTotals.hoya.cancelados}</td>
              </tr>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">WIP Final</td>
                <td className="py-3 px-6 border-b">{wipTotals.hoya.final}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Tabla INK */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <h2 className="text-xl font-bold text-center bg-blue-600 text-white py-4">INK</h2>
          <table className="min-w-full bg-white">
            <tbody>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">WIP Inicial</td>
                <td className="py-3 px-6 border-b">{wipTotals.ink.inicial}</td>
              </tr>
              <tr className="text-gray-700">
                <td className="py-3 px-6 font-semibold border-b">Recibidos</td>
                <td className="py-3 px-6 border-b">{wipTotals.ink.recibidos}</td>
              </tr>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">Enviados</td>
                <td className="py-3 px-6 border-b">{wipTotals.ink.enviados}</td>
              </tr>
              <tr className="text-gray-700">
                <td className="py-3 px-6 font-semibold border-b">Cancelados</td>
                <td className="py-3 px-6 border-b">{wipTotals.ink.cancelados}</td>
              </tr>
              <tr className="text-gray-700 bg-gray-100">
                <td className="py-3 px-6 font-semibold border-b">WIP Final</td>
                <td className="py-3 px-6 border-b">{wipTotals.ink.final}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReporteWipDiario;