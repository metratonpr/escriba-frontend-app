import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../components/Layout/ui/FormPageSkeleton";
import FormDatePickerField from "../../../components/form/FormDatePickerField";
import { FormActions } from "../../../components/form/FormActions";
import EmployeeAutocompleteField from "../../../components/form/EmployeeAutocompleteField";
import TechnicianAutocompleteField from "../../../components/form/TechnicianAutocompleteField";
import { FormInput } from "../../../components/form/FormInput";
import FormEpiItemsTable from "../../../components/form/FormEpiItemsTable";
import type { EpiAutocompleteOption } from "../../../components/form/EpiAutocompleteField";
import type { EpiItem } from "../../../types/epi";
import { createEpiDelivery, getEpiDeliveryById, updateEpiDelivery } from "../../../services/epiDeliveryService";
import { getEmployees } from "../../../services/employeeService";
import { getEpis } from "../../../services/epiService";
import { formatCurrency } from "../../../utils/formatUtils";

interface AutocompleteOption {
  id: number | string;
  label: string;
}
interface EpiDeliveryForm {
  employee_id: AutocompleteOption | null;
  technician_id: AutocompleteOption | null;
  document_number: string;
  delivery_date: string;
  items: EpiItem[];
}

export default function EpiDeliveryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<EpiDeliveryForm>({
    employee_id: null,
    technician_id: null,
    document_number: "",
    delivery_date: "",
    items: [],
  });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [employeeOptions, setEmployeeOptions] = useState<AutocompleteOption[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<AutocompleteOption[]>([]);
  const [epiOptions, setEpiOptions] = useState<EpiAutocompleteOption[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      setIsInitializing(true);

      try {
        const [employeesResponse, episResponse, deliveryData] = await Promise.all([
          getEmployees({ page: 1, perPage: 100 }),
          getEpis({ page: 1, perPage: 100 }),
          isEdit && id ? getEpiDeliveryById(Number(id)) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        const mappedEmployees = employeesResponse.data.map((item) => ({
          id: item.id,
          label: item.name,
        }));
        setEmployeeOptions(mappedEmployees);
        setTechnicianOptions(
          deliveryData?.technician_id && deliveryData.technician?.name
            ? [{ id: deliveryData.technician_id, label: deliveryData.technician.name }]
            : []
        );
        setEpiOptions(
          episResponse.data.map((item) => ({
            id: item.id,
            label: item.name,
            cost: item.cost ?? item.custo ?? null,
          }))
        );

        if (deliveryData) {
          setForm({
            employee_id: deliveryData.employee_id
              ? { id: deliveryData.employee_id, label: deliveryData.employee?.name ?? "" }
              : null,
            technician_id: deliveryData.technician_id
              ? { id: deliveryData.technician_id, label: deliveryData.technician?.name ?? "" }
              : null,
            document_number: deliveryData.document_number,
            delivery_date: deliveryData.delivery_date,
            items: deliveryData.items ?? [],
          });
        }
      } catch {
        setToast({ open: true, message: "Erro ao carregar entrega.", type: "error" });
        if (isEdit) {
          navigate("/backoffice/entregas-epis");
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (
    name: keyof Pick<EpiDeliveryForm, "employee_id" | "technician_id">,
    value: AutocompleteOption | null
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (items: EpiItem[]) => {
    setForm((prev) => ({ ...prev, items }));
  };

  const totalCost = form.items.reduce((total, item) => {
    const unitCost =
      typeof item.cost === "number"
        ? item.cost
        : Number.parseFloat(String(item.cost ?? "").replace(",", "."));

    if (!Number.isFinite(unitCost)) {
      return total;
    }

    return total + unitCost * Math.max(item.quantity || 0, 0);
  }, 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    try {
      const payload = {
        employee_id: Number(form.employee_id?.id) || 0,
        technician_id: Number(form.technician_id?.id) || 0,
        delivery_date: form.delivery_date,
        items: form.items,
      };

      if (isEdit && id) {
        await updateEpiDelivery(Number(id), payload);
      } else {
        await createEpiDelivery(payload);
      }

      setToast({
        open: true,
        message: `Entrega ${isEdit ? "atualizada" : "criada"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/entregas-epis");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar entrega.", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Breadcrumbs
        items={[
          { label: "Parametros", to: "/backoffice/parametros" },
          { label: "Entregas de EPIs", to: "/backoffice/entregas-epis" },
          { label: isEdit ? "Editar" : "Nova", to: "#" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold">
        {isEdit ? "Editar Entrega de EPI" : "Nova Entrega de EPI"}
      </h1>

      {isInitializing ? (
        <FormPageSkeleton className="px-0" fields={8} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <EmployeeAutocompleteField
            value={form.employee_id}
            onChange={(value) => handleAutocompleteChange("employee_id", value)}
            error={errors.employee_id}
            initialOptions={employeeOptions}
          />

          <TechnicianAutocompleteField
            value={form.technician_id}
            onChange={(value) => handleAutocompleteChange("technician_id", value)}
            error={errors.technician_id}
            initialOptions={technicianOptions}
          />

          <FormInput
            name="document_number"
            label="Numero do Documento"
            value={form.document_number}
            onChange={handleChange}
            error={errors.document_number}
            readOnly
            placeholder="Sera gerado automaticamente pelo backend"
          />

          <FormDatePickerField
            label="Data de Entrega"
            name="delivery_date"
            value={form.delivery_date}
            onChange={handleChange}
            error={errors.delivery_date}
          />

          <FormEpiItemsTable
            items={form.items}
            onChange={handleItemsChange}
            error={errors.items}
            initialOptions={epiOptions}
          />

          <div className="flex justify-end rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
            Total dos custos: {formatCurrency(totalCost)}
          </div>

          <FormActions
            onCancel={() => navigate("/backoffice/entregas-epis")}
            text={isEdit ? "Atualizar" : "Criar"}
          />
        </form>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
