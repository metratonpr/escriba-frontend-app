interface FormTextAreaProps {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

const FormTextArea = ({ id, label, name, value, onChange, error, required, rows = 3 }: FormTextAreaProps) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {label}
    </label>
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      required={required}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);
