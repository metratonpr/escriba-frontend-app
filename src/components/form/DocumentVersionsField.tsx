// src/components/form/DocumentVersionsField.tsx
import { useState } from "react";
import { FormInput } from "./FormInput";
import { FormTextArea } from "./FormTextArea";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";

interface Version {
  id?: number;
  code?: string;
  description?: string;
  version?: string;
}

interface Props {
  value?: Version[];
  onChange: (versions: Version[]) => void;
  errors?: Record<number, Record<string, FieldErrorValue>>;
}

export default function DocumentVersionsField({ value = [], onChange, errors = {} }: Props) {
  const [draft, setDraft] = useState<Version>({ code: "", description: "", version: "" });
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
    setDraft({ code: "", description: "", version: "" });
  };

  const handleRemove = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
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
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAdd}
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>
        <div className="md:col-span-3">
          <FormTextArea
            label="Descrição"
            name="description"
            value={draft.description ?? ""}
            onChange={(e) => setDraft((v) => ({ ...v, description: e.target.value }))}
          />
        </div>
      </div>

      {value.length > 0 && (
        <div className="relative mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-2">Código</th>
                <th scope="col" className="px-4 py-2">Versão</th>
                <th scope="col" className="px-4 py-2">Descrição</th>
                <th scope="col" className="w-28 px-4 py-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((v, index) => {
                const absoluteIndex = (currentPage - 1) * perPage + index;
                const rowErrors = errors[absoluteIndex] ?? {};
                const codeError = normalizeFieldError(rowErrors.code);
                const versionError = normalizeFieldError(rowErrors.version);
                const descriptionError = normalizeFieldError(rowErrors.description);

                return (
                  <tr
                    key={v.id ?? absoluteIndex}
                    className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      {v.code ?? ""}
                      {codeError && <p className="text-xs text-red-600">{codeError}</p>}
                    </td>
                    <td className="px-4 py-2">
                      {v.version ?? ""}
                      {versionError && <p className="text-xs text-red-600">{versionError}</p>}
                    </td>
                    <td className="px-4 py-2">
                      {v.description ?? ""}
                      {descriptionError && <p className="text-xs text-red-600">{descriptionError}</p>}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(absoluteIndex)}
                        className="text-xs text-red-600 hover:underline"
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
