import React, { useEffect, useState } from 'react';
import clienteAxios from '../../../config/clienteAxios';
import Heading from '../../components/others/Heading';
import { formatNumber } from '../../helpers/formatNumber';
import Select from 'react-select';

// Opciones para los selects
const opcionesAnios = [
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' }
];
const opcionesMeses = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];
const opcionesDias = Array.from({ length: 31 }, (_, i) => {
  const dia = (i + 1).toString().padStart(2, '0');
  return { value: dia, label: dia };
});

// Estilos personalizados para react-select
const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#D1D5DB',
    boxShadow: 'none',
    '&:hover': { borderColor: '#9CA3AF' },
    borderRadius: '0.375rem',
    minHeight: '2.7rem',
    minWidth: '8.5rem',
    fontSize: '1rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

// Función para obtener la opción correspondiente a un valor
const getOption = (opciones, valor) => opciones.find(opt => opt.value === valor);

const ReporteDeFlujo = () => {
  const [registros, setRegistros] = useState([]);

  // Calcular fechas por defecto
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  // Formatear fechas a string con ceros a la izquierda
  const yyyyHoy = hoy.getFullYear().toString();
  const mmHoy = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const ddHoy = hoy.getDate().toString().padStart(2, '0');
  const yyyyAyer = ayer.getFullYear().toString();
  const mmAyer = (ayer.getMonth() + 1).toString().padStart(2, '0');
  const ddAyer = ayer.getDate().toString().padStart(2, '0');

  // Estados para selects de fecha inicio y fin
  const [anioInicio, setAnioInicio] = useState(getOption(opcionesAnios, yyyyAyer));
  const [mesInicio, setMesInicio] = useState(getOption(opcionesMeses, mmAyer));
  const [diaInicio, setDiaInicio] = useState(getOption(opcionesDias, ddAyer));
  const [anioFin, setAnioFin] = useState(getOption(opcionesAnios, yyyyHoy));
  const [mesFin, setMesFin] = useState(getOption(opcionesMeses, mmHoy));
  const [diaFin, setDiaFin] = useState(getOption(opcionesDias, ddHoy));

  const consultar = async () => {
    try {
      const respuesta = await clienteAxios.get(
        `/reportes/reportes/wiptotal/rango/${anioInicio.value}/${mesInicio.value}/${diaInicio.value}/${anioFin.value}/${mesFin.value}/${diaFin.value}`
      );
      setRegistros(respuesta.data.registros);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  useEffect(() => {
    consultar();
    // eslint-disable-next-line
  }, []);

  // Agrupar por fecha y acción
  const datosPorDia = {};
  registros.forEach(registro => {
    if (!datosPorDia[registro.fecha]) {
      datosPorDia[registro.fecha] = {
        recibidos: null,
        enviados: null,
        cancelados: null,
      };
    }
    if (registro.accion === 'recibidos') {
      datosPorDia[registro.fecha].recibidos = registro;
    } else if (registro.accion === 'enviados') {
      datosPorDia[registro.fecha].enviados = registro;
    } else if (registro.accion === 'cancelados') {
      datosPorDia[registro.fecha].cancelados = registro;
    }
  });

    // Ordenar fechas ascendente
    const fechasOrdenadas = Object.keys(datosPorDia).sort((a, b) => a.localeCompare(b));

  // Calcular totales
  const calcularTotales = () => {
    const totales = {
      hoya_recibidos: 0,
      hoya_cancelados: 0,
      hoya_enviados: 0,
      ink_recibidos: 0,
      ink_cancelados: 0,
      ink_enviados: 0,
      nvi_recibidos: 0,
      nvi_cancelados: 0,
      nvi_enviados: 0
    };

    fechasOrdenadas.forEach(fecha => {
      const dia = datosPorDia[fecha];
      
      // Sumar Hoya
      if (dia.recibidos) totales.hoya_recibidos += dia.recibidos.total_hoya || 0;
      if (dia.cancelados) totales.hoya_cancelados += dia.cancelados.total_hoya || 0;
      if (dia.enviados) totales.hoya_enviados += dia.enviados.total_hoya || 0;
      
      // Sumar Ink
      if (dia.recibidos) totales.ink_recibidos += dia.recibidos.total_ink || 0;
      if (dia.cancelados) totales.ink_cancelados += dia.cancelados.total_ink || 0;
      if (dia.enviados) totales.ink_enviados += dia.enviados.total_ink || 0;
      
      // Sumar NVI
      if (dia.recibidos) totales.nvi_recibidos += dia.recibidos.total_nvi || 0;
      if (dia.cancelados) totales.nvi_cancelados += dia.cancelados.total_nvi || 0;
      if (dia.enviados) totales.nvi_enviados += dia.enviados.total_nvi || 0;
    });

    return totales;
  };

  const totales = calcularTotales();

  return (
    <>
      <div className='mt-6 md:mt-0'>
        <Heading title="Reporte de Flujo WIP Total" />
      </div>
      <div className="mt-6 lg:mt-0 bg-gray-100 min-h-screen">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-8 items-center mb-6 justify-center">
          {/* Fecha inicio */}
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <span className="block mb-1 text-gray-700 font-semibold md:mt-2 md:mr-2">Fecha inicio</span>
            <div className="w-44">
              <Select
                options={opcionesAnios}
                value={anioInicio}
                onChange={setAnioInicio}
                placeholder="Año"
                styles={customStyles}
              />
            </div>
            <div className="w-44">
              <Select
                options={opcionesMeses}
                value={mesInicio}
                onChange={setMesInicio}
                placeholder="Mes"
                styles={customStyles}
              />
            </div>
            <div className="w-44">
              <Select
                options={opcionesDias}
                value={diaInicio}
                onChange={setDiaInicio}
                placeholder="Día"
                styles={customStyles}
              />
            </div>
          </div>
          {/* Fecha fin */}
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <span className="block mb-1 text-gray-700 font-semibold md:mt-2 md:mr-2">Fecha fin</span>
            <div className="w-44">
              <Select
                options={opcionesAnios}
                value={anioFin}
                onChange={setAnioFin}
                placeholder="Año"
                styles={customStyles}
              />
            </div>
            <div className="w-44">
              <Select
                options={opcionesMeses}
                value={mesFin}
                onChange={setMesFin}
                placeholder="Mes"
                styles={customStyles}
              />
            </div>
            <div className="w-44">
              <Select
                options={opcionesDias}
                value={diaFin}
                onChange={setDiaFin}
                placeholder="Día"
                styles={customStyles}
              />
            </div>
          </div>
          <div className="flex items-end h-full">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded mb-0 md:mb-0 md:ml-2"
              style={{ minHeight: '2.7rem' }}
              onClick={consultar}
            >
              Consultar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {fechasOrdenadas.length === 0 && (
            <div className="w-full text-center text-red-600 font-semibold my-8">
              No se encontraron registros con la fecha seleccionada.
            </div>
          )}
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg hidden md:table">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-3 px-5 text-left font-semibold">Fecha</th>
                <th className="py-3 px-5 text-left font-semibold border">Hoya Recibidos</th>
                <th className="py-3 px-5 text-left font-semibold border">Hoya Cancelados</th>
                <th className="py-3 px-5 text-left font-semibold border">Hoya Enviados</th>
                <th className="py-3 px-5 text-left font-semibold border">Ink Recibidos</th>
                <th className="py-3 px-5 text-left font-semibold border">Ink Cancelados</th>
                <th className="py-3 px-5 text-left font-semibold border">Ink Enviados</th>
                <th className="py-3 px-5 text-left font-semibold border">NVI Recibidos</th>
                <th className="py-3 px-5 text-left font-semibold border">NVI Cancelados</th>
                <th className="py-3 px-5 text-left font-semibold border">NVI Enviados</th>
              </tr>
            </thead>
            <tbody>
              {fechasOrdenadas.map((fecha, index) => {
                const dia = datosPorDia[fecha];
                return (
                  <tr key={fecha} className={`border-t border-gray-200 hover:bg-blue-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{fecha}</td>
                    {/* Hoya */}
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_hoya) : '-'}</td>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_hoya) : '-'}</td>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_hoya) : '-'}</td>
                    {/* Ink */}
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_ink) : '-'}</td>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_ink) : '-'}</td>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_ink) : '-'}</td>
                    {/* NVI */}
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_nvi) : '-'}</td>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_nvi) : '-'}</td>
                    <td className="py-3 px-5 border font-semibold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_nvi) : '-'}</td>
                  </tr>
                );
              })}
              {/* Fila de totales */}
              {fechasOrdenadas.length > 0 && (
                <tr className="bg-green-500 text-white font-bold border-t-2">
                  <td className="py-3 px-5 border font-bold">TOTALES</td>
                  {/* Hoya */}
                  <td className="py-3 px-5 border">{formatNumber(totales.hoya_recibidos)}</td>
                  <td className="py-3 px-5 border">{formatNumber(totales.hoya_cancelados)}</td>
                  <td className="py-3 px-5 border">{formatNumber(totales.hoya_enviados)}</td>
                  {/* Ink */}
                  <td className="py-3 px-5 border">{formatNumber(totales.ink_recibidos)}</td>
                  <td className="py-3 px-5 border">{formatNumber(totales.ink_cancelados)}</td>
                  <td className="py-3 px-5 border">{formatNumber(totales.ink_enviados)}</td>
                  {/* NVI */}
                  <td className="py-3 px-5 border">{formatNumber(totales.nvi_recibidos)}</td>
                  <td className="py-3 px-5 border">{formatNumber(totales.nvi_cancelados)}</td>
                  <td className="py-3 px-5 border">{formatNumber(totales.nvi_enviados)}</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Vista para móviles y pantallas medianas */}
          <div className="md:hidden space-y-4">
            {fechasOrdenadas.map((fecha) => {
              const dia = datosPorDia[fecha];
              return (
                <div key={fecha} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
                  <div className="bg-blue-500 text-white p-4">
                    <div className="font-semibold text-lg">{fecha}</div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    {/* Hoya */}
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">Hoya Recibidos:</span>
                      <span className="font-bold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_hoya) : '-'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">Hoya Cancelados:</span>
                      <span className="font-bold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_hoya) : '-'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">Hoya Enviados:</span>
                      <span className="font-bold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_hoya) : '-'}</span>
                    </div>
                    {/* Ink */}
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">Ink Recibidos:</span>
                      <span className="font-bold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_ink) : '-'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">Ink Cancelados:</span>
                      <span className="font-bold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_ink) : '-'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">Ink Enviados:</span>
                      <span className="font-bold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_ink) : '-'}</span>
                    </div>
                    {/* NVI */}
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">NVI Recibidos:</span>
                      <span className="font-bold text-gray-500">{dia.recibidos ? formatNumber(dia.recibidos.total_nvi) : '-'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">NVI Cancelados:</span>
                      <span className="font-bold text-gray-500">{dia.cancelados ? formatNumber(dia.cancelados.total_nvi) : '-'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-2 flex justify-between">
                      <span className="text-gray-600">NVI Enviados:</span>
                      <span className="font-bold text-gray-500">{dia.enviados ? formatNumber(dia.enviados.total_nvi) : '-'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Card de totales para móvil */}
            {fechasOrdenadas.length > 0 && (
              <div className="bg-blue-600 text-white rounded-lg overflow-hidden border border-blue-700 shadow-md">
                <div className="bg-blue-700 text-white p-4">
                  <div className="font-bold text-lg">TOTALES</div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {/* Hoya */}
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">Hoya Recibidos:</span>
                    <span className="font-bold">{formatNumber(totales.hoya_recibidos)}</span>
                  </div>
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">Hoya Cancelados:</span>
                    <span className="font-bold">{formatNumber(totales.hoya_cancelados)}</span>
                  </div>
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">Hoya Enviados:</span>
                    <span className="font-bold">{formatNumber(totales.hoya_enviados)}</span>
                  </div>
                  {/* Ink */}
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">Ink Recibidos:</span>
                    <span className="font-bold">{formatNumber(totales.ink_recibidos)}</span>
                  </div>
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">Ink Cancelados:</span>
                    <span className="font-bold">{formatNumber(totales.ink_cancelados)}</span>
                  </div>
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">Ink Enviados:</span>
                    <span className="font-bold">{formatNumber(totales.ink_enviados)}</span>
                  </div>
                  {/* NVI */}
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">NVI Recibidos:</span>
                    <span className="font-bold">{formatNumber(totales.nvi_recibidos)}</span>
                  </div>
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">NVI Cancelados:</span>
                    <span className="font-bold">{formatNumber(totales.nvi_cancelados)}</span>
                  </div>
                  <div className="border-b border-blue-400 pb-2 flex justify-between">
                    <span className="text-blue-200">NVI Enviados:</span>
                    <span className="font-bold">{formatNumber(totales.nvi_enviados)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Notas importantes: </h3>
          <p className="text-gray-600">
            Este reporte muestra el flujo diario de recibidos, enviados y cancelados por cliente.
          </p>
        </div>
      </div>
    </>
  );
};

export default ReporteDeFlujo;