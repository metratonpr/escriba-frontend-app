import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import { getCompanyById, createCompany, updateCompany } from "../../../../services/companyService";
import CompanyGroupAutocompleteField from "../../../../components/form/CompanyGroupAutocompleteField";
import CompanyTypeAutocompleteField from "../../../../components/form/CompanyTypeAutocompleteField";
import SectorFormWithTable from "../../../../components/form/SectorFormWithTable";
import Spinner from "../../../../components/Layout/ui/Spinner";

// Interface corrigida com campos relacionais
interface CompanyResponse {
  id: string;
  name: string;
  cnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state: string;
  responsible: string;
  email: string;
  group?: { id: string; name: string };
  type?: { id: string; name: string };
  company_sectors?: { sector: { id: string; name: string } }[];
}

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO"
].map((uf) => ({ value: uf, label: uf }));

export default function CompanyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<any>({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  if (isEdit && id) {
    setIsLoading(true);
    getCompanyById(id)
      .then((data: CompanyResponse) => {
        setForm({
          company_group_id: data.group ? { id: data.group.id, label: data.group.name } : null,
          company_type_id: data.type ? { id: data.type.id, label: data.type.name } : null,
          name: data.name ?? "",
          cnpj: data.cnpj ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          responsible: data.responsible ?? "",
          email: data.email ?? "",
          sectors: Array.isArray(data.company_sectors)
            ? data.company_sectors
                .map((s) => s.sector && { id: s.sector.id, label: s.sector.name })
                .filter(Boolean)
            : [],
        });
      })
      .catch(() => {
        setToast({ open: true, message: "Erro ao carregar empresa.", type: "error" });
        navigate("/backoffice/empresas");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
}, [id, isEdit, navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      company_group_id: form.company_group_id?.id,
      company_type_id: form.company_type_id?.id,
      name: form.name,
      cnpj: form.cnpj,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state,
      responsible: form.responsible,
      email: form.email,
      company_sectors: form.sectors.map((s: any) => ({ sector_id: s.id })),
    };

    try {
      if (isEdit && id) {
        await updateCompany(id, payload);
      } else {
        await createCompany(payload);
      }
      setToast({ open: true, message: `Empresa ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate("/backoffice/empresas");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar empresa.", type: "error" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumbs items={[{ label: "Empresas", to: "/backoffice/empresas" }, { label: isEdit ? "Editar" : "Nova", to: "#" }]} />

      {isEdit && isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CompanyGroupAutocompleteField
              value={form.company_group_id}
              onChange={(v) => setForm((prev: any) => ({ ...prev, company_group_id: v }))}
              error={errors.company_group_id}
              required
            />
            <CompanyTypeAutocompleteField
              value={form.company_type_id}
              onChange={(v) => setForm((prev: any) => ({ ...prev, company_type_id: v }))}
              error={errors.company_type_id}
              required
            />
            <FormInput id="name" name="name" label="Nome" value={form.name} onChange={handleChange} error={errors.name} required />
            <FormInput id="cnpj" name="cnpj" label="CNPJ" value={form.cnpj} onChange={handleChange} error={errors.cnpj} required />
            <FormInput id="phone" name="phone" label="Telefone" value={form.phone} onChange={handleChange} error={errors.phone} />
            <FormInput id="email" name="email" label="E-mail" value={form.email} onChange={handleChange} error={errors.email} required />
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
              <SectorFormWithTable
                value={form.sectors}
                onChange={(val) => setForm((prev: any) => ({ ...prev, sectors: val }))}
              />
              {errors.sectors && <p className="text-sm text-red-600 mt-1">{errors.sectors}</p>}
            </div>
          </div>

          <div className="mt-6">
            <FormActions onCancel={() => navigate("/backoffice/empresas")} text={isEdit ? "Atualizar" : "Criar"} />
          </div>
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}
