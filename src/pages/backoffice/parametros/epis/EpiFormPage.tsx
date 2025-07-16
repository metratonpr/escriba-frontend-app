// src/pages/backoffice/parametros/epis/EpiFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import Spinner from "../../../../components/Layout/ui/Spinner";
import { FormInput } from "../../../../components/form/FormInput";
import { FormActions } from "../../../../components/form/FormActions";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";
import BrandAutocompleteField from "../../../../components/form/BrandAutocompleteField";
import CompanyAutocompleteField from "../../../../components/form/CompanyAutocompleteField";
import EpiTypeAutocompleteField from "../../../../components/form/EpiTypeAutocompleteField";
import {
  createEpi,
  getEpiById,
  updateEpi,
} from "../../../../services/epiService";

interface Option {
  id: string | number;
  label: string;
}

interface EpiFormData {
  name: string;
  epi_type: Option | null;
  brand: Option | null;
  company: Option | null;
  ca: string;
  ca_expiration: string;
}

export default function EpiFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const numericId = Number(id);

  const [form, setForm] = useState<EpiFormData>({
    name: "",
    epi_type: null,
    brand: null,
    company: null,
    ca: "",
    ca_expiration: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getEpiById(id)
        .then((data) => {
          setForm({
            name: data.name,
            epi_type: { id: data.epi_type_id, label: data.epi_type_name },
            brand: { id: data.brand_id, label: data.brand_name },
            company: { id: data.company_id, label: data.company_name },
            ca: data.ca,
            ca_expiration: data.ca_expiration.slice(0, 10),
          });
        })
        .catch(() => {
          setToast({
            open: true,
            message: "Erro ao carregar EPI.",
            type: "error",
          });
          navigate("/backoffice/epis");
        })
        .finally(() => setIsLoading(false));
    }
  }, [numericId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: form.name,
      ca: form.ca,
      ca_expiration: form.ca_expiration,
      brand_id: String(form.brand?.id ?? ""),
      company_id: String(form.company?.id ?? ""),
      epi_type_id: String(form.epi_type?.id ?? ""),
    };

    try {
      if (isEdit && numericId) {
        await updateEpi(id!, payload);

      } else {
        await createEpi(payload);
      }
      setToast({
        open: true,
        message: `EPI ${isEdit ? "atualizado" : "criado"} com sucesso.`,
        type: "success",
      });
      navigate("/backoffice/epis");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({
        open: true,
        message: "Erro ao salvar EPI.",
        type: "error",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "EPIs", to: "/backoffice/epis" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Editar EPI" : "Novo EPI"}
      </h1>

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6"
        >
          <FormInput
            id="name"
            name="name"
            label="Nome"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <EpiTypeAutocompleteField
            value={form.epi_type}
            onChange={(v) => setForm((prev) => ({ ...prev, epi_type: v }))}
            error={errors.epi_type_id}
          />

          <BrandAutocompleteField
            value={form.brand}
            onChange={(v) => setForm((prev) => ({ ...prev, brand: v }))}
            error={errors.brand_id}
          />

          <CompanyAutocompleteField
            value={form.company}
            onChange={(v) => setForm((prev) => ({ ...prev, company: v }))}
            error={errors.company_id}
          />

          <FormInput
            id="ca"
            name="ca"
            label="Número CA"
            value={form.ca}
            onChange={handleChange}
            error={errors.ca}
            required
          />

          <FormDatePickerField
            label="Validade do CA"
            name="ca_expiration"
            value={form.ca_expiration}
            onChange={handleChange}
            error={errors.ca_expiration}
          />

          <FormActions
            onCancel={() => navigate("/backoffice/epis")}
            text={isEdit ? "Atualizar" : "Criar"}
          />
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
