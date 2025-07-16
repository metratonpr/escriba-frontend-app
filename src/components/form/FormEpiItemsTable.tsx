import { useEffect, useState } from "react";
import EpiAutocompleteField from "./EpiAutocompleteField";
import { FormTextArea } from "./FormTextArea";
import type { EpiItem } from "../../types/epi";

interface Props {
  items: EpiItem[];
  onChange: (items: EpiItem[]) => void;
  error?: string;
}

export default function FormEpiItemsTable({ items, onChange, error }: Props) {
  const [current, setCurrent] = useState<{
    epi: { id: number; label: string } | null;
    quantity: number;
    notes: string;
  }>({ epi: null, quantity: 1, notes: "" });

  const [fieldErrors, setFieldErrors] = useState({
    epi: false,
    quantity: false,
  });

  useEffect(() => {
    if (items.length === 1 && !current.epi) {
      const item = items[0];
      if (item) {
        setCurrent({
          epi: { id: item.epi_id, label: item.epi?.name ?? "" },
          quantity: item.quantity,
          notes: item.notes ?? "",
        });
      }
    }
  }, [items]);

  const handleAdd = () => {
    const missingEpi = !current.epi?.id;
    const missingQty = current.quantity <= 0;

    if (missingEpi || missingQty) {
      setFieldErrors({ epi: missingEpi, quantity: missingQty });
      return;
    }

    const duplicate = items.some(
      (i) => i.epi_id === current.epi!.id && (i.notes ?? "") === current.notes.trim()
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
        validity_days: 0,
        notes: current.notes.trim(),
        epi: { id: current.epi!.id, name: current.epi!.label },
      },
    ]);

    setCurrent({ epi: null, quantity: 1, notes: "" });
    setFieldErrors({ epi: false, quantity: false });
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
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
          />
          <div className="min-h-[20px]">
            {fieldErrors.epi && <p className="text-sm text-red-600 mt-1">Selecione um EPI.</p>}
          </div>
        </div>
        <div>
          <input
            type="number"
            min={1}
            value={current.quantity}
            onChange={(e) =>
              setCurrent((prev) => ({ ...prev, quantity: Number(e.target.value) }))
            }
            placeholder="Quantidade"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
          <div className="min-h-[20px]">
            {fieldErrors.quantity && (
              <p className="text-sm text-red-600 mt-1">Informe a quantidade.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <FormTextArea
          name="notes"
          label="Observações"
          value={current.notes}
          onChange={(e) =>
            setCurrent((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="h-10 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Adicionar
      </button>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {items.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-2">EPI</th>
                <th className="px-4 py-2 text-center">Quantidade</th>
                <th className="px-4 py-2">Observações</th>
                <th className="px-4 py-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.epi_id}-${index}`} className="border-b dark:border-gray-600">
                  <td className="px-4 py-2">{item.epi?.name || `#${item.epi_id}`}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2">{item.notes}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
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