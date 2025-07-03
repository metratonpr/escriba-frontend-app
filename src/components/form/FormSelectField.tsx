import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const FormSelectField: React.FC<FormSelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  error,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormSelectField;
