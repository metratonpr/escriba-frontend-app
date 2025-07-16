import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import { FormInput } from "../../../../components/form/FormInput";
import { FormTextArea } from "../../../../components/form/FormTextArea";
import { FormActions } from "../../../../components/form/FormActions";
import { getSectorById, createSector, updateSector } from "../../../../services/sectorService";
import Spinner from "../../../../components/Layout/ui/Spinner";


export default function SectorFormPage() {
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
      getSectorById(id!)
         .then((res) => setForm({ name: res.name, description: res.description ?? "" }))
        .catch(() => {
          setToast({ open: true, message: "Erro ao carregar setor.", type: "error" });
          navigate("/backoffice/setores");
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
        await updateSector(id!, form);
      } else {
        await createSector(form);
      }
      setToast({ open: true, message: `Setor ${isEdit ? "atualizado" : "criado"} com sucesso.`, type: "success" });
      navigate("/backoffice/setores");
    } catch (err: any) {
      setErrors(err.response?.data?.errors ?? {});
      setToast({ open: true, message: "Erro ao salvar setor.", type: "error" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Setores", to: "/backoffice/setores" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Editar Setor" : "Novo Setor"}</h1>

      {isEdit && isLoading ? (
        <Spinner />
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
          <FormTextArea
            id="description"
            label="Descrição"
            name="description"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
          />
          <FormActions
            onCancel={() => navigate("/backoffice/setores")}
            text={isEdit ? "Atualizar" : "Criar"}
          />
        </form>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
