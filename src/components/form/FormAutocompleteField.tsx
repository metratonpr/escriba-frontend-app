import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  id: string | number;
  label: string;
}

interface AutocompleteFieldProps {
  label: string;
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function FormAutocompleteField({
  label,
  options,
  value,
  onChange,
  placeholder = "Digite para buscar...",
  disabled = false,
  className = "",
}: AutocompleteFieldProps) {
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Combobox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Combobox.Input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            displayValue={(opt: Option) => opt?.label || ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Combobox.Button>

          {filteredOptions.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm">
              {filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.id}
                  value={option}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
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
          )}
        </div>
      </Combobox>
    </div>
  );
}
