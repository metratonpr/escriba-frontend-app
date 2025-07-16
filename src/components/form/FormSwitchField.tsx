

interface FormSwitchFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

const FormSwitchField: React.FC<FormSwitchFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
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
      />
    </div>
  );
};

export default FormSwitchField;
