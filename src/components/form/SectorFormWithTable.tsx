import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import { getSectors } from "../../services/sectorService";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";
import { mergeSelectedOption, type AutocompleteOption } from "../../utils/autocompleteUtils";

type Option = AutocompleteOption;

interface Props {
  value: Option[];
  onChange: (sectors: Option[]) => void;
  error?: FieldErrorValue;
  required?: boolean;
  initialOptions?: Option[];
}

export default function SectorFormWithAutocompleteTable({
  value,
  onChange,
  error,
  required = false,
  initialOptions,
}: Props) {
  const [options, setOptions] = useState<Option[]>(() => initialOptions ?? []);
  const [query, setQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [errorLoad, setErrorLoad] = useState<string | null>(null);
  const errorMessage = normalizeFieldError(error);
  const {
    currentPage,
    perPage,
    total,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPerPage,
  } = useClientPagination(value, { initialPerPage: 5 });

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getSectors({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((sector: any) => ({ id: sector.id, label: sector.name })));
        setErrorLoad(null);
      } catch {
        setErrorLoad("Erro ao buscar setores.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (!query.trim() && initialOptions) {
      setOptions(initialOptions);
      return;
    }

    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [fetchOptions, initialOptions, query]);

  useEffect(() => {
    setOptions((prev) => mergeSelectedOption(prev, selectedOption));
  }, [selectedOption]);

  const handleAdd = () => {
    if (selectedOption && !value.some((sector) => String(sector.id) === String(selectedOption.id))) {
      onChange([...value, selectedOption]);
      setSelectedOption(null);
    }
  };

  const handleRemove = (id: string | number) => {
    onChange(value.filter((sector) => String(sector.id) !== String(id)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <FormAutocompleteField
            label="Setores"
            name="sectors"
            value={selectedOption}
            options={options}
            onChange={setSelectedOption}
            onInputChange={setQuery}
            error={errorMessage}
            required={required}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Adicionar
        </button>
      </div>

      {errorLoad && <p className="text-sm text-red-600">{errorLoad}</p>}

      {value.length > 0 && (
        <div className="relative mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-2">
                  Setor
                </th>
                <th scope="col" className="w-28 px-4 py-2 text-center">
                  Acao
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((sector) => (
                <tr
                  key={sector.id}
                  className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                    {sector.label}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(sector.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <InlinePagination
            className="mt-3"
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>
      )}
    </div>
  );
}
