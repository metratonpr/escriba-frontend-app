import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import ProtectedImage from "../../../components/Layout/ProtectedImage";
import Toast from "../../../components/Layout/Feedback/Toast";
import FormPageSkeleton from "../../../components/Layout/ui/FormPageSkeleton";
import { getDashboardAudit, type CompanyGroupAuditSummary } from "../../../services/auditService";
import type { CompanyResponse } from "../../../services/companyService";

type ToastType = "success" | "error" | "info";

const sectionItems = [
  { label: "Dashboard", to: "/backoffice/dashboard" },
  { label: "Auditoria", to: "/backoffice/auditoria" },
];

type LocationState = {
  group?: CompanyGroupAuditSummary;
};

export default function GroupCompaniesPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [group, setGroup] = useState<CompanyGroupAuditSummary | null>(
    (location.state as LocationState | null)?.group ?? null
  );
  const [loading, setLoading] = useState(!Boolean(group));
  const [toast, setToast] = useState<{ open: boolean; message: string; type: ToastType }>({
    open: false,
    message: "",
    type: "info",
  });

  const companies = useMemo<CompanyResponse[]>(() => (group?.companies ?? []) as CompanyResponse[], [
    group,
  ]);

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

  const goBackToAudit = () => {
    navigate("/backoffice/auditoria");
  };

  return (
    <div className="space-y-6 p-4">
      <Breadcrumbs
        items={[
          ...sectionItems,
          { label: group?.name ?? "Grupo", to: "#" },
        ]}
      />

      {loading ? (
        <FormPageSkeleton className="px-0" fields={6} />
      ) : !group ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          Não foi possível localizar o grupo. Volte para a auditoria.
        </div>
      ) : (
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 border-b border-gray-100 pb-6 text-center">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {group.logo_url ? (
                <ProtectedImage
                  src={group.logo_url}
                  alt={`Logo do grupo ${group.name}`}
                  className="h-full w-full object-contain p-4 transition-opacity duration-150 opacity-100"
                />
              ) : (
                <img
                  src="/images/placeholderfoto.jpg"
                  alt={`Logo do grupo ${group.name}`}
                  className="h-full w-full object-contain p-4"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
              {group.description && (
                <p className="mt-1 text-sm text-gray-500">{group.description}</p>
              )}
              {group.responsible && (
                <p className="text-xs text-gray-400">
                  Responsável: {group.responsible}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={goBackToAudit}
              className="mt-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
            >
              Voltar para auditoria
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-500">Empresas ({companies.length})</p>
            </div>

            {companies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                Nenhuma empresa encontrada para este grupo.
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
          </div>
        </section>
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
