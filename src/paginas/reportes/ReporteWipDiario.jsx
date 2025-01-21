import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';
import { FaTimesCircle } from 'react-icons/fa';

const RazonesCancelacion = ({ razones, cliente }) => {
  const totalCancelaciones = Object.values(razones).reduce((acc, count) => acc + count, 0);
  if (totalCancelaciones === 0) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4 mx-2">
      <h3 className="text-sm font-medium text-center text-gray-500 mb-2">{cliente.toUpperCase()}</h3>
      <h4 className="text-lg font-bold text-center text-gray-800 mb-4 flex items-center justify-center">
        Razones de Cancelación <FaTimesCircle className="text-red-500 ml-2" />
      </h4>
      <ul className="text-sm text-gray-700 space-y-2">
        {Object.entries(razones).map(([issue, count]) => (
          <li key={issue} className="flex justify-between items-center border-b py-2">
            <span>{issue}</span>
            <span className="font-medium text-blue-600">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ReporteWipDiario = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');

  const [anio, setAnio] = useState(currentYear.toString());
  const [mes, setMes] = useState(currentMonth);
  const [dia, setDia] = useState(currentDay);
  const [data, setData] = useState([]);
  const [cancelados, setCancelados] = useState([]);

  const handleAnioChange = (e) => setAnio(e.target.value);
  const handleMesChange = (e) => setMes(e.target.value);
  const handleDiaChange = (e) => setDia(e.target.value);

  const fetchData = async () => {
    try {
      const response = await clienteAxios.get(`/reportes/reportes/wiptotal/${anio}/${mes}/${dia}`);
      setData(response.data.registros || []);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setData([]);
    }
  };

  const fetchCancelados = async () => {
    try {
      const response = await clienteAxios.get(`/reportes/reportes/razones/${anio}/${mes}/${dia}`);
      setCancelados(response.data.resumenDia || []);
    } catch (error) {
      console.error("Error al obtener los datos cancelados:", error);
      setCancelados([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCancelados();
  }, [anio, mes, dia]);

  const calculateWIP = () => {
    const totals = {
      nvi: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0, semifinish: 0, finished: 0 },
      hoya: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0 },
      ink: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0 },
    };

    const razonesAgrupadas = {
      nvi: {},
      hoya: {},
      ink: {},
    };

    if (data.length > 0) {
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
          totals.nvi.semifinish = item.semifinish_nvi;
          totals.nvi.finished = item.finished_nvi;
          totals.hoya.enviados = item.total_hoya;
          totals.ink.enviados = item.total_ink;
        }
      });
    }

    if (cancelados.length > 0) {
      cancelados.forEach(item => {
        const cliente = item.job_type === 'NV' ? 'nvi' : item.job_type === 'HO' ? 'hoya' : 'ink';
        totals[cliente].cancelados += item.job_count;
        if (!razonesAgrupadas[cliente][item.job_issue]) {
          razonesAgrupadas[cliente][item.job_issue] = 0;
        }
        razonesAgrupadas[cliente][item.job_issue] += item.job_count;
      });
    }

    totals.nvi.inicial -= totals.nvi.recibidos;
    totals.hoya.inicial -= totals.hoya.recibidos;
    totals.ink.inicial -= totals.ink.recibidos;

    totals.nvi.final = totals.nvi.inicial + totals.nvi.recibidos - totals.nvi.enviados - totals.nvi.cancelados;
    totals.hoya.final = totals.hoya.inicial + totals.hoya.recibidos - totals.hoya.enviados - totals.hoya.cancelados;
    totals.ink.final = totals.ink.inicial + totals.ink.recibidos - totals.ink.enviados - totals.ink.cancelados;

    return { totals, razonesAgrupadas };
  };

  const { totals: wipTotals, razonesAgrupadas } = calculateWIP();

  return (
    <>
      <div className='mt-6 md:mt-0'>
        <Heading title="Reporte WIP Diario" />
      </div>
      <div className="w-full min-h-screen bg-gray-100 p-8">
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
        {data.length === 0 && (
          <div className="text-red-600 text-center mb-4">
            No hay registros disponibles para la fecha seleccionada.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['nvi', 'hoya', 'ink'].map(cliente => (
            <div key={cliente} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold text-center bg-blue-600 text-white py-4">{cliente.toUpperCase()}</h2>
              <table className="min-w-full bg-white">
                <tbody>
                  <tr className="text-gray-700 bg-gray-100">
                    <td className="py-3 px-6 font-semibold border-b">WIP Inicial</td>
                    <td className="py-3 px-6 border-b">{wipTotals[cliente].inicial}</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td className="py-3 px-6 font-semibold border-b">Recibidos</td>
                    <td className="py-3 px-6 border-b">{wipTotals[cliente].recibidos}</td>
                  </tr>
                  <tr className="text-gray-700 bg-gray-100">
                    <td className="py-3 px-6 font-semibold border-b">Enviados</td>
                    <td className="py-3 px-6 border-b">{wipTotals[cliente].enviados}</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td className="py-3 px-6 font-semibold border-b">Cancelados</td>
                    <td className="py-3 px-6 border-b">{wipTotals[cliente].cancelados}</td>
                  </tr>
                  <tr className="text-gray-700 bg-gray-100">
                    <td className="py-3 px-6 font-semibold border-b">WIP Final</td>
                    <td className="py-3 px-6 border-b">{wipTotals[cliente].final}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['nvi', 'hoya', 'ink'].map(cliente => (
            <RazonesCancelacion key={cliente} razones={razonesAgrupadas[cliente]} cliente={cliente} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ReporteWipDiario;