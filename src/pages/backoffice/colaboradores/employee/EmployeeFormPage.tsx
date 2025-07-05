// src/pages/backoffice/colaboradores/EmployeeFormPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import { FormEmployeeItem } from "./FormEmployeeItem";
import { getEmployeeById, createEmployee, updateEmployee } from "../../../../services/employeeService";
import { getJobTitles } from "../../../../services/jobTitleService";
import { getSectors } from "../../../../services/sectorService";
import { getCompanies } from "../../../../services/companyService";

const cnhOptions = [
  "A", "B", "C", "D", "E", "AB", "AC", "AD", "AE", "Não Possui"
].map((v) => ({ value: v, label: v }));

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    cpf: "",
    rg: "",
    rg_issuer: "",
    birth_date: "",
    driver_license_type: "",
    first_license_date: "",
    job_titles: [],
    sectors: [],
    companies: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const [jobTitleOptions, setJobTitleOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  useEffect(() => {
    getJobTitles().then(res => setJobTitleOptions((res.data || res).map((j: any) => ({ label: j.name, value: String(j.id) }))));
    getSectors().then(res => setSectorOptions((res.data || res).map((s: any) => ({ label: s.name, value: String(s.id) }))));
    getCompanies().then(res => setCompanyOptions((res.data || res).map((c: any) => ({ label: c.name, value: String(c.id) }))));

    if (isEdit && id) {
      getEmployeeById(id)
        .then((data) => {
          setForm({
            ...data,
            companies: data.companies.map((c: any) => ({
              id: String(c.id),
              start_date: c.pivot?.start_date || "",
              end_date: c.pivot?.end_date || "",
              status: c.pivot?.status || "",
            })),
            sectors: data.sectors.map((s: any) => ({
              id: String(s.id),
              start_date: s.pivot?.start_date || "",
              end_date: s.pivot?.end_date || "",
              status: s.pivot?.status || "",
            })),
            job_titles: data.job_titles.map((j: any) => ({
              id: String(j.id),
              start_date: j.pivot?.start_date || "",
              end_date: j.pivot?.end_date || "",
              status: j.pivot?.status || "",
            })),
          });
        })
        .catch(() => {
          setToast({
            open: true,
            message: "Erro ao carregar colaborador.",
            type: "error",
          });
          navigate("/backoffice/colaboradores");
        });
    }

  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (key: "job_titles" | "sectors" | "companies", index: number, field: string, value: string) => {
    const list = [...(form[key] as any[])];
    list[index] = { ...list[index], [field]: value };
    setForm((prev) => ({ ...prev, [key]: list }));
  };

  const handleItemAdd = (key: "job_titles" | "sectors" | "companies") => {
    setForm((prev) => ({ ...prev, [key]: [...(prev[key] as any[]), { id: "", start_date: "", end_date: "", status: "" }] }));
  };

  const handleItemRemove = (key: "job_titles" | "sectors" | "companies", index: number) => {
    const list = [...(form[key] as any[])];
    list.splice(index, 1);
    setForm((prev) => ({ ...prev, [key]: list }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        await updateEmployee(id!, form);
      } else {
        await createEmployee(form);
      }
      setToast({ open: true, message: `Colaborador ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/colaboradores");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar colaborador.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Colaboradores", to: "/backoffice/colaboradores" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput id="name" name="name" label="Nome" value={form.name} onChange={handleChange} error={errors.name} required />
          <FormInput id="cpf" name="cpf" label="CPF" value={form.cpf} onChange={handleChange} error={errors.cpf} required />
          <FormInput id="rg" name="rg" label="RG" value={form.rg} onChange={handleChange} error={errors.rg} required />
          <FormInput id="rg_issuer" name="rg_issuer" label="Emissor do RG" value={form.rg_issuer} onChange={handleChange} error={errors.rg_issuer} required />
          <FormInput id="birth_date" name="birth_date" type="date" label="Nascimento" value={form.birth_date} onChange={handleChange} error={errors.birth_date} required />
          <FormSelectField label="Categoria CNH" name="driver_license_type" value={form.driver_license_type} onChange={handleChange} options={cnhOptions} error={errors.driver_license_type} required />
          <FormInput id="first_license_date" name="first_license_date" type="date" label="1ª Habilitação" value={form.first_license_date} onChange={handleChange} error={errors.first_license_date} />
        </div>

        <FormEmployeeItem
          label="Cargos"
          name="job_titles"
          items={form.job_titles}
          onAdd={() => handleItemAdd("job_titles")}
          onRemove={(i) => handleItemRemove("job_titles", i)}
          onChange={(i, k, v) => handleItemChange("job_titles", i, k, v)}
          errorMap={errors}
          fields={[
            { name: "id", label: "Cargo", type: "select", options: jobTitleOptions },
            { name: "start_date", label: "Início", type: "date" },
            { name: "end_date", label: "Fim", type: "date" },
            {
              name: "status", label: "Status", type: "select", options: [
                { value: "ativo", label: "Ativo" },
                { value: "afastado", label: "Afastado" },
                { value: "desligado", label: "Desligado" },
              ]
            },
          ]}
        />

        <FormEmployeeItem
          label="Setores"
          name="sectors"
          items={form.sectors}
          onAdd={() => handleItemAdd("sectors")}
          onRemove={(i) => handleItemRemove("sectors", i)}
          onChange={(i, k, v) => handleItemChange("sectors", i, k, v)}
          errorMap={errors}
          fields={[
            { name: "id", label: "Setor", type: "select", options: sectorOptions },
            { name: "start_date", label: "Início", type: "date" },
            { name: "end_date", label: "Fim", type: "date" },
            {
              name: "status", label: "Status", type: "select", options: [
                { value: "ativo", label: "Ativo" },
                { value: "afastado", label: "Afastado" },
                { value: "desligado", label: "Desligado" },
              ]
            },
          ]}
        />

        <FormEmployeeItem
          label="Empresas"
          name="companies"
          items={form.companies}
          onAdd={() => handleItemAdd("companies")}
          onRemove={(i) => handleItemRemove("companies", i)}
          onChange={(i, k, v) => handleItemChange("companies", i, k, v)}
          errorMap={errors}
          fields={[
            { name: "id", label: "Empresa", type: "select", options: companyOptions },
            { name: "start_date", label: "Início", type: "date" },
            { name: "end_date", label: "Fim", type: "date" },
            {
              name: "status", label: "Status", type: "select", options: [
                { value: "ativo", label: "Ativo" },
                { value: "afastado", label: "Afastado" },
                { value: "desligado", label: "Desligado" },
              ]
            },
          ]}
        />

        <div className="mt-6">
          <FormActions onCancel={() => navigate("/backoffice/colaboradores")} text={isEdit ? "Atualizar" : "Criar"} />
        </div>
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
