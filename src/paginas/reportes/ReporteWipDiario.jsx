import React, { useState, useEffect } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';
import SelectWipDiario from '../../components/others/html_personalizado/SelectWipDiario';
import CardWipDiario from '../../components/others/cards/CardWipDiario';
import { formatNumber } from '../../helpers/formatNumber';

const ReporteWipDiario = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const diaAyer = String(yesterday.getDate()).padStart(2, '0');
  const [anio, setAnio] = useState(currentYear.toString());
  const [mes, setMes] = useState(currentMonth);
  const [dia, setDia] = useState(diaAyer);
  const [data, setData] = useState([]);
  const [cancelados, setCancelados] = useState([]);
  // Opciones para año
  const optionsAnio = [
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear + 1).toString(), label: (currentYear + 1).toString() },
  ];
  // Opciones para mes (nombres largos en español)
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const optionsMes = monthNames.map((name, index) => {
    const value = (index + 1).toString().padStart(2, '0');
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    return { value, label };
  });
  // Opciones para día (1 al 31)
  const optionsDia = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return { value: day, label: day };
  });
  const handleAnioChange = (selectedOption) => setAnio(selectedOption.value);
  const handleMesChange = (selectedOption) => setMes(selectedOption.value);
  const handleDiaChange = (selectedOption) => setDia(selectedOption.value);
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
      nvi: { inicial: 0, recibidos: 0, enviados: 0, cancelados: 0, final: 0, semifinishRec: 0, finishedRec: 0, semifinishEnv: 0, finishedEnv: 0 },
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
          totals.nvi.semifinishRec = item.semifinish_nvi;
          totals.nvi.finishedRec = item.finished_nvi;
          totals.hoya.recibidos = item.total_hoya;
          totals.ink.recibidos = item.total_ink;
        } else if (item.accion === 'enviados') {
          totals.nvi.enviados = item.total_nvi;
          totals.nvi.semifinishEnv = item.semifinish_nvi;
          totals.nvi.finishedEnv = item.finished_nvi;
          totals.hoya.enviados = item.total_hoya;
          totals.ink.enviados = item.total_ink;
        }
      });
    }
    if (cancelados.length > 0) {
      cancelados.forEach(item => {
        const clienteKey = item.job_type === 'NV' ? 'nvi' : item.job_type === 'HO' ? 'hoya' : 'ink';
        totals[clienteKey].cancelados += item.job_count;
        if (!razonesAgrupadas[clienteKey][item.job_issue]) {
          razonesAgrupadas[clienteKey][item.job_issue] = 0;
        }
        razonesAgrupadas[clienteKey][item.job_issue] += item.job_count;
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
      <div className="mt-6 md:mt-0">
        <Heading title="Reporte WIP Diario" />
      </div>
      <div className="w-full min-h-screen bg-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <SelectWipDiario
            options={optionsAnio}
            value={optionsAnio.find(opt => opt.value === anio)}
            onChange={handleAnioChange}
            placeholder="Año"
          />
          <SelectWipDiario
            options={optionsMes}
            value={optionsMes.find(opt => opt.value === mes)}
            onChange={handleMesChange}
            placeholder="Mes"
          />
          <SelectWipDiario
            options={optionsDia}
            value={optionsDia.find(opt => opt.value === dia)}
            onChange={handleDiaChange}
            placeholder="Día"
          />
        </div>
        {data.length === 0 && (
          <div className="text-red-600 text-center mb-4">
            No hay registros disponibles para la fecha seleccionada.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['nvi', 'hoya', 'ink'].map(cliente => (
            <div key={cliente} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold text-center bg-blue-600 text-white py-4">
                {cliente.toUpperCase()}
              </h2>
              <table className="min-w-full bg-white">
                <tbody>
                  <tr className="text-gray-700 bg-gray-100">
                    <td className="py-3 px-6 font-semibold border-b">WIP Inicial</td>
                    <td className="py-3 px-6 border-b">{formatNumber(wipTotals[cliente].inicial)}</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td className="py-3 px-6 font-semibold border-b">
                      Recibidos
                      {cliente === 'nvi' && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Semi-Finished: {formatNumber(wipTotals.nvi.semifinishRec)}, Finished: {formatNumber(wipTotals.nvi.finishedRec)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b">{formatNumber(wipTotals[cliente].recibidos)}</td>
                  </tr>
                  <tr className="text-gray-700 bg-gray-100">
                    <td className="py-3 px-6 font-semibold border-b">
                      Enviados
                      {cliente === 'nvi' && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Semi-Finished: {formatNumber(wipTotals.nvi.semifinishEnv)}, Finished: {formatNumber(wipTotals.nvi.finishedEnv)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b">{formatNumber(wipTotals[cliente].enviados)}</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td className="py-3 px-6 font-semibold border-b">Cancelados</td>
                    <td className="py-3 px-6 border-b">{formatNumber(wipTotals[cliente].cancelados)}</td>
                  </tr>
                  <tr className="text-gray-700 bg-gray-100">
                    <td className="py-3 px-6 font-semibold border-b">WIP Final</td>
                    <td className="py-3 px-6 border-b">{formatNumber(wipTotals[cliente].final)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['nvi', 'hoya', 'ink'].map(cliente => (
            <CardWipDiario
              key={cliente}
              razones={razonesAgrupadas[cliente]}
              cliente={cliente}
            />
          ))}
        </div>
      </div>
    </>
  );
};
export default ReporteWipDiario;