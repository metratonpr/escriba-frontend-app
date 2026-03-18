import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "./FormAutocompleteField";
import { getEmployeesByJobTitle } from "../../services/employeeService";
import {
  mergeSelectedOption,
  type AutocompleteOption,
} from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface TechnicianAutocompleteFieldProps {
  label?: string;
  value: Option | null;
  onChange: (value: Option | null) => void;
  jobTitle?: string;
  exactJobTitle?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  required?: boolean;
  initialOptions?: Option[];
}

const normalizeText = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const TARGET_JOB_TITLE = "tecnico em seguranca do trabalho";

export default function TechnicianAutocompleteField({
  label = "Tecnico",
  value,
  onChange,
  jobTitle = "tecnico",
  exactJobTitle = false,
  disabled = false,
  className = "",
  error,
  required = false,
  initialOptions,
}: TechnicianAutocompleteFieldProps) {
  const [options, setOptions] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [allTechnicians, setAllTechnicians] = useState<Option[]>(() =>
    mergeSelectedOption(initialOptions ?? [], value)
  );
  const [query, setQuery] = useState("");

  const fetchTechnicians = useCallback(
    debounce(async () => {
      try {
        const list = await getEmployeesByJobTitle({
          jobTitle,
          exact: exactJobTitle,
        });

        const nextOptions = list
          .filter((employee) => {
            const assignmentMatches =
              employee.assignments?.some(
                (assignment) => normalizeText(assignment.job_title?.name) === TARGET_JOB_TITLE
              ) ?? false;

            const jobTitlesMatch =
              employee.job_titles?.some(
                (jobTitleItem) => normalizeText(jobTitleItem.name) === TARGET_JOB_TITLE
              ) ?? false;

            return assignmentMatches || jobTitlesMatch;
          })
          .map((employee) => ({ id: employee.id, label: employee.name }));

        setAllTechnicians(mergeSelectedOption(nextOptions, value));
      } catch {
        setAllTechnicians(mergeSelectedOption([], value));
        setOptions([]);
      }
    }, 300),
    [exactJobTitle, jobTitle, value]
  );

  useEffect(() => {
    fetchTechnicians();
    return () => fetchTechnicians.cancel();
  }, [fetchTechnicians]);

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source =
      allTechnicians.length > 0
        ? allTechnicians
        : mergeSelectedOption(initialOptions ?? [], value);

    if (!normalizedQuery) {
      setOptions(mergeSelectedOption(source, value));
      return;
    }

    setOptions(
      mergeSelectedOption(
        source.filter((option) => option.label.toLowerCase().includes(normalizedQuery)),
        value
      )
    );
  }, [allTechnicians, initialOptions, query, value]);

  useEffect(() => {
    setAllTechnicians((prev) => mergeSelectedOption(prev, value));
    setOptions((prev) => mergeSelectedOption(prev, value));
  }, [value]);

  return (
    <FormAutocompleteField
      name="technician_id"
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      onInputChange={setQuery}
      disabled={disabled}
      className={className}
      error={error ?? undefined}
      required={required}
      placeholder="Digite para buscar..."
    />
  );
}
