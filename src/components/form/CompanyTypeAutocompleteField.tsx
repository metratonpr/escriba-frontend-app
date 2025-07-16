// src/components/form/CompanyTypeAutocompleteField.tsx
import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import { getCompanyTypes } from "../../services/companyTypeService";

interface Option {
  id: string | number;
  label: string;
}

interface CompanyTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function CompanyTypeAutocompleteField({
  label = "Tipo de Empresa",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: CompanyTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  // Função assíncrona com debounce para buscar tipos de empresa
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getCompanyTypes({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((item: any) => ({ id: item.id, label: item.name })));
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  // Refaz a busca sempre que a query muda
  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  // Garante que o valor atual esteja nas opções
  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <FormAutocompleteField
      name="company_type_id"
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      className={className}
      error={error}
      required={required}
      placeholder="Digite para buscar..."
      onInputChange={setQuery}
    />
  );
}
