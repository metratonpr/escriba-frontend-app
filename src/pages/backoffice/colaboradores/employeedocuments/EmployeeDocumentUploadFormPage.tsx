import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import DocumentWithVersionField from "../../../../components/form/DocumentWithVersionField";
import EmployeeAutocompleteField from "../../../../components/form/EmployeeAutocompleteField";
import FileUpload, { type UploadFile } from "../../../../components/form/FileUpload";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import { FormActions } from "../../../../components/form/FormActions";
import FormSelectField from "../../../../components/form/FormSelectField";
import { getEmployees } from "../../../../services/employeeService";
import {
  createEmployeeDocumentUpload,
  getEmployeeDocumentUploadById,
  updateEmployeeDocumentUpload,
} from "../../../../services/employeeDocumentService";
import { getDocumentsWithVersions } from "../../../../services/documentService";
import { getFieldError } from "../../../../utils/errorUtils";
import {
  buildDocumentOption,
  buildVersionOption,
  findDocumentOptionByVersionId,
  mapDocumentsWithVersionsToOptions,
  type DocumentWithVersionOption,
} from "../../../../utils/documentWithVersionUtils";
import EmployeeDocumentAttachmentList from "./EmployeeDocumentAttachmentList";

interface DocumentFile {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
  has_file?: boolean | null;
  links?: {
    view?: string;
    download?: string;
  };
}

interface Option {
  id: string | number;
  label: string;
}

type FormDocument = File | DocumentFile;

interface FormState {
  employee_id: Option | null;
  document: Option | null;
  document_id: string;
  document_version_id: string;
  emission_date: string;
  due_date: string;
  documents: FormDocument[];
  status: string;
  upload_id: string;
}

