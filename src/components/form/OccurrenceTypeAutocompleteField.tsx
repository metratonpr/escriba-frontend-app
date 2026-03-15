import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getOccurrenceTypes } from "../../services/occurrenceTypeService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface OccurrenceTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

export default function OccurrenceTypeAutocompleteField({
  label = "Tipo de Ocorrencia",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: OccurrenceTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOccurrenceTypes = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getOccurrenceTypes({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        setOptions(list.map((item: any) => ({ id: item.id, label: item.name })));
        setLoadError(null);
      } catch {
        setLoadError("Erro ao buscar tipos de ocorrencia.");
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

    fetchOccurrenceTypes(query);
    return () => fetchOccurrenceTypes.cancel();
  }, [fetchOccurrenceTypes, initialOptions, query, value]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, value));
  }, [value]);

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
