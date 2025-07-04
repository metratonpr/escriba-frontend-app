import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";

import {
  createEpi,
  getEpiById,
  updateEpi,
} from "../../../../services/epiService";
import { getBrands } from "../../../../services/brandService";
import { getCompanies } from "../../../../services/companyService";
import { getEpiTypes } from "../../../../services/epiTypeService";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import FormDatePickerField from "../../../../components/form/FormDatePickerField";



export default function EpiFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    epi_type_id: "",
    brand_id: "",
    company_id: "",
    ca: "",
    ca_expiration: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const [epiTypes, setEpiTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
  getEpiTypes().then((res) => {
    const data = Array.isArray(res) ? res : res.data;
    setEpiTypes(data.map((item: any) => ({ value: item.id, label: item.name })));
  });

  getBrands().then((res) => {
    const data = Array.isArray(res) ? res : res.data;
    setBrands(data.map((item: any) => ({ value: item.id, label: item.name })));
  });

  getCompanies().then((res) => {
    const data = Array.isArray(res) ? res : res.data;
    setCompanies(data.map((item: any) => ({ value: item.id, label: item.name })));
  });

  if (isEdit && id) {
    getEpiById(+id)
      .then((data) => {
        setForm({
          name: data.name,
          epi_type_id: String(data.epi_type_id),
          brand_id: String(data.brand_id),
          company_id: String(data.company_id),
          ca: data.ca,
          ca_expiration: data.ca_expiration.slice(0, 10),
        });
      })
      .catch(() => {
        setToast({ open: true, message: "Erro ao carregar EPI.", type: "error" });
        navigate("/backoffice/epis");
      });
  }
}, [id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        await updateEpi(Number(id), form);
      } else {
        await createEpi(form);
      }
      setToast({ open: true, message: `EPI ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/epis");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar EPI.", type: "error" });
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

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar EPI" : "Novo EPI"}</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <FormInput id="name" name="name" label="Nome" value={form.name} onChange={handleChange} error={errors.name} required />
        <FormSelectField label="Tipo de EPI" name="epi_type_id" value={form.epi_type_id} onChange={handleChange} options={epiTypes} error={errors.epi_type_id} required />
        <FormSelectField label="Marca" name="brand_id" value={form.brand_id} onChange={handleChange} options={brands} error={errors.brand_id} required />
        <FormSelectField label="Empresa" name="company_id" value={form.company_id} onChange={handleChange} options={companies} error={errors.company_id} required />
        <FormInput id="ca" name="ca" label="Número CA" value={form.ca} onChange={handleChange} error={errors.ca} required />
        <FormDatePickerField label="Validade do CA" name="ca_expiration" value={form.ca_expiration} onChange={handleChange} error={errors.ca_expiration} />
        <FormActions onCancel={() => navigate("/backoffice/epis")} text={isEdit ? "Atualizar" : "Criar"} />
      </form>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
