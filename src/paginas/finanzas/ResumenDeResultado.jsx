import React, { useState } from 'react'
import TablaResumenResultado from '../../components/others/tables/TablaResumenResultado'
import Heading from '../../components/others/Heading'
import ModalMetasResultados from '../../components/modals/ModalMetasResultados'
import ModalAsistencias from '../../components/modals/ModalAsistencias'
import useResumenResultados from '../../../hooks/reportes/useResumenResultados'
import { Cog6ToothIcon, CalendarIcon, XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline'


const ResumenDeResultado = () => {
  const { 
    datos, 
    loading, 
    modalMetasDiariasOpen,
    modalAsistenciasOpen,
    abrirModalMetasDiarias,
    cerrarModalMetasDiarias,
    cerrarModalAsistencias
  } = useResumenResultados();
  const [fechaBusqueda, setFechaBusqueda] = useState('');

  // Filtrar datos por fecha
  const datosFiltrados = fechaBusqueda 
    ? datos.filter(item => item.diario === fechaBusqueda)
    : datos;

  if (loading) {
    return (
      <div className='p-6'>
        <Heading title={'Resumen de resultados'}/>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Heading con diseño mejorado */}
      <div className="border-b border-gray-200 pb-4">
        <Heading title={'Resumen de resultados'}/>
      </div>
      
      {/* Barra de controles con mejor diseño */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Buscador por fecha mejorado */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="date"
              value={fechaBusqueda}
              onChange={(e) => setFechaBusqueda(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       transition-all duration-200 text-sm font-medium text-gray-700
                       hover:border-gray-400 bg-white shadow-sm"
              placeholder="Seleccionar fecha"
            />
          </div>
          
          {fechaBusqueda && (
            <button
              onClick={() => setFechaBusqueda('')}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 
                       hover:text-red-700 hover:bg-red-50 font-medium rounded-lg 
                       transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Botones de configuración */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={abrirModalMetasDiarias}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold 
                     transition-all duration-200 shadow-lg hover:shadow-xl 
                     transform hover:-translate-y-0.5 flex-1 sm:flex-none justify-center"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span>Configurar Metas</span>
          </button>
        </div>
      </div>

      {/* Badge de resultados de búsqueda mejorado */}
      {fechaBusqueda && (
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 
                      border-l-4 border-blue-500 px-5 py-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Resultados filtrados
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {new Date(fechaBusqueda + 'T00:00:00').toLocaleDateString('es-MX', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              {datosFiltrados.length} {datosFiltrados.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>
      )}
      
      {/* Tabla con sombra mejorada */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <TablaResumenResultado datos={datosFiltrados} />
      </div>
      
      <ModalMetasResultados 
        isOpen={modalMetasDiariasOpen}
        onClose={cerrarModalMetasDiarias}
      />
      
      <ModalAsistencias 
        isOpen={modalAsistenciasOpen}
        onClose={cerrarModalAsistencias}
      />
    </div>
  )
}

export default ResumenDeResultado