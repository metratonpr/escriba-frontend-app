// types/epi.ts

export type EpiItemState = "novo" | "usado";

export const EPI_ITEM_STATE_OPTIONS: Array<{ value: EpiItemState; label: string }> = [
  { value: "novo", label: "Novo" },
  { value: "usado", label: "Usado" },
];

export const getEpiItemStateLabel = (state?: string | null) =>
  EPI_ITEM_STATE_OPTIONS.find((option) => option.value === state)?.label ?? "-";

export interface EpiItem {
  epi_id: number;
  quantity: number;
  state?: EpiItemState | null;
  notes?: string;
  epi?: {
    id: number;
    name: string;
  };
   validity_days?: number; // <-- adicione isso se for necessário
}

export interface EpiDelivery {
  id: number;
  employee_id: number;
  technician_id: number;
  document_number: string;
  delivery_date: string;
  employee?: { name: string };
  technician?: { name: string };  
  items: EpiItem[];
}
export interface EpiDeliveryWithItems extends EpiDelivery {
  items: EpiItem[];
}
