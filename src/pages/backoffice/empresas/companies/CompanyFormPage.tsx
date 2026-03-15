import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import CompanyDocumentAttachmentList from "../companydocumentupload/CompanyDocumentAttachmentList";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import CompanyGroupAutocompleteField from "../../../../components/form/CompanyGroupAutocompleteField";
import CompanyTypeAutocompleteField from "../../../../components/form/CompanyTypeAutocompleteField";
import SectorFormWithTable from "../../../../components/form/SectorFormWithTable";
import DocumentWithVersionField from "../../../../components/form/DocumentWithVersionField";
import FileUpload, {
  type UploadFile as FileUploadItem,
} from "../../../../components/form/FileUpload";

// Importa apenas os tipos com "type"
import type {
  CompanyDocumentItem,
  CompanyResponse,
  CompanyUploadRef,
} from "../../../../services/companyService";
import {
  getCompanyById,
  createCompany,
  updateCompany,
} from "../../../../services/companyService";
import { getCompanyGroups } from "../../../../services/companyGroupService";
import { getCompanyTypes } from "../../../../services/companyTypeService";
import { getSectors } from "../../../../services/sectorService";
import { getDocumentsWithVersions } from "../../../../services/documentService";
import { getFieldError, type FieldErrors } from "../../../../utils/errorUtils";
import {
  buildDocumentOption,
  mapDocumentsWithVersionsToOptions,
  type DocumentWithVersionOption,
} from "../../../../utils/documentWithVersionUtils";

interface AutocompleteOption {
  id: string | number;
  label: string;
}

type CompanyFormTab = "details" | "sectors" | "documents";

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error";
};

type CompanyDocumentFormItem = {
  localId: string;
  id?: string | number;
  document: AutocompleteOption | null;
  status: string;
  emission_date: string;
  due_date: string;
  upload: CompanyUploadRef | null;
  files: FileUploadItem[];
};

interface CompanyFormState {
  company_group_id: AutocompleteOption | null;
  company_type_id: AutocompleteOption | null;
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  responsible: string;
  email: string;
  sectors: AutocompleteOption[];
  logoFile: File | null;
  existingLogoUrl: string;
  documents: CompanyDocumentFormItem[];
}

const COMPANIES_ROUTE = "/backoffice/empresas";

const DOCUMENT_STATUS_OPTIONS = [
  "pendente",
  "enviado",
  "aprovado",
  "rejeitado",
].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO"
].map((uf) => ({ value: uf, label: uf }));

