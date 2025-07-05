// src/pages/backoffice/empresas/CompanyFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";

import {
  getCompanyById,
  createCompany,
  updateCompany,
} from "../../../../services/companyService";
import { getCompanyGroups } from "../../../../services/companyGroupService";
import { getCompanyTypes } from "../../../../services/companyTypeService";

export default function CompanyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_group_id: "",
    company_type_id: "",
    name: "",
    cnpj: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    responsible: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    getCompanyGroups().then((res) => {
      const data = Array.isArray(res) ? res : res.data;
      setGroups(data.map((g: any) => ({ value: g.id, label: g.name })));
    });

    getCompanyTypes().then((res) => {
      const data = Array.isArray(res) ? res : res.data;
      setTypes(data.map((t: any) => ({ value: t.id, label: t.name })));
    });

    if (isEdit && id) {
      getCompanyById(+id)
        .then((data) => {
          setForm({
            company_group_id: String(data.company_group_id ?? ""),
            company_type_id: String(data.company_type_id ?? ""),
            name: data.name ?? "",
            cnpj: data.cnpj ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            responsible: data.responsible ?? "",
            email: data.email ?? "",
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar empresa.", type: "error" });
          navigate("/backoffice/empresas");
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        await updateCompany(Number(id), form);
      } else {
        await createCompany(form);
      }
      setToast({ open: true, message: `Empresa ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate("/backoffice/empresas");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar empresa.", type: "error" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Empresas", to: "/backoffice/empresas" },
          { label: isEdit ? "Editar" : "Nova", to: "#" },
        ]}
      />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelectField
            label="Grupo da Empresa"
            name="company_group_id"
            value={form.company_group_id ?? ""}
            onChange={handleChange}
            options={groups}
            error={errors.company_group_id}
            required
          />
          <FormSelectField
            label="Tipo de Empresa"
            name="company_type_id"
            value={form.company_type_id ?? ""}
            onChange={handleChange}
            options={types}
            error={errors.company_type_id}
            required
          />
          <FormInput id="name" name="name" label="Nome" value={form.name ?? ""} onChange={handleChange} error={errors.name} required />
          <FormInput id="cnpj" name="cnpj" label="CNPJ" value={form.cnpj ?? ""} onChange={handleChange} error={errors.cnpj} required />
          <FormInput id="phone" name="phone" label="Telefone" value={form.phone ?? ""} onChange={handleChange} error={errors.phone} />
          <FormInput id="email" name="email" label="E-mail" type="email" value={form.email ?? ""} onChange={handleChange} error={errors.email} />
          <FormInput id="responsible" name="responsible" label="Responsável" value={form.responsible ?? ""} onChange={handleChange} error={errors.responsible} />
          <FormInput id="address" name="address" label="Endereço" value={form.address ?? ""} onChange={handleChange} error={errors.address} />
          <FormInput id="city" name="city" label="Cidade" value={form.city ?? ""} onChange={handleChange} error={errors.city} />
          <FormInput id="state" name="state" label="Estado" value={form.state ?? ""} onChange={handleChange} error={errors.state} />
        </div>

        <div className="mt-6">
          <FormActions onCancel={() => navigate("/backoffice/empresas")} text={isEdit ? "Atualizar" : "Criar"} />
        </div>
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
