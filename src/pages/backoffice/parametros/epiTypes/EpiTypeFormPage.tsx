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

export default function EpiTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    if (isEdit) {
      getEpiTypeById(id!).then(setForm).catch(() => {
        setToast({ open: true, message: "Erro ao carregar tipo.", type: "error" });
        navigate("/backoffice/tipos-epi");
      });
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

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
