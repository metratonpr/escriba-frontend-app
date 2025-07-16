

interface FormDateTimePickerFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const FormDateTimePickerField: React.FC<FormDateTimePickerFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="datetime-local"
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormDateTimePickerField;
