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
const compactStyles = {
  ...customStyles,
  control: (provided, state) => ({
    ...provided,
    minHeight: '38px',
    border: `1px solid ${state.isFocused ? '#9bb9e7' : '#dce3ed'}`,
    borderRadius: '5px',
    backgroundColor: '#fff',
    boxShadow: state.isFocused ? '0 0 0 2px #e8f0ff' : 'none',
    '&:hover': { borderColor: '#adc3e4' },
  }),
  valueContainer: (provided) => ({ ...provided, minHeight: '36px', padding: '0 10px' }),
  indicatorsContainer: (provided) => ({ ...provided, minHeight: '36px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({ ...provided, padding: '7px', color: '#8392a6' }),
  singleValue: (provided) => ({ ...provided, color: '#52647d', fontSize: '13px', fontWeight: 500 }),
  placeholder: (provided) => ({ ...provided, color: '#9aa6b5', fontSize: '13px' }),
};
const SelectWipDiario = ({
  options,
  value,
  onChange,
  placeholder,
  compact = false,
  ...selectProps
}) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      styles={compact ? compactStyles : customStyles}
      {...selectProps}
    />
  );
};
export default SelectWipDiario;
