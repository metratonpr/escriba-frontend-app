import React, { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getDocumentIssuers } from "../../services/documentIssuerService";

interface Option {
  id: number | string;
  label: string;
}

interface DocumentIssuerAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
}

export default function DocumentIssuerAutocompleteField({
  label = "Emissor do Documento",
  value,
  onChange,
  disabled = false,
  className = "",
}: DocumentIssuerAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // função para buscar os emissores de documento da API
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getDocumentIssuers({ search: term, page: 1, perPage: 25 });
        const issuers = Array.isArray(res) ? res : res.data;

        setOptions(
          issuers.map((i: any) => ({
            id: i.id,
            label: i.name,
          }))
        );
      } catch {
        setError("Erro ao carregar emissores de documentos.");
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
        onInputChange={(text) => setQuery(text)}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </>
  );
}
