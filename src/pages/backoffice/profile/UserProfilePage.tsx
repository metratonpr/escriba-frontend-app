import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import Spinner from "../../../components/Layout/ui/Spinner";
import { FormActions } from "../../../components/form/FormActions";
import { FormInput } from "../../../components/form/FormInput";
import { fetchCurrentUser, getStoredUser, updateProfile } from "../../../services/authService";
import { getFieldError } from "../../../utils/errorUtils";

type ProfileForm = {
  name: string;
  email: string;
  password: string;
};

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    const cached = getStoredUser();
    if (cached) {
      setForm((prev) => ({
        ...prev,
        name: typeof cached.name === "string" ? cached.name : "",
        email: typeof cached.email === "string" ? cached.email : "",
      }));
    }

    const loadProfile = async () => {
      try {
        const user = await fetchCurrentUser();
        setForm((prev) => ({
          ...prev,
          name: typeof user.name === "string" ? user.name : "",
          email: typeof user.email === "string" ? user.email : "",
        }));
      } catch {
        setToast({
          open: true,
          message: "Nao foi possivel carregar o perfil do usuario.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const payload: { name?: string; email?: string; password?: string } = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      const response = await updateProfile(payload);
      const user = response.user;

      setForm((prev) => ({
        ...prev,
        name: typeof user.name === "string" ? user.name : prev.name,
        email: typeof user.email === "string" ? user.email : prev.email,
        password: "",
      }));

      setToast({
        open: true,
        message: response.message || "Perfil atualizado com sucesso.",
        type: "success",
      });
    } catch (error: any) {
      setErrors(error?.response?.data?.errors ?? {});
      setToast({
        open: true,
        message: "Erro ao atualizar perfil.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Backoffice", to: "/backoffice/entidades" },
          { label: "Meu Perfil", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

      {isLoading ? (
        <div className="h-56 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6"
        >
          <FormInput
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={getFieldError(errors, "name")}
            required
          />

          <FormInput
            label="E-mail"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={getFieldError(errors, "email")}
            required
          />

          <FormInput
            label="Nova senha"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={getFieldError(errors, "password")}
            autoComplete="new-password"
            placeholder="Preencha apenas se quiser trocar a senha"
          />

          <FormActions
            onCancel={() => navigate(-1)}
            text="Salvar perfil"
            isSubmitting={isSubmitting}
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
