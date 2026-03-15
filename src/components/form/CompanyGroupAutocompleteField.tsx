import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import { getCompanyGroups } from "../../services/companyGroupService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface CompanyGroupAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

export default function CompanyGroupAutocompleteField({
  label = "Grupo de Empresas",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: CompanyGroupAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    if (!query.trim() && initialOptions) {
      setOptions(mergeSelectedOption(initialOptions, value));
      return;
    }

    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [fetchOptions, initialOptions, query, value]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, value));
  }, [value]);

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
