// src/pages/backoffice/parametros/epiTypes/EpiTypeFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormActions } from "../../../../components/form/FormActions";
import {
  getEpiTypeById,
  createEpiType,
  updateEpiType,
} from "../../../../services/epiTypeService";
import Spinner from "../../../../components/Layout/ui/Spinner";

export default function EpiTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  if (isEdit && id) {
    setIsLoading(true);
    getEpiById(+id)
      .then((data) => {
        setForm({
          name: data.name,
          epi_type: data.type ? { id: data.type.id, label: data.type.name } : null,
          brand: data.brand ? { id: data.brand.id, label: data.brand.name } : null,
          company: data.company ? { id: data.company.id, label: data.company.name } : null,
          ca: data.ca,
          ca_expiration: data.ca_expiration.slice(0, 10),
        });
      })
      .catch(() => {
        setToast({ open: true, message: "Erro ao carregar EPI.", type: "error" });
        navigate("/backoffice/epis");
      })
      .finally(() => setIsLoading(false));
  }
}, [id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        await updateEpiType(id!, form);
      } else {
        await createEpiType(form);
      }
      setToast({ open: true, message: `Tipo ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/tipos-epi");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar tipo.", type: "error" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Tipos de EPI", to: "/backoffice/tipos-epi" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Tipo de EPI" : "Novo Tipo de EPI"}</h1>

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <FormInput
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <FormActions cancelUrl="/backoffice/tipos-epi" text={isEdit ? "Atualizar" : "Criar"} />
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
