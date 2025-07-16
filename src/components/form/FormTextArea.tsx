interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export const FormTextArea = ({
  id,
  label,
  name,
  value = "",
  onChange,
  error,
  required = false,
  rows = 3,
  className = "",
  ...rest
}: FormTextAreaProps) => {
  const finalId = id || name;

  return (
    <div className={className}>
      <label
        htmlFor={finalId}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={finalId}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${finalId}-error` : undefined}
        className={`bg-gray-50 border text-sm rounded-lg block w-full p-2.5 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50
          ${error ? "border-red-500" : "border-gray-300"}`}
        {...rest}
      />
      {error && (
        <p id={`${finalId}-error`} className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
