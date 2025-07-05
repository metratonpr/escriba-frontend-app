import React, { useEffect, useState, useCallback } from "react";
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getCompanyGroups({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((item: any) => ({ id: item.id, label: item.name })));
      } catch {
        setLoadError("Erro ao carregar grupos de empresas.");
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
        name="company_group_id"
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        disabled={disabled}
        className={className}
        error={error}
        required={required}
        onInputChange={setQuery}
      />
      {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
    </>
  );
}
