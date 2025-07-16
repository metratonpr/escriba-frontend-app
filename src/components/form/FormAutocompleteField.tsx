import  { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  id: string | number;
  label: string;
}

interface AutocompleteFieldProps {
  label: string;
  name?: string;
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  onInputChange?: (value: string) => void;
}

export default function FormAutocompleteField({
  label,
  name = "",
  options,
  value,
  onChange,
  placeholder = "Digite para buscar...",
  disabled = false,
  className = "",
  error,
  required = false,
  onInputChange,
}: AutocompleteFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    onInputChange?.(text);
  };

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Combobox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Combobox.Input
            id={name}
            name={name}
            className={`h-10 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-gray-50 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white
              ${error ? "border-red-500" : "border-gray-300"}`}
            displayValue={(opt: Option) => opt?.label || ""}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            placeholder={placeholder}
            autoComplete="off"
          />

          <Combobox.Button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2"
            onClick={handleButtonClick}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Combobox.Button>

          {isOpen && (
            options.length > 0 ? (
              <Combobox.Options
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm dark:bg-gray-800"
                aria-label={`Sugestões para ${label}`}
              >
                {options.map((option) => (
                  <Combobox.Option
                    key={option.id}
                    value={option}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-blue-600 text-white" : "text-gray-900 dark:text-white"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {option.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            ) : (
              query && (
                <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-2 px-3 text-sm text-gray-500 shadow ring-1 ring-black/5 dark:bg-gray-800 dark:text-gray-400">
                  Nenhum resultado encontrado.
                </div>
              )
            )
          )}
        </div>
      </Combobox>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
