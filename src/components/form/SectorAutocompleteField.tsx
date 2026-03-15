import { useEffect, useState } from "react";
import FormSelectField from "./FormSelectField";
import { getSectors } from "../../services/sectorService";
import { mergeSelectedOption, type AutocompleteOption } from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface SectorAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

export default function SectorAutocompleteField({
  label = "Setor",
  value,
  onChange,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: SectorAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOptions) {
      setOptions(mergeSelectedOption(initialOptions, value));
      return;
    }

    let mounted = true;

    getSectors({ page: 1, perPage: 500, sortBy: "name", sortOrder: "asc" })
      .then((response) => {
        if (!mounted) {
          return;
        }

        setOptions(
          response.data.map((item) => ({
            id: item.id,
            label: item.name,
          }))
        );
        setLoadError(null);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setLoadError("Erro ao carregar setores.");
        setOptions([]);
      });

    return () => {
      mounted = false;
    };
  }, [initialOptions, value]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, value));
  }, [value]);

  return (
    <div className={className}>
      <FormSelectField
        name="sector_id"
        label={label}
        value={value?.id ?? ""}
        options={options.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
        onChange={(event) => {
          const selectedOption =
            options.find((option) => String(option.id) === event.target.value) ?? null;
          onChange(selectedOption);
        }}
        disabled={disabled}
        error={error ?? loadError ?? undefined}
        required={required}
      />
    </div>
  );
}
