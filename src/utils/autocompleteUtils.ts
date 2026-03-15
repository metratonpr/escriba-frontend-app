export interface AutocompleteOption {
  id: string | number;
  label: string;
}

export function mergeSelectedOption<T extends AutocompleteOption>(
  options: T[],
  selected: AutocompleteOption | null
): T[] {
  if (!selected) {
    return options;
  }

  const selectedId = String(selected.id);
  if (options.some((option) => String(option.id) === selectedId)) {
    return options;
  }

  return [{ ...(selected as T), id: selected.id, label: selected.label }, ...options];
}
