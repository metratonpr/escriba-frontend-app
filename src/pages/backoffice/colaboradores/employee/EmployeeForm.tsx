// src/pages/backoffice/colaboradores/employee/EmployeeForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import Spinner from "../../../../components/Layout/ui/Spinner";
import { FormActions } from "../../../../components/form/FormActions";
import { FormInput } from "../../../../components/form/FormInput";
import CustomAssignmentsTable, {
  type CustomAssignment,
} from "../../../../components/form/CustomAssignmentsTable";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FormSelectField from "../../../../components/form/FormSelectField";
import {
  createEmployee,
  getEmployeeById,
  updateEmployee,
  type Employee,
  type EmployeePayload,
} from "../../../../services/employeeService";
import type { FieldErrors } from "../../../../utils/errorUtils";

const EMPLOYEES_ROUTE = "/backoffice/colaboradores";

const LICENSE_TYPES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "AB",
  "AC",
  "AD",
  "AE",
  "Não Possui",
].map((value) => ({ value, label: value }));

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

type EmployeeFormState = {
  name: string;
  cpf: string;
  rg: string;
  rg_issuer: string;
  birth_date: string;
  driver_license_type: string;
  first_license_date: string;
  assignments: CustomAssignment[];
};

const INITIAL_FORM_STATE: EmployeeFormState = {
  name: "",
  cpf: "",
  rg: "",
  rg_issuer: "",
  birth_date: "",
  driver_license_type: "",
  first_license_date: "",
  assignments: [],
};

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function mapEmployeeToForm(employee: Employee): EmployeeFormState {
  return {
    name: employee.name ?? "",
    cpf: employee.cpf ?? "",
    rg: employee.rg ?? "",
    rg_issuer: employee.rg_issuer ?? "",
    birth_date: toDateInputValue(employee.birth_date),
    driver_license_type: employee.driver_license_type ?? "",
    first_license_date: toDateInputValue(employee.first_license_date),
    assignments: (employee.assignments ?? []).map((assignment) => ({
      company_sector_id: assignment.company_sector_id,
      company_name:
        assignment.company_sector?.company?.name ??
        `Empresa #${assignment.company_sector_id}`,
      sector_name:
        assignment.company_sector?.sector?.name ??
        `Setor #${assignment.company_sector_id}`,
      job_title_id: assignment.job_title_id,
      job_title_name:
        assignment.job_title?.name ?? `Cargo #${assignment.job_title_id}`,
      start_date: toDateInputValue(assignment.start_date),
      end_date: toDateInputValue(assignment.end_date),
    })),
  };
}

function buildPayload(form: EmployeeFormState): EmployeePayload {
  return {
    name: form.name,
    cpf: form.cpf,
    rg: form.rg,
    rg_issuer: form.rg_issuer,
    birth_date: toDateInputValue(form.birth_date),
    driver_license_type: form.driver_license_type,
    first_license_date: toDateInputValue(form.first_license_date) || null,
    assignments: form.assignments.map((assignment) => ({
      company_sector_id: assignment.company_sector_id,
      job_title_id: assignment.job_title_id,
      start_date: toDateInputValue(assignment.start_date),
      end_date: toDateInputValue(assignment.end_date) || null,
    })),
  };
}

function getApiErrors(error: unknown): FieldErrors {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return {};
  }

  const response = (error as { response?: { data?: { errors?: FieldErrors } } })
    .response;

  return response?.data?.errors ?? {};
}

function validateAssignments(
  assignments: Array<{ start_date: string; end_date?: string | null }>
): string | null {
  for (const assignment of assignments) {
    const startDate = toDateInputValue(assignment.start_date);
    const endDate = toDateInputValue(assignment.end_date);

    if (endDate && endDate < startDate) {
      return `Data de fim (${endDate}) não pode ser anterior à data de início (${startDate}).`;
    }
  }

  return null;
}

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<EmployeeFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) {
      setForm(INITIAL_FORM_STATE);
      return;
    }

    setIsLoading(true);

    getEmployeeById(id)
      .then((employee) => {
        setForm(mapEmployeeToForm(employee));
      })
      .catch(() => {
        setToast({
          open: true,
          message: "Erro ao carregar colaborador.",
          type: "error",
        });
        navigate(EMPLOYEES_ROUTE);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, isEdit, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange =
    (field: "birth_date" | "first_license_date") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAssignmentsChange = (assignments: CustomAssignment[]) => {
    setForm((prev) => ({ ...prev, assignments }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const payload = buildPayload(form);
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

      setToast({
        open: true,
        message: `Colaborador ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate(EMPLOYEES_ROUTE);
    } catch (error) {
      console.error("Backend validation errors:", error);
      setErrors(getApiErrors(error));
      setToast({
        open: true,
        message: "Erro ao salvar colaborador.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Colaboradores", to: EMPLOYEES_ROUTE },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      {isLoading && isEdit ? (
        <Spinner />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="name"
              name="name"
              label="Nome"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <FormInput
              id="cpf"
              name="cpf"
              label="CPF"
              value={form.cpf}
              onChange={handleChange}
              error={errors.cpf}
              required
            />
            <FormInput
              id="rg"
              name="rg"
              label="RG"
              value={form.rg}
              onChange={handleChange}
              error={errors.rg}
              required
            />

            <FormInput
              id="rg_issuer"
              name="rg_issuer"
              label="Órgão Emissor"
              value={form.rg_issuer}
              onChange={handleChange}
              error={errors.rg_issuer}
              required
            />

            <FormDatePickerField
              name="birth_date"
              label="Data de Nascimento"
              value={form.birth_date}
              onChange={handleDateChange("birth_date")}
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
              value={form.first_license_date}
              onChange={handleDateChange("first_license_date")}
              error={errors.first_license_date}
            />
          </div>

          <div className="mt-8">
            <CustomAssignmentsTable
              value={form.assignments}
              onChange={handleAssignmentsChange}
              error={errors.assignments}
            />
          </div>

          <div className="mt-6">
            <FormActions
              onCancel={() => navigate(EMPLOYEES_ROUTE)}
              text={isEdit ? "Atualizar" : "Criar"}
            />
          </div>
        </form>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
