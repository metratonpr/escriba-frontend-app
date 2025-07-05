import React, { useEffect, useState, useCallback } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEpiTypes } from "../../services/epiTypeService";
import debounce from "lodash/debounce";

interface Option {
  id: string | number;
  label: string;
}

interface EpiTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function EpiTypeAutocompleteField({
  label = "Tipo de EPI",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
}: EpiTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getEpiTypes({ search: term, page: 1, perPage: 20 });
        const data = Array.isArray(res) ? res : res.data;
        setOptions(data.map((item: any) => ({ id: item.id, label: item.name })));
      } catch {
        setErrorMsg("Erro ao carregar tipos de EPI.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  return (
    <>
      <FormAutocompleteField
        label={label}
        name="epi_type_id"
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Digite para buscar..."
        className={className}
        error={error}
        onInputChange={(text) => setQuery(text)}
      />
      {errorMsg && <p className="text-sm text-red-600 mt-1">{errorMsg}</p>}
    </>
  );
}
