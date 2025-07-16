import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEpis } from "../../services/epiService";

interface Option {
  id: string | number;
  label: string;
}

interface EpiAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function EpiAutocompleteField({
  label = "EPI",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: EpiAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch debounced para evitar múltiplas requisições em digitação
  const fetchEpis = useCallback(
    debounce(async (term: string) => {
      try {
        const response = await getEpis({ search: term, page: 1, perPage: 25 });
        const list = Array.isArray(response) ? response : response.data;

        const mapped: Option[] = list.map((epi: any) => ({
          id: epi.id,
          label: epi.name,
        }));

        setOptions(mapped);
        setLoadError(null);
      } catch {
        setLoadError("Erro ao buscar EPIs.");
        setOptions([]);
      }
    }, 300),
    []
  );

  // Executa a busca com base na query atual
  useEffect(() => {
    fetchEpis(query);
    return () => fetchEpis.cancel();
  }, [query, fetchEpis]);

  // Garante que o valor selecionado esteja na lista, mesmo se vier de fora
  useEffect(() => {
    if (value && !options.find((o) => o.id === value.id)) {
      setOptions((prev) => [...prev, value]);
    }
  }, [value, options]);

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
