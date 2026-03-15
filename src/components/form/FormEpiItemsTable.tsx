import { useEffect, useState } from "react";
import EpiAutocompleteField from "./EpiAutocompleteField";
import FormSelectField from "./FormSelectField";
import { FormTextArea } from "./FormTextArea";
import {
  EPI_ITEM_STATE_OPTIONS,
  getEpiItemStateLabel,
  type EpiItem,
  type EpiItemState,
} from "../../types/epi";
import { normalizeFieldError, type FieldErrorValue } from "../../utils/errorUtils";
import { useClientPagination } from "../../hooks/useClientPagination";
import InlinePagination from "../Layout/ui/InlinePagination";
import type { AutocompleteOption } from "../../utils/autocompleteUtils";

interface Props {
  items: EpiItem[];
  onChange: (items: EpiItem[]) => void;
  error?: FieldErrorValue;
  initialOptions?: AutocompleteOption[];
}

export default function FormEpiItemsTable({
  items,
  onChange,
  error,
  initialOptions,
}: Props) {
  const quantityInputId = "epi-item-quantity";
  const [current, setCurrent] = useState<{
    epi: { id: number; label: string } | null;
    quantity: number;
    state: EpiItemState | "";
    notes: string;
  }>({ epi: null, quantity: 1, state: "", notes: "" });

  const [fieldErrors, setFieldErrors] = useState({
    epi: false,
    quantity: false,
    state: false,
  });
  const errorMessage = normalizeFieldError(error);
  const {
    currentPage,
    perPage,
    total,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPerPage,
  } = useClientPagination(items, { initialPerPage: 5 });

  useEffect(() => {
    if (items.length === 1 && !current.epi) {
      const item = items[0];
      if (item) {
        setCurrent({
          epi: { id: item.epi_id, label: item.epi?.name ?? "" },
          quantity: item.quantity,
          state: item.state ?? "",
          notes: item.notes ?? "",
        });
      }
    }
  }, [current.epi, items]);

  const handleAdd = () => {
    const missingEpi = !current.epi?.id;
    const missingQty = current.quantity <= 0;
    const missingState = !current.state;

    if (missingEpi || missingQty || missingState) {
      setFieldErrors({ epi: missingEpi, quantity: missingQty, state: missingState });
      return;
    }

    const selectedState = current.state as EpiItemState;

    const duplicate = items.some(
      (item) =>
        item.epi_id === current.epi!.id &&
        item.state === selectedState &&
        (item.notes ?? "") === current.notes.trim()
    );
    if (duplicate) {
      setFieldErrors((prev) => ({ ...prev, epi: true }));
      return;
    }

    onChange([
      ...items,
      {
        epi_id: current.epi!.id,
        quantity: current.quantity,
        state: selectedState,
        validity_days: 0,
        notes: current.notes.trim(),
        epi: { id: current.epi!.id, name: current.epi!.label },
      },
    ]);

    setCurrent({ epi: null, quantity: 1, state: "", notes: "" });
    setFieldErrors({ epi: false, quantity: false, state: false });
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <EpiAutocompleteField
            value={current.epi}
            onChange={(value) => {
              if (value) {
                const id = typeof value.id === "string" ? parseInt(value.id, 10) : value.id;
                setCurrent((prev) => ({ ...prev, epi: { id, label: value.label } }));
              } else {
                setCurrent((prev) => ({ ...prev, epi: null }));
              }
            }}
            initialOptions={initialOptions}
          />
          <div className="min-h-[20px]">
            {fieldErrors.epi && <p className="mt-1 text-sm text-red-600">Selecione um EPI.</p>}
          </div>

          <div className="mt-2">
            <label
              htmlFor={quantityInputId}
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-white"
            >
              Quantidade
            </label>
            <input
              id={quantityInputId}
              type="number"
              min={1}
              value={current.quantity}
              onChange={(e) =>
                setCurrent((prev) => ({ ...prev, quantity: Number(e.target.value) }))
              }
              placeholder="Quantidade"
              aria-invalid={fieldErrors.quantity}
              aria-describedby={fieldErrors.quantity ? `${quantityInputId}-error` : undefined}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="min-h-[20px]">
            {fieldErrors.quantity && (
              <p id={`${quantityInputId}-error`} className="mt-1 text-sm text-red-600">
                Informe a quantidade.
              </p>
            )}
          </div>

          <div className="mt-2">
            <FormSelectField
              name="epi_state"
              label="Estado do EPI"
              value={current.state}
              onChange={(event) =>
                setCurrent((prev) => ({
                  ...prev,
                  state: event.target.value as EpiItemState,
                }))
              }
              options={EPI_ITEM_STATE_OPTIONS}
              error={fieldErrors.state ? "Selecione o estado do EPI." : undefined}
            />
          </div>
        </div>
      </div>

      <div>
        <FormTextArea
          name="notes"
          label="Observacoes"
          value={current.notes}
          onChange={(e) =>
            setCurrent((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="h-10 rounded bg-blue-600 px-4 text-white transition hover:bg-blue-700"
      >
        Adicionar
      </button>

      {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}

      {items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2">EPI</th>
                <th className="px-4 py-2 text-center">Quantidade</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Observacoes</th>
                <th className="px-4 py-2 text-center">Acao</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, index) => {
                const absoluteIndex = (currentPage - 1) * perPage + index;

                return (
                  <tr
                    key={`${item.epi_id}-${absoluteIndex}`}
                    className="border-b dark:border-gray-600"
                  >
                    <td className="px-4 py-2">{item.epi?.name || `#${item.epi_id}`}</td>
                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                    <td className="px-4 py-2">{getEpiItemStateLabel(item.state)}</td>
                    <td className="px-4 py-2">{item.notes}</td>
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
