import React, { useEffect, useState, useCallback } from "react";
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
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getCompanyTypes({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((item: any) => ({ id: item.id, label: item.name })));
      } catch {
        setLoadError("Erro ao carregar tipos de empresa.");
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
        name="company_type_id"
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
