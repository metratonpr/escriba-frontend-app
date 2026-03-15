import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
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
import { getBrands } from "../../../../services/brandService";
import { getCompanies } from "../../../../services/companyService";
import { getEpiTypes } from "../../../../services/epiTypeService";

interface Option {
  id: string | number;
  label: string;
}

interface EpiFormData {
  name: string;
  epi_type: Option | null;
  brand: Option | null;
  company: Option | null;
  cost: string;
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
    cost: "",
    ca: "",
    ca_expiration: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [epiTypeOptions, setEpiTypeOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadForm = async () => {
      setIsLoading(true);

      try {
        const [epiTypesResponse, brandsResponse, companiesResponse, epiData] = await Promise.all([
          getEpiTypes({ page: 1, perPage: 100 }),
          getBrands({ page: 1, perPage: 100 }),
          getCompanies({ page: 1, perPage: 100 }),
          isEdit && numericId ? getEpiById(numericId) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        setEpiTypeOptions(
          epiTypesResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );
        setBrandOptions(
          brandsResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );
        setCompanyOptions(
          companiesResponse.data.map((item) => ({ id: item.id, label: item.name }))
        );

        if (epiData) {
          setForm({
            name: epiData.name,
            epi_type: { id: epiData.epi_type_id, label: epiData.type?.name ?? "" },
            brand: { id: epiData.brand_id, label: epiData.brand?.name ?? "" },
            company: { id: epiData.company_id, label: epiData.company?.name ?? "" },
            cost: epiData.cost != null ? String(epiData.cost) : "",
            ca: epiData.ca,
            ca_expiration: epiData.ca_expiration.slice(0, 10),
          });
        }
      } catch {
        setToast({
          open: true,
          message: "Erro ao carregar EPI.",
          type: "error",
        });
        if (isEdit) {
          navigate("/backoffice/epis");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      active = false;
    };
  }, [isEdit, navigate, numericId]);

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
      cost: form.cost.trim() === "" ? undefined : Number(form.cost),
      ca: form.ca,
      ca_expiration: form.ca_expiration,
      brand_id: Number(form.brand?.id ?? 0),
      company_id: Number(form.company?.id ?? 0),
      epi_type_id: Number(form.epi_type?.id ?? 0),
    };

    try {
      if (isEdit && numericId) {
        await updateEpi(numericId, payload);
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

      {isLoading ? (
        <FormPageSkeleton className="px-0" fields={7} />
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
            initialOptions={epiTypeOptions}
          />

          <BrandAutocompleteField
            value={form.brand}
            onChange={(v) => setForm((prev) => ({ ...prev, brand: v }))}
            error={errors.brand_id}
            initialOptions={brandOptions}
          />

          <CompanyAutocompleteField
            value={form.company}
            onChange={(v) => setForm((prev) => ({ ...prev, company: v }))}
            error={errors.company_id}
            initialOptions={companyOptions}
          />

          <FormInput
            id="cost"
            name="cost"
            label="Custo"
            type="number"
            min={0}
            step="0.01"
            value={form.cost}
            onChange={handleChange}
            error={errors.cost}
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
