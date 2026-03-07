import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";

interface FormSwitchFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: FieldErrorValue;
  disabled?: boolean;
  className?: string;
}

const FormSwitchField: React.FC<FormSwitchFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  error,
  disabled = false,
  className = "",
}) => {
  const errorMessage = normalizeFieldError(error);
  const hasError = Boolean(errorMessage);

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      </div>
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormSwitchField;
