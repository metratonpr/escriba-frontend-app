import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import type { BreadcrumbItem } from "../../../../components/Layout/Breadcrumbs";
import {
  getCompanyGroupById,
  createCompanyGroup,
  updateCompanyGroup,
} from "../../../../services/companyGroupService";

import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";


export default function CompanyGroupFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    description: "",
    responsible: "",
    contact_email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Parâmetros", to: "/backoffice/parametros" },
    { label: "Grupos de Empresa", to: "/backoffice/grupos-empresa" },
    { label: isEdit ? "Editar" : "Novo", to: "#" },
  ];

  useEffect(() => {
    if (isEdit) {
      getCompanyGroupById(Number(id))
        .then(setForm)
        .catch(() => {
          setToast({
            open: true,
            message: "Erro ao carregar grupo de empresa.",
            type: "error",
          });
          navigate("/backoffice/grupos-empresa");
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
      await saveCompanyGroup(form, isEdit ? Number(id) : undefined);
      setToast({
        open: true,
        message: `Grupo ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/grupos-empresa");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setToast({
          open: true,
          message: "Erro ao salvar grupo.",
          type: "error",
        });
      }
    }
  };

  async function saveCompanyGroup(data: typeof form, id?: number): Promise<void> {
    if (id) {
      await updateCompanyGroup(id, data);
    } else {
      await createCompanyGroup(data);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Editar Grupo de Empresa" : "Novo Grupo de Empresa"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <FormInput
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <FormInput
            label="Responsável"
            name="responsible"
            value={form.responsible}
            onChange={handleChange}
            error={errors.responsible}
            required
          />

          <FormInput
            label="E-mail de Contato"
            name="contact_email"
            value={form.contact_email}
            onChange={handleChange}
            error={errors.contact_email}
            required
            type="email"
            className="md:col-span-2"
          />

          <FormTextArea
            label="Descrição"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
            className="md:col-span-2"
          />
        </div>

        <FormActions
          cancelUrl="/backoffice/grupos-empresa"
          text={isEdit ? "Atualizar" : "Criar"}
        />
      </form>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}