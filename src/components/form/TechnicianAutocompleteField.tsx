import { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import debounce from "lodash/debounce";
import { getEmployees } from "../../services/employeeService";

interface Option {
  id: string | number;
  label: string;
}

interface TechnicianAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function TechnicianAutocompleteField({
  label = "Técnico",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: TechnicianAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");


  const fetchTechnicians = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getEmployees({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        const mapped: Option[] = list.map((emp: any) => ({
          id: emp.id,
          label: emp.name,
        }));
        setOptions(mapped);        
      } catch {       
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchTechnicians(query);
    return () => fetchTechnicians.cancel();
  }, [query, fetchTechnicians]);

  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

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
