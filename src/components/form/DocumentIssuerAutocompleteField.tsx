// src/components/form/DocumentIssuerAutocompleteField.tsx
import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getDocumentIssuers } from "../../services/documentIssuerService";

interface Option {
  id: string | number;
  label: string;
}

interface DocumentIssuerAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function DocumentIssuerAutocompleteField({
  label = "Emissor do Documento",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: DocumentIssuerAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  // Função de busca com debounce
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getDocumentIssuers({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(res) ? res : res.data;
        const mapped = list.map((item: any) => ({
          id: item.id,
          label: item.name,
        }));
        setOptions(mapped);
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  // Busca reativa a mudanças de query
  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  // Inclui valor manual caso não esteja na lista de opções
  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <FormAutocompleteField
      name="document_issuer_id"
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      onInputChange={setQuery}
      disabled={disabled}
      className={className}
      error={error}
      required={required}
      placeholder="Digite para buscar..."
    />
  );
}
