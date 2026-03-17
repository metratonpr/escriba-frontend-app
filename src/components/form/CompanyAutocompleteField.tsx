import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getCompanies } from "../../services/companyService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface CompanyAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  initialOptions?: Option[];
}

export default function CompanyAutocompleteField({
  label = "Empresa",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  initialOptions,
}: CompanyAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");
  const valueRef = useRef(value);

  const fetchCompanies = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getCompanies({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        const mapped = list.map((company: any) => ({ id: company.id, label: company.name }));
        setOptions(mergeSelectedOption(mapped, valueRef.current));
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (!query.trim() && initialOptions) {
      setOptions(mergeSelectedOption(initialOptions, value));
      return;
    }

    fetchCompanies(query);
    return () => fetchCompanies.cancel();
  }, [fetchCompanies, initialOptions, query, value]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, value));
    valueRef.current = value;
  }, [value]);

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
