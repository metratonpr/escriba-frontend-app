// src/pages/backoffice/colaboradores/employee-documents/EmployeeDocumentUploadFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import DocumentWithVersionField from "../../../../components/form/DocumentWithVersionField";
import FormSelectField from "../../../../components/form/FormSelectField";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FileUpload from "../../../../components/form/FileUpload";

import {
  createEmployeeDocumentUpload,
  getEmployeeDocumentUploadById,
  updateEmployeeDocumentUpload,
} from "../../../../services/employeeDocumentService";
import EmployeeDocumentAttachmentList from "./EmployeeDocumentAttachmentList";

export default function EmployeeDocumentUploadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employee_id: null as any,
    document: null as any,
    document_version_id: "",
    issue_date: "",
    due_date: "",
    documents: [] as (File | { id: number; nome_arquivo: string; url_arquivo: string })[],
    status: "pendente",
    upload_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getEmployeeDocumentUploadById(id)
        .then((data) => {
          setForm({
            employee_id: data.employee ? { id: data.employee.id, label: data.employee.name } : null,
            document: data.document_version
              ? {
                  id: data.document_version.id,
                  label: `${data.document_version.code} (${data.document_version.version})`,
                }
              : null,
            document_version_id: String(data.document_version_id),
            issue_date: data.emission_date || "",
            due_date: data.due_date || "",
            documents: data.upload
              ? [
                  {
                    id: data.upload.id,
                    nome_arquivo: data.upload.nome_arquivo,
                    url_arquivo: data.upload.url_arquivo,
                  },
                ]
              : [],
            status: data.status,
            upload_id: data.upload_id ? String(data.upload_id) : "",
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar registro.", type: "error" });
          navigate("/backoffice/colaboradores/documentos");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFile = (index: number, type: "persisted" | "pending") => {
    if (type === "persisted") {
      const doc = form.documents.filter((d) => !(d instanceof File))[index] as any;
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => !(d instanceof File) ? d.id !== doc.id : true),
      }));
    } else {
      const pending = form.documents.filter((d) => d instanceof File);
      const toRemove = pending[index];
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d !== toRemove),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData();

    if (form.employee_id?.id) formData.append("employee_id", String(form.employee_id.id));
    formData.append("document_version_id", form.document_version_id);
    formData.append("emission_date", form.issue_date);
    formData.append("due_date", form.due_date);
    formData.append("status", form.status);

    if (form.upload_id) {
      formData.append("upload_id", form.upload_id);
    }

    const file = form.documents[0];
    if (file instanceof File) {
      formData.append("upload", file);
    }

    try {
      if (isEdit && id) {
        formData.append("_method", "PUT");
        await updateEmployeeDocumentUpload(id, formData);
      } else {
        await createEmployeeDocumentUpload(formData);
      }

      setToast({
        open: true,
        message: `Registro ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });

      navigate("/backoffice/colaboradores/documentos");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar registro.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const persisted = form.documents.filter((d) => !(d instanceof File));
  const pending = form.documents.filter((d) => d instanceof File);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Documentos do Colaborador", to: "/backoffice/colaboradores/documentos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      {isEdit && isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <EmployeeAutocompleteField
            value={form.employee_id}
            onChange={(v) => setForm((p) => ({ ...p, employee_id: v }))}
            error={errors.employee_id}
            required
          />
          <DocumentWithVersionField
            document={form.document}
            onDocumentChange={(doc) => setForm((p) => ({ ...p, document: doc }))}
            versionId={form.document_version_id}
            onVersionChange={(e) => setForm((p) => ({ ...p, document_version_id: e.target.value }))}
          />
          <FormDatePickerField
            name="issue_date"
            label="Data de Emissão"
            value={form.issue_date}
            onChange={handleChange}
            error={errors.issue_date}
          />
          <FormDatePickerField
            name="due_date"
            label="Data de Vencimento"
            value={form.due_date}
            onChange={handleChange}
            error={errors.due_date}
          />
          <FormSelectField
            name="status"
            label="Status"
            value={form.status}
            onChange={handleChange}
            options={["pendente", "enviado", "aprovado", "rejeitado"].map((v) => ({ label: v, value: v }))}
            error={errors.status}
          />
          <FileUpload
            label="Anexo único (JPG, PNG ou PDF até 50MB)"
            files={form.documents.slice(0, 1)}
            setFiles={(f) => setForm((prev) => ({ ...prev, documents: f.slice(0, 1) }))}
            maxSizeMB={50}
            multiple={false}
            showToast={(msg, type = "success") => setToast({ open: true, message: msg, type })}
          />
          <EmployeeDocumentAttachmentList
            persisted={persisted as any}
            pending={pending as any}
            onRemove={handleRemoveFile}
          />
          <FormActions
            onCancel={() => navigate("/backoffice/colaboradores/documentos")}
            text={isEdit ? "Atualizar" : "Criar"}
          />
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