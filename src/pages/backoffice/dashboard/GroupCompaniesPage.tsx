import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import ProtectedImage from "../../../components/Layout/ProtectedImage";
import Toast from "../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../components/Layout/ui/FormPageSkeleton";
import {
  getDashboardAudit,
  type CompanyGroupAuditSummary,
} from "../../../services/auditService";
import type { CompanyResponse } from "../../../services/companyService";

type ToastType = "success" | "error" | "info";

const sectionItems = [
  { label: "Dashboard", to: "/backoffice/dashboard" },
  { label: "Auditoria", to: "/backoffice/auditoria" },
];

type LocationState = {
  group?: CompanyGroupAuditSummary;
};

function CompanyCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={`company-card-skeleton-${index}`}
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
        >
          <div className="flex aspect-square h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white">
            <div className="h-10 w-10 rounded-full bg-slate-200 skeleton-shimmer" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-200 skeleton-shimmer" />
            <div className="h-2.5 w-2/3 rounded bg-slate-200 skeleton-shimmer" />
            <div className="h-2.5 w-1/2 rounded bg-slate-200 skeleton-shimmer" />
          </div>
          <span className="h-3 w-3 rounded-full bg-slate-200 skeleton-shimmer" />
        </article>
      ))}
    </div>
  );
}

function CompanyTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`company-table-skeleton-${index}`}
            className="grid grid-cols-5 gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <span className="h-3 w-full rounded bg-slate-200 skeleton-shimmer col-span-2" />
            <span className="h-3 w-full rounded bg-slate-200 skeleton-shimmer col-span-1" />
            <span className="h-3 w-full rounded bg-slate-200 skeleton-shimmer col-span-1" />
            <span className="h-3 w-full rounded bg-slate-200 skeleton-shimmer col-span-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GroupCompaniesPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const [group, setGroup] = useState<CompanyGroupAuditSummary | null>(
    (location.state as LocationState | null)?.group ?? null
  );
  const [loading, setLoading] = useState(!Boolean(group));
  const [toast, setToast] = useState<{ open: boolean; message: string; type: ToastType }>(
    {
      open: false,
      message: "",
      type: "info",
    }
  );
  const [companyView, setCompanyView] = useState<"card" | "table">("card");
  const [pendingImageLoads, setPendingImageLoads] = useState(0);
  const navigate = useNavigate();

  const companies = useMemo<CompanyResponse[]>(
    () => (group?.companies ?? []) as CompanyResponse[],
    [group]
  );

  const handleImageLoadComplete = useCallback(() => {
    setPendingImageLoads((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (group || !groupId) {
      return;
    }

    let active = true;
    setLoading(true);

    void getDashboardAudit()
      .then((response) => {
        if (!active) {
          return;
        }

        const section =
          response.items?.find((item) => item.key === "company_groups_with_companies") ??
          response.items?.[0];

        const found =
          section?.data?.find((item) => String(item.id) === String(groupId)) ?? null;

        if (found) {
          setGroup(found);
          return;
        }

        setToast({
          open: true,
          message: "Grupo não encontrado.",
          type: "error",
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setToast({
          open: true,
          message: "Erro ao carregar os dados do grupo.",
          type: "error",
        });
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [group, groupId]);

  useEffect(() => {
    if (!group) {
      setPendingImageLoads(0);
      return;
    }

    const groupLogoCount = group.logo_url ? 1 : 0;
    setPendingImageLoads(groupLogoCount);
  }, [group]);

  useEffect(() => {
    if (!group || companyView !== "card") {
      return;
    }

    const companyLogoCount = (group.companies ?? []).filter((company) => Boolean(company.logo_url))
      .length;

    if (companyLogoCount === 0) {
      return;
    }

    setPendingImageLoads((prev) => prev + companyLogoCount);
  }, [companyView, group]);

  useEffect(() => {
    if (pendingImageLoads <= 0) {
      return;
    }

    const fallback = setTimeout(() => setPendingImageLoads(0), 6000);
    return () => clearTimeout(fallback);
  }, [pendingImageLoads]);

  const shouldShowSkeleton = pendingImageLoads > 0;

  return (
    <div className="space-y-6 p-4">
      <Breadcrumbs
        items={
          [
            ...sectionItems,
            { label: group?.name ?? "Grupo", to: "#" },
          ]
        }
      />

      {loading ? (
        <FormPageSkeleton className="px-0" fields={6} />
      ) : !group ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          Não foi possível localizar o grupo. Volte para a auditoria.
        </div>
      ) : (
        <>
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                {group.logo_url ? (
                  <ProtectedImage
                    src={group.logo_url}
                    alt={`Logo do grupo ${group.name}`}
                    className="h-full w-full object-contain p-2"
                    onReady={handleImageLoadComplete}
                    onFetchError={handleImageLoadComplete}
                  />
                ) : (
                  <img
                    src="/images/placeholderfoto.jpg"
                    alt={`Logo do grupo ${group.name}`}
                    className="h-full w-full object-contain p-2"
                  />
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p className="text-xs uppercase tracking-wide text-gray-400">Grupo</p>
                <p className="text-base font-semibold text-gray-900">{group.name}</p>
              </div>
            </div>
            {group.responsible ? (
              <p className="text-xs text-right text-gray-500">Responsável: {group.responsible}</p>
            ) : null}
          </header>

          <div className="relative">
            {shouldShowSkeleton && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-gray-200 bg-white/80 p-6">
                {companyView === "card" ? (
                  <CompanyCardsSkeleton />
                ) : (
                  <CompanyTableSkeleton rows={4} />
                )}
              </div>
            )}

            <section
              aria-hidden={shouldShowSkeleton}
              className={`space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-opacity ${
                shouldShowSkeleton ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <div className="space-y-2 border-b border-gray-100 pb-6 text-left">
                {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Empresas ({companies.length})</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
                      companyView === "card"
                        ? "border border-blue-600 bg-blue-50 text-blue-600"
                        : "border border-gray-200 text-gray-600"
                    }`}
                    onClick={() => setCompanyView("card")}
                  >
                    Cartões
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
                      companyView === "table"
                        ? "border border-blue-600 bg-blue-50 text-blue-600"
                        : "border border-gray-200 text-gray-600"
                    }`}
                    onClick={() => setCompanyView("table")}
                  >
                    Tabela
                  </button>
                </div>
              </div>

              {companies.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  Nenhuma empresa encontrada para este grupo.
                </div>
              ) : companyView === "card" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {companies.map((company, index) => {
                    const locationText = [company.city, company.state].filter(Boolean).join(" / ");

                    return (
                      <article
                        key={`${company.id ?? index}-${company.name ?? "empresa"}`}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate(`/backoffice/auditoria/empresa/${company.id}`, {
                            state: { company },
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(`/backoffice/auditoria/empresa/${company.id}`, {
                              state: { company },
                            });
                          }
                        }}
                        className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
                      >
                        <div className="flex aspect-square h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white">
                          {company.logo_url ? (
                            <ProtectedImage
                              src={company.logo_url}
                              alt={`Logo da empresa ${company.name}`}
                              className="h-full w-full object-contain p-2 transition-opacity duration-150 opacity-100"
                              onReady={handleImageLoadComplete}
                              onFetchError={handleImageLoadComplete}
                            />
                          ) : (
                            <img
                              src="/images/placeholderfoto.jpg"
                              alt={`Logo da empresa ${company.name}`}
                              className="h-full w-full object-contain p-2 transition-opacity duration-150 opacity-100"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {company.name ?? `Empresa ${company.id ?? index}`}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {company.cnpj ?? "CNPJ indisponível"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {locationText || "Localização indisponível"}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-900">Empresa</th>
                        <th className="px-4 py-3 font-medium text-gray-900">CNPJ</th>
                        <th className="px-4 py-3 font-medium text-gray-900">Localização</th>
                        <th className="px-4 py-3 font-medium text-gray-900">Responsável</th>
                        <th className="px-4 py-3 font-medium text-gray-900">Contato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {companies.map((company, index) => {
                        const locationText = [company.city, company.state].filter(Boolean).join(" / ");
                        const contactText = company.email ?? company.phone ?? "-";

                        return (
                          <tr
                            key={`${company.id ?? index}-${company.name ?? "empresa"}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {company.name ?? `Empresa ${company.id ?? index}`}
                            </td>
                            <td className="px-4 py-3">{company.cnpj ?? "—"}</td>
                            <td className="px-4 py-3">{locationText || "—"}</td>
                            <td className="px-4 py-3">{company.responsible ?? "—"}</td>
                            <td className="px-4 py-3">{contactText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
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
