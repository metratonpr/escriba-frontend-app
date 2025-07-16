import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEpiTypes } from "../../services/epiTypeService";

interface Option {
  id: string | number;
  label: string;
}

interface EpiTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function EpiTypeAutocompleteField({
  label = "Tipo de EPI",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: EpiTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Busca debounced por tipos de EPI
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getEpiTypes({ search: term, page: 1, perPage: 20 });
        const data = Array.isArray(res) ? res : res.data;
        setOptions(data.map((item: any) => ({ id: item.id, label: item.name })));
        setLoadError(null);
      } catch {
        setLoadError("Erro ao carregar tipos de EPI.");
        setOptions([]);
      }
    }, 300),
    []
  );

  // Atualiza opções ao digitar
  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

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
