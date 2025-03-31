import React, { useState } from 'react';
import Select from 'react-select';
import Heading from '../../components/others/Heading';
import Nvi from '../../components/finanzas/Nvi';
import Hoya from '../../components/finanzas/Hoya';
import Ink from '../../components/finanzas/Ink';
import CardFacturacionNvi from '../../components/others/cards/CardFacturacionNvi';
import ModalSemanas from '../../components/modals/ModalSemanas';
// Importamos las opciones y datos generados en el módulo de constantes
import { optionsYear, optionsWeek, dataSemanas } from '../../components/others/arrays/arrayFinanzas';
// Importamos el ícono de calendario de Heroicons v2
import { CalendarIcon } from '@heroicons/react/24/outline';
const Datos = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estilos personalizados para react‑select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#D1D5DB',
      boxShadow: 'none',
      '&:hover': { borderColor: '#9CA3AF' },
      borderRadius: '0.375rem'
    }),
    menu: (provided) => ({ ...provided, zIndex: 9999 })
  };
  return (
    <>
      <div className="px-4 py-2">
        <Heading title="Reporte de Facturación" />
      </div>
      <div className="p-2 space-y-10">
        {/* Filtros mediante select para año y semana */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="w-64">
            <Select 
              options={optionsYear}
              value={selectedYear} 
              onChange={(option) => setSelectedYear(option)} 
              placeholder="Selecciona un año" 
              styles={customStyles}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-64">
              <Select 
                options={optionsWeek}
                value={selectedWeek} 
                onChange={(option) => setSelectedWeek(option)} 
                placeholder="Selecciona una semana" 
                styles={customStyles}
              />
            </div>
            {/* Botón para abrir el modal con ícono de calendario de Heroicons */}
            <button 
              className="flex items-center px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors shadow-md"
              onClick={() => setIsModalOpen(true)}
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="ml-2">Ver rangos</span>
            </button>
          </div>
        </div>
        {/* Renderiza los componentes hijos solo cuando se hayan seleccionado ambos filtros */}
        {selectedYear && selectedWeek && (
          <>
            <Nvi anio={selectedYear.value} semana={selectedWeek.value} />
            <Hoya anio={selectedYear.value} semana={selectedWeek.value} />
            <Ink anio={selectedYear.value} semana={selectedWeek.value} />
          </>
        )}
        {/* Sección para mostrar cards en un grid de 3 columnas */}
        {selectedYear && selectedWeek && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardFacturacionNvi anio={selectedYear.value} semana={selectedWeek.value} />
          </div>
        )}
        {/* Sección de escritorio (tablas) solo visible en md y superiores */}
        <div className="hidden md:block space-y-10">
          {/* Aquí incluirás el resto de la visualización para escritorio */}
        </div>
      </div>
      {/* Modal para mostrar todas las semanas y su rango de fechas */}
      <ModalSemanas 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        semanasData={dataSemanas}
      />
    </>
  );
};
export default Datos;