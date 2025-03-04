import React from 'react';
import Select from 'react-select';
const FiltrosCustom = ({
  filterOptions,
  selectedFilterField,
  onChangeFilterField,
  filterValue,
  onChangeFilterValue,
}) => {
  // Definición de estilos personalizados para react‑select (encapsulados en este componente)
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
  return (
    // Usamos un contenedor horizontal para que la leyenda quede a un lado del select
    <div className="flex items-center gap-4 mb-8">
      <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
      <div className="w-64">
        <Select
          options={filterOptions}
          value={selectedFilterField}
          onChange={onChangeFilterField}
          placeholder="Selecciona un campo"
          styles={customStyles}
        />
      </div>
      <div className="w-64">
        <input
          type="text"
          value={filterValue}
          onChange={onChangeFilterValue}
          placeholder="Ingresa valor..."
          className="w-full px-4 py-1.5 border border-gray-300 rounded-md focus:ring focus:ring-gray-400 transition duration-150"
        />
      </div>
    </div>
  );
};
export default FiltrosCustom;