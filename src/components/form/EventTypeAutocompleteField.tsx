import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEventTypes } from "../../services/eventTypeService";

interface Option {
  id: string | number;
  label: string;
}

interface EventTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
}

export default function EventTypeAutocompleteField({
  label = "Tipo de Evento",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
}: EventTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Função assíncrona para buscar tipos de eventos com debounce
  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getEventTypes({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        const mapped = list.map((item: any) => ({
          id: item.id,
          label: item.nome_tipo_evento,
        }));
        setOptions(mapped);
        setLoadError(null);
      } catch {
        setLoadError("Erro ao carregar tipos de evento.");
        setOptions([]);
      }
    }, 300),
    []
  );

  // Atualiza opções quando a query muda
  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  return (
    <div className={className}>
      <FormAutocompleteField
        name="event_type_id"
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
