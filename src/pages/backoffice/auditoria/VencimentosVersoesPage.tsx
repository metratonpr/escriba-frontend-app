import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import {
  getDocumentVersionExpirationList,
  type AuditDocumentVersionExpirationItem,
} from "../../../services/auditDocumentVersionService";
import dayjs from "dayjs";

const DUE_FILTER_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "30 dias", value: 30 },
  { label: "60 dias", value: 60 },
  { label: "90 dias", value: 90 },
  { label: "Acima de 90 dias", value: 365 },
];

const statusBadgeClass = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "pendente":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "enviado":
      return "bg-sky-100 text-sky-800 border border-sky-200";
    case "aprovado":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "rejeitado":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const timelineBadgeClass = (days: number) => {
  if (days <= 0) {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (days <= 30) {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  if (days <= 60) {
    return "bg-amber-100 text-amber-800 border border-amber-200";
  }

  if (days <= 90) {
    return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  }

  return "bg-blue-100 text-blue-700 border border-blue-200";
};

const formatDate = (value?: string) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD/MM/YYYY") : "—";

const computeDueInfo = (item: AuditDocumentVersionExpirationItem) => {
  const updated = dayjs(item.updated_at);
  const dueDate = updated.add(item.validity_days ?? 0, "day");
  const daysUntilDue = Math.ceil(dueDate.diff(dayjs(), "day"));
  return { dueDate, daysUntilDue };
};

export default function VencimentosVersoesPage() {
  const latestRequestRef = useRef(0);
  const [filters, setFilters] = useState({
    query: "",
    days: 30,
    page: 1,
    perPage: 25,
  });
  const [data, setData] = useState<
    Awaited<ReturnType<typeof getDocumentVersionExpirationList>> | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" | "info" }>({
    open: false,
    message: "",
    type: "info",
  });

  const loadData = useCallback(async (nextFilters: typeof filters) => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    setLoading(true);
    try {
      const response = await getDocumentVersionExpirationList({
        query: nextFilters.query.trim() || undefined,
        days: nextFilters.days,
        page: nextFilters.page,
        perPage: nextFilters.perPage,
      });

      if (requestId !== latestRequestRef.current) {
        return;
      }

      setData(response);
    } catch (error) {
      if (requestId !== latestRequestRef.current) {
        return;
      }

      console.error(error);
      setToast({ open: true, message: "Não foi possível carregar os vencimentos.", type: "error" });
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadData(filters);
  }, [filters, loadData]);

  const totalPages = useMemo(() => {
    if (!data) {
      return 1;
    }
    return Math.max(1, Math.ceil(data.total / filters.perPage));
  }, [data, filters.perPage]);

  const handleQueryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, query: value, page: 1 }));
  };

  const handleDaysChange = (days: number) => {
    setFilters((prev) => ({ ...prev, days, page: 1 }));
  };

  const handlePageChange = (delta: number) => {
    setFilters((prev) => {
      const nextPage = Math.min(totalPages, Math.max(1, prev.page + delta));
      return { ...prev, page: nextPage };
    });
  };

  return (
    <div className="space-y-6 p-4">
      <Breadcrumbs
        items={[
          { label: "Auditoria", to: "/backoffice/dashboard/auditoria" },
          { label: "Vencimentos de versões", to: "#" },
        ]}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Vencimentos de versões</p>
            <p className="text-lg font-semibold text-gray-900">Controle das versões próximas do vencimento</p>
          </div>
          <label className="w-full max-w-[320px] text-xs text-gray-500">
            Buscar por documento, código ou status
            <input
              type="search"
              value={filters.query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Ex.: CT-001, Cartão, pendente..."
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Janela (dias)</span>
          {DUE_FILTER_OPTIONS.map((option) => (
            <button
              key={`days-${option.value}`}
              type="button"
              onClick={() => handleDaysChange(option.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                filters.days === option.value
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="text-xs text-gray-400">
            exibindo versões com vencimento até{" "}
            {
              DUE_FILTER_OPTIONS.find((option) => option.value === filters.days)?.label ??
              `${filters.days} dias`
            }
          </span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white/80 text-xs">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Documento</th>
                <th className="px-3 py-2">Versão</th>
                <th className="px-3 py-2">Descrição</th>
                <th className="px-3 py-2">Atualização</th>
                <th className="px-3 py-2">Vencimento</th>
                <th className="px-3 py-2 text-center">Dias</th>
                <th className="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {!data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-gray-500">
                    {loading ? "Carregando registros..." : "Nenhuma versão encontrada para os filtros selecionados."}
                  </td>
                </tr>
              ) : (
                data.data.map((item) => {
                  const { dueDate, daysUntilDue } = computeDueInfo(item);
                  return (
                    <tr
                      key={`version-${item.document_version_id}-${item.document_id}`}
                      className="border-b border-gray-100 bg-white last:border-b-0"
                    >
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-gray-900">{item.document_name}</p>
                        <p className="text-xs text-gray-500">Código: {item.document_code}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-gray-900">{item.version}</p>
                        <p className="text-xs text-gray-500">Versão {item.document_version_code}</p>
                      </td>
                      <td className="px-3 py-3">{item.description ?? "—"}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-gray-900">{formatDate(item.updated_at)}</p>
                        <p className="text-[11px] text-gray-500">Validade {item.validity_days} dias</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-gray-900">{formatDate(dueDate.toISOString())}</p>
                        <p className="text-[11px] text-gray-500">baseado em atualização + validade</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${timelineBadgeClass(
                            daysUntilDue
                          )}`}
                        >
                          {daysUntilDue >= 0 ? `${daysUntilDue} dias` : "Vencido"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{data ? `Mostrando ${data.data.length} de ${data.total} registros.` : "—"}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(-1)}
              disabled={filters.page <= 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span>
              Página {filters.page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={!data || filters.page >= totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>

        <Toast
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />
      </section>
    </div>
  );
}
