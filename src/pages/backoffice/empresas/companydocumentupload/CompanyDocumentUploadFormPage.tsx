// src/pages/backoffice/empresas/companies/CompanyDocumentUploadFormPage.tsx
import { useEffect, useState } from "react";
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
import { getFieldError } from "../../../../utils/errorUtils";

import {
    createCompanyDocumentUpload,
    getCompanyDocumentUploadById,
    updateCompanyDocumentUpload,
} from "../../../../services/companyDocumentService";

// Definindo interfaces compatíveis com os componentes
interface DocumentFile {
    id: number;
    nome_arquivo: string;
    url_arquivo: string;
}

interface Option {
    id: string | number;
    label: string;
}

type FormDocument = File | DocumentFile;

interface FormState {
    company_id: Option | null;
    document: Option | null;
    document_id: string;
    issue_date: string;
    due_date: string;
    documents: FormDocument[];
    status: string;
    upload_id: string;
}

export default function CompanyDocumentUploadFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>({
        company_id: null,
        document: null,
        document_id: "",
        issue_date: "",
        due_date: "",
        documents: [],
        status: "pendente",
        upload_id: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{
        open: boolean;
        message: string;
        type: "success" | "error"
    }>({
        open: false,
        message: "",
        type: "success",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Type guards
    const isDocumentFile = (item: FormDocument): item is DocumentFile => {
        return !(item instanceof File) && typeof item === 'object' && 'id' in item;
    };

    const isFile = (item: FormDocument): item is File => {
        return item instanceof File;
    };

    useEffect(() => {
        if (isEdit && id) {
            setIsLoading(true);
            getCompanyDocumentUploadById(id)
                .then((data) => {
                    const selectedDocument = data.document ?? data.document_version;

                    setForm({
                        company_id: data.company ? { id: data.company.id, label: data.company.name } : null,
                        document: selectedDocument
                            ? {
                                id: selectedDocument.id,
                                label: selectedDocument.name
                                    ? `${selectedDocument.code} - ${selectedDocument.name}`
                                    : `${selectedDocument.code}${selectedDocument.version ? ` (${selectedDocument.version})` : ""}`,
                            }
                            : null,
                        document_id: String(data.document_id ?? selectedDocument?.id ?? ""),
                        issue_date: data.emission_date ?? "",
                        due_date: data.due_date ?? "",
                        documents: data.upload
                            ? [
                                {
                                    id: data.upload.id,
                                    nome_arquivo: data.upload.nome_arquivo,
                                    url_arquivo: data.upload.url_arquivo,
                                },
                            ]
                            : [],
                        status: data.status ?? "pendente",
                        upload_id: data.upload_id ? String(data.upload_id) : "",
                    });
                })
                .catch(() => {
                    setToast({ open: true, message: "Erro ao carregar registro.", type: "error" });
                    navigate("/backoffice/empresas/documentos");
                })
                .finally(() => setIsLoading(false));
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRemoveFile = (index: number, type: "persisted" | "pending") => {
        if (type === "persisted") {
            const persistedDocs = form.documents.filter(isDocumentFile);
            const docToRemove = persistedDocs[index];

            if (docToRemove) {
                setForm((prev) => ({
                    ...prev,
                    documents: prev.documents.filter((d) =>
                        isDocumentFile(d) ? d.id !== docToRemove.id : true
                    ),
                }));
            }
        } else {
            const pendingFiles = form.documents.filter(isFile);
            const fileToRemove = pendingFiles[index];

            if (fileToRemove) {
                setForm((prev) => ({
                    ...prev,
                    documents: prev.documents.filter((d) => d !== fileToRemove),
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        const formData = new FormData();

        if (form.company_id?.id) formData.append("company_id", String(form.company_id.id));
        formData.append("document_id", form.document_id);
        formData.append("emission_date", form.issue_date);
        formData.append("due_date", form.due_date);
        formData.append("status", form.status);

        if (form.upload_id) {
            formData.append("upload_id", form.upload_id);
        }

        const file = form.documents[0];
        if (file && isFile(file)) {
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
        } catch (err: unknown) {
            const error = err as { response?: { data?: { errors?: Record<string, string> } } };
            setErrors(error.response?.data?.errors ?? {});
            setToast({ open: true, message: "Erro ao salvar registro.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    // Filtros seguros
    const persisted = form.documents.filter(isDocumentFile);
    const pending = form.documents.filter(isFile);

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
                        onChange={(v: Option | null) => setForm((p) => ({ ...p, company_id: v }))}
                        error={errors.company_id}

                    />
                    <DocumentWithVersionField
                        document={form.document}
                        onDocumentChange={(doc: Option | null) =>
                            setForm((p) => ({
                                ...p,
                                document: doc,
                                document_id: doc ? String(doc.id) : "",
                            }))
                        }
                        versionId={form.document_id}
                        onVersionChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((p) => ({ ...p, document_id: e.target.value }))}
                        documentError={getFieldError(errors, "document_id", "document")}
                        versionError={getFieldError(errors, "document_id", "document_version_id")}
                    />
                    <FormDatePickerField
                        name="issue_date"
                        label="Data de Emissão"
                        value={form.issue_date}
                        onChange={handleChange}
                        error={getFieldError(errors, "emission_date", "issue_date")}
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
                        files={form.documents.slice(0, 1) as any}
                        setFiles={(files: any) => setForm((prev) => ({ ...prev, documents: files.slice(0, 1) }))}
                        maxSizeMB={50}
                        multiple={false}
                        showToast={(msg: string, type: "success" | "error" = "success") => setToast({ open: true, message: msg, type })}
                        error={getFieldError(errors, "upload", "documents")}
                    />
                    <CompanyDocumentAttachmentList
                        persisted={persisted}
                        pending={pending}
                        onRemove={handleRemoveFile}
                    />
                    <FormActions
                        onCancel={() => navigate("/backoffice/empresas/documentos")}
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
