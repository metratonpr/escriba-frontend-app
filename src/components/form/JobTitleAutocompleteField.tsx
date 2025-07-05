import React, { useCallback, useEffect, useState } from "react";
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
}

export default function JobTitleAutocompleteField({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Cargo",
}: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchJobTitles = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) return;

      setLoading(true);
      try {
        const response = await getJobTitles({ search: term, page: 1, perPage: 25 });
        const data = Array.isArray(response) ? response : response.data;
        const mapped: Option[] = data.map((j: any) => ({
          id: j.id,
          label: j.name,
          _original: j,
        }));
        setOptions(mapped);
      } catch {
        setError("Erro ao buscar cargos.");
        setOptions([]);
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
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
