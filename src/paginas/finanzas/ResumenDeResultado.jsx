import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import TablaResumenResultado from '../../components/others/tables/TablaResumenResultado'
import CardResumenResultado from '../../components/others/cards/CardResumenResultado'
import Heading from '../../components/others/Heading'
import ModalMetasResultados from '../../components/modals/ModalMetasResultados'
import ModalAsistencias from '../../components/modals/ModalAsistencias'
import useResumenResultados from '../../../hooks/reportes/useResumenResultados'
import { Cog6ToothIcon, CalendarIcon, XMarkIcon, TableCellsIcon, RectangleStackIcon } from '@heroicons/react/24/outline'

const ResumenDeResultado = () => {
  const { 
    datos, 
    loading, 
    modalMetasDiariasOpen,
    modalAsistenciasOpen,
    anioSeleccionado,
    cambiarAnio,
    abrirModalMetasDiarias,
    cerrarModalMetasDiarias,
    cerrarModalAsistencias
  } = useResumenResultados();
  
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('tabla');
  const [esPantallaGrande, setEsPantallaGrande] = useState(window.innerWidth >= 1024);

  // Detectar tamaño de pantalla y cambiar vista automáticamente
  useEffect(() => {
    const handleResize = () => {
      const esGrande = window.innerWidth >= 1024;
      setEsPantallaGrande(esGrande);
      
      // Solo cambiar automáticamente la vista si NO es pantalla grande
      if (!esGrande) {
        setVistaActual('cards');
      }
    };

    // Ejecutar al montar
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generar opciones de años (últimos 5 años + próximo año)
  const generarOpcionesAnios = () => {
    const anioActual = new Date().getFullYear();
    const anios = [];
    for (let i = anioActual - 1; i <= anioActual + 1; i++) {
      anios.push({ value: i, label: i.toString() });
    }
    return anios;
  };

  const opcionesAnios = generarOpcionesAnios();

  // Filtrar datos por fecha
  const datosFiltrados = fechaBusqueda 
    ? datos.filter(item => item.diario === fechaBusqueda)
    : datos;

  // Estilos personalizados para react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#9ca3af'
      },
      padding: '2px',
      minHeight: '42px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#dbeafe'
      }
    })
  };

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Selectores de filtros */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          {/* Selector de Año */}
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Año
            </label>
            <Select
              value={opcionesAnios.find(opt => opt.value === anioSeleccionado)}
              onChange={(option) => cambiarAnio(option.value)}
              options={opcionesAnios}
              styles={customStyles}
              placeholder="Seleccionar año"
              isSearchable={false}
            />
          </div>

          {/* Buscador por fecha */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Buscar por fecha
            </label>
            <div className="relative">
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
          </div>
          
          {fechaBusqueda && (
            <button
              onClick={() => setFechaBusqueda('')}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 
                       hover:text-red-700 hover:bg-red-50 font-medium rounded-lg 
                       transition-all duration-200 border border-red-200 hover:border-red-300 mt-6"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Botones de configuración */}
        <div className="flex gap-3 w-full lg:w-auto lg:mt-6">
          {/* Botón para cambiar vista - SOLO en pantallas grandes */}
          {esPantallaGrande && (
            <button
              onClick={() => setVistaActual(vistaActual === 'tabla' ? 'cards' : 'tabla')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 
                       hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold 
                       transition-all duration-200 shadow-lg hover:shadow-xl 
                       transform hover:-translate-y-0.5 justify-center"
            >
              {vistaActual === 'tabla' ? (
                <>
                  <RectangleStackIcon className="h-5 w-5" />
                  <span>Vista Cards</span>
                </>
              ) : (
                <>
                  <TableCellsIcon className="h-5 w-5" />
                  <span>Vista Tabla</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={abrirModalMetasDiarias}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold 
                     transition-all duration-200 shadow-lg hover:shadow-xl 
                     transform hover:-translate-y-0.5 flex-1 lg:flex-none justify-center"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            <span>Configurar Metas</span>
          </button>
        </div>
      </div>

      {/* Badge de año seleccionado */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 
                    border-l-4 border-indigo-500 px-5 py-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Visualizando año {anioSeleccionado}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {datos.length} {datos.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </p>
          </div>
        </div>
      </div>

      {/* Badge de resultados de búsqueda por fecha */}
      {fechaBusqueda && (
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 
                      border-l-4 border-blue-500 px-5 py-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Resultados filtrados por fecha
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
      
      {/* Vista condicional: Tabla o Cards */}
      {vistaActual === 'tabla' ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <TablaResumenResultado datos={datosFiltrados} />
        </div>
      ) : (
        <CardResumenResultado datos={datosFiltrados} />
      )}
      
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