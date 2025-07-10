import React, { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import debounce from "lodash/debounce";
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
}

export default function EventTypeAutocompleteField({
  label = "Tipo de Evento",
  value,
  onChange,
  disabled = false,
  className = "",
}: EventTypeAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        setError("Erro ao carregar tipos de evento.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  return (
    <>
      <FormAutocompleteField
        name="event_type_id"
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={setQuery}
        disabled={disabled}
        className={className}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </>
  );
}
