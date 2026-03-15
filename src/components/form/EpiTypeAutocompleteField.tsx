import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEpiTypes } from "../../services/epiTypeService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface EpiTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

export default function EpiTypeAutocompleteField({
  label = "Tipo de EPI",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: EpiTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getEpiTypes({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((item: any) => ({ id: item.id, label: item.name })));
        setLoadError(null);
      } catch {
        setLoadError("Erro ao carregar tipos de EPI.");
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
    <div className={className}>
      <FormAutocompleteField
        name="epi_type_id"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={setQuery}
        disabled={disabled}
        placeholder="Digite para buscar..."
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
