// src/pages/backoffice/colaboradores/employee/EmployeeForm.tsx
import { useEffect, useState } from "react";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import Spinner from "../../../../components/Layout/ui/Spinner";
import { FormActions } from "../../../../components/form/FormActions";
import { FormInput } from "../../../../components/form/FormInput";
import CustomAssignmentsTable, {
  type CustomAssignment,
} from "../../../../components/form/CustomAssignmentsTable";
import FileUpload, {
  type UploadFile as FileUploadItem,
} from "../../../../components/form/FileUpload";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import FormSelectField from "../../../../components/form/FormSelectField";
import EmployeeDocumentAttachmentList from "../employeedocuments/EmployeeDocumentAttachmentList";
import { getDocuments } from "../../../../services/documentService";
import {
  createEmployee,
  getEmployeeById,
  updateEmployee,
  type Employee,
  type EmployeeDetailsResponse,
  type EmployeeDocument,
  type EmployeeDocumentUpload,
} from "../../../../services/employeeService";
import {
  getFieldError,
  type FieldErrors,
} from "../../../../utils/errorUtils";

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

const DOCUMENT_STATUS_OPTIONS = [
  "pendente",
  "enviado",
  "aprovado",
  "rejeitado",
  "valido",
  "vencido",
  "invalido",
];

const EMPLOYEE_PHOTO_PLACEHOLDER = "/images/placeholderfoto.jpg";

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

type EmployeeFormTab = "details" | "assignments" | "documents";

type Option = {
  id: string | number;
  label: string;
};

type PersistedAttachment = Extract<
  FileUploadItem,
  { id: number; nome_arquivo: string; url_arquivo: string }
>;

type EmployeeDocumentFormItem = {
  localId: string;
  id?: string | number;
  document: Option | null;
  issued_at: string;
  expires_at: string;
  status: string;
  upload: EmployeeDocumentUpload | null;
  files: FileUploadItem[];
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
  documents: EmployeeDocumentFormItem[];
  photoFile: File | null;
  existingPhotoUrl: string;
  photoMarkedForRemoval: boolean;
  documentsDownloadUrl: string;
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
  documents: [],
  photoFile: null,
  existingPhotoUrl: "",
  photoMarkedForRemoval: false,
  documentsDownloadUrl: "",
};

function createLocalId(): string {
  return `employee-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function capitalizeLabel(value: string): string {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isPendingFile(file: FileUploadItem): file is File {
  return file instanceof File;
}

function isPersistedAttachment(file: FileUploadItem): file is PersistedAttachment {
  return !(file instanceof File);
}

function createEmptyDocument(): EmployeeDocumentFormItem {
  return {
    localId: createLocalId(),
    document: null,
    issued_at: "",
    expires_at: "",
    status: "",
    upload: null,
    files: [],
  };
}

function removeFileFromDocument(
  document: EmployeeDocumentFormItem,
  index: number,
  type: "persisted" | "pending"
): EmployeeDocumentFormItem {
  const filtered =
    type === "persisted"
      ? document.files.filter((file) => {
          if (!isPersistedAttachment(file)) {
            return true;
          }

          const persistedIndex = document.files
            .filter(isPersistedAttachment)
            .findIndex((item) => item.id === file.id);

          return persistedIndex !== index;
        })
      : document.files.filter((file) => {
          if (!isPendingFile(file)) {
            return true;
          }

          const pendingIndex = document.files
            .filter(isPendingFile)
            .findIndex((item) => item === file);

          return pendingIndex !== index;
        });

  return {
    ...document,
    files: filtered,
    upload: type === "persisted" ? null : document.upload,
  };
}

function mapEmployeeToBaseForm(employee: Employee): Pick<
  EmployeeFormState,
  | "name"
  | "cpf"
  | "rg"
  | "rg_issuer"
  | "birth_date"
  | "driver_license_type"
  | "first_license_date"
  | "assignments"
> {
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
        assignment.company?.name ??
        assignment.company_sector?.company?.name ??
        `Empresa #${assignment.company_sector_id}`,
      sector_name:
        assignment.sector?.name ??
        assignment.company_sector?.sector?.name ??
        `Setor #${assignment.company_sector_id}`,
      job_title_id: assignment.job_title_id,
      job_title_name:
        assignment.job_title?.name ?? `Cargo #${assignment.job_title_id}`,
      status: assignment.status ?? "ativo",
      start_date: toDateInputValue(assignment.start_date),
      end_date: toDateInputValue(assignment.end_date),
    })),
  };
}

