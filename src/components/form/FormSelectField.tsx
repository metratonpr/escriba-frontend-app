interface Option {
  value: string | number;
  label: string;
}

interface FormSelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id?: string;
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  className?: string;
}

const FormSelectField = ({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  error,
  className = "",
  required = false,
  disabled = false,
  ...rest
}: FormSelectFieldProps) => {
  const finalId = id || name;

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={finalId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={finalId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${finalId}-error` : undefined}
        className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm
          dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50
          ${error ? "border-red-500" : "border-gray-300"}`}
        {...rest}
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
      {error && (
        <p id={`${finalId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelectField;
