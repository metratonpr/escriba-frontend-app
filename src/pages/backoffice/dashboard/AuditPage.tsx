import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import DashboardSectionCard from "../../../components/dashboard/DashboardSectionCard";
import FormPageSkeleton from "../../../components/Layout/ui/FormPageSkeleton";
import ProtectedImage from "../../../components/Layout/ProtectedImage";
import Toast from "../../../components/Layout/Feedback/Toast";
import { getDashboardAudit, type CompanyGroupAuditSummary } from "../../../services/auditService";

type ToastType = "success" | "error" | "info";

export default function AuditPage() {
  const [groups, setGroups] = useState<CompanyGroupAuditSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: ToastType }>({
    open: false,
    message: "",
    type: "info",
  });
  const [failedLogos, setFailedLogos] = useState<Record<number, boolean>>({});
  const [pendingLogoLoads, setPendingLogoLoads] = useState(0);
  const navigate = useNavigate();

  const handleGroupNavigation = (group: CompanyGroupAuditSummary) => {
    navigate(`/backoffice/auditoria/grupo/${group.id}`, {
      state: { group },
    });
  };

  const handleGroupLogoStatus = useCallback(
    (groupId: number, status: "success" | "error") => {
      setPendingLogoLoads((prev) => Math.max(prev - 1, 0));

      if (status === "error") {
        setFailedLogos((prev) => ({ ...prev, [groupId]: true }));
        return;
      }

      setFailedLogos((prev) => {
        if (!prev[groupId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[groupId];
        return next;
      });
    },
    []
  );

  useEffect(() => {
    const loadAudit = async () => {
      setLoading(true);

      try {
        const response = await getDashboardAudit();
        const section =
          response.items?.find((item) => item.key === "company_groups_with_companies") ??
          response.items?.[0];
        const nextGroups = section?.data ?? [];
        const logoCount = nextGroups.filter((item) => item.has_logo && item.logo_url).length;

        setGroups(nextGroups);
        setFailedLogos({});
        setPendingLogoLoads(logoCount);
      } catch (error) {
        let message = "Erro ao carregar auditoria.";

        if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
          message = error.response.data.message;
        }

        setToast({
          open: true,
          message,
          type: "error",
        });
        setPendingLogoLoads(0);
      } finally {
        setLoading(false);
      }
    };

    void loadAudit();
  }, []);

  useEffect(() => {
    if (pendingLogoLoads <= 0) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setPendingLogoLoads(0);
    }, 6000);

    return () => window.clearTimeout(fallback);
  }, [pendingLogoLoads]);

  const sectionTitle = useMemo(() => {
    if (!groups.length) {
      return "Auditoria";
    }

    return "Grupos com empresas ativas";
  }, [groups.length]);

  const shouldShowSkeleton = loading || pendingLogoLoads > 0;

  return (
    <div className="space-y-6 p-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/backoffice/dashboard" },
          { label: "Auditoria", to: "#" },
        ]}
      />

      <DashboardSectionCard title="Auditoria" subtitle="Registros e rastreabilidade">
        <div className="relative min-h-[300px]">
          {shouldShowSkeleton && (
            <div className="absolute inset-0 flex flex-col justify-center">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-items-center px-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <article
                    key={`skeleton-${index}`}
                    className="flex w-full max-w-[210px] flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex aspect-square h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-100">
                      <div className="h-full w-full rounded-xl bg-gray-200 opacity-70" />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      <span className="h-3 w-5/6 rounded bg-gray-200 opacity-70" />
                      <span className="h-3 w-4/6 rounded bg-gray-200 opacity-70" />
                      <span className="h-3 w-3/5 rounded bg-gray-200 opacity-70" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {!groups.length ? (
            <p
              className={`text-sm text-gray-500 ${
                shouldShowSkeleton ? "opacity-0" : "opacity-100"
              }`}
            >
              Nenhum grupo com empresas encontradas.
            </p>
          ) : (
            <section
              aria-label={sectionTitle}
              aria-hidden={shouldShowSkeleton}
              className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-items-center ${
                shouldShowSkeleton ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              {groups.map((group) => (
                <article
                  key={group.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleGroupNavigation(group)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleGroupNavigation(group);
                    }
                  }}
                  className="flex w-full max-w-[220px] flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    {group.has_logo && group.logo_url && !failedLogos[group.id] ? (
                      <ProtectedImage
                        src={group.logo_url}
                        alt={`Logo do grupo ${group.name}`}
                        className="h-full w-full object-contain p-4 transition-opacity duration-150 opacity-100"
                        onReady={(status) => handleGroupLogoStatus(group.id, status)}
                        onFetchError={() => handleGroupLogoStatus(group.id, "error")}
                      />
                    ) : (
                      <img
                        src="/images/placeholderfoto.jpg"
                        alt={`Logo placeholder do grupo ${group.name}`}
                        className="h-full w-full object-contain p-4"
                      />
                    )}
                  </div>

                  <h2 className="text-base font-semibold text-gray-900 text-center">{group.name}</h2>
                </article>
              ))}
            </section>
          )}
        </div>
      </DashboardSectionCard>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
