export const selectStyle = {
  option: (provided, state) => ({
    ...provided,
    background: state.isFocused ? '#666' : '#333',
    color: '#eee',
  }),
  control: (provided) => ({
    ...provided,
    background: '#333',
    borderColor: '#444',
  }),
  menu: (provided, state) => ({
    ...provided,
    background: '#333',
    marginTop: '0',
  }),
  input: (provided, state) => ({
    ...provided,
    color: '#eee',
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: '#eee',
  }),
  multiValue: (provided, state) => ({
    ...provided,
    color: 'red',
    background: '#444',
  }),
  valueLabel: (provided, state) => ({
    ...provided,
    color: '#eee',
  }),
  multiValueLabel: (provided, state) => ({
    ...provided,
    color: '#eee',
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    color: '#888',
    cursor: 'pointer',
  }),
}
