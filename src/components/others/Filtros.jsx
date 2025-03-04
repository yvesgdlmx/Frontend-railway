import React from 'react';

const Filtros = ({
  filterField,
  filterValue,
  setFilterField,
  setFilterValue,
  filterOptions
}) => {
  return (
    <div className="mt-8 mx-4 mb-4 flex flex-col md:flex-row md:items-center md:space-x-4">
      <label className="text-gray-600 font-medium">
        Filtrar por:
        <select
          className="ml-2 p-2 border rounded-md"
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <input
        type="text"
        placeholder="Ingrese el valor a buscar..."
        className="mt-2 md:mt-0 w-60 p-2 border rounded-md"
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
      />
    </div>
  );
};
export default Filtros;