function mapEmployeeDocumentToForm(document: EmployeeDocument): EmployeeDocumentFormItem {
  const documentLabel = document.document
    ? [document.document.code, document.document.name].filter(Boolean).join(" - ")
    : `Documento #${document.id}`;

  const files: FileUploadItem[] = document.upload
    ? [
        {
          id: Number(document.upload.id),
          nome_arquivo: document.upload.file_name,
          url_arquivo:
            document.upload.links?.view ??
            document.upload.links?.download ??
            "",
          file_path: document.upload.file_path,
          links: document.upload.links,
        },
      ]
    : [];

  return {
    localId: createLocalId(),
    id: document.id,
    document: document.document
      ? {
          id: document.document.id,
          label: documentLabel,
        }
      : null,
    issued_at: toDateInputValue(document.issued_at),
    expires_at: toDateInputValue(document.expires_at),
    status: document.status ?? "",
    upload: document.upload ?? null,
    files,
  };
}

function mapResponseToForm(response: EmployeeDetailsResponse): EmployeeFormState {
  const employee = response.employee;
  const documents =
    employee.documents && employee.documents.length > 0
      ? employee.documents
      : response.documents ?? [];

  return {
    ...mapEmployeeToBaseForm(employee),
    documents: documents.map(mapEmployeeDocumentToForm),
    photoFile: null,
    existingPhotoUrl: employee.photo_path ? employee.photo_url ?? "" : "",
    photoMarkedForRemoval: false,
    documentsDownloadUrl:
      response.documents_download_url ??
      employee.documents_download_url ??
      "",
  };
}

function validateAssignments(assignments: CustomAssignment[]): string | null {
  for (const assignment of assignments) {
    const startDate = toDateInputValue(assignment.start_date);
    const endDate = toDateInputValue(assignment.end_date);

    if (endDate && endDate < startDate) {
      return `Data de fim (${endDate}) não pode ser anterior à data de início (${startDate}).`;
    }
  }

  return null;
}

function getApiErrors(error: unknown): FieldErrors {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return {};
  }

  const response = (error as { response?: { data?: { errors?: FieldErrors } } })
    .response;

  return response?.data?.errors ?? {};
}

