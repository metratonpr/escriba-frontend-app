// src/pages/backoffice/colaboradores/employee/EmployeeFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEmployee, getEmployeeById, updateEmployee } from "../../../../services/employeeService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import { FormInput } from "../../../../components/form/FormInput";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import Toast from "../../../../components/Layout/Feedback/Toast";
import Spinner from "../../../../components/Layout/ui/Spinner";
import CustomAssignmentsTable from "../../../../components/form/CustomAssignmentsTable";

const LICENSE_TYPES = [
  "A", "B", "C", "D", "E", "AB", "AC", "AD", "AE", "Não Possui"
].map((v) => ({ value: v, label: v }));

export default function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    name: "",
    cpf: "",
    rg: "",
    rg_issuer: "",
    birth_date: "",
    driver_license_type: "",
    first_license_date: "",
    assignments: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getEmployeeById(id)
        .then((data: any) => {
          setForm({
            name: data.name,
            cpf: data.cpf,
            rg: data.rg,
            rg_issuer: data.rg_issuer || "",
            birth_date: data.birth_date || "",
            driver_license_type: data.driver_license_type,
            first_license_date: data.first_license_date || "",
            assignments: (data.assignments || []).map((a: any) => ({
              company_sector_id: a.company_sector_id,
              company_name: a.company_sector?.company?.name || `Empresa #${a.company_sector_id}`,
              sector_name: a.company_sector?.sector?.name || `Setor #${a.company_sector_id}`,
              job_title_id: a.job_title_id,
              job_title_name: a.job_title?.name || `Cargo #${a.job_title_id}`,
              start_date: a.start_date,
              end_date: a.end_date,
            })),
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar colaborador.", type: "error" });
          navigate("/backoffice/colaboradores");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const validateAssignments = (assignments: any[]) => {
    for (const a of assignments) {
      if (a.end_date && new Date(a.end_date) < new Date(a.start_date)) {
        return `Data de fim (${a.end_date}) não pode ser anterior à data de início (${a.start_date}).`;
      }
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const payload = {
      ...form,
      assignments: form.assignments.map((a: any) => ({
        company_sector_id: a.company_sector_id,
        job_title_id: a.job_title_id,
        start_date: a.start_date,
        end_date: a.end_date || null,
      })),
    };

    const validationError = validateAssignments(payload.assignments);
    if (validationError) {
      setToast({ open: true, message: validationError, type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit && id) {
        await updateEmployee(id, payload);
      } else {
        await createEmployee(payload);
      }
      setToast({ open: true, message: `Colaborador ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/colaboradores");
    } catch (err: any) {
      console.error("Backend validation errors:", err.response?.data);
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar colaborador.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs items={[{ label: "Colaboradores", to: "/backoffice/colaboradores" }, { label: isEdit ? "Editar" : "Novo", to: "#" }]} />

      {isLoading && isEdit ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput id="name" name="name" label="Nome" value={form.name} onChange={handleChange} error={errors.name} required />
            <FormInput id="cpf" name="cpf" label="CPF" value={form.cpf} onChange={handleChange} error={errors.cpf} required />
            <FormInput id="rg" name="rg" label="RG" value={form.rg} onChange={handleChange} error={errors.rg} required />

            <FormInput id="rg_issuer" name="rg_issuer" label="Órgão Emissor" value={form.rg_issuer} onChange={handleChange} error={errors.rg_issuer} required />

            <FormDatePickerField
              name="birth_date"
              label="Data de Nascimento"
              value={form.birth_date || ""}
              onChange={(e) => setForm((prev: any) => ({ ...prev, birth_date: e.target.value }))}
              error={errors.birth_date}
            />

            <FormSelectField
              name="driver_license_type"
              label="Categoria CNH"
              value={form.driver_license_type}
              onChange={handleChange}
              options={LICENSE_TYPES}
              error={errors.driver_license_type}
            />

            <FormDatePickerField
              name="first_license_date"
              label="Data da 1ª Habilitação"
              value={form.first_license_date || ""}
              onChange={(e) => setForm((prev: any) => ({ ...prev, first_license_date: e.target.value }))}
              error={errors.first_license_date}
            />
          </div>

          <div className="mt-8">
            <CustomAssignmentsTable
              value={form.assignments}
              onChange={(list: any[]) => setForm((prev: any) => ({ ...prev, assignments: list }))}
              error={errors.assignments}
            />
          </div>

          <div className="mt-6">
            <FormActions onCancel={() => navigate("/backoffice/colaboradores")} text={isEdit ? "Atualizar" : "Criar"} />
          </div>
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}