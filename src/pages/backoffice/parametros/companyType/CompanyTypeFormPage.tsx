import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import {
  getCompanyTypeById,
  createCompanyType,
  updateCompanyType,
} from "../../../../services/companyTypeService";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";

export default function CompanyTypeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setIsLoading(true);
      getCompanyTypeById(id!)
        .then((data) => setForm({ name: data.name, description: data.description ?? "" }))
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar tipo.", type: "error" });
          navigate("/backoffice/tipos-empresa");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit) {
        await updateCompanyType(id!, form);
      } else {
        await createCompanyType(form);
      }
      setToast({ open: true, message: `Tipo ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/tipos-empresa");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar tipo.", type: "error" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs items={[
        { label: "Parâmetros", to: "/backoffice/parametros" },
        { label: "Tipos de Empresa", to: "/backoffice/tipos-empresa" },
        { label: isEdit ? "Editar" : "Novo", to: "#" }
      ]} />
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Tipo de Empresa" : "Novo Tipo de Empresa"}</h1>

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <FormInput label="Nome" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
          <FormTextArea label="Descrição" name="description" value={form.description} onChange={handleChange} error={errors.description} />
          <FormActions onCancel={() => navigate("/backoffice/tipos-empresa")} text={isEdit ? "Atualizar" : "Criar"} />
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
