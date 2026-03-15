import { useEffect, useId, useMemo, useRef, useState } from "react";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";

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
  error?: FieldErrorValue;
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
  const emptyOptionValue = "__empty__";
  const [query, setQuery] = useState("");
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const generatedId = useId();
  const errorMessage = normalizeFieldError(error);
  const hasError = Boolean(errorMessage);
  const fieldId = name || generatedId;
  const labelId = `${fieldId}-label`;
  const statusId = `${fieldId}-status`;
  const errorId = `${fieldId}-error`;

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  const selectedValue = value ? String(value.id) : "";
  const selectValue = selectedValue || emptyOptionValue;

  const optionsById = useMemo(() => {
    const map = new Map<string, Option>();
    options.forEach((option) => map.set(String(option.id), option));
    return map;
  }, [options]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setQuery(text);
    onInputChange?.(text);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      selectRef.current?.focus();
    }

    if (event.key === "Enter" && !selectedValue && options.length > 0) {
      event.preventDefault();
      onChange(options[0]);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.currentTarget.value;
    const option = selectedId ? optionsById.get(selectedId) ?? null : null;
    onChange(option);
  };

  return (
    <div className={`w-full ${className}`}>
      <label
        id={labelId}
        htmlFor={fieldId}
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-white"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={fieldId}
        name={name}
        type="search"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-invalid={hasError}
        aria-describedby={`${statusId} ${hasError ? errorId : ""}`.trim()}
        className={`mb-2 h-10 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white
          disabled:cursor-not-allowed disabled:opacity-60 ${hasError ? "border-red-500" : "border-gray-300"}`}
      />

      <select
        ref={selectRef}
        id={`${fieldId}-select`}
        size={5}
        value={selectValue}
        onChange={handleSelectChange}
        disabled={disabled}
        aria-invalid={hasError}
        aria-labelledby={labelId}
        aria-describedby={`${statusId} ${hasError ? errorId : ""}`.trim()}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white
          disabled:cursor-not-allowed disabled:opacity-60 ${hasError ? "border-red-500" : "border-gray-300"}`}
      >
        {!selectedValue && options.length > 0 ? (
          <option value={emptyOptionValue} disabled hidden>
            Selecione...
          </option>
        ) : null}

        {options.length > 0 ? (
          options.map((option) => (
            <option key={String(option.id)} value={String(option.id)}>
              {option.label}
            </option>
          ))
        ) : (
          <option value={emptyOptionValue} disabled>
            Selecione...
          </option>
        )}
      </select>

      <div id={statusId} aria-live="polite" className="mt-2">
        {!options.length && query.trim().length > 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum resultado encontrado.</p>
        ) : null}
      </div>

      {hasError && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
