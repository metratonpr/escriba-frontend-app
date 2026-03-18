import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";

interface FormTimePickerFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: FieldErrorValue;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormTimePickerField: React.FC<FormTimePickerFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  const errorMessage = normalizeFieldError(error);
  const hasError = Boolean(errorMessage);

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="time"
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
          hasError ? "border-red-500" : "border-gray-300"
        }`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormTimePickerField;
