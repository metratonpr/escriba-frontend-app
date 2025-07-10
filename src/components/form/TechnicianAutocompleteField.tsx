// src/components/form/TechnicianAutocompleteField.tsx
import React, { useCallback, useEffect, useState } from "react";
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
}

export default function TechnicianAutocompleteField({
  label = "Técnico",
  value,
  onChange,
  disabled = false,
  className = "",
}: TechnicianAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        setError("Erro ao buscar técnicos.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchTechnicians(query);
    return () => fetchTechnicians.cancel();
  }, [query, fetchTechnicians]);

  return (
    <>
      <FormAutocompleteField
        name="technician_id"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={setQuery}
        disabled={disabled}
        className={className}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </>
  );
}
