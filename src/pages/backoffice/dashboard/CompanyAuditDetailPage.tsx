import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import ProtectedImage from "../../../components/Layout/ProtectedImage";
import Toast from "../../../components/Layout/Feedback/Toast";
import { getCompanyAuditDetail, type CompanyAuditDetail } from "../../../services/auditService";
import type { CompanyResponse } from "../../../services/companyService";

type ToastType = "success" | "error" | "info";
type TabKey = "documents" | "events" | "sectors" | "employees";

type LocationState = {
  company?: CompanyResponse;
};

const detailTabs: Array<{ key: TabKey; label: string }> = [
  { key: "documents", label: "Documentos da empresa" },
  { key: "events", label: "Eventos" },
  { key: "sectors", label: "Setores" },
  { key: "employees", label: "Funcionários" },
];

function CompanyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-14 w-14 rounded-xl bg-slate-200 skeleton-shimmer" />
        <div className="flex-1 space-y-2">
          <span className="h-3 w-3/5 rounded-full bg-slate-200 skeleton-shimmer" />
          <span className="h-2.5 w-1/3 rounded-full bg-slate-200 skeleton-shimmer" />
          <span className="h-2 w-1/4 rounded-full bg-slate-200 skeleton-shimmer" />
        </div>
        <span className="h-3 w-32 rounded-full bg-slate-200 skeleton-shimmer" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: detailTabs.length }).map((_, index) => (
          <span
            key={`tab-skeleton-${index}`}
            className="h-10 w-32 rounded-t-lg border-t-2 border-gray-200 bg-slate-200 skeleton-shimmer"
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`card-skeleton-${index}`}
            className="rounded-2xl border border-gray-200 bg-white/60 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="h-3 w-32 rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="h-3 w-12 rounded-full bg-slate-200 skeleton-shimmer" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <span className="h-3 w-full rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="h-3 w-full rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="h-3 w-5/6 rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="h-3 w-4/6 rounded-full bg-slate-200 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyAuditDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const location = useLocation();
  const stateCompany = (location.state as LocationState | null)?.company ?? null;

  const [detail, setDetail] = useState<CompanyAuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: ToastType }>({
    open: false,
    message: "",
    type: "info",
  });
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(() => stateCompany?.logo_url ?? null);
  const [pendingLogoLoads, setPendingLogoLoads] = useState(() =>
    stateCompany?.logo_url ? 1 : 0
  );
  const [activeTab, setActiveTab] = useState<TabKey>("documents");

  const companyDocuments = detail?.company_documents ?? [];
  const documentEntries = useMemo(() => {
    return companyDocuments.map((document) => ({
      id: document.id,
      name: document.document?.name ?? document.document_version?.code ?? "Documento",
      status: document.status ?? "—",
      issuance: document.emission_date,
      due: document.due_date,
      type: document.document?.type ?? "—",
      issuer: document.document?.issuer ?? "—",
      hasFile: Boolean(document.has_file),
    }));
  }, [companyDocuments]);

  const eventEntries = detail?.events ?? [];

  const [sectorView, setSectorView] = useState<"cards" | "table">("cards");
  const [sectorSearch, setSectorSearch] = useState("");
  const [sectorPage, setSectorPage] = useState(1);
  const [sectorPageSize, setSectorPageSize] = useState(5);

  const detailSectors = detail?.sectors ?? [];
  const filteredSectors = useMemo(() => {
    if (!sectorSearch.trim()) {
      return detailSectors;
    }

    const query = sectorSearch.trim().toLowerCase();
    return detailSectors.filter((sector) => (sector.name ?? "").toLowerCase().includes(query));
  }, [detailSectors, sectorSearch]);

  const sectorPageCount = Math.max(1, Math.ceil(filteredSectors.length / sectorPageSize));
  const paginatedSectors = filteredSectors.slice(
    (sectorPage - 1) * sectorPageSize,
    sectorPage * sectorPageSize
  );
  const sectorStartIndex = filteredSectors.length === 0 ? 0 : (sectorPage - 1) * sectorPageSize + 1;
  const sectorEndIndex = Math.min(filteredSectors.length, sectorPage * sectorPageSize);
  const sectorRangeText =
    filteredSectors.length === 0
      ? "Nenhum setor para mostrar."
      : `Mostrando ${sectorStartIndex}-${sectorEndIndex} de ${filteredSectors.length}`;


  useEffect(() => {
    setSectorSearch("");
    setSectorPage(1);
  }, [detail?.company.id]);

  useEffect(() => {
    if (sectorPage > sectorPageCount) {
      setSectorPage(sectorPageCount);
    }
  }, [sectorPage, sectorPageCount]);


  useEffect(() => {
    if (!companyId) {
      setError("Identificador da empresa indisponível.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let active = true;

    void getCompanyAuditDetail(Number(companyId))
      .then((data) => {
        if (!active) {
          return;
        }

        setDetail(data);
        const hasLogo = Boolean(data.company.logo_url);
        setCompanyLogoUrl(data.company.logo_url ?? null);
        setPendingLogoLoads(hasLogo ? 1 : 0);
      })
      .catch((err) => {
        console.error(err);
        const message = "Erro ao carregar os dados da empresa.";
        setError(message);
        setToast({ open: true, message, type: "error" });
        setDetail(null);
        setCompanyLogoUrl(stateCompany?.logo_url ?? null);
        setPendingLogoLoads(stateCompany?.logo_url ? 1 : 0);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [companyId, stateCompany?.logo_url]);



  useEffect(() => {
    if (pendingLogoLoads <= 0) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setPendingLogoLoads(0);
    }, 6000);

    return () => window.clearTimeout(fallback);
  }, [pendingLogoLoads]);

  const companyName = useMemo(() => {
    return detail?.company.name ?? stateCompany?.name ?? `Empresa ${companyId ?? ""}`;
  }, [detail?.company.name, stateCompany?.name, companyId]);

  const companyCnpj = detail?.company.cnpj ?? stateCompany?.cnpj;
  const shouldShowSkeleton = loading || pendingLogoLoads > 0;

  const handleLogoReady = () => {
    setPendingLogoLoads((prev) => Math.max(prev - 1, 0));
  };

  const breadcrumbItems = useMemo(() => {
    return [
      { label: "Dashboard", to: "/backoffice/dashboard" },
      { label: "Auditoria", to: "/backoffice/auditoria" },
      { label: companyName, to: "#" },
    ];
  }, [companyName]);

  const detailContent = error ? (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      {error}
    </div>
  ) : detail ? (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
            {companyLogoUrl ? (
              <ProtectedImage
                src={companyLogoUrl}
                alt={`Logo da empresa ${companyName}`}
                className="h-full w-full object-contain p-2"
                onReady={handleLogoReady}
                onFetchError={handleLogoReady}
              />
            ) : (
              <img
                src="/images/placeholderfoto.jpg"
                alt={`Logo da empresa ${companyName}`}
                className="h-full w-full object-contain p-2"
              />
            )}
          </div>
          <div className="text-sm text-gray-600">
            <p className="text-xs uppercase tracking-wide text-gray-400">Empresa</p>
            <p className="text-lg font-semibold text-gray-900">{companyName}</p>
            {companyCnpj ? <p className="text-xs text-gray-500">CNPJ: {companyCnpj}</p> : null}
          </div>
        </div>
        {detail.company.responsible ? (
          <p className="text-xs text-right text-gray-500">Responsável: {detail.company.responsible}</p>
        ) : null}
      </header>

      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-2">
            {detailTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 pt-6">
          {activeTab === "documents" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-400">Documentos</p>
                <span className="text-xs text-gray-400">{documentEntries.length} registro(s)</span>
              </div>
              <div className="space-y-3">
                {documentEntries.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum documento registrado.</p>
                ) : (
                  documentEntries.map((entry) => (
                    <article
                      key={`document-${entry.id}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{entry.name}</p>
                        <span className="text-[11px] text-gray-500 uppercase">{entry.status}</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Tipo: {entry.type} · Emissor: {entry.issuer}
                      </p>
                      <p className="text-xs text-gray-400">
                        Emissão: {entry.issuance ?? "—"} • Vencimento: {entry.due ?? "—"}
                      </p>
                      <p className="text-xs text-blue-600">
                        {entry.hasFile ? "Arquivo disponível" : "Nenhum arquivo vinculado"}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === "events" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-400">Eventos</p>
                <span className="text-xs text-gray-400">{eventEntries.length} registro(s)</span>
              </div>
              <div className="space-y-3">
                {eventEntries.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum evento registrado.</p>
                ) : (
                  eventEntries.map((event) => (
                    <article
                      key={`event-${event.id}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                        <span className="text-[11px] text-gray-500 uppercase">{event.event_type}</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Local: {event.location} · Responsável: {event.responsible}
                      </p>
                      <p className="text-xs text-gray-500">
                        Período: {event.start_date} até {event.end_date}
                      </p>
                      <p className="text-xs text-gray-500">
                        Papel: {event.role} · Inclusão: {event.joined_at}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === "sectors" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
                      sectorView === "cards"
                        ? "border border-blue-600 bg-blue-50 text-blue-600"
                        : "border border-gray-200 bg-white text-gray-600"
                    }`}
                    onClick={() => setSectorView("cards")}
                  >
                    Cartões
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
                      sectorView === "table"
                        ? "border border-blue-600 bg-blue-50 text-blue-600"
                        : "border border-gray-200 bg-white text-gray-600"
                    }`}
                    onClick={() => setSectorView("table")}
                  >
                    Tabela
                  </button>
                </div>
                <label className="w-full text-xs text-gray-500 sm:w-auto">
                  Buscar por setor
                  <input
                    type="search"
                    value={sectorSearch}
                    onChange={(event) => {
                      setSectorSearch(event.target.value);
                      setSectorPage(1);
                    }}
                    placeholder="Buscar setor"
                    className="mt-1 w-full min-w-[180px] rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>

              {filteredSectors.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum setor encontrado.</p>
              ) : sectorView === "cards" ? (
                <div className="space-y-3">
                  {filteredSectors.map((sector) => (
                    <article
                      key={`sector-${sector.company_sector_id}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{sector.name}</p>
                        <span className="text-[11px] text-gray-500">
                          {sector.employees.length} colaborador(es)
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-gray-600">
                        {sector.employees.map((employee) => (
                          <p key={`sector-employee-${employee.assignment_id}`}>
                            {employee.employee_name} · {employee.job_title} · 
                            <span className="capitalize">{employee.status}</span>
                          </p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white/80">
                    <table className="w-full text-left text-sm text-gray-500">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-2 font-medium text-gray-900">Setor</th>
                          <th scope="col" className="px-4 py-2 font-medium text-gray-900">Colaboradores</th>
                          <th scope="col" className="w-32 px-4 py-2 text-center font-medium text-gray-900">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSectors.map((sector) => (
                          <tr
                            key={`table-sector-${sector.company_sector_id}`}
                            className="border-b border-gray-200 bg-white last:border-b-0"
                          >
                            <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                              {sector.name}
                            </td>
                            <td className="px-4 py-2 text-gray-500">
                              {sector.employees.length} colaborador(es)
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              <button
                                type="button"
                                className="text-blue-600 underline-offset-2 transition hover:text-blue-700 hover:underline"
                                onClick={() => setActiveTab("employees")}
                              >
                                Ver funcionários
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-gray-500">{sectorRangeText}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-8 rounded border border-gray-300 px-2 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setSectorPage((prev) => Math.max(prev - 1, 1))}
                        disabled={sectorPage === 1}
                      >
                        Anterior
                      </button>
                      <span className="text-xs text-gray-600">
                        Página {sectorPage} de {sectorPageCount}
                      </span>
                      <button
                        type="button"
                        className="h-8 rounded border border-gray-300 px-2 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setSectorPage((prev) => Math.min(prev + 1, sectorPageCount))}
                        disabled={sectorPage === sectorPageCount}
                      >
                        Próxima
                      </button>
                      <select
                        className="h-8 rounded border border-gray-300 px-2 text-xs text-gray-700"
                        value={sectorPageSize}
                        onChange={(event) => {
                          const nextSize = Number(event.target.value);
                          setSectorPageSize(nextSize);
                          setSectorPage(1);
                        }}
                      >
                        {[5, 10, 25, 50].map((option) => (
                          <option key={`page-size-${option}`} value={option}>
                            {option}/página
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários</p>
                <span className="text-xs text-gray-400">{detail.employees.length} registro(s)</span>
              </div>
              <div className="space-y-3">
                {detail.employees.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum colaborador encontrado.</p>
                ) : (
                  detail.employees.map((employee) => (
                    <article
                      key={`employee-${employee.id}`}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                        <span className="text-[11px] text-gray-500">{employee.cpf}</span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                        <p>RG: {employee.rg}</p>
                        <p>Status: {employee.assignments[0]?.status ?? ""}</p>
                        <p>Função: {employee.assignments[0]?.job_title ?? ""}</p>
                        <p>Documentos: {employee.documents.length}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  ) : (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-sm text-gray-500">
      Nenhuma informação adicional disponível no momento.
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="relative">
        {shouldShowSkeleton && (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm">
            <CompanyDetailSkeleton />
          </div>
        )}
        <div
          className={`${shouldShowSkeleton ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          {detailContent}
        </div>
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
