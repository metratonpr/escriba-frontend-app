import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../components/Layout/FileViewer";
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

const getSearchLabel = (tab: TabKey) => {
  switch (tab) {
    case "documents":
      return "Buscar documento";
    case "events":
      return "Buscar evento";
    case "sectors":
      return "Buscar setor";
    case "employees":
      return "Buscar funcionário";
  }
};

function CompanyDetailSkeleton() {
  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              <span className="h-full w-full rounded-xl bg-slate-200 skeleton-shimmer" />
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <span className="block h-3 w-16 rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="block h-4 w-44 rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="block h-3 w-32 rounded-full bg-slate-200 skeleton-shimmer" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
            <span className="h-8 w-20 rounded-md bg-slate-200 skeleton-shimmer" />
            <span className="h-8 w-20 rounded-md bg-slate-200 skeleton-shimmer" />
          </div>
          <label className="w-full max-w-[260px] text-xs text-gray-500">
            <span className="block h-3 w-20 rounded-full bg-slate-200 skeleton-shimmer" />
            <span className="mt-1 block h-10 w-full rounded-md bg-slate-200 skeleton-shimmer" />
          </label>
        </div>
      </header>

      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-2">
            {detailTabs.map((tab) => (
              <span
                key={`tab-${tab.key}`}
                className="h-10 w-40 rounded-t-lg border-b-2 border-transparent bg-slate-200/80"
              />
            ))}
          </nav>
        </div>

        <div className="space-y-4 pt-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                <span className="h-8 w-20 rounded-md bg-slate-200 skeleton-shimmer" />
                <span className="h-8 w-20 rounded-md bg-slate-200 skeleton-shimmer" />
              </div>
              <div className="w-full text-xs text-gray-500 sm:w-auto">
                <span className="block h-3 w-28 rounded-full bg-slate-200 skeleton-shimmer" />
                <span className="mt-1 block h-10 w-full rounded-md bg-slate-200 skeleton-shimmer" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="h-3 w-24 rounded-full bg-slate-200 skeleton-shimmer" />
              <span className="h-3 w-16 rounded-full bg-slate-200 skeleton-shimmer" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <article
                  key={`skeleton-document-${index}`}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="h-4 w-32 rounded-full bg-slate-200 skeleton-shimmer" />
                    <span className="h-3 w-16 rounded-full bg-slate-200 skeleton-shimmer" />
                  </div>
                  <div className="mt-2 space-y-2 text-xs text-gray-500">
                    <span className="block h-3 w-44 rounded-full bg-slate-200 skeleton-shimmer" />
                    <span className="block h-3 w-40 rounded-full bg-slate-200 skeleton-shimmer" />
                    <span className="block h-3 w-32 rounded-full bg-slate-200 skeleton-shimmer" />
                    <span className="block h-3 w-24 rounded-full bg-slate-200 skeleton-shimmer" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CompanyAuditDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [globalSearch, setGlobalSearch] = useState("");

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
      uploadId: document.upload?.id ?? null,
      source: document,
    }));
  }, [companyDocuments]);

  const [selectedAttachment, setSelectedAttachment] = useState<{ fileId: number; fileName: string } | null>(null);
  const handleViewDocument = (document: CompanyDocumentAudit) => {
    if (!document.upload?.id) {
      return;
    }

    const fileName = document.upload.file_name ?? document.document?.name ?? "Documento";
    setSelectedAttachment({ fileId: document.upload.id, fileName });
  };

  const filteredDocumentEntries = useMemo(() => {
    if (!globalSearch.trim()) {
      return documentEntries;
    }

    const query = globalSearch.trim().toLowerCase();
    return documentEntries.filter((entry) => {
      const haystack = `${entry.name} ${entry.status} ${entry.type} ${entry.issuer}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [documentEntries, globalSearch]);

  const eventEntries = detail?.events ?? [];
  const filteredEventEntries = useMemo(() => {
    if (!globalSearch.trim()) {
      return eventEntries;
    }

    const query = globalSearch.trim().toLowerCase();
    return eventEntries.filter((event) => {
      const haystack = `${event.name} ${event.event_type} ${event.location} ${event.role}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [eventEntries, globalSearch]);
  const detailEmployees = detail?.employees ?? [];
  const filteredEmployees = useMemo(() => {
    if (!globalSearch.trim()) {
      return detailEmployees;
    }

    const query = globalSearch.trim().toLowerCase();
    return detailEmployees.filter((employee) => {
      const haystack = `${employee.name} ${employee.cpf} ${employee.rg}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [detailEmployees, globalSearch]);

  const [sectorSearch, setSectorSearch] = useState("");
  const [sectorPage, setSectorPage] = useState(1);
  const [sectorPageSize, setSectorPageSize] = useState(5);

  const handleGlobalSearchChange = (value: string) => {
    setGlobalSearch(value);
    setSectorPage(1);
  };

  const handleSectorSearchChange = (value: string) => {
    setSectorSearch(value);
    setSectorPage(1);
  };

  useEffect(() => {
    setGlobalSearch("");
    setSectorSearch("");
    setSectorPage(1);
  }, [activeTab]);

  const renderTabControls = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder = "Digite para filtrar ..."
  ) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
            viewMode === "cards"
              ? "border border-blue-600 bg-blue-50 text-blue-600"
              : "border border-gray-200 bg-white text-gray-600"
          }`}
          onClick={() => setViewMode("cards")}
        >
          Cartões
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
            viewMode === "table"
              ? "border border-blue-600 bg-blue-50 text-blue-600"
              : "border border-gray-200 bg-white text-gray-600"
          }`}
          onClick={() => setViewMode("table")}
        >
          Tabela
        </button>
      </div>
      <label className="w-full text-xs text-gray-500 sm:w-auto">
        {label}
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full min-w-[180px] rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>
    </div>
  );

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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
            {companyLogoUrl ? (
              <ProtectedImage
                src={companyLogoUrl}
                alt={`Logo da empresa ${companyName}`}
                className="h-full w-full object-contain p-2"
                onFetchError={handleLogoReady}
                onReady={handleLogoReady}
              />
            ) : (
                <img
                  src="/images/placeholderfoto.jpg"
                  alt={`Logo da empresa ${companyName}`}
                  className="h-full w-full object-contain p-2"
                  onLoad={handleLogoReady}
                  onError={handleLogoReady}
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
            <p className="text-xs text-gray-500">Responsável: {detail.company.responsible}</p>
          ) : null}
        </div>
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
              {renderTabControls(getSearchLabel("documents"), globalSearch, handleGlobalSearchChange)}
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-400">Documentos</p>
                <span className="text-xs text-gray-400">{filteredDocumentEntries.length} registro(s)</span>
              </div>
              {viewMode === "cards" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredDocumentEntries.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum documento registrado.</p>
                  ) : (
                    filteredDocumentEntries.map((entry) => (
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
                        {entry.hasFile ? (
                          <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                            <span>Arquivo disponível</span>
                            <button
                              type="button"
                              onClick={() => handleViewDocument(entry.source)}
                              aria-label={`Visualizar ${entry.name}`}
                              title="Visualizar arquivo"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-blue-600">Nenhum arquivo vinculado</p>
                        )}
                      </article>
                    ))
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-medium text-gray-900">Documento</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Status</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Tipo</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Emissor</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Vencimento</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Arquivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocumentEntries.map((entry) => (
                        <tr
                          key={`document-table-${entry.id}`}
                          className="border-b border-gray-200 bg-white last:border-b-0"
                        >
                          <td className="px-4 py-2 font-medium text-gray-900">{entry.name}</td>
                          <td className="px-4 py-2 text-xs text-gray-700 uppercase">{entry.status}</td>
                          <td className="px-4 py-2">{entry.type}</td>
                          <td className="px-4 py-2">{entry.issuer}</td>
                          <td className="px-4 py-2">{entry.due ?? "—"}</td>
                          <td className="px-4 py-2 text-xs">
                            {entry.uploadId ? (
                              <div className="flex items-center gap-2 text-blue-600">
                                <span>Arquivo disponível</span>
                                <button
                                  type="button"
                                  onClick={() => handleViewDocument(entry.source)}
                                  aria-label={`Visualizar ${entry.name}`}
                                  title="Visualizar arquivo"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-blue-600">Sem arquivo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === "events" ? (
            <div className="space-y-3">
              {renderTabControls(getSearchLabel("events"), globalSearch, handleGlobalSearchChange)}
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-400">Eventos</p>
                <span className="text-xs text-gray-400">{filteredEventEntries.length} registro(s)</span>
              </div>
              {viewMode === "cards" ? (
                <div className="space-y-3">
                  {filteredEventEntries.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum evento registrado.</p>
                  ) : (
                    filteredEventEntries.map((event) => (
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
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-medium text-gray-900">Evento</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Tipo</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Local</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Período</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Papel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventEntries.map((event) => (
                        <tr
                          key={`event-table-${event.id}`}
                          className="border-b border-gray-200 bg-white last:border-b-0"
                        >
                          <td className="px-4 py-2 font-medium text-gray-900">{event.name}</td>
                          <td className="px-4 py-2">{event.event_type}</td>
                          <td className="px-4 py-2">{event.location}</td>
                          <td className="px-4 py-2">
                            {event.start_date} até {event.end_date}
                          </td>
                          <td className="px-4 py-2">
                            {event.role} · {event.responsible}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === "sectors" ? (
            <div className="space-y-4">
              {renderTabControls("Buscar por setor", sectorSearch, handleSectorSearchChange, "Buscar setor")}

              {filteredSectors.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum setor encontrado.</p>
              ) : viewMode === "cards" ? (
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
              {renderTabControls(getSearchLabel("employees"), globalSearch, handleGlobalSearchChange)}
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários</p>
                <span className="text-xs text-gray-400">{filteredEmployees.length} registro(s)</span>
              </div>
              {viewMode === "cards" ? (
                <div className="space-y-3">
                  {filteredEmployees.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum colaborador encontrado.</p>
                  ) : (
                    filteredEmployees.map((employee) => (
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
                          <p>Status: {employee.assignments[0]?.status ?? "—"}</p>
                          <p>Função: {employee.assignments[0]?.job_title ?? "—"}</p>
                          <p>Documentos: {employee.documents.length}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80 text-xs">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-medium text-gray-900">Funcionário</th>
                        <th className="px-4 py-2 font-medium text-gray-900">CPF</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Função</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Status</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Documentos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={`employee-table-${employee.id}`}
                          className="border-b border-gray-200 bg-white last:border-b-0"
                        >
                          <td className="px-4 py-2 font-medium text-gray-900">{employee.name}</td>
                          <td className="px-4 py-2">{employee.cpf}</td>
                          <td className="px-4 py-2">{employee.assignments[0]?.job_title ?? "—"}</td>
                          <td className="px-4 py-2 uppercase">{employee.assignments[0]?.status ?? "—"}</td>
                          <td className="px-4 py-2">{employee.documents.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

      <div>
        {shouldShowSkeleton ? <CompanyDetailSkeleton /> : detailContent}
      </div>

      <Transition appear show={selectedAttachment !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedAttachment(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Dialog.Title className="sr-only">
                    {selectedAttachment?.fileName ?? "Visualizar documento"}
                  </Dialog.Title>

                  {selectedAttachment ? (
                    <FileViewer
                      embedded
                      fileId={selectedAttachment.fileId}
                      fileName={selectedAttachment.fileName}
                      onClose={() => setSelectedAttachment(null)}
                    />
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
