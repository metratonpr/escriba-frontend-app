import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";
import CompanyAutocompleteField from "../../../../components/form/CompanyAutocompleteField";
import DocumentWithVersionField from "../../../../components/form/DocumentWithVersionField";
import FormSelectField from "../../../../components/form/FormSelectField";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FileUpload from "../../../../components/form/FileUpload";
import CompanyDocumentAttachmentList from "./CompanyDocumentAttachmentList";
import {
  createCompanyDocumentUpload,
  getCompanyDocumentUploadById,
  updateCompanyDocumentUpload,
} from "../../../../services/companyDocumentService";

type UploadFile = File | { id: number; nome_arquivo: string; url_arquivo: string };

export default function CompanyDocumentVersionUploadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_id: null as any,
    document: null as any,
    document_version_id: "",
    issue_date: "",
    due_date: "",
    documents: [] as UploadFile[],
    status: "pendente",
    upload_id: "", // ✅ incluído
  });

  const [deletedUploadIds, setDeletedUploadIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as const });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getCompanyDocumentUploadById(id)
        .then((res) => {
          const data = res.data;

          setForm({
            company_id: data.company ? { id: data.company.id, label: data.company.name } : null,
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
            upload_id: data.upload_id ? String(data.upload_id) : "", // ✅ novo
          });
        })
        .catch(() => {
          setToast({
            open: true,
            message: "Erro ao carregar registro.",
            type: "error",
          });
          navigate("/backoffice/empresas/documentos");
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
      setDeletedUploadIds((prev) => [...prev, doc.id]);
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

    if (form.company_id?.id) formData.append("company_id", String(form.company_id.id));
    formData.append("document_version_id", form.document_version_id);
    formData.append("emission_date", form.issue_date);
    formData.append("due_date", form.due_date);
    formData.append("status", form.status);

    if (form.upload_id) {
      formData.append("upload_id", form.upload_id); // ✅ adiciona o upload_id
    }

    const file = form.documents[0];
    if (file instanceof File) {
      formData.append("upload", file);
    }

    try {
      if (isEdit && id) {
        formData.append("_method", "PUT");
        await updateCompanyDocumentUpload(id, formData);
      } else {
        await createCompanyDocumentUpload(formData);
      }

      setToast({
        open: true,
        message: `Registro ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });

      navigate("/backoffice/empresas/documentos");
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
          { label: "Documentos da Empresa", to: "/backoffice/empresas/documentos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      {isEdit && isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <CompanyAutocompleteField
            value={form.company_id}
            onChange={(v) => setForm((p) => ({ ...p, company_id: v }))}
            error={errors.company_id}
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
            required
          />
          <FormDatePickerField
            name="due_date"
            label="Data de Vencimento"
            value={form.due_date}
            onChange={handleChange}
            error={errors.due_date}
            required
          />
          <FormSelectField
            name="status"
            label="Status"
            value={form.status}
            onChange={handleChange}
            options={["pendente", "enviado", "aprovado", "rejeitado"].map((v) => ({ label: v, value: v }))}
            error={errors.status}
            required
          />
          <FileUpload
            label="Anexo único (JPG, PNG ou PDF até 50MB)"
            files={form.documents.slice(0, 1)}
            setFiles={(f) => setForm((prev) => ({ ...prev, documents: f.slice(0, 1) }))}
            accept=".jpg,.jpeg,.png,.pdf"
            maxSizeMB={50}
            multiple={false}
            showToast={(msg, type) => setToast({ open: true, message: msg, type })}
          />
          <CompanyDocumentAttachmentList
            persisted={persisted as any}
            pending={pending as any}
            onRemove={handleRemoveFile}
          />
          <FormActions
            onCancel={() => navigate("/backoffice/empresas/documentos")}
            text={isEdit ? "Atualizar" : "Criar"}
            loading={isLoading}
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