type SelectedAttachment = {
  fileId: number;
  fileName: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

const STATUS_OPTIONS = ["pendente", "enviado", "aprovado", "rejeitado"].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function getSingleVersionId(document: DocumentWithVersionOption | null): string {
  if (!document || document.versions.length !== 1) {
    return "";
  }

  return String(document.versions[0].id);
}

function getNextVersionId(document: DocumentWithVersionOption | null): string {
  if (document?.selectedVersionId) {
    return String(document.selectedVersionId);
  }

  return getSingleVersionId(document);
}

export default function EmployeeDocumentUploadFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    employee_id: null,
    document: null,
    document_id: "",
    document_version_id: "",
    emission_date: "",
    due_date: "",
    documents: [],
    status: "pendente",
    upload_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);
  const [initialDocumentOptions, setInitialDocumentOptions] = useState<
    DocumentWithVersionOption[]
  >([]);
  const [documentOptions, setDocumentOptions] = useState<DocumentWithVersionOption[]>([]);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [, setIsLoading] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);

  const isDocumentFile = (item: FormDocument): item is DocumentFile =>
    !(item instanceof File) && typeof item === "object" && "id" in item;

  const isFile = (item: FormDocument): item is File => item instanceof File;

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      setIsInitializing(true);

      try {
        const [employeesResponse, documentsResponse, data] = await Promise.all([
          getEmployees({ page: 1, perPage: 100 }),
          getDocumentsWithVersions({
            page: 1,
            perPage: 25,
            search: "",
            sortBy: "name",
            sortOrder: "asc",
          }),
          isEdit && id ? getEmployeeDocumentUploadById(id) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        const nextDocumentOptions = mapDocumentsWithVersionsToOptions(documentsResponse.data);

        setEmployeeOptions(
          employeesResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );
        setInitialDocumentOptions(nextDocumentOptions);
        setDocumentOptions(nextDocumentOptions);

        if (!data) {
          return;
        }

        const selectedVersionId = data.document_version_id
          ? String(data.document_version_id)
          : data.document_version?.id
            ? String(data.document_version.id)
            : "";
        const matchedDocument =
          nextDocumentOptions.find(
            (option) => String(option.id) === String(data.document_id ?? "")
          ) ?? findDocumentOptionByVersionId(nextDocumentOptions, selectedVersionId);
        const selectedDocument = matchedDocument ?? buildDocumentOption(data.document);
        const selectedVersion =
          matchedDocument?.versions.find(
            (version) => String(version.id) === selectedVersionId
          ) ?? buildVersionOption(data.document_version);

        setForm({
          employee_id: data.employee
            ? { id: data.employee.id, label: data.employee.name }
            : null,
          document: selectedDocument,
          document_id: selectedDocument?.id
            ? String(selectedDocument.id)
            : data.document_id
              ? String(data.document_id)
              : "",
          document_version_id:
            selectedVersion?.id
              ? String(selectedVersion.id)
              : getSingleVersionId(matchedDocument),
          emission_date: data.emission_date ?? "",
          due_date: data.due_date ?? "",
          documents: data.upload
            ? [
                {
                  id: data.upload.id,
                  nome_arquivo: data.upload.nome_arquivo,
                  url_arquivo: data.upload.url_arquivo,
                  has_file: data.upload.has_file,
                  links: {
                    view: data.upload.links?.view ?? undefined,
                    download: data.upload.links?.download ?? undefined,
                  },
                },
              ]
            : [],
          status: data.status ?? "pendente",
          upload_id: data.upload_id ? String(data.upload_id) : "",
        });
      } catch {
        setInitialDocumentOptions([]);
        setDocumentOptions([]);
        setToast({ open: true, message: "Erro ao carregar registro.", type: "error" });

        if (isEdit) {
          navigate("/backoffice/colaboradores/documentos");
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    const trimmedQuery = documentSearchQuery.trim();
    if (!trimmedQuery) {
      setDocumentOptions(initialDocumentOptions);
      return;
    }

    let active = true;

    const timer = window.setTimeout(() => {
      getDocumentsWithVersions({
        page: 1,
        perPage: 25,
        search: trimmedQuery,
        sortBy: "name",
        sortOrder: "asc",
      })
        .then((response) => {
          if (!active) {
            return;
          }

          setDocumentOptions(mapDocumentsWithVersionsToOptions(response.data, trimmedQuery));
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setDocumentOptions([]);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [documentSearchQuery, initialDocumentOptions, isInitializing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (document: Option | null) => {
    const matchedDocument =
      documentOptions.find((option) => String(option.id) === String(document?.id ?? "")) ?? null;

    setForm((prev) => ({
      ...prev,
      document: matchedDocument
        ? {
            id: matchedDocument.id,
            label: matchedDocument.label,
          }
        : document,
      document_id: document ? String(document.id) : "",
      document_version_id: getNextVersionId(matchedDocument),
    }));
  };

  const handleRemoveFile = (index: number, type: "persisted" | "pending") => {
    if (type === "persisted") {
      const persistedDocs = form.documents.filter(isDocumentFile);
      const docToRemove = persistedDocs[index];

      if (docToRemove) {
        setForm((prev) => ({
          ...prev,
          documents: prev.documents.filter((item) =>
            isDocumentFile(item) ? item.id !== docToRemove.id : true
          ),
          upload_id: prev.upload_id === String(docToRemove.id) ? "" : prev.upload_id,
        }));
      }

      return;
    }

    const pendingFiles = form.documents.filter(isFile);
    const fileToRemove = pendingFiles[index];

    if (!fileToRemove) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((item) => item !== fileToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData();

    if (form.employee_id?.id) {
      formData.append("employee_id", String(form.employee_id.id));
    }

    formData.append("document_id", form.document_id);
    formData.append("document_version_id", form.document_version_id);
    formData.append("emission_date", form.emission_date);
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
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { errors?: Record<string, string> } };
      };

      setErrors(error.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar registro.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const persisted = form.documents.filter(isDocumentFile);
  const pending = form.documents.filter(isFile);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Documentos do Colaborador", to: "/backoffice/colaboradores/documentos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      {isInitializing ? (
        <FormPageSkeleton className="px-0" fields={7} />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        >
          <EmployeeAutocompleteField
            value={form.employee_id}
            onChange={(value: Option | null) =>
              setForm((prev) => ({ ...prev, employee_id: value }))
            }
            error={errors.employee_id}
            required
            initialOptions={employeeOptions}
          />

          <DocumentWithVersionField
            document={form.document}
            onDocumentChange={handleDocumentChange}
            versionId={form.document_version_id}
            onVersionChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm((prev) => ({ ...prev, document_version_id: e.target.value }))
            }
            onInputChange={setDocumentSearchQuery}
            documentError={getFieldError(errors, "document_id", "document")}
            versionError={getFieldError(errors, "document_version_id")}
            documentRequired
            initialOptions={documentOptions}
          />

          <FormDatePickerField
            name="emission_date"
            label="Data de Emissao"
            value={form.emission_date}
            onChange={handleChange}
            error={getFieldError(errors, "emission_date")}
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
            options={STATUS_OPTIONS}
            error={errors.status}
          />

          <FileUpload
            label="Anexo unico (JPG, PNG ou PDF ate 50MB)"
            files={form.documents.slice(0, 1) as UploadFile[]}
            setFiles={(files: UploadFile[]) =>
              setForm((prev) => ({
                ...prev,
                documents: files.slice(0, 1) as FormDocument[],
                upload_id: files.some((file) => file instanceof File) ? "" : prev.upload_id,
              }))
            }
            maxSizeMB={50}
            multiple={false}
            showToast={(message: string, type: "success" | "error" = "success") =>
              setToast({ open: true, message, type })
            }
            error={getFieldError(errors, "upload", "documents")}
          />

          <EmployeeDocumentAttachmentList
            persisted={persisted}
            pending={pending}
            onRemove={handleRemoveFile}
            onViewAttachment={(attachment) =>
              setSelectedAttachment({
                fileId: Number(attachment.id),
                fileName: attachment.nome_arquivo,
                viewUrl: attachment.links?.view ?? attachment.url_arquivo ?? null,
                downloadUrl: attachment.links?.download ?? null,
              })
            }
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

      <Transition appear show={selectedAttachment !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedAttachment(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Dialog.Title className="sr-only">
                    {selectedAttachment?.fileName ?? "Visualizar arquivo"}
                  </Dialog.Title>

                  {selectedAttachment ? (
                    <FileViewer
                      embedded
                      fileId={selectedAttachment.fileId}
                      fileName={selectedAttachment.fileName}
                      viewUrl={selectedAttachment.viewUrl}
                      downloadUrl={selectedAttachment.downloadUrl}
                      onClose={() => setSelectedAttachment(null)}
                    />
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
