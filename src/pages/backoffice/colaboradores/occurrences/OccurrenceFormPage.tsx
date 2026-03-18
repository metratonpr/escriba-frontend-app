import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import CompanySectorAutocompleteField from "../../../../components/form/CompanySectorAutocompleteField";
import OccurrenceTypeAutocompleteField from "../../../../components/form/OccurrenceTypeAutocompleteField";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import FormTimePickerField from "../../../../components/form/FormTimePickerField";
import { createOccurrence, getOccurrenceById, updateOccurrence } from "../../../../services/occurrenceService";
import { getCompaniesWithSectors, type CompanyResponse } from "../../../../services/companyService";
import { getEmployees } from "../../../../services/employeeService";
import { getOccurrenceTypes } from "../../../../services/occurrenceTypeService";

type Option = {
  id: string | number;
  label: string;
};

export default function OccurrenceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
    employee_id: null,
    company_id: null,
    sector_id: null,
    occurrence_type_id: null,
    occurrence_date: "",
    occurrence_time: "",
    location: "",
    description: "",
    probable_cause: "",
    actual_consequence: "",
    immediate_action: "",
    corrective_action: "",
    witnesses: "",
    classification: "",
    severity: "",
    status: "",
    attachment_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [companyOptions, setCompanyOptions] = useState<CompanyResponse[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);
  const [occurrenceTypeOptions, setOccurrenceTypeOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      setIsLoading(true);

      try {
        const [companiesResponse, employeesResponse, typesResponse, occurrenceData] = await Promise.all([
          getCompaniesWithSectors({ page: 1, perPage: 100 }),
          getEmployees({ page: 1, perPage: 100 }),
          getOccurrenceTypes({ page: 1, perPage: 100 }),
          isEdit && id ? getOccurrenceById(Number(id)) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        setCompanyOptions(companiesResponse.data);
        setEmployeeOptions(
          employeesResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );
        setOccurrenceTypeOptions(
          typesResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );

        if (occurrenceData) {
          setForm({
            employee_id: occurrenceData.employee
              ? { id: occurrenceData.employee.id, label: occurrenceData.employee.name }
              : null,
            company_id: occurrenceData.company
              ? { id: occurrenceData.company.id, label: occurrenceData.company.name }
              : null,
            sector_id: occurrenceData.sector
              ? { id: occurrenceData.sector.id, label: occurrenceData.sector.name }
              : null,
            occurrence_type_id: occurrenceData.type
              ? { id: occurrenceData.type.id, label: occurrenceData.type.name }
              : null,
            occurrence_date: occurrenceData.occurrence_date ?? "",
            occurrence_time: occurrenceData.occurrence_time ?? "",
            location: occurrenceData.location ?? "",
            description: occurrenceData.description ?? "",
            probable_cause: occurrenceData.probable_cause ?? "",
            actual_consequence: occurrenceData.actual_consequence ?? "",
            immediate_action: occurrenceData.immediate_action ?? "",
            corrective_action: occurrenceData.corrective_action ?? "",
            witnesses: occurrenceData.witnesses ?? "",
            classification: occurrenceData.classification ?? "",
            severity: occurrenceData.severity ?? "",
            status: occurrenceData.status ?? "",
            attachment_url: occurrenceData.attachment_url ?? "",
          });
        }
      } catch {
        setToast({ open: true, message: "Erro ao carregar ocorrencia.", type: "error" });
        if (isEdit) {
          navigate("/backoffice/ocorrencias");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const payload = {
      employee_id: form.employee_id?.id ?? null,
      company_id: form.company_id?.id ?? null,
      sector_id: form.sector_id?.id ?? null,
      occurrence_type_id: form.occurrence_type_id?.id ?? null,
      occurrence_date: form.occurrence_date,
      occurrence_time: form.occurrence_time?.slice(0, 5),
      location: form.location,
      description: form.description,
      probable_cause: form.probable_cause,
      actual_consequence: form.actual_consequence,
      immediate_action: form.immediate_action,
      corrective_action: form.corrective_action,
      witnesses: form.witnesses || null,
      classification: form.classification,
      severity: form.severity,
      status: form.status,
      attachment_url: form.attachment_url || null,
    };

    try {
      if (isEdit && id) {
        await updateOccurrence(Number(id), payload);
      } else {
        await createOccurrence(payload);
      }
      setToast({
        open: true,
        message: `Ocorrencia ${isEdit ? "atualizada" : "criada"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/ocorrencias");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar ocorrencia.", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Breadcrumbs
        items={[
          { label: "Ocorrencias", to: "/backoffice/ocorrencias" },
          { label: isEdit ? "Editar" : "Nova", to: "#" },
        ]}
      />

      {isLoading ? (
        <FormPageSkeleton className="px-0" fields={12} />
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CompanySectorAutocompleteField
              className="md:col-span-2"
              company={form.company_id}
              sector={form.sector_id}
              onChange={({ company, sector }) =>
                setForm((prev: any) => ({
                  ...prev,
                  company_id: company,
                  sector_id: sector,
                }))
              }
              companyName="company_id"
              sectorName="sector_id"
              sectorValueMode="sector"
              companyRequired
              companyError={errors.company_id}
              sectorError={errors.sector_id}
              initialCompanies={companyOptions}
            />
            <EmployeeAutocompleteField
              value={form.employee_id}
              onChange={(value) => setForm((prev: any) => ({ ...prev, employee_id: value }))}
              error={errors.employee_id}
              initialOptions={employeeOptions}
            />
            <OccurrenceTypeAutocompleteField
              value={form.occurrence_type_id}
              onChange={(value) =>
                setForm((prev: any) => ({ ...prev, occurrence_type_id: value }))
              }
              error={errors.occurrence_type_id}
              required
              initialOptions={occurrenceTypeOptions}
            />
            <FormDatePickerField
              name="occurrence_date"
              label="Data"
              value={form.occurrence_date}
              onChange={handleChange}
              error={errors.occurrence_date}
              required
            />
            <FormTimePickerField
              name="occurrence_time"
              label="Hora"
              value={form.occurrence_time}
              onChange={handleChange}
              error={errors.occurrence_time}
              required
            />
            <FormInput
              name="location"
              label="Local"
              value={form.location}
              onChange={handleChange}
              error={errors.location}
              required
            />
            <FormTextArea
              name="description"
              label="Descricao"
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              required
            />
            <FormTextArea
              name="probable_cause"
              label="Causa Provavel"
              value={form.probable_cause}
              onChange={handleChange}
              error={errors.probable_cause}
              required
            />
            <FormTextArea
              name="actual_consequence"
              label="Consequencia Real"
              value={form.actual_consequence}
              onChange={handleChange}
              error={errors.actual_consequence}
              required
            />
            <FormTextArea
              name="immediate_action"
              label="Acao Imediata"
              value={form.immediate_action}
              onChange={handleChange}
              error={errors.immediate_action}
              required
            />
            <FormTextArea
              name="corrective_action"
              label="Acao Corretiva"
              value={form.corrective_action}
              onChange={handleChange}
              error={errors.corrective_action}
              required
            />
            <FormInput
              name="witnesses"
              label="Testemunhas"
              value={form.witnesses}
              onChange={handleChange}
              error={errors.witnesses}
            />
            <FormSelectField
              name="classification"
              label="Classificacao"
              value={form.classification}
              onChange={handleChange}
              options={["Com Afastamento", "Sem Afastamento", "Quase Acidente", "Desvio", "Outro"].map((value) => ({ label: value, value }))}
              error={errors.classification}
              required
            />
            <FormSelectField
              name="severity"
              label="Gravidade"
              value={form.severity}
              onChange={handleChange}
              options={["Leve", "Moderada", "Grave"].map((value) => ({ label: value, value }))}
              error={errors.severity}
              required
            />
            <FormSelectField
              name="status"
              label="Status"
              value={form.status}
              onChange={handleChange}
              options={["Aberta", "Em Analise", "Encerrada"].map((value) => ({ label: value, value }))}
              error={errors.status}
              required
            />
            <FormInput
              name="attachment_url"
              label="URL do Anexo"
              value={form.attachment_url}
              onChange={handleChange}
              error={errors.attachment_url}
            />
          </div>

          <div className="mt-6">
            <FormActions
              onCancel={() => navigate("/backoffice/ocorrencias")}
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
