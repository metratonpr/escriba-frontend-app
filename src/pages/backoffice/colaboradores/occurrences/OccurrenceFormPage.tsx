import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import CompanyAutocompleteField from "../../../../components/form/CompanyAutocompleteField";
import SectorAutocompleteField from "../../../../components/form/SectorAutocompleteField";
import OccurrenceTypeAutocompleteField from "../../../../components/form/OccurrenceTypeAutocompleteField";
import { createOccurrence, getOccurrenceById, updateOccurrence } from "../../../../services/occurrenceService";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import FormTimePickerField from "../../../../components/form/FormTimePickerField";

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
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getOccurrenceById(Number(id))
        .then((data) => {
          setForm({
            employee_id: data.employee ? { id: data.employee.id, label: data.employee.name } : null,
            company_id: data.company ? { id: data.company.id, label: data.company.name } : null,
            sector_id: data.sector ? { id: data.sector.id, label: data.sector.name } : null,
            occurrence_type_id: data.type ? { id: data.type.id, label: data.type.name } : null,
            occurrence_date: data.occurrence_date,
            occurrence_time: data.occurrence_time,
            location: data.location,
            description: data.description,
            probable_cause: data.probable_cause,
            actual_consequence: data.actual_consequence,
            immediate_action: data.immediate_action,
            corrective_action: data.corrective_action,
            witnesses: data.witnesses,
            classification: data.classification,
            severity: data.severity,
            status: data.status,
            attachment_url: data.attachment_url,
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar ocorrência.", type: "error" });
          navigate("/backoffice/ocorrencias");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setToast({ open: true, message: `Ocorrência ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate("/backoffice/ocorrencias");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar ocorrência.", type: "error" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Breadcrumbs items={[{ label: "Ocorrências", to: "/backoffice/ocorrencias" }, { label: isEdit ? "Editar" : "Nova", to: "#" }]} />

      {isEdit && isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompanyAutocompleteField value={form.company_id} onChange={(v) => setForm((p: any) => ({ ...p, company_id: v }))} error={errors.company_id} />
            <SectorAutocompleteField value={form.sector_id} onChange={(v) => setForm((p: any) => ({ ...p, sector_id: v }))} error={errors.sector_id} />
            <EmployeeAutocompleteField value={form.employee_id} onChange={(v) => setForm((p: any) => ({ ...p, employee_id: v }))} error={errors.employee_id} />
            <OccurrenceTypeAutocompleteField value={form.occurrence_type_id} onChange={(v) => setForm((p: any) => ({ ...p, occurrence_type_id: v }))} error={errors.occurrence_type_id} />
            <FormDatePickerField name="occurrence_date" label="Data" value={form.occurrence_date} onChange={handleChange} error={errors.occurrence_date} />
            <FormTimePickerField name="occurrence_time" label="Hora" value={form.occurrence_time} onChange={handleChange} error={errors.occurrence_time} />
            <FormInput name="location" label="Local" value={form.location} onChange={handleChange} error={errors.location} />
            <FormTextArea name="description" label="Descrição" value={form.description} onChange={handleChange} error={errors.description} />
            <FormTextArea name="probable_cause" label="Causa Provável" value={form.probable_cause} onChange={handleChange} error={errors.probable_cause} />
            <FormTextArea name="actual_consequence" label="Consequência Real" value={form.actual_consequence} onChange={handleChange} error={errors.actual_consequence} />
            <FormTextArea name="immediate_action" label="Ação Imediata" value={form.immediate_action} onChange={handleChange} error={errors.immediate_action} />
            <FormTextArea name="corrective_action" label="Ação Corretiva" value={form.corrective_action} onChange={handleChange} error={errors.corrective_action} />
            <FormInput name="witnesses" label="Testemunhas" value={form.witnesses} onChange={handleChange} error={errors.witnesses} />
            <FormSelectField name="classification" label="Classificação" value={form.classification} onChange={handleChange} options={["Com Afastamento", "Sem Afastamento", "Quase Acidente", "Desvio", "Outro"].map((v) => ({ label: v, value: v }))} error={errors.classification} />
            <FormSelectField name="severity" label="Gravidade" value={form.severity} onChange={handleChange} options={["Leve", "Moderada", "Grave"].map((v) => ({ label: v, value: v }))} error={errors.severity} />
            <FormSelectField name="status" label="Status" value={form.status} onChange={handleChange} options={["Aberta", "Em Análise", "Encerrada"].map((v) => ({ label: v, value: v }))} error={errors.status} />
            <FormInput name="attachment_url" label="URL do Anexo" value={form.attachment_url} onChange={handleChange} error={errors.attachment_url} />
          </div>

          <div className="mt-6">
            <FormActions onCancel={() => navigate("/backoffice/ocorrencias")} text={isEdit ? "Atualizar" : "Criar"} />
          </div>
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}
