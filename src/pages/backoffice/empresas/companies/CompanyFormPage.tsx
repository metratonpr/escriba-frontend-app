import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import CompanyGroupAutocompleteField from "../../../../components/form/CompanyGroupAutocompleteField";
import CompanyTypeAutocompleteField from "../../../../components/form/CompanyTypeAutocompleteField";
import SectorFormWithTable from "../../../../components/form/SectorFormWithTable";

// Importa apenas os tipos com "type"
import type { CompanyResponse, CompanyPayload } from "../../../../services/companyService";
import {
  getCompanyById,
  createCompany,
  updateCompany,
} from "../../../../services/companyService";
import { getCompanyGroups } from "../../../../services/companyGroupService";
import { getCompanyTypes } from "../../../../services/companyTypeService";
import { getSectors } from "../../../../services/sectorService";

interface AutocompleteOption {
  id: string | number;
  label: string;
}

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
}

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO"
].map((uf) => ({ value: uf, label: uf }));

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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [groupOptions, setGroupOptions] = useState<AutocompleteOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<AutocompleteOption[]>([]);
  const [sectorOptions, setSectorOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDependencies = async () => {
      setIsLoading(true);

      try {
        const [groupsResponse, typesResponse, sectorsResponse, companyData] = await Promise.all([
          getCompanyGroups({ page: 1, perPage: 100 }),
          getCompanyTypes({ page: 1, perPage: 100 }),
          getSectors({ page: 1, perPage: 100 }),
          isEdit && id ? getCompanyById(id) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        setGroupOptions(
          groupsResponse.data.map((group) => ({ id: group.id, label: group.name }))
        );
        setTypeOptions(
          typesResponse.data.map((type) => ({ id: type.id, label: type.name }))
        );
        setSectorOptions(
          sectorsResponse.data.map((sector) => ({ id: sector.id, label: sector.name }))
        );

        if (companyData) {
          const company = companyData as CompanyResponse;
          setForm({
            name: company.name ?? "",
            cnpj: company.cnpj ?? "",
            phone: company.phone ?? "",
            address: company.address ?? "",
            city: company.city ?? "",
            state: company.state ?? "",
            responsible: company.responsible ?? "",
            email: company.email ?? "",
            company_group_id: company.group ? { id: company.group.id, label: company.group.name } : null,
            company_type_id: company.type ? { id: company.type.id, label: company.type.name } : null,
            sectors: (company.company_sectors || []).map((item) => ({
              id: item.sector.id,
              label: item.sector.name,
            })),
          });
        }
      } catch (err) {
        console.error("Erro ao carregar formulario da empresa:", err);
        setToast({ open: true, message: "Erro ao carregar dados da empresa.", type: "error" });

        if (isEdit) {
          navigate("/backoffice/empresas");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CompanyPayload = {
      name: form.name,
      cnpj: form.cnpj,
      email: form.email,
      responsible: form.responsible,
      state: form.state,
      company_group_id: form.company_group_id ? String(form.company_group_id.id) : "",
      company_type_id: form.company_type_id ? String(form.company_type_id.id) : "",
      phone: form.phone || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      company_sectors: form.sectors.map((s) => ({ sector_id: String(s.id) })),
    };

    try {
      if (isEdit && id) {
        await updateCompany(id, payload);
      } else {
        await createCompany(payload);
      }
      setToast({ open: true, message: `Empresa ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate("/backoffice/empresas");
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { errors?: Record<string, string> } } }).response;
      if (response?.data?.errors) {
        setErrors(response.data.errors);
      }
      setToast({ open: true, message: "Erro ao salvar empresa. Verifique os campos.", type: "error" });
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={10} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumbs items={[{ label: "Empresas", to: "/backoffice/empresas" }, { label: isEdit ? "Editar" : "Nova" }]} />

      <form onSubmit={handleSubmit} className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanyGroupAutocompleteField
            value={form.company_group_id}
            onChange={(v) => handleAutocompleteChange("company_group_id", v)}
            error={errors.company_group_id}
            required
            initialOptions={groupOptions}
          />
          <CompanyTypeAutocompleteField
            value={form.company_type_id}
            onChange={(v) => handleAutocompleteChange("company_type_id", v)}
            error={errors.company_type_id}
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
            <SectorFormWithTable
              value={form.sectors}
              onChange={handleSectorsChange}
              error={errors.company_sectors}
              initialOptions={sectorOptions}
            />
          </div>
        </div>

        <div className="mt-8">
          <FormActions onCancel={() => navigate("/backoffice/empresas")} text={isEdit ? "Atualizar Empresa" : "Criar Empresa"} />
        </div>
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </div>
  );
}
