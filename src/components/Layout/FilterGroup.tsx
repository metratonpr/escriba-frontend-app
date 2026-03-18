import type { ChangeEvent } from "react";
import SearchBar from "./ui/SearchBar";
import FormSelectField from "../form/FormSelectField";

export type FilterSelectOption = {
  value: string;
  label: string;
};

export type FilterField = {
  id: string;
  name: string;
  label: string;
  value: string | undefined;
  options: FilterSelectOption[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  error?: string;
};

export type FilterGroupProps = {
  search?: {
    onSearch: (value: string) => void;
    onClear?: () => void;
    placeholder?: string;
  };
  description?: string;
  selectFields?: FilterField[];
};

export default function FilterGroup({ search, description, selectFields }: FilterGroupProps) {
  return (
    <section className="space-y-3">
      {search && (
        <>
          <SearchBar
            placeholder={search.placeholder ?? "Pesquisar..."}
            onSearch={search.onSearch}
            onClear={search.onClear}
            fullWidth
          />
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </>
      )}

      {selectFields && selectFields.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {selectFields.map((field) => (
            <FormSelectField
              key={field.id}
              id={field.id}
              name={field.name}
              label={field.label}
              value={field.value ?? ""}
              onChange={field.onChange}
              options={field.options}
              disabled={field.disabled}
              error={field.error}
            />
          ))}
        </div>
      )}
    </section>
  );
}
