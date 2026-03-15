import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEmployees } from "../../services/employeeService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface TechnicianAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

export default function TechnicianAutocompleteField({
  label = "Tecnico",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: TechnicianAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");

  const fetchTechnicians = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getEmployees({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        setOptions(list.map((employee: any) => ({ id: employee.id, label: employee.name })));
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (!query.trim() && initialOptions) {
      setOptions(mergeSelectedOption(initialOptions, value));
      return;
    }

    fetchTechnicians(query);
    return () => fetchTechnicians.cancel();
  }, [fetchTechnicians, initialOptions, query, value]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, value));
  }, [value]);

  return (
    <FormAutocompleteField
      name="technician_id"
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      onInputChange={setQuery}
      disabled={disabled}
      className={className}
      error={error ?? undefined}
      required={required}
      placeholder="Digite para buscar..."
    />
  );
}