function createLocalId(): string {
  return `company-document-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function createEmptyDocument(): CompanyDocumentFormItem {
  return {
    localId: createLocalId(),
    document: null,
    status: "pendente",
    emission_date: "",
    due_date: "",
    upload: null,
    files: [],
  };
}

function isPendingFile(file: FileUploadItem): file is File {
  return file instanceof File;
}

function isPersistedAttachment(file: FileUploadItem): file is Extract<
  FileUploadItem,
  { id: number; nome_arquivo: string; url_arquivo: string }
> {
  return !(file instanceof File);
}

function isDocumentReadyToSubmit(document: CompanyDocumentFormItem): boolean {
  return Boolean(document.document?.id) && (
    document.files.some(isPendingFile) || Boolean(document.upload?.id)
  );
}

function removeFileFromDocument(
  document: CompanyDocumentFormItem,
  index: number,
  type: "persisted" | "pending"
): CompanyDocumentFormItem {
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

function mapCompanyDocumentToForm(
  document: CompanyDocumentItem
): CompanyDocumentFormItem {
  const fileName =
    document.upload?.file_name ??
    document.upload?.nome_arquivo ??
    `arquivo-${document.upload?.id ?? document.id}`;
  const fileUrl =
    document.upload?.links?.view ??
    document.upload?.links?.download ??
    document.upload?.url_arquivo ??
    document.upload?.file_path ??
    "";
  const files: FileUploadItem[] = document.upload
    ? [
        {
          id: Number(document.upload.id),
          nome_arquivo: fileName,
          url_arquivo: fileUrl,
          has_file: document.upload.has_file,
          file_path: document.upload.file_path,
          links: document.upload.links,
        },
      ]
    : [];

  return {
    localId: createLocalId(),
    id: document.id,
    document: buildDocumentOption(document.document),
    status: document.status ?? "pendente",
    emission_date: toDateInputValue(document.emission_date ?? document.issued_at),
    due_date: toDateInputValue(document.due_date ?? document.expires_at),
    upload: document.upload ?? null,
    files,
  };
}

export default function CompanyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<CompanyFormState>({
    company_group_id: null,
    company_type_id: null,
    name: "",
    cnpj: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    responsible: "",
    email: "",
    sectors: [],
    logoFile: null,
    existingLogoUrl: "",
    documents: [],
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "success",
  });
  const [groupOptions, setGroupOptions] = useState<AutocompleteOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<AutocompleteOption[]>([]);
  const [sectorOptions, setSectorOptions] = useState<AutocompleteOption[]>([]);
  const [allDocumentOptions, setAllDocumentOptions] = useState<
    DocumentWithVersionOption[]
  >([]);
  const [documentOptions, setDocumentOptions] = useState<
    DocumentWithVersionOption[]
  >([]);
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CompanyFormTab>("details");
  const [activeDocumentLocalId, setActiveDocumentLocalId] = useState<
    string | null
  >(null);
  const [draftDocument, setDraftDocument] =
    useState<CompanyDocumentFormItem | null>(null);

  useEffect(() => {
    let active = true;

    const loadDependencies = async () => {
      setIsLoading(true);

      try {
        const [
          groupsResponse,
          typesResponse,
          sectorsResponse,
          documentsResponse,
          companyData,
        ] = await Promise.all([
          getCompanyGroups({ page: 1, perPage: 100 }),
          getCompanyTypes({ page: 1, perPage: 100 }),
          getSectors({ page: 1, perPage: 100 }),
          getDocumentsWithVersions({
            page: 1,
            perPage: 100,
            search: "",
            sortBy: "name",
            sortOrder: "asc",
          }),
          isEdit && id ? getCompanyById(id) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        const mappedGroups = groupsResponse.data.map((group) => ({
          id: group.id,
          label: group.name,
        }));
        const mappedTypes = typesResponse.data.map((type) => ({
          id: type.id,
          label: type.name,
        }));
        const mappedSectors = sectorsResponse.data.map((sector) => ({
          id: sector.id,
          label: sector.name,
        }));
        const mappedDocuments = mapDocumentsWithVersionsToOptions(
          documentsResponse.data
        );

        setGroupOptions(mappedGroups);
        setTypeOptions(mappedTypes);
        setSectorOptions(mappedSectors);
        setAllDocumentOptions(mappedDocuments);
        setDocumentOptions(mappedDocuments);

        if (companyData) {
          const company = companyData as CompanyResponse;
          const selectedGroup = company.group
            ? { id: company.group.id, label: company.group.name }
            : mappedGroups.find(
                (group) =>
                  String(group.id) === String(company.company_group_id ?? "")
              ) ?? null;
          const selectedType = company.type
            ? { id: company.type.id, label: company.type.name }
            : mappedTypes.find(
                (type) =>
                  String(type.id) === String(company.company_type_id ?? "")
              ) ?? null;
          const mappedSectors =
            company.company_sectors && company.company_sectors.length > 0
              ? company.company_sectors.map((item) => ({
                  id: item.sector.id,
                  label: item.sector.name,
                }))
              : (company.sectors ?? []).map((sector) => ({
                  id: sector.id,
                  label: sector.name,
                }));

          setForm({
            name: company.name ?? "",
            cnpj: company.cnpj ?? "",
            phone: company.phone ?? "",
            address: company.address ?? "",
            city: company.city ?? "",
            state: company.state ?? "",
            responsible: company.responsible ?? "",
            email: company.email ?? "",
            company_group_id: selectedGroup,
            company_type_id: selectedType,
            sectors: mappedSectors,
            logoFile: null,
            existingLogoUrl: company.logo_url ?? "",
            documents: (company.documents ?? []).map(mapCompanyDocumentToForm),
          });
        }
      } catch (err) {
        console.error("Erro ao carregar formulario da empresa:", err);
        setToast({ open: true, message: "Erro ao carregar dados da empresa.", type: "error" });

        if (isEdit) {
          navigate(COMPANIES_ROUTE);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDependencies();

    return () => {
      active = false;
    };
  }, [id, isEdit, navigate]);

  useEffect(() => {
    const normalizedQuery = documentSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      setDocumentOptions(allDocumentOptions);
      return;
    }

    setDocumentOptions(
      allDocumentOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(normalizedQuery) ||
          option.versions.some((version) =>
            version.label.toLowerCase().includes(normalizedQuery)
          )
      )
    );
  }, [allDocumentOptions, documentSearchQuery]);

  const editingDocument = useMemo(() => {
    if (draftDocument) {
      return draftDocument;
    }

    return (
      form.documents.find(
        (document) => document.localId === activeDocumentLocalId
      ) ?? null
    );
  }, [activeDocumentLocalId, draftDocument, form.documents]);

  const editingDocumentIndex = draftDocument
    ? null
    : form.documents.findIndex(
        (document) => document.localId === activeDocumentLocalId
      );
  const persistedAttachments = editingDocument?.files.filter(
    isPersistedAttachment
  ) as Array<
    Extract<FileUploadItem, { id: number; nome_arquivo: string; url_arquivo: string }>
  >;
  const pendingAttachments =
    editingDocument?.files.filter(isPendingFile) ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name: 'company_group_id' | 'company_type_id', value: AutocompleteOption | null) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectorsChange = (value: AutocompleteOption[]) => {
    setForm((prev) => ({ ...prev, sectors: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, logoFile: nextFile }));
    e.target.value = "";
  };

  const handleAddDocument = () => {
    setActiveTab("documents");
    setActiveDocumentLocalId(null);
    setDraftDocument(createEmptyDocument());
  };

  const handleDocumentPatch = (
    localId: string,
    patch: Partial<CompanyDocumentFormItem>
  ) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((document) =>
        document.localId === localId ? { ...document, ...patch } : document
      ),
    }));
  };

  const handleDraftDocumentPatch = (
    patch: Partial<CompanyDocumentFormItem>
  ) => {
    setDraftDocument((current) => (current ? { ...current, ...patch } : current));
  };

  const handleEditDocument = (localId: string) => {
    setDraftDocument(null);
    setActiveDocumentLocalId(localId);
    setActiveTab("documents");
  };

  const handleRemoveDocument = (localId: string) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((document) => document.localId !== localId),
    }));

    if (activeDocumentLocalId === localId) {
      setActiveDocumentLocalId(null);
    }
  };

  const handleDocumentChange = (value: AutocompleteOption | null) => {
    if (!editingDocument) {
      return;
    }

    const patch = { document: value };

    if (draftDocument) {
      handleDraftDocumentPatch(patch);
      return;
    }

    handleDocumentPatch(editingDocument.localId, patch);
  };

  const handleDocumentFilesChange = (files: FileUploadItem[]) => {
    if (!editingDocument) {
      return;
    }

    const patch = {
      files: files.slice(0, 1),
      upload: null,
    };

    if (draftDocument) {
      handleDraftDocumentPatch(patch);
      return;
    }

    handleDocumentPatch(editingDocument.localId, patch);
  };

  const handleDocumentFileRemove = (
    index: number,
    type: "persisted" | "pending"
  ) => {
    if (!editingDocument) {
      return;
    }

    if (draftDocument) {
      setDraftDocument((current) =>
        current ? removeFileFromDocument(current, index, type) : current
      );
      return;
    }

    handleDocumentPatch(
      editingDocument.localId,
      removeFileFromDocument(editingDocument, index, type)
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
    setDraftDocument(null);
    setActiveDocumentLocalId(null);
  };

  const buildCompanyFormData = (
    documentsForSubmission: CompanyDocumentFormItem[]
  ): FormData => {
    const formData = new FormData();

    const appendValue = (
      key: string,
      value: string | number | boolean | null | undefined
    ) => {
      formData.append(key, value == null ? "" : String(value));
    };

    const appendValueIfFilled = (
      key: string,
      value: string | number | boolean | null | undefined
    ) => {
      if (value == null || value === "") {
        return;
      }

      formData.append(key, String(value));
    };

    appendValue("name", form.name);
    appendValue("cnpj", form.cnpj);
    appendValue("email", form.email);
    appendValue("responsible", form.responsible);
    appendValue("state", form.state);
    appendValue("company_group_id", form.company_group_id?.id);
    appendValue("company_type_id", form.company_type_id?.id);
    appendValueIfFilled("phone", form.phone);
    appendValueIfFilled("address", form.address);
    appendValueIfFilled("city", form.city);

    if (form.logoFile) {
      formData.append("logo", form.logoFile);
    }

    form.sectors.forEach((sector, index) => {
      appendValue(`company_sectors[${index}][sector_id]`, sector.id);
    });

    documentsForSubmission
      .filter(isDocumentReadyToSubmit)
      .forEach((document, index) => {
        appendValueIfFilled(`documents[${index}][id]`, document.id);
        appendValue(`documents[${index}][document_id]`, document.document?.id);
        appendValueIfFilled(`documents[${index}][status]`, document.status);
        appendValueIfFilled(
          `documents[${index}][emission_date]`,
          toDateInputValue(document.emission_date)
        );
        appendValueIfFilled(
          `documents[${index}][due_date]`,
          toDateInputValue(document.due_date)
        );

        const pendingFile = document.files.find(isPendingFile);
        if (pendingFile) {
          formData.append(`documents[${index}][upload]`, pendingFile);
          return;
        }

        appendValueIfFilled(`documents[${index}][upload_id]`, document.upload?.id);
      });

    return formData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const documentsForSubmission =
      draftDocument && isDocumentReadyToSubmit(draftDocument)
        ? [...form.documents, draftDocument]
        : form.documents;
    const payload = buildCompanyFormData(documentsForSubmission);

    try {
      if (isEdit && id) {
        await updateCompany(id, payload);
      } else {
        await createCompany(payload);
      }
      setToast({ open: true, message: `Empresa ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate(COMPANIES_ROUTE);
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { errors?: FieldErrors } } }).response;
      const backendErrors = response?.data?.errors ?? {};
      setErrors(backendErrors);

      const errorKeys = Object.keys(backendErrors);
      if (
        errorKeys.some(
          (key) =>
            key === "documents" ||
            key.startsWith("documents.") ||
            key.startsWith("documents[")
        )
      ) {
        setActiveTab("documents");
      } else if (
        errorKeys.some((key) => key === "company_sectors" || key.startsWith("company_sectors"))
      ) {
        setActiveTab("sectors");
      } else {
        setActiveTab("details");
      }

      setToast({ open: true, message: "Erro ao salvar empresa. Verifique os campos.", type: "error" });
    }
  };

  const getDocumentFieldError = (index: number, ...keys: string[]) =>
    getFieldError(
      errors,
      ...keys.flatMap((key) => [
        `documents.${index}.${key}`,
        `documents[${index}].${key}`,
        `documents[${index}][${key}]`,
      ])
    );

  const isCreatingDocument = Boolean(draftDocument);
  const getEditingDocumentError = (...keys: string[]) =>
    editingDocumentIndex !== null && editingDocumentIndex >= 0
      ? getDocumentFieldError(editingDocumentIndex, ...keys)
      : "";
  const tabButtonClass = (tab: CompanyFormTab) =>
    `rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
    }`;

  if (isLoading) {
    return <FormPageSkeleton fields={10} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Empresas", to: COMPANIES_ROUTE },
          { label: isEdit ? "Editar" : "Nova" },
        ]}
      />

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800"
      >
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={tabButtonClass("details")}
            >
              Dados
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sectors")}
              className={tabButtonClass("sectors")}
            >
              Setores
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("documents")}
              className={tabButtonClass("documents")}
            >
              Documentos
            </button>
          </nav>
        </div>

        {activeTab === "details" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dados da empresa
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cadastro principal, contato e identidade visual.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CompanyGroupAutocompleteField
            value={form.company_group_id}
            onChange={(v) => handleAutocompleteChange("company_group_id", v)}
            error={getFieldError(errors, "company_group_id")}
            required
            initialOptions={groupOptions}
          />
          <CompanyTypeAutocompleteField
            value={form.company_type_id}
            onChange={(v) => handleAutocompleteChange("company_type_id", v)}
            error={getFieldError(errors, "company_type_id")}
            required
            initialOptions={typeOptions}
          />
          <FormInput id="name" name="name" label="Nome da Empresa" value={form.name} onChange={handleChange} error={errors.name} required />
          <FormInput id="cnpj" name="cnpj" label="CNPJ" value={form.cnpj} onChange={handleChange} error={errors.cnpj} required />
          <FormInput id="phone" name="phone" label="Telefone" value={form.phone} onChange={handleChange} error={errors.phone} />
          <FormInput id="email" name="email" label="E-mail de Contato" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
          <FormInput id="responsible" name="responsible" label="Responsável" value={form.responsible} onChange={handleChange} error={errors.responsible} required />
          <FormInput id="address" name="address" label="Endereço" value={form.address} onChange={handleChange} error={errors.address} />
          <FormInput id="city" name="city" label="Cidade" value={form.city} onChange={handleChange} error={errors.city} />
          <FormSelectField
            name="state"
            label="Estado"
            value={form.state}
            onChange={handleChange}
            options={STATES}
            error={errors.state}
            required
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {form.logoFile ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Arquivo selecionado: {form.logoFile.name}
              </p>
            ) : form.existingLogoUrl ? (
              <a
                href={form.existingLogoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-blue-600 hover:underline"
              >
                Ver logo atual
              </a>
            ) : null}
          </div>
            </div>
          </section>
        ) : null}

        {activeTab === "sectors" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Setores vinculados
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Defina em quais setores a empresa atua.
              </p>
            </div>

            {getFieldError(errors, "company_sectors") ? (
              <p className="text-sm text-red-600">
                {getFieldError(errors, "company_sectors")}
              </p>
            ) : null}

            <SectorFormWithTable
              value={form.sectors}
              onChange={handleSectorsChange}
              error={errors.company_sectors}
              initialOptions={sectorOptions}
            />
          </section>
        ) : null}

        {activeTab === "documents" ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Documentos da empresa
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cadastre e atualize os documentos diretamente dentro da empresa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddDocument}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Adicionar documento
              </button>
            </div>

            {getFieldError(errors, "documents") ? (
              <p className="text-sm text-red-600">
                {getFieldError(errors, "documents")}
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              {editingDocument ? (
                <div className="order-1 rounded-xl border border-gray-200 p-5 dark:border-gray-700">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {isCreatingDocument ? "Adicionar documento" : "Editar documento"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        O documento fica no formulario e sera salvo junto com a empresa.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseDocumentEditor}
                      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      {isCreatingDocument ? "Cancelar" : "Fechar edicao"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <DocumentWithVersionField
                      document={editingDocument.document}
                      onDocumentChange={handleDocumentChange}
                      onInputChange={setDocumentSearchQuery}
                      documentError={
                        getEditingDocumentError("document_id", "document") || undefined
                      }
                      initialOptions={documentOptions}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormSelectField
                        name={
                          editingDocumentIndex !== null && editingDocumentIndex >= 0
                            ? `documents.${editingDocumentIndex}.status`
                            : "documents.draft.status"
                        }
                        label="Status"
                        value={editingDocument.status}
                        onChange={(event) => {
                          const patch = { status: event.target.value };
                          if (draftDocument) {
                            handleDraftDocumentPatch(patch);
                            return;
                          }

                          handleDocumentPatch(editingDocument.localId, patch);
                        }}
                        options={DOCUMENT_STATUS_OPTIONS}
                        error={getEditingDocumentError("status") || undefined}
                      />
                      <FormInput
                        id={
                          editingDocumentIndex !== null && editingDocumentIndex >= 0
                            ? `documents.${editingDocumentIndex}.emission_date`
                            : "documents.draft.emission_date"
                        }
                        name="emission_date"
                        type="date"
                        label="Data de emissao"
                        value={editingDocument.emission_date}
                        onChange={(event) => {
                          const patch = { emission_date: event.target.value };
                          if (draftDocument) {
                            handleDraftDocumentPatch(patch);
                            return;
                          }

                          handleDocumentPatch(editingDocument.localId, patch);
                        }}
                        error={
                          getEditingDocumentError("emission_date", "issued_at") ||
                          undefined
                        }
                      />
                      <FormInput
                        id={
                          editingDocumentIndex !== null && editingDocumentIndex >= 0
                            ? `documents.${editingDocumentIndex}.due_date`
                            : "documents.draft.due_date"
                        }
                        name="due_date"
                        type="date"
                        label="Data de vencimento"
                        value={editingDocument.due_date}
                        onChange={(event) => {
                          const patch = { due_date: event.target.value };
                          if (draftDocument) {
                            handleDraftDocumentPatch(patch);
                            return;
                          }

                          handleDocumentPatch(editingDocument.localId, patch);
                        }}
                        error={
                          getEditingDocumentError("due_date", "expires_at") ||
                          undefined
                        }
                      />
                    </div>

                    <FileUpload
                      label="Anexo do documento"
                      files={editingDocument.files}
                      setFiles={handleDocumentFilesChange}
                      showToast={(message, type = "error") =>
                        setToast({ open: true, message, type })
                      }
                      multiple={false}
                      error={getEditingDocumentError("upload", "upload_id") || undefined}
                    />

                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <CompanyDocumentAttachmentList
                        persisted={persistedAttachments}
                        pending={pendingAttachments}
                        onRemove={handleDocumentFileRemove}
                      />
                    </div>

                    {isCreatingDocument ? (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveDraftDocument}
                          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Adicionar ao formulario
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

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
                        const persistedFiles = document.files.filter(
                          isPersistedAttachment
                        );
                        const pendingFiles = document.files.filter(isPendingFile);
                        const attachmentCount =
                          persistedFiles.length + pendingFiles.length;
                        const isEditingDocument =
                          document.localId === activeDocumentLocalId;
                        const rowError = getFieldError(
                          errors,
                          `documents.${index}`,
                          `documents[${index}]`
                        );

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
                                <div className="flex flex-col">
                                  <span>
                                    {document.document?.label ||
                                      "Documento nao informado"}
                                  </span>
                                  {rowError ? (
                                    <span className="text-xs text-red-600">
                                      {rowError}
                                    </span>
                                  ) : null}
                                </div>
                                {isEditingDocument ? (
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    Em edicao
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                              {document.emission_date || "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                              {document.due_date || "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                              {document.status
                                ? document.status.charAt(0).toUpperCase() +
                                  document.status.slice(1)
                                : "-"}
                            </td>
                            <td className="px-4 py-2 text-gray-900 sm:px-6 sm:py-4 dark:text-white">
                              {attachmentCount > 0
                                ? `${attachmentCount} anexo(s)`
                                : "Sem anexo"}
                            </td>
                            <td className="px-4 py-2 text-right text-sm sm:px-6 sm:py-4">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditDocument(document.localId)}
                                  aria-label={`Editar documento ${index + 1}`}
                                  title="Editar"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDocument(document.localId)
                                  }
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

        <FormActions
          onCancel={() => navigate(COMPANIES_ROUTE)}
          text={isEdit ? "Atualizar Empresa" : "Criar Empresa"}
        />
      </form>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
