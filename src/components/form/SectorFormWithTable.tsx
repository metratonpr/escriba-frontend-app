import { useCallback, useEffect, useState } from "react";
import FormAutocompleteField from "../../components/form/FormAutocompleteField";
import debounce from "lodash/debounce";
import { getSectors } from "../../services/sectorService";

interface Option {
  id: string | number; // Corrigido para compatibilidade com FormAutocompleteField
  label: string;
}

interface Props {
  value: Option[];
  onChange: (sectors: Option[]) => void;
  error?: string;
  required?: boolean;
}

export default function SectorFormWithAutocompleteTable({
  value,
  onChange,
  error,
  required = false,
}: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [errorLoad, setErrorLoad] = useState<string | null>(null);

  const fetchOptions = useCallback(
    debounce(async (term: string) => {
      try {
        const res = await getSectors({ search: term, page: 1, perPage: 20 });
        const list = Array.isArray(res) ? res : res.data;
        setOptions(list.map((s: any) => ({ id: s.id, label: s.name })));
      } catch {
        setErrorLoad("Erro ao buscar setores.");
        setOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchOptions(query);
    return () => fetchOptions.cancel();
  }, [query, fetchOptions]);

  const handleAdd = () => {
    if (selectedOption && !value.some((s) => s.id === selectedOption.id)) {
      onChange([...value, selectedOption]);
      setSelectedOption(null);
    }
  };

  const handleRemove = (id: string | number) => {
    onChange(value.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <FormAutocompleteField
            label="Setores"
            name="sectors"
            value={selectedOption}
            options={options}
            onChange={setSelectedOption}
            onInputChange={setQuery}
            error={error}
            required={required}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Adicionar
        </button>
      </div>

      {errorLoad && <p className="text-sm text-red-600">{errorLoad}</p>}

      {value.length > 0 && (
        <div className="relative overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-2">Setor</th>
                <th scope="col" className="px-4 py-2 text-center w-28">Ação</th>
              </tr>
            </thead>
            <tbody>
              {value.map((sector) => (
                <tr key={sector.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {sector.label}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(sector.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
