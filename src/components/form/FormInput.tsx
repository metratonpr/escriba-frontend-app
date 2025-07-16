interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  name: string;
    value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
}

export const FormInput = ({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = "",
  autoComplete = "off",
  className = "",
  ...rest
}: FormInputProps) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`bg-gray-50 border text-sm rounded-lg block w-full p-2.5 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50
          ${error ? "border-red-500" : "border-gray-300"}`}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
