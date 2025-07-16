// types/epi.ts

export interface EpiItem {
  epi_id: number;
  quantity: number;
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
