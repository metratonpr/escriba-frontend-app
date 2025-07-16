// src/components/form/CompanyAutocompleteField.tsx
import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getCompanies } from "../../services/companyService";

interface Option {
  id: string | number;
  label: string;
}

interface CompanyAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function CompanyAutocompleteField({
  label = "Empresa",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
}: CompanyAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  const fetchCompanies = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getCompanies({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        setOptions(list.map((company: any) => ({ id: company.id, label: company.name })));
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchCompanies(query);
    return () => fetchCompanies.cancel();
  }, [query, fetchCompanies]);

  // Garante que o valor atual esteja presente nas opções
  useEffect(() => {
    if (value && !options.find((opt) => opt.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <FormAutocompleteField
      name="company_id"
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      onInputChange={setQuery}
      disabled={disabled}
      className={className}
      error={error}
      placeholder="Digite para buscar..."
    />
  );
}
