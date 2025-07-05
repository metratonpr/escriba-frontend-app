import React, { useEffect, useState, useCallback } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import { getDocumentTypes } from "../../services/documentTypeService";
import debounce from "lodash/debounce";

interface Option {
  id: string | number;
  label: string;
}

interface DocumentTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function DocumentTypeAutocompleteField({
  label = "Tipo de Documento",
  value,
  onChange,
  disabled = false,
  className = "",
}: DocumentTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getDocumentTypes({ search: term, page: 1, perPage: 20 });
        const types = Array.isArray(res) ? res : res.data;
        setOptions(types.map((t: any) => ({ id: t.id, label: t.name })));
      } catch {
        setError("Erro ao carregar tipos de documentos.");
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
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Digite para buscar..."
        className={className}
        // intercepta digitação para fazer busca
        onInputChange={(text) => setQuery(text)}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </>
  );
}
