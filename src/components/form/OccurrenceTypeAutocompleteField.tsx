import { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import debounce from "lodash/debounce";
import { getOccurrenceTypes } from "../../services/occurrenceTypeService";

interface Option {
  id: string | number;
  label: string;
}

interface OccurrenceTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function OccurrenceTypeAutocompleteField({
  label = "Tipo de Ocorrência",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: OccurrenceTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOccurrenceTypes = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getOccurrenceTypes({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        const mapped: Option[] = list.map((item: any) => ({ id: item.id, label: item.name }));
        setOptions(mapped);
        setLoadError(null);
      } catch {
        setLoadError("Erro ao buscar tipos de ocorrência.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchOccurrenceTypes(query);
    return () => fetchOccurrenceTypes.cancel();
  }, [query, fetchOccurrenceTypes]);

  useEffect(() => {
    if (value && !options.some((opt) => opt.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <div className={className}>
      <FormAutocompleteField
        name="occurrence_type_id"
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
