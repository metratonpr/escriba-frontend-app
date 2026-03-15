import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../../components/Layout/ui/FormPageSkeleton";
import { FormActions } from "../../../../components/form/FormActions";
import { FormInput } from "../../../../components/form/FormInput";
import FormSwitchField from "../../../../components/form/FormSwitchField";
import { getStoredUser } from "../../../../services/authService";
import { createUser, getUserById, updateUser } from "../../../../services/userService";
import { getFieldError } from "../../../../utils/errorUtils";

type UserFormState = {
  name: string;
  email: string;
  is_admin: boolean;
};

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: unknown } } })?.response;
  const message = response?.data?.message;
  return typeof message === "string" && message.trim().length > 0 ? message : fallback;
};

export default function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<UserFormState>({
    name: "",
    email: "",
    is_admin: false,
  });
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
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

  const currentUserId = useMemo(() => {
    const user = getStoredUser();
    return user?.id != null ? String(user.id) : "";
  }, []);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    const loadUser = async () => {
      setIsLoading(true);
      try {
        const user = await getUserById(id);
        setForm({
          name: user.name ?? "",
          email: user.email ?? "",
          is_admin: Boolean(user.is_admin),
        });
      } catch {
        setToast({
          open: true,
          message: "Não foi possível carregar o usuário.",
          type: "error",
        });
        navigate("/backoffice/perfil/usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [id, isEdit, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? event.target.checked : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (isEdit && id && String(id) === currentUserId && !form.is_admin) {
      setToast({
        open: true,
        message: "Você não pode remover o próprio perfil de administrador.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      is_admin: form.is_admin,
    };

    try {
      if (isEdit && id) {
        await updateUser(id, payload);
        setToast({
          open: true,
          message: "Usuário atualizado com sucesso.",
          type: "success",
        });
      } else {
        await createUser(payload);
        setToast({
          open: true,
          message: "Usuário criado com sucesso. Um e-mail de redefinição foi enviado.",
          type: "success",
        });
      }

      navigate("/backoffice/perfil/usuarios");
    } catch (error) {
      setErrors((error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data?.errors ?? {});
      setToast({
        open: true,
        message: resolveErrorMessage(error, "Erro ao salvar usuário."),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Breadcrumbs
        items={[
          { label: "Perfil", to: "/backoffice/perfil" },
          { label: "Usuários", to: "/backoffice/perfil/usuarios" },
          { label: isEdit ? "Editar" : "Novo", to: "#" },
        ]}
      />

      <h1 className="mb-6 text-2xl font-bold">
        {isEdit ? "Editar usuário" : "Novo usuário"}
      </h1>

      {isEdit && isLoading ? (
        <FormPageSkeleton className="px-0" fields={6} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
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

          <FormSwitchField
            label="Usuário administrador"
            name="is_admin"
            checked={form.is_admin}
            onChange={handleChange}
            error={getFieldError(errors, "is_admin")}
          />

          <FormActions
            onCancel={() => navigate("/backoffice/perfil/usuarios")}
            text={isEdit ? "Atualizar" : "Criar"}
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
