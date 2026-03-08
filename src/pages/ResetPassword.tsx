import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../components/Layout/Feedback/Toast";
import { getFieldError } from "../utils/errorUtils";
import {
  requestPasswordResetLink,
  resetPassword,
} from "../services/passwordResetService";

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
};

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: unknown } } })?.response;
  const message = response?.data?.message;
  return typeof message === "string" && message.trim().length > 0 ? message : fallback;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialToken = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const initialEmail = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [requestEmail, setRequestEmail] = useState(initialEmail);
  const [form, setForm] = useState({
    token: initialToken,
    email: initialEmail,
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    type: "info",
  });

  const handleRequestLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setIsRequestingLink(true);

    try {
      const response = await requestPasswordResetLink({
        email: requestEmail.trim(),
      });
      setToast({
        open: true,
        message: response.message || "Se o e-mail existir, enviaremos um link de redefinição.",
        type: "success",
      });
    } catch (error) {
      setErrors(
        (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data
          ?.errors ?? {}
      );
      setToast({
        open: true,
        message: resolveErrorMessage(error, "Não foi possível solicitar o código agora."),
        type: "error",
      });
    } finally {
      setIsRequestingLink(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setIsResetting(true);

    try {
      const response = await resetPassword({
        token: form.token.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      setToast({
        open: true,
        message: response.message || "Senha redefinida com sucesso.",
        type: "success",
      });

      setTimeout(() => navigate("/"), 900);
    } catch (error) {
      setErrors(
        (error as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data
          ?.errors ?? {}
      );
      setToast({
        open: true,
        message: resolveErrorMessage(error, "Não foi possível redefinir a senha."),
        type: "error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Redefinir senha</h1>
          <p className="mb-6 text-sm text-gray-600">
            Use o token recebido no e-mail ou o link automático.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="reset-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {getFieldError(errors, "email") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(errors, "email")}</p>
              )}
            </div>

            <div>
              <label htmlFor="reset-token" className="block text-sm font-medium text-gray-700">
                Código / token
              </label>
              <input
                id="reset-token"
                type="text"
                value={form.token}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, token: event.target.value }))
                }
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {getFieldError(errors, "token") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(errors, "token")}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reset-password"
                className="block text-sm font-medium text-gray-700"
              >
                Nova senha
              </label>
              <input
                id="reset-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {getFieldError(errors, "password") && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(errors, "password")}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reset-password-confirmation"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar nova senha
              </label>
              <input
                id="reset-password-confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    password_confirmation: event.target.value,
                  }))
                }
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {getFieldError(errors, "password_confirmation") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError(errors, "password_confirmation")}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isResetting ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Voltar para{" "}
            <Link to="/" className="font-medium text-blue-700 hover:underline">
              login
            </Link>
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Não recebeu o token?</h2>
          <p className="mb-6 text-sm text-gray-600">
            Informe seu e-mail para reenviar o link/código de redefinição.
          </p>

          <form onSubmit={handleRequestLink} className="space-y-4" noValidate>
            <div>
              <label htmlFor="request-email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="request-email"
                type="email"
                value={requestEmail}
                onChange={(event) => setRequestEmail(event.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isRequestingLink}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRequestingLink ? "Enviando..." : "Solicitar código por e-mail"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Se você abriu um link como{" "}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">
              /reset-password?token=...&amp;email=...
            </code>
            , os campos acima já são preenchidos automaticamente.
          </div>
        </section>
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
