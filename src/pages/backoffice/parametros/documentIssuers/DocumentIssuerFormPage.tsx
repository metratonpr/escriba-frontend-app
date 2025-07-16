import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import FormSelectField from "../../../../components/form/FormSelectField";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";
import {
  createDocumentIssuer,
  getDocumentIssuerById,
  updateDocumentIssuer,
} from "../../../../services/documentIssuerService";
import { estadosBrasileiros } from "../../../../utils/estados";

export default function DocumentIssuerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    postal_code: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getDocumentIssuerById(id)
        .then((data) => {
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            number: data.number || "",
            complement: data.complement || "",
            city: data.city || "",
            state: data.state || "",
            postal_code: data.postal_code || "",
          });
        })
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar órgão emissor.", type: "error" });
          navigate("/backoffice/orgaos-emissores");
        })
        .finally(() => setIsLoading(false));
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
        await updateDocumentIssuer(id!, form);
      } else {
        await createDocumentIssuer(form);
      }
      setToast({ open: true, message: `Órgão ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/orgaos-emissores");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar órgão emissor.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Órgãos Emissores", to: "/backoffice/orgaos-emissores" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Órgão Emissor" : "Novo Órgão Emissor"}</h1>

      {isEdit && isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 grid gap-4 md:grid-cols-2">
          <FormInput id="name" label="Nome" name="name" value={form.name} onChange={handleChange} error={errors.name} required className="md:col-span-2" />
          <FormInput id="phone" label="Telefone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />
          <FormInput id="email" label="E-mail" name="email" value={form.email} onChange={handleChange} error={errors.email} type="email" />
          <FormInput id="address" label="Endereço" name="address" value={form.address} onChange={handleChange} error={errors.address} />
          <FormInput id="number" label="Número" name="number" value={form.number} onChange={handleChange} error={errors.number} />
          <FormInput id="complement" label="Complemento" name="complement" value={form.complement} onChange={handleChange} error={errors.complement} />
          <FormInput id="city" label="Cidade" name="city" value={form.city} onChange={handleChange} error={errors.city} />
          <FormSelectField
            label="Estado"
            name="state"
            value={form.state}
            onChange={handleChange}
            options={estadosBrasileiros}
            error={errors.state}
            className=""
          />
          <FormInput id="postal_code" label="CEP" name="postal_code" value={form.postal_code} onChange={handleChange} error={errors.postal_code} />
          <div className="md:col-span-2">
            <FormActions onCancel={() => navigate("/backoffice/orgaos-emissores")} text={isEdit ? "Atualizar" : "Criar"} />
          </div>
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
