import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import DocumentTypeAutocompleteField from "../../../../components/form/DocumentTypeAutocompleteField";
import DocumentIssuerAutocompleteField from "../../../../components/form/DocumentIssuerAutocompleteField";
import FormSelectField from "../../../../components/form/FormSelectField";
import FormSwitchField from "../../../../components/form/FormSwitchField";
import Spinner from "../../../../components/Layout/ui/Spinner";
import {
  getDocumentById,
  createDocument,
  updateDocument,
  type DocumentCategory,
} from "../../../../services/documentService";
import DocumentVersionsField from "../../../../components/form/DocumentVersionsField";
import { getFieldError } from "../../../../utils/errorUtils";

interface Option {
  id: string | number;
  label: string;
}

interface Version {
  code?: string;
  description?: string;
  version?: string;
}

type DocumentTab = "dados" | "versoes";

export default function DocumentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    category: "general" as DocumentCategory,
    is_required: false,
  });

  const [type, setType] = useState<Option | null>(null);
  const [issuer, setIssuer] = useState<Option | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionErrors, setVersionErrors] = useState<Record<number, Record<string, string>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentTab>("dados");

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    setIsLoading(true);
    getDocumentById(id)
      .then((doc) => {
        setForm({
          code: doc.code,
          name: doc.name,
          description: doc.description ?? "",
          category: doc.category,
          is_required: doc.is_required,
        });

        setType({ id: doc.document_type_id, label: doc.type?.name ?? `Tipo ${doc.document_type_id}` });
        setIssuer({ id: doc.document_issuer_id, label: doc.issuer?.name ?? `Órgão ${doc.document_issuer_id}` });

        setVersions(
          (doc.versions ?? []).map((item) => ({
            code: item.code,
            description: item.description ?? "",
            version: item.version,
          }))
        );
      })
      .catch(() => {
        setToast({ open: true, message: "Erro ao carregar documento.", type: "error" });
        navigate("/backoffice/documentos");
      })
      .finally(() => setIsLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const parsedValue =
      type === "checkbox" && "checked" in event.target
        ? (event.target as HTMLInputElement).checked
        : value;

    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setVersionErrors({});

    try {
      const payload = {
        ...form,
        document_type_id: type?.id != null ? String(type.id) : "",
        document_issuer_id: issuer?.id != null ? String(issuer.id) : "",
        versions,
        version: 1,
      };

      if (isEdit && id) {
        await updateDocument(id, payload);
      } else {
        await createDocument(payload);
      }

      setToast({
        open: true,
        message: `Documento ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/documentos");
    } catch (err: any) {
      const rawErrors = err.response?.data?.errors ?? {};
      const groupedVersionErrors: Record<number, Record<string, string>> = {};

      Object.keys(rawErrors).forEach((key) => {
        const match = key.match(/^versions\.(\d+)\.(\w+)$/);
        if (!match) {
          return;
        }

        const index = Number(match[1]);
        const field = match[2];
        if (!groupedVersionErrors[index]) {
          groupedVersionErrors[index] = {};
        }
        groupedVersionErrors[index][field] = rawErrors[key];
      });

      setErrors(rawErrors);
      setVersionErrors(groupedVersionErrors);
      if (Object.keys(groupedVersionErrors).length > 0) {
        setActiveTab("versoes");
      }
      setToast({ open: true, message: "Erro ao salvar documento.", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Documentos", to: "/backoffice/documentos" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold">{isEdit ? "Editar Documento" : "Novo Documento"}</h1>

      {isEdit && isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("dados")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "dados"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Dados
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("versoes")}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "versoes"
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                Versões
              </button>
            </nav>
          </div>

          {activeTab === "dados" && (
            <div className="grid gap-6 md:grid-cols-2">
              <FormInput
                label="Código"
                name="code"
                value={form.code}
                onChange={handleChange}
                error={errors.code}
                required
              />
              <FormInput
                label="Nome"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <FormTextArea
                label="Descrição"
                name="description"
                value={form.description}
                onChange={handleChange}
                error={errors.description}
                className="md:col-span-2"
              />

              <div className="grid gap-6 md:col-span-2 md:grid-cols-2 md:items-end">
                <FormSelectField
                  label="Categoria"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  error={errors.category}
                  options={[
                    { value: "employee", label: "Funcionário" },
                    { value: "company", label: "Empresa" },
                    { value: "general", label: "Geral" },
                  ]}
                />

                <FormSwitchField
                  label="Obrigatório"
                  name="is_required"
                  checked={form.is_required}
                  error={getFieldError(errors, "is_required")}
                  className="flex h-full items-center justify-center md:pb-2"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      is_required: event.target.checked,
                    }))
                  }
                />
              </div>

              <DocumentTypeAutocompleteField
                value={type}
                onChange={setType}
                error={getFieldError(errors, "document_type_id")}
                required
              />
              <DocumentIssuerAutocompleteField
                value={issuer}
                onChange={setIssuer}
                error={getFieldError(errors, "document_issuer_id")}
                required
              />
            </div>
          )}

          {activeTab === "versoes" && (
            <div className="space-y-4">
              <DocumentVersionsField value={versions} onChange={setVersions} errors={versionErrors} />
            </div>
          )}

          <div className="mt-6">
            <FormActions
              onCancel={() => navigate("/backoffice/documentos")}
              text={isEdit ? "Atualizar" : "Criar"}
            />
          </div>
        </form>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
