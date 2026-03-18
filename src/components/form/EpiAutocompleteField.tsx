import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEpis } from "../../services/epiService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

export type EpiAutocompleteOption = AutocompleteOption & {
  cost?: number | null;
};

interface EpiAutocompleteFieldProps {
  label?: string;
  value: EpiAutocompleteOption | null;
  onChange: (value: EpiAutocompleteOption | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: EpiAutocompleteOption[];
}

export default function EpiAutocompleteField({
  label = "EPI",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: EpiAutocompleteFieldProps) {
  const [options, setOptions] = useState<EpiAutocompleteOption[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchEpis = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getEpis({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;
        setOptions(
          list.map((epi: any) => ({
            id: epi.id,
            label: epi.name,
            cost: epi.cost ?? epi.custo ?? null,
          }))
        );
        setLoadError(null);
      } catch {
        setLoadError("Erro ao buscar EPIs.");
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

    fetchEpis(query);
    return () => fetchEpis.cancel();
  }, [fetchEpis, initialOptions, query, value]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, value));
  }, [value]);

  return (
    <div className={className}>
      <FormAutocompleteField
        name="epi_id"
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
