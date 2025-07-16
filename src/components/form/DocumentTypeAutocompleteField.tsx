// src/components/form/DocumentTypeAutocompleteField.tsx
import { useEffect, useState, useCallback } from "react";
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
  error?: string;
  required?: boolean;
}

export default function DocumentTypeAutocompleteField({
  label = "Tipo de Documento",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: DocumentTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  // Função de busca com debounce para performance
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getDocumentTypes({ search: term, page: 1, perPage: 20 });
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

  // Dispara busca quando a query muda
  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  // Garante que o valor esteja presente nas opções
  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <FormAutocompleteField
      name="document_type_id"
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
