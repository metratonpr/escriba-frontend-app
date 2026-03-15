import { useCallback, useEffect, useRef, useState } from "react";
import FormAutocompleteField from "./FormAutocompleteField";
import { getDocumentTypes } from "../../services/documentTypeService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface DocumentTypeAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

const MIN_SEARCH_LENGTH = 2;
const FETCH_LIMIT = 25;

function toUniqueOptions(items: any[]): Option[] {
  const map = new Map<string, Option>();

  items.forEach((item) => {
    if (item?.id == null) {
      return;
    }

    const id = String(item.id);
    if (map.has(id)) {
      return;
    }

    map.set(id, {
      id,
      label: typeof item.name === "string" ? item.name : id,
    });
  });

  return Array.from(map.values());
}

export default function DocumentTypeAutocompleteField({
  label = "Tipo de Documento",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: DocumentTypeAutocompleteFieldProps) {
  const requestIdRef = useRef(0);
  const selectedRef = useRef<Option | null>(value);
  const debounceRef = useRef<number | null>(null);

  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [baseOptions, setBaseOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");

  const loadOptions = useCallback(async (term: string): Promise<Option[]> => {
    const response = await getDocumentTypes({
      search: term,
      page: 1,
      perPage: FETCH_LIMIT,
    });

    return toUniqueOptions(response.data);
  }, []);

  useEffect(() => {
    selectedRef.current = value ? { id: String(value.id), label: value.label } : null;
    setOptions((prev) => mergeSelectedOption(prev, selectedRef.current));
  }, [value]);

  useEffect(() => {
    if (!initialOptions) {
      return;
    }

    const merged = mergeSelectedOption(initialOptions, selectedRef.current);
    setBaseOptions(merged);
    setOptions(merged);
  }, [initialOptions]);

  useEffect(() => {
    if (initialOptions) {
      return;
    }

    let canceled = false;
    const currentRequest = ++requestIdRef.current;

    const fetchInitial = async () => {
      try {
        const fetched = await loadOptions("");
        if (canceled || requestIdRef.current !== currentRequest) {
          return;
        }

        setBaseOptions(fetched);
        setOptions(mergeSelectedOption(fetched, selectedRef.current));
      } catch {
        if (canceled || requestIdRef.current !== currentRequest) {
          return;
        }

        setBaseOptions([]);
        setOptions(mergeSelectedOption([], selectedRef.current));
      }
    };

    void fetchInitial();

    return () => {
      canceled = true;
    };
  }, [initialOptions, loadOptions]);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const term = query.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setOptions(mergeSelectedOption(baseOptions, selectedRef.current));
      return;
    }

    const currentRequest = ++requestIdRef.current;
    debounceRef.current = window.setTimeout(async () => {
      try {
        const fetched = await loadOptions(term);
        if (requestIdRef.current !== currentRequest) {
          return;
        }

        setOptions(mergeSelectedOption(fetched, selectedRef.current));
      } catch {
        if (requestIdRef.current !== currentRequest) {
          return;
        }

        setOptions(mergeSelectedOption([], selectedRef.current));
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [baseOptions, loadOptions, query]);

  return (
    <FormAutocompleteField
      name="document_type_id"
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      onInputChange={setQuery}
      disabled={disabled}
      className={className}
      error={error}
      required={required}
      placeholder="Digite para buscar..."
    />
  );
}
