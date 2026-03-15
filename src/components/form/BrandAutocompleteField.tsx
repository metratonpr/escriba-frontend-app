import { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getBrands } from "../../services/brandService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface BrandAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  initialOptions?: Option[];
}

export default function BrandAutocompleteField({
  label = "Marca",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  initialOptions,
}: BrandAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getBrands({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(
          list.map((brand: any) => ({
            id: brand.id,
            label: brand.name,
          }))
        );
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
      name="brand_id"
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
