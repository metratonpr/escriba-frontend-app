import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormActions } from "../../../../components/form/FormActions";
import Spinner from "../../../../components/Layout/ui/Spinner";

import {
  getBrandById,
  createBrand,
  updateBrand,
} from "../../../../services/brandService";

export default function BrandFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    website: "",
    support_email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setIsLoading(true);
      getBrandById(id)
        .then((data) =>
          setForm({
            name: data.name,
            website: data.website ?? "",
            support_email: data.support_email ?? "",
          })
        )
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar marca.", type: "error" });
          navigate("/backoffice/marcas");
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (isEdit && id) {
        await updateBrand(id, form);
      } else {
        await createBrand(form);
      }
      setToast({ open: true, message: `Marca ${isEdit ? "atualizada" : "criada"} com sucesso.`, type: "success" });
      navigate("/backoffice/marcas");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar marca.", type: "error" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs items={[
        { label: "Parâmetros", to: "/backoffice/parametros" },
        { label: "Marcas", to: "/backoffice/marcas" },
        { label: isEdit ? "Editar" : "Nova", to: "#" },
      ]} />

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Editar Marca" : "Nova Marca"}
      </h1>

      {isEdit && isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <FormInput
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <FormInput
            label="Site"
            name="website"
            value={form.website}
            onChange={handleChange}
            error={errors.website}
            type="url"
          />

          <FormInput
            label="E-mail de Suporte"
            name="support_email"
            value={form.support_email}
            onChange={handleChange}
            error={errors.support_email}
            type="email"
          />

          <FormActions
            onCancel={() => navigate("/backoffice/marcas")}
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