function buildEmployeeFormData(form: EmployeeFormState): FormData {
  const formData = new FormData();
  const appendValue = (
    key: string,
    value: string | number | boolean | null | undefined
  ) => {
    formData.append(key, value == null ? "" : String(value));
  };

  appendValue("name", form.name);
  appendValue("cpf", form.cpf);
  appendValue("rg", form.rg);
  appendValue("rg_issuer", form.rg_issuer);
  appendValue("birth_date", toDateInputValue(form.birth_date));
  appendValue("driver_license_type", form.driver_license_type);
  appendValue("first_license_date", toDateInputValue(form.first_license_date));

  if (form.photoFile) {
    formData.append("photo", form.photoFile);
  }

  if (form.photoMarkedForRemoval) {
    appendValue("remove_photo", "1");
  }

  form.assignments.forEach((assignment, index) => {
    appendValue(
      `assignments[${index}][company_sector_id]`,
      assignment.company_sector_id
    );
    appendValue(`assignments[${index}][job_title_id]`, assignment.job_title_id);
    appendValue(`assignments[${index}][status]`, assignment.status);
    appendValue(
      `assignments[${index}][start_date]`,
      toDateInputValue(assignment.start_date)
    );
    appendValue(
      `assignments[${index}][end_date]`,
      toDateInputValue(assignment.end_date)
    );
  });

  const documentsToSubmit = form.documents.filter(
    (document) =>
      Boolean(document.document?.id) && document.files.some(isPendingFile)
  );

  documentsToSubmit.forEach((document, index) => {
    appendValue(`documents[${index}][document_id]`, document.document?.id);
    appendValue(`documents[${index}][issued_at]`, toDateInputValue(document.issued_at));
    appendValue(
      `documents[${index}][expires_at]`,
      toDateInputValue(document.expires_at)
    );
    appendValue(`documents[${index}][status]`, document.status);

    const pendingFile = document.files.find(isPendingFile);
    if (pendingFile) {
      formData.append(`documents[${index}][upload]`, pendingFile);
    }
  });

  return formData;
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
  const [documentOptions, setDocumentOptions] = useState<Option[]>([]);
  const [isLoadingDocumentOptions, setIsLoadingDocumentOptions] = useState(false);
  const [activeDocumentLocalId, setActiveDocumentLocalId] = useState<string | null>(
    null
  );
  const [draftDocument, setDraftDocument] = useState<EmployeeDocumentFormItem | null>(
    null
  );
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<EmployeeFormTab>("details");

  useEffect(() => {
    if (!isEdit || !id) {
      setForm(INITIAL_FORM_STATE);
      setActiveDocumentLocalId(null);
      setDraftDocument(null);
      setPhotoLoadFailed(false);
      return;
    }

    setIsLoading(true);

    getEmployeeById(id)
      .then((response) => {
        setForm(mapResponseToForm(response));
        setActiveDocumentLocalId(null);
        setDraftDocument(null);
        setPhotoLoadFailed(false);
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

  useEffect(() => {
    let mounted = true;

    setIsLoadingDocumentOptions(true);

    getDocuments({ page: 1, perPage: 100, sortBy: "name", sortOrder: "asc" })
      .then((response) => {
        if (!mounted) {
          return;
        }

        const nextOptions = response.data
          .filter((document) => document.category === "employee")
          .map((document) => ({
            id: document.id,
            label: [document.code, document.name].filter(Boolean).join(" - "),
          }));

        setDocumentOptions(nextOptions);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setDocumentOptions([]);
        setToast({
          open: true,
          message: "Erro ao carregar documentos disponiveis.",
          type: "error",
        });
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setIsLoadingDocumentOptions(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (form.photoFile) {
      const objectUrl = URL.createObjectURL(form.photoFile);
      setPhotoLoadFailed(false);
      setPhotoPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (!form.photoMarkedForRemoval && form.existingPhotoUrl && !photoLoadFailed) {
      setPhotoPreviewUrl(form.existingPhotoUrl);
      return;
    }

    setPhotoPreviewUrl("");
  }, [
    form.existingPhotoUrl,
    form.photoFile,
    form.photoMarkedForRemoval,
    photoLoadFailed,
  ]);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null;
    setPhotoLoadFailed(false);
    setForm((prev) => ({
      ...prev,
      photoFile: nextFile,
      photoMarkedForRemoval: false,
    }));
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setPhotoLoadFailed(false);
    setForm((prev) => ({
      ...prev,
      photoFile: null,
      existingPhotoUrl: "",
      photoMarkedForRemoval: true,
    }));
  };

  const handleAddDocument = () => {
    setActiveDocumentLocalId(null);
    setDraftDocument((current) => current ?? createEmptyDocument());
  };

  const handleDocumentPatch = (
    localId: string,
    patch: Partial<EmployeeDocumentFormItem>
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((document) =>
        document.localId === localId ? { ...document, ...patch } : document
      ),
    }));
  };

  const handleDraftDocumentPatch = (patch: Partial<EmployeeDocumentFormItem>) => {
    setDraftDocument((current) => (current ? { ...current, ...patch } : current));
  };

  const handleRemoveDocument = (localId: string) => {
    setForm((prev) => {
      const document = prev.documents.find((item) => item.localId === localId);
      if (document?.localId === activeDocumentLocalId) {
        setActiveDocumentLocalId(null);
      }

      return {
        ...prev,
        documents: prev.documents.filter((item) => item.localId !== localId),
      };
    });
  };

  const handleDocumentFilesChange = (localId: string, files: FileUploadItem[]) => {
    handleDocumentPatch(localId, {
      files: files.slice(0, 1),
      upload: null,
    });
  };

  const handleDraftDocumentFilesChange = (files: FileUploadItem[]) => {
    handleDraftDocumentPatch({
      files: files.slice(0, 1),
      upload: null,
    });
  };

  const handleDocumentFileRemove = (
    localId: string,
    index: number,
    type: "persisted" | "pending"
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((document) => {
        if (document.localId !== localId) {
          return document;
        }

        return removeFileFromDocument(document, index, type);
      }),
    }));
  };

  const handleDraftDocumentFileRemove = (
    index: number,
    type: "persisted" | "pending"
  ) => {
    setDraftDocument((current) =>
      current ? removeFileFromDocument(current, index, type) : current
    );
  };

  const handleSaveDraftDocument = () => {
    if (!draftDocument) {
      return;
    }

    if (!draftDocument.document?.id) {
      setToast({
        open: true,
        message: "Selecione um documento antes de adicionar.",
        type: "error",
      });
      return;
    }

    if (draftDocument.files.length === 0) {
      setToast({
        open: true,
        message: "Anexe um arquivo antes de adicionar o documento.",
        type: "error",
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, draftDocument],
    }));
    setDraftDocument(null);
  };

  const handleCloseDocumentEditor = () => {
    setActiveDocumentLocalId(null);
    setDraftDocument(null);
  };

  const getDocumentFieldError = (index: number, ...keys: string[]) =>
    getFieldError(
      errors,
      ...keys.flatMap((key) => [
        `documents.${index}.${key}`,
        `documents[${index}].${key}`,
      ])
    );

  const activeDocumentIndex = form.documents.findIndex(
    (document) => document.localId === activeDocumentLocalId
  );
  const activeDocument =
    activeDocumentIndex >= 0 ? form.documents[activeDocumentIndex] : null;
  const editingDocument = draftDocument ?? activeDocument;
  const editingDocumentIndex = draftDocument ? null : activeDocumentIndex;
  const isCreatingDocument = Boolean(draftDocument);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const assignmentValidationError = validateAssignments(form.assignments);
    if (assignmentValidationError) {
      setActiveTab("assignments");
      setToast({ open: true, message: assignmentValidationError, type: "error" });
      setIsLoading(false);
      return;
    }

    const payload = buildEmployeeFormData(form);

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
      const backendErrors = getApiErrors(error);
      setErrors(backendErrors);

      const errorKeys = Object.keys(backendErrors);
      const hasAssignmentErrors = errorKeys.some(
        (key) =>
          key === "assignments" ||
          key.startsWith("assignments.") ||
          key.startsWith("assignments[")
      );
      const hasDocumentErrors = errorKeys.some(
        (key) =>
          key === "documents" ||
          key.startsWith("documents.") ||
          key.startsWith("documents[")
      );

      if (hasAssignmentErrors) {
        setActiveTab("assignments");
      } else if (hasDocumentErrors) {
        setActiveTab("documents");
        const firstDocumentErrorKey = errorKeys.find(
          (key) => key.startsWith("documents.") || key.startsWith("documents[")
        );
        const match = firstDocumentErrorKey?.match(/documents(?:\.|\[)(\d+)/);
        if (match) {
          const documentIndex = Number(match[1]);
          const documentWithError = form.documents[documentIndex];
          if (documentWithError) {
            setActiveDocumentLocalId(documentWithError.localId);
          }
        }
      } else {
        setActiveTab("details");
      }

      setToast({
        open: true,
        message: "Erro ao salvar colaborador.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const photoButtonLabel = photoPreviewUrl ? "Trocar foto" : "Selecionar foto";

  return (
    <div className="max-w-6xl mx-auto p-6">
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
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "details"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Dados
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assignments")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "assignments"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Lotacao
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "documents"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Documentos
              </button>
            </nav>
          </div>

          {activeTab === "details" ? (
            <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dados do colaborador
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dados cadastrais e foto do colaborador.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="aspect-square overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt="Foto do colaborador"
                      className="h-full w-full object-cover"
                      onError={() => {
                        if (!form.photoFile) {
                          setPhotoLoadFailed(true);
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={EMPLOYEE_PHOTO_PLACEHOLDER}
                      alt="Placeholder da foto do colaborador"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    {photoButtonLabel}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>

                  {(photoPreviewUrl || form.photoFile || form.existingPhotoUrl) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remover foto
                    </button>
                  )}
                </div>

                {getFieldError(errors, "photo", "photo_file") && (
                  <p className="text-sm text-red-600">
                    {getFieldError(errors, "photo", "photo_file")}
                  </p>
                )}
              </div>

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
            </div>
            </section>
          ) : null}

          {activeTab === "assignments" ? (
            <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lotações
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Empresas, setores, cargos e período de atuação.
              </p>
            </div>

            <CustomAssignmentsTable
              value={form.assignments}
              onChange={handleAssignmentsChange}
              error={errors.assignments}
            />
            </section>
          ) : null}

          {activeTab === "documents" ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Documentos do colaborador
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cadastre e atualize os documentos diretamente no colaborador.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.documentsDownloadUrl && (
                    <a
                      href={form.documentsDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Download size={16} />
                      Baixar documentos
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Adicionar documento
                  </button>
                </div>
              </div>

              {getFieldError(errors, "documents") && (
                <p className="text-sm text-red-600">
                  {getFieldError(errors, "documents")}
                </p>
              )}

              <div className="flex flex-col gap-4">
                {editingDocument ? (() => {
                const visibleDocumentOptions =
                  editingDocument.document &&
                  !documentOptions.some(
                    (option) => String(option.id) === String(editingDocument.document?.id)
                  )
                    ? [editingDocument.document, ...documentOptions]
                    : documentOptions;
                const statusOptions = Array.from(
                  new Set(
                    [...DOCUMENT_STATUS_OPTIONS, editingDocument.status].filter(Boolean)
                  )
                ).map((value) => ({
                  value,
                  label: capitalizeLabel(value),
                }));
                const persistedFiles = editingDocument.files.filter(isPersistedAttachment);
                const pendingFiles = editingDocument.files.filter(isPendingFile);
                const getEditingDocumentError = (...keys: string[]) =>
                  editingDocumentIndex !== null && editingDocumentIndex >= 0
                    ? getDocumentFieldError(editingDocumentIndex, ...keys)
                    : undefined;

                return (
                  <div className="order-1 rounded-xl border border-gray-200 p-5 dark:border-gray-700">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {isCreatingDocument ? "Adicionar documento" : "Editar documento"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Preencha os dados do documento sem precisar rolar horizontalmente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCloseDocumentEditor}
                        className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {isCreatingDocument ? "Cancelar" : "Fechar edicao"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <FormSelectField
                        name={
                          editingDocumentIndex !== null && editingDocumentIndex >= 0
                            ? `documents.${editingDocumentIndex}.document_id`
                            : "documents.draft.document_id"
                        }
                        label="Documento"
                        value={editingDocument.document?.id ?? ""}
                        onChange={(e) => {
                          const selected =
                            visibleDocumentOptions.find(
                              (option) => String(option.id) === e.target.value
                            ) ?? null;

                          if (isCreatingDocument) {
                            handleDraftDocumentPatch({ document: selected });
                            return;
                          }

                          handleDocumentPatch(editingDocument.localId, {
                            document: selected,
                          });
                        }}
                        options={visibleDocumentOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
                        }))}
                        error={getEditingDocumentError("document_id")}
                        disabled={
                          isLoadingDocumentOptions &&
                          visibleDocumentOptions.length === 0
                        }
                      />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormDatePickerField
                          name={
                            editingDocumentIndex !== null && editingDocumentIndex >= 0
                              ? `documents.${editingDocumentIndex}.issued_at`
                              : "documents.draft.issued_at"
                          }
                          label="Data de Emissao"
                          value={editingDocument.issued_at}
                          onChange={(e) => {
                            if (isCreatingDocument) {
                              handleDraftDocumentPatch({ issued_at: e.target.value });
                              return;
                            }

                            handleDocumentPatch(editingDocument.localId, {
                              issued_at: e.target.value,
                            });
                          }}
                          error={getEditingDocumentError("issued_at")}
                        />
                        <FormDatePickerField
                          name={
                            editingDocumentIndex !== null && editingDocumentIndex >= 0
                              ? `documents.${editingDocumentIndex}.expires_at`
                              : "documents.draft.expires_at"
                          }
                          label="Data de Vencimento"
                          value={editingDocument.expires_at}
                          onChange={(e) => {
                            if (isCreatingDocument) {
                              handleDraftDocumentPatch({ expires_at: e.target.value });
                              return;
                            }

                            handleDocumentPatch(editingDocument.localId, {
                              expires_at: e.target.value,
                            });
                          }}
                          error={getEditingDocumentError("expires_at")}
                        />
                        <FormSelectField
                          name={
                            editingDocumentIndex !== null && editingDocumentIndex >= 0
                              ? `documents.${editingDocumentIndex}.status`
                              : "documents.draft.status"
                          }
                          label="Status"
                          value={editingDocument.status}
                          onChange={(e) => {
                            if (isCreatingDocument) {
                              handleDraftDocumentPatch({ status: e.target.value });
                              return;
                            }

                            handleDocumentPatch(editingDocument.localId, {
                              status: e.target.value,
                            });
                          }}
                          options={statusOptions}
                          error={getEditingDocumentError("status")}
                        />
                      </div>

                      <FileUpload
                        label="Anexo unico (JPG, PNG ou PDF ate 50MB)"
                        files={editingDocument.files.slice(0, 1)}
                        setFiles={(files) => {
                          if (isCreatingDocument) {
                            handleDraftDocumentFilesChange(files);
                            return;
                          }

                          handleDocumentFilesChange(editingDocument.localId, files);
                        }}
                        maxSizeMB={50}
                        multiple={false}
                        showToast={(message, type = "success") =>
                          setToast({ open: true, message, type })
                        }
                        error={getEditingDocumentError("upload", "file")}
                      />

                      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <EmployeeDocumentAttachmentList
                          employeeId={id}
                          persisted={persistedFiles}
                          pending={pendingFiles}
                          onRemove={(fileIndex, type) => {
                            if (isCreatingDocument) {
                              handleDraftDocumentFileRemove(fileIndex, type);
                              return;
                            }

                            handleDocumentFileRemove(
                              editingDocument.localId,
                              fileIndex,
                              type
                            );
                          }}
                        />
                      </div>

                      {isCreatingDocument && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCloseDocumentEditor}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveDraftDocument}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Adicionar documento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : null}

                <div className="order-2 w-full overflow-x-auto rounded-lg bg-white px-2 shadow-sm sm:px-0 dark:bg-gray-900">
                  <table className="w-full text-left text-sm text-gray-500 rtl:text-right sm:text-base dark:text-gray-400">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-2 font-medium tracking-wider sm:px-6 sm:py-3">
                          Documento
                        </th>
                        <th className="px-4 py-2 font-medium tracking-wider sm:px-6 sm:py-3">
                          Emissao
                        </th>
                        <th className="px-4 py-2 font-medium tracking-wider sm:px-6 sm:py-3">
                          Vencimento
                        </th>
                        <th className="px-4 py-2 font-medium tracking-wider sm:px-6 sm:py-3">
                          Status
                        </th>
                        <th className="px-4 py-2 font-medium tracking-wider sm:px-6 sm:py-3">
                          Anexos
                        </th>
                        <th className="px-4 py-2 text-right font-medium tracking-wider sm:px-6 sm:py-3">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.documents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
                          >
                            Nenhum documento adicionado.
                          </td>
                        </tr>
                      ) : (
                        form.documents.map((document, index) => {
                          const persistedFiles = document.files.filter(isPersistedAttachment);
                          const pendingFiles = document.files.filter(isPendingFile);
                          const attachmentCount = persistedFiles.length + pendingFiles.length;
                          const isEditingDocument = document.localId === activeDocumentLocalId;

                          return (
                            <tr
                              key={document.localId}
                              className={
                                isEditingDocument
                                  ? "bg-blue-50 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                                  : "odd:bg-white even:bg-gray-50 transition hover:bg-gray-100 odd:dark:bg-gray-900 even:dark:bg-gray-800 dark:hover:bg-gray-700"
                              }
                            >
                              <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                                <div className="flex items-center gap-2">
                                  <span>{document.document?.label || "Documento nao informado"}</span>
                                  {isEditingDocument && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                      Em edicao
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                                {document.issued_at || "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                                {document.expires_at || "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                                {document.status ? capitalizeLabel(document.status) : "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                                {attachmentCount > 0 ? `${attachmentCount} anexo(s)` : "Sem anexo"}
                              </td>
                              <td className="px-4 py-2 text-right text-sm sm:px-6 sm:py-4">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDraftDocument(null);
                                      setActiveDocumentLocalId(document.localId);
                                    }}
                                    aria-label={`Editar documento ${index + 1}`}
                                    title="Editar"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDocument(document.localId)}
                                    aria-label={`Remover documento ${index + 1}`}
                                    title="Remover"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}

          <div className="pt-2">
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
