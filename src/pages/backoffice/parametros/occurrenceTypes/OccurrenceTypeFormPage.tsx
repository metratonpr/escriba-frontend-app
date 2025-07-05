// src/pages/backoffice/parametros/occurrenceTypes/OccurrenceTypeFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";
import {
  createOccurrenceType,
  getOccurrenceTypeById,
  updateOccurrenceType,
} from "../../../../services/occurrenceTypeService";

export default function OccurrenceTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    severity_level: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getOccurrenceTypeById(id)
        .then(setForm)
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar tipo de ocorrência.", type: "error" });
          navigate("/backoffice/tipos-ocorrencia");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    try {
      if (isEdit && id) {
        await updateOccurrenceType(id, form);
      } else {
        await createOccurrenceType(form);
      }
      setToast({ open: true, message: `Tipo ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/tipos-ocorrencia");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar tipo de ocorrência.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Tipos de Ocorrência", to: "/backoffice/tipos-ocorrencia" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Tipo de Ocorrência" : "Novo Tipo de Ocorrência"}</h1>

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <FormInput
            id="name"
            name="name"
            label="Nome"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <FormTextArea
            id="description"
            name="description"
            label="Descrição"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
          />

          <FormSelectField
            label="Categoria"
            name="category"
            value={form.category}
            onChange={handleChange}
            error={errors.category}
            required
            options={[
              { value: "Acidente", label: "Acidente" },
              { value: "Quase Acidente", label: "Quase Acidente" },
              { value: "Desvio", label: "Desvio" },
              { value: "Comportamento Inseguro", label: "Comportamento Inseguro" },
              { value: "Outro", label: "Outro" },
            ]}
          />

          <FormSelectField
            label="Grau de Severidade"
            name="severity_level"
            value={form.severity_level}
            onChange={handleChange}
            error={errors.severity_level}
            required
            options={[
              { value: "Baixo", label: "Baixo" },
              { value: "Médio", label: "Médio" },
              { value: "Alto", label: "Alto" },
              { value: "Gravíssimo", label: "Gravíssimo" },
            ]}
          />

          <FormActions
            loading={isLoading}
            onCancel={() => navigate("/backoffice/tipos-ocorrencia")}
            text={isEdit ? "Atualizar" : "Criar"}
          />
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
