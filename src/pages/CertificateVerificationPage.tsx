import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  type CertificateVerificationResult,
  verifyCertificate,
} from "../services/certificateService";
import { DOMINIO } from "../api/apiConfig";

const formatDate = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : value;
};

const formatPresence = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "-";
  }

  const parsed = Number(value);
  return `${parsed.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}%`;
};

const formatHours = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "-";
  }

  const parsed = Number(value);
  return `${parsed.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}h`;
};

const getErrorMessage = (error: unknown): string => {
  const message = (
    error as { response?: { data?: { message?: unknown } } }
  )?.response?.data?.message;

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return "Nao foi possivel validar este certificado.";
};

const buildLogoCandidates = (logoPath?: string | null): string[] => {
  if (!logoPath) {
    return [];
  }

  if (/^https?:\/\//i.test(logoPath)) {
    return [logoPath];
  }

  const cleanPath = logoPath.replace(/^\/+/, "");

  return [`${DOMINIO}/storage/${cleanPath}`, `${DOMINIO}/${cleanPath}`];
};

export default function CertificateVerificationPage() {
  const navigate = useNavigate();
  const { verificationCode } = useParams<{ verificationCode?: string }>();
  const normalizedCode = useMemo(() => (verificationCode ?? "").trim(), [verificationCode]);

  const [searchCode, setSearchCode] = useState(normalizedCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    setSearchCode(normalizedCode);
  }, [normalizedCode]);

  useEffect(() => {
    if (!normalizedCode) {
      setResult(null);
      setError("");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await verifyCertificate(normalizedCode);
        if (!cancelled) {
          setResult(payload);
        }
      } catch (requestError) {
        if (!cancelled) {
          setResult(null);
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [normalizedCode]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    const code = searchCode.trim();
    if (!code) {
      setError("Informe o codigo de verificacao.");
      setResult(null);
      return;
    }

    navigate(`/certificados/validar/${encodeURIComponent(code)}`);
  };

  const certificate = result?.certificate;
  const courseData = result?.course_data ?? certificate?.meta?.course_data;
  const eventName = courseData?.name || result?.event?.name || certificate?.meta?.event_name || "-";
  const eventType =
    courseData?.type ||
    result?.event?.event_type?.nome_tipo_evento ||
    certificate?.meta?.event_type_name ||
    "-";
  const eventPeriod =
    courseData?.period ||
    (result?.event?.start_date && result?.event?.end_date
      ? `${formatDate(result.event.start_date)} a ${formatDate(result.event.end_date)}`
      : "-");
  const eventLocation =
    courseData?.location || result?.event?.location || certificate?.meta?.location || "-";
  const presencePercent = certificate?.presence_percent ?? result?.participation?.presence;
  const totalHours = certificate?.total_hours ?? courseData?.total_hours ?? result?.event?.total_hours;
  const logoCandidates = useMemo(
    () => buildLogoCandidates(result?.company?.logo_path),
    [result?.company?.logo_path]
  );
  const currentLogo = logoCandidates[logoIndex];
  const companyName = result?.company?.name || "Organizacao";
  const companyInitial = companyName.trim().charAt(0).toUpperCase() || "O";
  const showLogoImage = Boolean(currentLogo);

  useEffect(() => {
    setLogoIndex(0);
  }, [logoCandidates.length, result?.company?.logo_path]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}images/logo_iapotech.jpg`}
                alt="Logwood - SGD"
                className="h-14 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Validacao de certificado</h1>
                <p className="text-sm text-gray-600">
                  Consulte a autenticidade informando o codigo de verificacao.
                </p>
              </div>
            </div>
            <Link to="/" className="text-sm font-medium text-blue-700 hover:underline">
              Ir para login
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchCode}
              onChange={(event) => setSearchCode(event.target.value)}
              placeholder="Ex.: C56SDLGYI0DWNM"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Validando..." : "Validar"}
            </button>
          </form>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <p className="text-sm font-medium">{error}</p>
          </section>
        )}

        {!normalizedCode && !error && (
          <section className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">
            Informe um codigo acima ou acesse diretamente uma URL como{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5">
              /certificados/validar/C56SDLGYI0DWNM
            </code>
            .
          </section>
        )}

        {loading && !result && (
          <section className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">
            Carregando validacao do certificado...
          </section>
        )}

        {result && certificate && (
          <section className="space-y-5 rounded-2xl bg-white p-6 shadow-xl">
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      {showLogoImage ? (
                        <img
                          src={currentLogo}
                          alt={`Logo da empresa ${companyName}`}
                          className="h-full w-full object-contain"
                          onError={() => {
                            if (logoIndex + 1 < logoCandidates.length) {
                              setLogoIndex((prev) => prev + 1);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-500">{companyInitial}</span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Organizacao emissora
                      </p>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {companyName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {result.company?.cnpj || "CNPJ nao informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        result.is_issued
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.is_issued ? "Certificado emitido" : "Certificado nao emitido"}
                    </span>
                    <span
                      className={`rounded px-3 py-1 text-xs font-semibold ${
                        result.is_valid_for_organization
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {result.is_valid_for_organization ? "Valido para a organizacao" : "Invalido"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Codigo de verificacao
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-800">
                      {certificate.verification_code}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Numero do certificado
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-gray-800">
                      {certificate.certificate_number}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Data de emissao
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {formatDate(certificate.issued_at)}
                    </p>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">Participante e resultado</h3>
                <dl className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Participante</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {certificate.participant_name || result.participation?.employee?.name || "-"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Presenca</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {formatPresence(presencePercent)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Carga horaria</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {formatHours(totalHours)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Avaliacao</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {result.participation?.evaluation || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">Curso</h3>
                <dl className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Evento</dt>
                    <dd className="text-right font-semibold text-gray-900">{eventName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Tipo</dt>
                    <dd className="text-right font-semibold text-gray-900">{eventType}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Periodo</dt>
                    <dd className="text-right font-semibold text-gray-900">{eventPeriod}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-500">Local</dt>
                    <dd className="text-right font-semibold text-gray-900">{eventLocation}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {certificate.description && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">Descricao oficial</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{certificate.description}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
