// src/components/form/CompanyGroupAutocompleteField.tsx
import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import { getCompanyGroups } from "../../services/companyGroupService";

interface Option {
  id: string | number;
  label: string;
}

interface CompanyGroupAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function CompanyGroupAutocompleteField({
  label = "Grupo de Empresas",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: CompanyGroupAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  // Função para buscar os grupos com debounce
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getCompanyGroups({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((item: any) => ({ id: item.id, label: item.name })));
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  // Executa busca quando a query muda
  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  // Garante que o valor selecionado esteja presente nas opções
  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <FormAutocompleteField
      name="company_group_id"
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
