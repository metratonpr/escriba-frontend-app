// src/components/form/DocumentVersionsField.tsx
import  { useState } from "react";
import { FormInput } from "./FormInput";
import { FormTextArea } from "./FormTextArea";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";

interface Version {
  id?: number;
  code?: string;
  description?: string;
  validity_days?: number | "";
  version?: string;
}

interface Props {
  value?: Version[];
  onChange: (versions: Version[]) => void;
  errors?: Record<number, Record<string, FieldErrorValue>>;
}

export default function DocumentVersionsField({ value = [], onChange, errors = {} }: Props) {
  const [draft, setDraft] = useState<Version>({ code: "", description: "", validity_days: "", version: "" });
  const {
    currentPage,
    perPage,
    total,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPerPage,
  } = useClientPagination(value, { initialPerPage: 5 });

  const handleAdd = () => {
    if (!draft.version?.trim()) return;
    onChange([...value, draft]);
    setDraft({ code: "", description: "", validity_days: "", version: "" });
  };

  const handleRemove = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <FormInput
          label="Código"
          name="code"
          value={draft.code ?? ""}
          onChange={(e) => setDraft((v) => ({ ...v, code: e.target.value }))}
        />
        <FormInput
          label="Versão"
          name="version"
          value={draft.version ?? ""}
          onChange={(e) => setDraft((v) => ({ ...v, version: e.target.value }))}
        />
        <FormInput
          label="Validade (dias)"
          name="validity_days"
          type="number"
          value={draft.validity_days ?? ""}
          onChange={(e) => setDraft((v) => ({ ...v, validity_days: Number(e.target.value) }))}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAdd}
            className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Adicionar
          </button>
        </div>
        <div className="md:col-span-4">
          <FormTextArea
            label="Descrição"
            name="description"
            value={draft.description ?? ""}
            onChange={(e) => setDraft((v) => ({ ...v, description: e.target.value }))}
          />
        </div>
      </div>

      {value.length > 0 && (
        <div className="relative overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-2">Código</th>
                <th scope="col" className="px-4 py-2">Versão</th>
                <th scope="col" className="px-4 py-2">Validade (dias)</th>
                <th scope="col" className="px-4 py-2">Descrição</th>
                <th scope="col" className="px-4 py-2 text-center w-28">Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((v, index) => {
                const absoluteIndex = (currentPage - 1) * perPage + index;
                const rowErrors = errors[absoluteIndex] ?? {};
                const codeError = normalizeFieldError(rowErrors.code);
                const versionError = normalizeFieldError(rowErrors.version);
                const validityError = normalizeFieldError(rowErrors.validity_days);
                const descriptionError = normalizeFieldError(rowErrors.description);

                return (
                  <tr key={v.id ?? absoluteIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {v.code}
                      {codeError && <p className="text-xs text-red-600">{codeError}</p>}
                    </td>
                    <td className="px-4 py-2">
                      {v.version}
                      {versionError && <p className="text-xs text-red-600">{versionError}</p>}
                    </td>
                    <td className="px-4 py-2">
                      {v.validity_days}
                      {validityError && <p className="text-xs text-red-600">{validityError}</p>}
                    </td>
                    <td className="px-4 py-2">
                      {v.description}
                      {descriptionError && <p className="text-xs text-red-600">{descriptionError}</p>}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(absoluteIndex)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
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
