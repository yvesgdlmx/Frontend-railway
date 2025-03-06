import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#D1D5DB',
    boxShadow: 'none',
    '&:hover': { borderColor: '#9CA3AF' },
    height: '50px',
    minHeight: '50px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '40px',
    padding: '0 8px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '50px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};
const SelectWipDiario = ({ options, value, onChange, placeholder }) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      styles={customStyles}
    />
  );
};
export default SelectWipDiario;