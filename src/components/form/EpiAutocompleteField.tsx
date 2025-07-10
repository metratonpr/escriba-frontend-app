import React, { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import debounce from "lodash/debounce";
import { getEpis } from "../../services/epiService";

interface Option {
  id: string | number;
  label: string;
}

interface EpiAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function EpiAutocompleteField({
  label = "EPI",
  value,
  onChange,
  disabled = false,
  className = "",
}: EpiAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchEpis = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getEpis({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;

        const mapped: Option[] = list.map((epi: any) => ({
          id: epi.id,
          label: epi.name,
        }));

        setOptions(mapped);
      } catch {
        setError("Erro ao buscar EPIs.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchEpis(query);
    return () => fetchEpis.cancel();
  }, [query, fetchEpis]);

  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <>
      <FormAutocompleteField
        name="epi_id"
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
