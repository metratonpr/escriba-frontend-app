import React, { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";

import debounce from "lodash/debounce";
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
}

export default function CompanyAutocompleteField({
  label = "Empresa",
  value,
  onChange,
  disabled = false,
  className = "",
}: CompanyAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getCompanies({
          search: term,
          page: 1,
          perPage: 25,
        });

        const list = Array.isArray(response) ? response : response.data;
        const mapped: Option[] = list.map((company: any) => ({
          id: company.id,
          label: company.name,
        }));

        setOptions(mapped);
      } catch (e) {
        setError("Erro ao buscar empresas.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchCompanies(query);
    return () => fetchCompanies.cancel();
  }, [query, fetchCompanies]);

  return (
    <>
      <FormAutocompleteField
        name="company_id"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={setQuery}
        disabled={disabled}
        className={className}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </>
  );
}
