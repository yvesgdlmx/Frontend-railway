import React from 'react';
import Select from 'react-select';
// Opciones para los selects
const optionsYear = [
  { value: 2025, label: '2025' },
  { value: 2024, label: '2024' },
  { value: 2023, label: '2023' }
];
const optionsMonth = [
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
const optionsDay = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1)
}));
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
const SelectAnioMesDia = ({
  selectedYear,
  selectedMonth,
  selectedDay,
  setSelectedYear,
  setSelectedMonth,
  setSelectedDay
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center mt-4 ml-16 md:ml-0">
      <div className="w-64">
        <Select 
          options={optionsYear}
          value={selectedYear}
          onChange={(option) => setSelectedYear(option)}
          placeholder="Selecciona un año"
          styles={customStyles}
        />
      </div>
      <div className="w-64">
        <Select 
          options={optionsMonth}
          value={selectedMonth}
          onChange={(option) => setSelectedMonth(option)}
          placeholder="Selecciona un mes"
          styles={customStyles}
        />
      </div>
      <div className="w-64">
        <Select 
          options={optionsDay}
          value={selectedDay}
          onChange={(option) => setSelectedDay(option)}
          placeholder="Selecciona un día"
          styles={customStyles}
        />
      </div>
    </div>
  );
};
export default SelectAnioMesDia;