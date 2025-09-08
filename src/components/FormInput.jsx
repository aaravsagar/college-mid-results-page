function FormInput({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  onBlur, 
  error, 
  placeholder,
  required = false,
  min,
  max,
  ...props 
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur && onBlur(name)}
        placeholder={placeholder}
        className={`form-input ${error ? 'error' : ''}`}
        min={min}
        max={max}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export default FormInput;