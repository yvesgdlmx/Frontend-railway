import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#D1D5DB',
    boxShadow: 'none',
    '&:hover': { borderColor: '#9CA3AF' },
    minHeight: '50px',
  }),
  valueContainer: (provided) => ({
    ...provided,
    minHeight: '40px',
    padding: '0 8px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    minHeight: '50px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};
const SelectWipDiario = ({
  options,
  value,
  onChange,
  placeholder,
  ...selectProps
}) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      styles={customStyles}
      {...selectProps}
    />
  );
};
export default SelectWipDiario;
