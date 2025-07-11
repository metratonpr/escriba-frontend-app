import React, { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import debounce from "lodash/debounce";
import { getOccurrenceTypes } from "../../services/occurrenceTypeService";

interface Option {
  id: string | number;
  label: string;
}

interface OccurrenceTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function OccurrenceTypeAutocompleteField({
  label = "Tipo de Ocorrência",
  value,
  onChange,
  disabled = false,
  className = "",
}: OccurrenceTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getOccurrenceTypes({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        const mapped: Option[] = list.map((item: any) => ({ id: item.id, label: item.name }));
        setOptions(mapped);
      } catch {
        setError("Erro ao buscar tipos de ocorrência.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchData(query);
    return () => fetchData.cancel();
  }, [query, fetchData]);

  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <>
      <FormAutocompleteField
        name="occurrence_type_id"
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
