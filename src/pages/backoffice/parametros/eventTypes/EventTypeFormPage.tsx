// src/pages/backoffice/parametros/eventTypes/EventTypeFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import {
  createEventType,
  getEventTypeById,
  updateEventType,
} from "../../../../services/eventTypeService";

export default function EventTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ nome_tipo_evento: "", descricao: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    if (isEdit) {
      getEventTypeById(id!)
        .then(setForm)
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar tipo de evento.", type: "error" });
          navigate("/backoffice/tipos-evento");
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        await updateEventType(id!, form);
      } else {
        await createEventType(form);
      }
      setToast({ open: true, message: `Tipo de evento ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/tipos-evento");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar tipo de evento.", type: "error" });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Tipos de Evento", to: "/backoffice/tipos-evento" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Tipo de Evento" : "Novo Tipo de Evento"}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <FormInput
          label="Nome do Tipo de Evento"
          name="nome_tipo_evento"
          value={form.nome_tipo_evento}
          onChange={handleChange}
          error={errors.nome_tipo_evento}
          required
        />

        <FormTextArea
          label="Descrição"
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          error={errors.descricao}
        />

        <FormActions cancelUrl="/backoffice/tipos-evento" text={isEdit ? "Atualizar" : "Criar"} />
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
