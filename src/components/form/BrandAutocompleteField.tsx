// src/components/form/BrandAutocompleteField.tsx
import { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getBrands } from "../../services/brandService";

interface Option {
  id: string | number;
  label: string;
}

interface BrandAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function BrandAutocompleteField({
  label = "Marca",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
}: BrandAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getBrands({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        const mapped = list.map((brand: any) => ({
          id: brand.id,
          label: brand.name,
        }));
        setOptions(mapped);
      } catch {
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  useEffect(() => {
    if (value && !options.find((opt) => opt.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

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
