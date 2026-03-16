import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import type { BreadcrumbItem } from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import { FormActions } from "../../../../components/form/FormActions";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import ImageUploadPreview from "../../../../components/form/ImageUploadPreview";
import {
  createCompanyGroup,
  getCompanyGroupById,
  updateCompanyGroup,
} from "../../../../services/companyGroupService";
import { getFieldError, type FieldErrors } from "../../../../utils/errorUtils";

type CompanyGroupFormState = {
  name: string;
  description: string;
  responsible: string;
  contact_email: string;
  logoFile: File | null;
  existingLogoUrl: string;
  removeLogo: boolean;
};

const MAX_LOGO_SIZE_MB = 5;
const ACCEPTED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const GROUPS_ROUTE = "/backoffice/grupos-empresa";

const INITIAL_FORM_STATE: CompanyGroupFormState = {
  name: "",
  description: "",
  responsible: "",
  contact_email: "",
  logoFile: null,
  existingLogoUrl: "",
  removeLogo: false,
};

const COMPANY_GROUP_LOGO_PLACEHOLDER = "/images/placeholderfoto.jpg";

function buildCompanyGroupFormData(form: CompanyGroupFormState): FormData {
  const formData = new FormData();

  const appendValue = (
    key: string,
    value: string | number | boolean | null | undefined
  ) => {
    formData.append(key, value == null ? "" : String(value));
  };

  appendValue("name", form.name);
  appendValue("description", form.description);
  appendValue("responsible", form.responsible);
  appendValue("contact_email", form.contact_email);

  if (form.logoFile) {
    formData.append("logo", form.logoFile);
  }

  if (form.removeLogo && !form.logoFile) {
    formData.append("remove_logo", "true");
  }

  return formData;
}

export default function CompanyGroupFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<CompanyGroupFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isLoading, setIsLoading] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Parametros", to: "/backoffice/parametros" },
    { label: "Grupos de Empresa", to: GROUPS_ROUTE },
    { label: isEdit ? "Editar" : "Novo", to: "#" },
  ];

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    setIsLoading(true);
    getCompanyGroupById(id)
      .then((data) =>
        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          responsible: data.responsible ?? "",
          contact_email: data.contact_email ?? "",
          logoFile: null,
          existingLogoUrl: data.logo_url ?? "",
          removeLogo: false,
        })
      )
      .catch(() => {
        setToast({
          open: true,
          message: "Erro ao carregar grupo de empresa.",
          type: "error",
        });
        navigate(GROUPS_ROUTE);
      })
      .finally(() => setIsLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    if (!ACCEPTED_LOGO_TYPES.includes(nextFile.type)) {
      setToast({
        open: true,
        message: "O logo deve estar nos formatos JPG, JPEG, PNG ou WEBP.",
        type: "error",
      });
      return;
    }

    if (nextFile.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setToast({
        open: true,
        message: `O logo nao pode exceder ${MAX_LOGO_SIZE_MB}MB.`,
        type: "error",
      });
      return;
    }

    setErrors((prev) => ({ ...prev, logo: "" }));
    setForm((prev) => ({
      ...prev,
      logoFile: nextFile,
      removeLogo: false,
    }));
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({
      ...prev,
      logoFile: null,
      removeLogo:
        prev.logoFile && prev.existingLogoUrl && !prev.removeLogo
          ? false
          : Boolean(prev.existingLogoUrl),
    }));
  };

  const handleRestoreLogo = () => {
    setForm((prev) => ({
      ...prev,
      removeLogo: false,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    const payload = buildCompanyGroupFormData(form);

    try {
      if (isEdit && id) {
        await updateCompanyGroup(id, payload);
      } else {
        await createCompanyGroup(payload);
      }

      setToast({
        open: true,
        message: `Grupo ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate(GROUPS_ROUTE);
    } catch (error: unknown) {
      const response = (error as { response?: { data?: { errors?: FieldErrors } } }).response;
      const backendErrors = response?.data?.errors ?? {};

      if (Object.keys(backendErrors).length > 0) {
        setErrors(backendErrors);
        return;
      }

      setToast({
        open: true,
        message: "Erro ao salvar grupo.",
        type: "error",
      });
    }
  };

  const normalizedLogoUrl = form.existingLogoUrl ? form.existingLogoUrl.trim() : "";
  const hasExistingLogo = Boolean(normalizedLogoUrl);
  const hasLogoPreview = Boolean(form.logoFile || hasExistingLogo);
  const logoButtonLabel = hasLogoPreview ? "Trocar logo" : "Enviar logo";
  const removeButtonLabel =
    form.removeLogo && form.existingLogoUrl && !form.logoFile
      ? "Restaurar logo"
      : form.logoFile && form.existingLogoUrl && !form.removeLogo
        ? "Descartar nova logo"
        : "Remover logo";
  const removeAction = form.removeLogo ? handleRestoreLogo : handleRemoveLogo;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mb-6 text-2xl font-semibold">
        {isEdit ? "Editar Grupo de Empresa" : "Novo Grupo de Empresa"}
      </h1>

      {isEdit && isLoading ? (
        <FormPageSkeleton className="px-0" fields={5} />
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="space-y-3">
                <ImageUploadPreview
                  file={form.logoFile}
                  existingImageUrl={form.removeLogo ? undefined : normalizedLogoUrl}
                  onFileChange={handleLogoChange}
                  buttonLabel={logoButtonLabel}
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  previewAlt="Logo do grupo de empresa"
                  overlayText="Carregando logo..."
                  previewWrapperClassName="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                  imageClassName="h-full w-full object-contain p-4"
                  onRemove={removeAction}
                  removeButtonLabel={removeButtonLabel}
                  removeButtonDisabled={!form.logoFile && !form.existingLogoUrl}
                  details={
                    <>
                      {form.logoFile ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Arquivo selecionado: {form.logoFile.name}
                        </p>
                      ) : null}
                      {form.removeLogo && !form.logoFile ? (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          A logo atual sera removida ao salvar.
                        </p>
                      ) : null}
                    </>
                  }
                  error={getFieldError(errors, "logo")}
                />
              </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormInput
                label="Nome"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={getFieldError(errors, "name")}
                required
              />

              <FormInput
                label="Responsavel"
                name="responsible"
                value={form.responsible}
                onChange={handleChange}
                error={getFieldError(errors, "responsible")}
                required
              />

              <FormInput
                label="E-mail de Contato"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                error={getFieldError(errors, "contact_email")}
                required
                type="email"
                className="md:col-span-2"
              />

              <FormTextArea
                label="Descricao"
                name="description"
                value={form.description}
                onChange={handleChange}
                error={getFieldError(errors, "description")}
                className="md:col-span-2"
              />
            </div>
          </div>

          <FormActions
            onCancel={() => navigate(GROUPS_ROUTE)}
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
