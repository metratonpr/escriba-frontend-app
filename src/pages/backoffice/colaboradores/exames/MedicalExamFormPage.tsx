import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createMedicalExam,
  getMedicalExamById,
  updateMedicalExam,
} from "../../../../services/medicalExamService";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FormSelectField from "../../../../components/form/FormSelectField";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import { FormInput } from "../../../../components/form/FormInput";
import FormSwitchField from "../../../../components/form/FormSwitchField";
import { FormActions } from "../../../../components/form/FormActions";
import Toast from "../../../../components/Layout/Feedback/Toast";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import FileUpload from "../../../../components/form/FileUpload";
import ExamAttachmentList from "./ExamAttachmentList";

export type UploadFile =
  | File
  | {
    id: number;
    nome_arquivo: string;
    url_arquivo: string;
  };

export default function MedicalExamFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_id: "",
    exam_type: "",
    exam_date: "",
    cid: "",
    fit: false,
    result_attachment_url: "",
    documents: [] as UploadFile[],
  });

  const [deletedUploadIds, setDeletedUploadIds] = useState<number[]>([]);
  const [employeeSelected, setEmployeeSelected] = useState<{ id: string | number; label: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (isEdit && id) {
      getMedicalExamById(Number(id)).then((res) => {
        setForm({
          employee_id: String(res.employee_id),
          exam_type: res.exam_type,
          exam_date: res.exam_date?.slice(0, 10),
          cid: res.cid || "",
          fit: !!res.fit,
          result_attachment_url: res.result_attachment_url || "",
          documents: res.uploads?.map((u) => ({
            id: u.id,
            nome_arquivo: u.nome_arquivo,
            url_arquivo: u.url_arquivo,
          })) || [],
        });

        setEmployeeSelected({
          id: res.employee_id,
          label: res.employee?.name || res.employee_name || "Colaborador",
        });
      });
    }
  }, [id, isEdit]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append("employee_id", form.employee_id);
    formData.append("exam_type", form.exam_type);
    formData.append("exam_date", form.exam_date);
    formData.append("cid", form.cid ?? "");
    formData.append("fit", form.fit ? "1" : "0");
    formData.append("result_attachment_url", form.result_attachment_url ?? "");

    form.documents.forEach((doc) => {
      if (doc instanceof File) {
        formData.append("documents[]", doc);
      }
    });

    deletedUploadIds.forEach((id) => {
      formData.append("documents_to_delete[]", String(id));
    });

    try {
      if (isEdit) {
        formData.append("_method", "PUT");
        await updateMedicalExam(Number(id), formData);
      } else {
        await createMedicalExam(formData);
      }

      setToast({
        open: true,
        message: `Exame ${isEdit ? "atualizado" : "criado"} com sucesso`,
        type: "success",
      });

      navigate("/backoffice/exames-medicos");
    } catch (err: any) {
      setErrors(err.response?.data?.errors || {});
      setToast({
        open: true,
        message: "Erro ao salvar exame",
        type: "error",
      });
    }
  };

  const handleRemoveFile = (index: number, type: 'persisted' | 'pending') => {
    if (type === 'persisted') {
      const doc = form.documents.filter((d) => !(d instanceof File))[index] as any;
      setDeletedUploadIds((prev) => [...prev, doc.id]);
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => !(d instanceof File) ? d.id !== doc.id : true),
      }));
    } else {
      const pendingDocs = form.documents.filter((d) => d instanceof File);
      const docToRemove = pendingDocs[index];
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d !== docToRemove),
      }));
    }
  };

  const persisted = form.documents.filter((d): d is Exclude<UploadFile, File> => !(d instanceof File));
  const pending = form.documents.filter((d): d is File => d instanceof File);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Backoffice", to: "/backoffice" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
          { label: isEdit ? "Editar" : "Novo" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Exame Médico" : "Novo Exame Médico"}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <EmployeeAutocompleteField
          value={employeeSelected}
          onChange={(opt) => {
            setEmployeeSelected(opt);
            setForm((prev) => ({ ...prev, employee_id: String(opt?.id || "") }));
          }}
        />


        <FormSelectField
          label="Tipo de Exame"
          name="exam_type"
          value={form.exam_type}
          onChange={handleChange}
          options={[
            { value: "admissional", label: "Admissional" },
            { value: "periodico", label: "Periódico" },
            { value: "demissional", label: "Demissional" },
            { value: "retorno_ao_trabalho", label: "Retorno ao Trabalho" },
            { value: "mudanca_de_funcao", label: "Mudança de Função" },
          ]}
          error={errors.exam_type}
        />

        <FormDatePickerField
          label="Data do Exame"
          name="exam_date"
          value={form.exam_date}
          onChange={handleChange}
          error={errors.exam_date}
        />

        <FormInput id="cid" name="cid" label="CID" value={form.cid} onChange={handleChange} error={errors.cid} />

        <FormSwitchField label="Apto" name="fit" checked={form.fit} onChange={handleChange} />

        <FormInput
          id="result_attachment_url"
          name="result_attachment_url"
          label="Link do Resultado"
          value={form.result_attachment_url}
          onChange={handleChange}
          error={errors.result_attachment_url}
        />

        <FileUpload
          label="Anexos do Exame"
          files={form.documents}
          setFiles={(files) => setForm((prev) => ({ ...prev, documents: files }))}
          showToast={(msg, type) => setToast({ open: true, message: msg, type: type === "error" ? "error" : "success" })}
        />

        <ExamAttachmentList
          examId={id || ""}
          persisted={persisted}
          pending={pending}
          onRemove={handleRemoveFile}
        />

        <FormActions onCancel={() => navigate("/backoffice/exames-medicos")} text={isEdit ? "Atualizar" : "Criar"} />
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
