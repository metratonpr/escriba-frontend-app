import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEpiDelivery, getEpiDeliveryById, updateEpiDelivery } from "../../../services/epiDeliveryService";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import FormDatePickerField from "../../../components/form/FormDatePickerField";
import { FormActions } from "../../../components/form/FormActions";
import Toast from "../../../components/Layout/Feedback/Toast";

import EmployeeAutocompleteField from "../../../components/form/EmployeeAutocompleteField";
import TechnicianAutocompleteField from "../../../components/form/TechnicianAutocompleteField";
import { FormTextArea } from "../../../components/form/FormTextArea";
import FormEpiItemsTable from "../../../components/form/FormEpiItemsTable";
import { FormInput } from "../../../components/form/FormInput";

export default function EpiDeliveryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    employee_id: null,
    technician_id: null,
    document_number: "",
    delivery_date: "",
    items: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    if (isEdit && id) {
      getEpiDeliveryById(+id)
        .then((data) => {
          setForm({
            employee_id: { id: data.employee_id, label: data.employee?.name },
            technician_id: { id: data.technician_id, label: data.technician?.name },
            document_number: data.document_number,
            delivery_date: data.delivery_date,
            items: data.items || [],
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar entrega.", type: "error" });
          navigate("/backoffice/entregas-epis");
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (items: any[]) => {
    setForm((prev) => ({ ...prev, items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = {
        ...form,
        employee_id: form.employee_id?.id,
        technician_id: form.technician_id?.id,
      };

      if (isEdit) {
        await updateEpiDelivery(Number(id), payload);
      } else {
        await createEpiDelivery(payload);
      }
      setToast({ open: true, message: `Entrega ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate("/backoffice/entregas-epis");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar entrega.", type: "error" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Entregas de EPIs", to: "/backoffice/entregas-epis" },
          { label: isEdit ? "Editar" : "Nova", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Entrega de EPI" : "Nova Entrega de EPI"}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <EmployeeAutocompleteField
          value={form.employee_id}
          onChange={(value) => handleAutocompleteChange("employee_id", value)}
        />

        <TechnicianAutocompleteField
          value={form.technician_id}
          onChange={(value) => handleAutocompleteChange("technician_id", value)}
        />

        <FormInput
          name="document_number"
          label="Número do Documento"
          value={form.document_number}
          onChange={handleChange}
          error={errors.document_number}
          required
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
        />

        <FormActions onCancel={() => navigate("/backoffice/entregas-epis")} text={isEdit ? "Atualizar" : "Criar"} />
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
