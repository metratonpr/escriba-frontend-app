import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { getJobTitles } from "../../services/jobTitleService";
import FormAutocompleteField from "./FormAutocompleteField";

interface Option {
  id: string | number;
  label: string;
  _original?: any;
}

interface Props {
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

export default function JobTitleAutocompleteField({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Cargo",
  error,
  required = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchJobTitles = useCallback(
    debounce(async (term: string) => {
      if (term.trim().length < 2) return;

      setLoading(true);
      try {
        const response = await getJobTitles({ search: term, page: 1, perPage: 25 });
        const data = Array.isArray(response) ? response : response.data;
        setOptions(
          data.map((j: any) => ({
            id: j.id,
            label: j.name,
            _original: j,
          }))
        );
        setLoadError(null);
      } catch {
        setOptions([]);
        setLoadError("Erro ao buscar cargos.");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchJobTitles(query);
    return () => fetchJobTitles.cancel();
  }, [query, fetchJobTitles]);

  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

  return (
    <div className={className}>
      <FormAutocompleteField
        name="job_title_id"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={setQuery}
        disabled={disabled || loading}
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
