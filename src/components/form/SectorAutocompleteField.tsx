import { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import debounce from "lodash/debounce";
import { getSectors } from "../../services/sectorService";

interface Option {
  id: string | number;
  label: string;
}

interface SectorAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function SectorAutocompleteField({
  label = "Setor",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: SectorAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchData = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getSectors({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        const mapped: Option[] = list.map((item: any) => ({ id: item.id, label: item.name }));
        setOptions(mapped);
        setLoadError(null);
      } catch {
        setLoadError("Erro ao buscar setores.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchData(query);
    return () => fetchData.cancel();
  }, [query, fetchData]);

  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <div className={className}>
      <FormAutocompleteField
        name="sector_id"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={setQuery}
        disabled={disabled}
        error={error}
        required={required}
      />
      {loadError && (
        <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
          {loadError}
        </p>
      )}
    </div>
  );
}
