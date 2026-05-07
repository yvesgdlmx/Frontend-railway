// FiltrosCustom.jsx

import React from 'react';
import Select from 'react-select';

const FiltrosCustom = ({ filterOptions, filters, setFilters }) => {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#D1D5DB',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9CA3AF',
      },
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

  // Cambiar campo
  const handleFieldChange = (index, option) => {
    const updatedFilters = [...filters];

    updatedFilters[index].field = option;

    setFilters(updatedFilters);
  };

  // Cambiar valor
  const handleValueChange = (index, value) => {
    const updatedFilters = [...filters];

    updatedFilters[index].value = value;

    setFilters(updatedFilters);
  };

  // Agregar filtro
  const addFilter = () => {
    setFilters([
      ...filters,
      {
        field: filterOptions[0],
        value: '',
      },
    ]);
  };

  // Eliminar filtro
  const removeFilter = (index) => {
    const updatedFilters = filters.filter((_, i) => i !== index);

    setFilters(updatedFilters);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      {filters.map((filter, index) => (
        <div key={index} className="flex flex-wrap items-center gap-4">
          {/* TEXTO */}
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filtrar por:</span>

          {/* SELECT */}
          <div className="w-64">
            <Select
              options={filterOptions}
              value={filter.field}
              onChange={(option) => handleFieldChange(index, option)}
              placeholder="Selecciona un campo"
              styles={customStyles}
            />
          </div>

          {/* INPUT */}
          <div className="w-64">
            <input
              type="text"
              value={filter.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder="Ingresa valor..."
              className="w-full px-4 py-1.5 border border-gray-300 rounded-md focus:ring focus:ring-gray-400 transition duration-150"
            />
          </div>

          {/* BOTÓN ELIMINAR */}
          {filters.length > 1 && (
            <button
              onClick={() => removeFilter(index)}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
            >
              X
            </button>
          )}

          {/* BOTÓN AGREGAR SOLO EN EL PRIMER FILTRO */}
          {index === 0 && (
            <button
              onClick={addFilter}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
            >
              + Agregar filtro
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default FiltrosCustom;
