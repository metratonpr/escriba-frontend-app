import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../components/Layout/FileViewer";
import ProtectedImage from "../../../components/Layout/ProtectedImage";
import Toast from "../../../components/Layout/Feedback/Toast";
import MediaUploadViewer, { type MediaUploadItem } from "../../../components/media/MediaUploadViewer";
import {
  getCompanyAuditDetail,
  type CompanyAuditDetail,
  type CompanyEmployeeAudit,
  type CompanyDocumentAudit,
} from "../../../services/auditService";
import { getEventById, type Event } from "../../../services/eventService";
import type { CompanyResponse } from "../../../services/companyService";
import dayjs from "dayjs";
import { formatCurrency } from "../../../utils/formatUtils";

type ToastType = "success" | "error" | "info";
type TabKey = "costs" | "documents" | "events" | "sectors" | "employees";

type LocationState = {
  company?: CompanyResponse;
};

const detailTabs: Array<{ key: TabKey; label: string }> = [
  { key: "costs", label: "Custos" },
  { key: "documents", label: "Documentos da empresa" },
  { key: "events", label: "Eventos" },
  { key: "sectors", label: "Setores" },
  { key: "employees", label: "Funcionários" },
];

const getSearchLabel = (tab: TabKey) => {
  switch (tab) {
    case "costs":
      return "Buscar custo";
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

const resolveEventTypeLabel = (
  value?: string | { id?: string | number; nome_tipo_evento?: string; descricao?: string; name?: string } | null
) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object") {
    return value.nome_tipo_evento ?? value.descricao ?? value.name ?? "Evento";
  }

  return "Evento";
};

const assignmentStatusClass = (status?: string) => {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized.includes("ferias")) {
    return "bg-amber-100 text-amber-800";
  }

  if (normalized.includes("afastado")) {
    return "bg-yellow-100 text-yellow-800";
  }

  if (normalized.includes("desligado")) {
    return "bg-red-100 text-red-800";
  }

  return "bg-green-100 text-green-800";
};

const categorizeDocumentDue = (due?: string | null) => {
  if (!due || !dayjs(due).isValid()) {
    return "Sem vencimento";
  }

  const diff = dayjs(due).diff(dayjs(), "day");
  if (diff < 0) {
    return "Vencido";
  }

  if (diff <= 30) {
    return "Até 30 dias";
  }

  if (diff <= 60) {
    return "31 a 60 dias";
  }

  if (diff <= 90) {
    return "61 a 90 dias";
  }

  return "Acima de 90 dias";
};

const documentDueBadgeClass = (category?: string) => {
  switch (category) {
    case "Vencido":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Até 30 dias":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "31 a 60 dias":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "61 a 90 dias":
      return "bg-sky-100 text-sky-700 border border-sky-200";
    case "Acima de 90 dias":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const parseCostValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replace(",", "."));

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getEmployeeDocumentCost = (employee: CompanyEmployeeAudit) =>
  (employee.documents ?? []).reduce((total, document) => total + parseCostValue(document.cost), 0);

const getEmployeeMedicalExamCost = (employee: CompanyEmployeeAudit) =>
  (employee.medical_exams ?? []).reduce((total, exam) => total + parseCostValue(exam.cost), 0);

const getEmployeeEpiCost = (employee: CompanyEmployeeAudit) =>
  (employee.epi_deliveries ?? []).reduce(
    (deliveryTotal, delivery) =>
      deliveryTotal +
      (delivery.items ?? []).reduce(
        (itemTotal, item) => itemTotal + parseCostValue(item.cost) * Math.max(item.quantity ?? 0, 0),
        0
      ),
    0
  );

function CompanyDetailSkeleton() {
  const companyCostSummary = {
    companyDocumentCost: 0,
    employeeDocumentCost: 0,
    employeeEpiCost: 0,
    employeeOtherCost: 0,
    total: 0,
  };

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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Empresa · Documentos</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.companyDocumentCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários · Documentos</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.employeeDocumentCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários · EPIs</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.employeeEpiCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários · Outros</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.employeeOtherCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-wide text-blue-500">Total monitorado</p>
              <p className="mt-2 text-lg font-semibold text-blue-700">
                {formatCurrency(companyCostSummary.total)}
              </p>
            </article>
            </div>
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
    </section>
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
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedEventEntry, setSelectedEventEntry] = useState<
    CompanyAuditDetail["events"][number] | null
  >(null);
  const [eventDetail, setEventDetail] = useState<Event | null>(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetailError, setEventDetailError] = useState<string | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<CompanyEmployeeAudit | null>(null);
  const companyDocuments = detail?.company_documents ?? [];
  const documentEntries = useMemo(() => {
    return companyDocuments.map((document) => ({
      id: document.id,
      name: document.document?.name ?? document.document_version?.code ?? "Documento",
      status: document.status ?? "—",
      issuance: document.emission_date,
      due: document.due_date,
      cost: document.cost,
      paidByCompany: !!document.paid_by_company,
      type: document.document?.type ?? "—",
      issuer: document.document?.issuer ?? "—",
      hasFile: Boolean(document.has_file),
      uploadId: document.upload?.id ?? null,
      source: document,
    }));
  }, [companyDocuments]);

  const [selectedAttachment, setSelectedAttachment] = useState<{ fileId: number; fileName: string } | null>(null);
  const openFileViewer = (uploadId: number, fileName?: string) => {
    setSelectedAttachment({ fileId: uploadId, fileName: fileName ?? "Documento" });
  };

  const handleViewDocument = (document: CompanyDocumentAudit) => {
    if (!document.upload?.id) {
      return;
    }

    const fileName = document.upload.file_name ?? document.document?.name ?? "Documento";
    openFileViewer(document.upload.id, fileName);
  };

  const handleViewEmployeeDocument = (document: CompanyDocumentAudit) => {
    if (!document.upload?.id || document.has_file !== true) {
      return;
    }

    const fileName = document.upload.file_name ?? document.document?.name ?? "Documento";
    openFileViewer(document.upload.id, fileName);
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
      const eventTypeLabel = resolveEventTypeLabel(event.event?.event_type ?? event.event_type);
      const haystack = `${event.name} ${eventTypeLabel} ${event.location} ${event.role}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [eventEntries, globalSearch]);

  const detailEmployees = detail?.employees ?? [];
  const companyCostSummary = useMemo(() => {
    const companyDocumentCost = companyDocuments.reduce(
      (total, document) => total + parseCostValue(document.cost),
      0
    );
    const employeeDocumentCost = detailEmployees.reduce(
      (total, employee) => total + getEmployeeDocumentCost(employee),
      0
    );
    const employeeEpiCost = detailEmployees.reduce(
      (total, employee) => total + getEmployeeEpiCost(employee),
      0
    );
    const employeeOtherCost = detailEmployees.reduce(
      (total, employee) => total + getEmployeeMedicalExamCost(employee),
      0
    );

    return {
      companyDocumentCost,
      employeeDocumentCost,
      employeeEpiCost,
      employeeOtherCost,
      total:
        companyDocumentCost +
        employeeDocumentCost +
        employeeEpiCost +
        employeeOtherCost,
    };
  }, [companyDocuments, detailEmployees]);
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

  const employeeDocumentBuckets = useMemo(() => {
    const counts = {
      upTo30: 0,
      upTo60: 0,
      upTo90: 0,
      above90: 0,
    };

    (selectedEmployee?.documents ?? []).forEach((document) => {
      if (!document.due_date || !dayjs(document.due_date).isValid()) {
        return;
      }

      const diff = dayjs(document.due_date).diff(dayjs(), "day");
      if (diff <= 30) {
        counts.upTo30 += 1;
      } else if (diff <= 60) {
        counts.upTo60 += 1;
      } else if (diff <= 90) {
        counts.upTo90 += 1;
      } else {
        counts.above90 += 1;
      }
    });

    return counts;
  }, [selectedEmployee]);

  const employeesById = useMemo<Record<number, CompanyEmployeeAudit>>(() => {
    const map: Record<number, CompanyEmployeeAudit> = {};
    detailEmployees.forEach((employee) => {
      map[employee.id] = employee;
    });
    return map;
  }, [detailEmployees]);

  const [sectorSearch, setSectorSearch] = useState("");
  const [sectorPage, setSectorPage] = useState(1);
  const [sectorPageSize, setSectorPageSize] = useState(5);

  const handleGlobalSearchChange = (value: string) => {
    setGlobalSearch(value);
    setSectorPage(1);
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "—";
    }

    return dayjs(value).isValid() ? dayjs(value).format("DD/MM/YYYY") : "—";
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return "—";
    }

    return dayjs(value).isValid() ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";
  };

  const handleSectorSearchChange = (value: string) => {
    setSectorSearch(value);
    setSectorPage(1);
  };

  const handleOpenEmployeeModal = (employeeId: number) => {
    const employee = employeesById[employeeId];
    if (!employee) {
      return;
    }

    setSelectedEmployee(employee);
  };

  const handleCloseEmployeeModal = () => {
    setSelectedEmployee(null);
  };

  const handleOpenEventModal = (event: CompanyAuditDetail["events"][number]) => {
    setSelectedEventEntry(event);
  };

  const handleCloseEventModal = () => {
    setSelectedEventEntry(null);
    setEventDetail(null);
    setEventDetailError(null);
    setEventDetailLoading(false);
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
    if (!selectedEventEntry) {
      setEventDetail(null);
      setEventDetailError(null);
      setEventDetailLoading(false);
      return;
    }

    let active = true;

    const fetchEventDetail = async () => {
      setEventDetailLoading(true);
      setEventDetailError(null);
      setEventDetail(null);

      try {
        const eventData = await getEventById(String(selectedEventEntry.event_id));
        if (active) {
          setEventDetail(eventData);
        }
      } catch (err) {
        if (active) {
          setEventDetailError("Não foi possível carregar os detalhes do evento.");
        }
      } finally {
        if (active) {
          setEventDetailLoading(false);
        }
      }
    };

    void fetchEventDetail();

    return () => {
      active = false;
    };
  }, [selectedEventEntry]);

  const displayEvent = eventDetail ?? selectedEventEntry?.event ?? null;
  const displayEventTypeLabel = resolveEventTypeLabel(
    displayEvent?.event_type ?? selectedEventEntry?.event?.event_type ?? selectedEventEntry?.event_type
  );

  const eventMediaItems = useMemo<MediaUploadItem[]>(() => {
    const remoteMedia =
      eventDetail?.media ??
      selectedEventEntry?.event?.media ??
      [];

    return remoteMedia
      .filter((media) => media.has_file === true)
      .map((media) => ({
        id: `modal-${media.id}`,
        name: media.original_name,
        previewUrl: media.url,
        remoteUrl: media.url,
        mimeType: media.mime_type,
        sizeBytes: media.size_bytes ?? undefined,
      }));
  }, [eventDetail, selectedEventEntry]);

  const attendanceRecords =
    eventDetail?.attendance_list ?? selectedEventEntry?.event?.attendance_list ?? [];
  const attendancePresentCount = attendanceRecords.filter((record) => record.present).length;


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
          {activeTab === "costs" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Empresa · Documentos</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.companyDocumentCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários · Documentos</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.employeeDocumentCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários · EPIs</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.employeeEpiCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Funcionários · Outros</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatCurrency(companyCostSummary.employeeOtherCost)}
              </p>
            </article>
            <article className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-wide text-blue-500">Total monitorado</p>
              <p className="mt-2 text-lg font-semibold text-blue-700">
                {formatCurrency(companyCostSummary.total)}
              </p>
            </article>
            </div>
          ) : null}
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
                          Emissão: {formatDate(entry.issuance)} • Vencimento: {formatDate(entry.due)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Custo: {formatCurrency(entry.cost ?? 0)} · Pago empresa: {entry.paidByCompany ? "Sim" : "Não"}
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
                        <th className="px-4 py-2 font-medium text-gray-900">Custo</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Pago empresa</th>
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
                          <td className="px-4 py-2">{formatCurrency(entry.cost ?? 0)}</td>
                          <td className="px-4 py-2">{entry.paidByCompany ? "Sim" : "Não"}</td>
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
                filteredEventEntries.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum evento registrado.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredEventEntries.map((event) => {
                      const eventTypeLabel = resolveEventTypeLabel(
                        event.event?.event_type ?? event.event_type
                      );
                      return (
                        <article
                          key={`event-${event.id}`}
                          className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                            <span className="text-[11px] text-gray-500 uppercase">{eventTypeLabel}</span>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Local: {event.location} · Responsável: {event.responsible}
                          </p>
                          <p className="text-xs text-gray-500">
                            Período: {formatDate(event.start_date)} até {formatDate(event.end_date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Papel: {event.role} · Inclusão: {formatDateTime(event.joined_at)}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wide text-gray-400">
                              Cadastrado em {dayjs(event.joined_at).format("DD/MM/YYYY")}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEventModal(event)}
                              className="inline-flex items-center gap-2 rounded-md border border-blue-600 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              <Eye className="h-3 w-3" />
                              Ver evento
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )
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
                        <th className="px-4 py-2 font-medium text-gray-900 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEventEntries.map((event) => {
                        const eventTypeLabel = resolveEventTypeLabel(
                          event.event?.event_type ?? event.event_type
                        );
                        return (
                          <tr
                            key={`event-table-${event.id}`}
                            className="border-b border-gray-200 bg-white last:border-b-0"
                          >
                            <td className="px-4 py-2 font-medium text-gray-900">{event.name}</td>
                            <td className="px-4 py-2">{eventTypeLabel}</td>
                            <td className="px-4 py-2">{event.location}</td>
                            <td className="px-4 py-2">
                              {event.start_date} até {event.end_date}
                            </td>
                            <td className="px-4 py-2">
                              {event.role} · {event.responsible}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenEventModal(event)}
                                className="inline-flex items-center gap-1 rounded-md border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3" />
                                Detalhes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
                      <div className="mt-3 space-y-3 text-xs text-gray-600">
                        {sector.employees.map((employee) => (
                          <div
                            key={`sector-employee-${employee.assignment_id}`}
                            className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-gray-200 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {employee.employee_name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {employee.job_title} · {formatDate(employee.start_date)}
                                {employee.end_date ? ` até ${formatDate(employee.end_date)}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`rounded-full border px-2 py-0.5 uppercase tracking-wide text-[11px] ${assignmentStatusClass(
                                  employee.status
                                )}`}
                              >
                                {employee.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenEmployeeModal(employee.employee_id)}
                                className="rounded-md border border-blue-600 px-2 py-0.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                              >
                                Detalhes
                              </button>
                            </div>
                          </div>
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
                          className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                              <p className="text-[11px] text-gray-500">CPF: {employee.cpf}</p>
                            </div>
                            <span className="text-[11px] text-gray-500">
                              {employee.assignments[0]?.status ?? "—"}
                            </span>
                          </div>
                          <div className="mt-2 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                            <p>RG: {employee.rg}</p>
                            <p>Função: {employee.assignments[0]?.job_title ?? "—"}</p>
                            <p>Status do contrato: {employee.assignments[0]?.status ?? "—"}</p>
                            <p>Documentos: {employee.documents.length}</p>
                            <p>Custos docs: {formatCurrency(getEmployeeDocumentCost(employee))}</p>
                            <p>Custos EPIs: {formatCurrency(getEmployeeEpiCost(employee))}</p>
                            <p>Outros: {formatCurrency(getEmployeeMedicalExamCost(employee))}</p>
                            <p>
                              Total: {formatCurrency(
                                getEmployeeDocumentCost(employee) +
                                  getEmployeeEpiCost(employee) +
                                  getEmployeeMedicalExamCost(employee)
                              )}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenEmployeeModal(employee.id)}
                              className="inline-flex items-center gap-2 rounded-md border border-blue-600 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              <Eye className="h-3 w-3" />
                              Ver detalhes
                            </button>
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
                        <th className="px-4 py-2 font-medium text-gray-900">Docs</th>
                        <th className="px-4 py-2 font-medium text-gray-900">EPIs</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Outros</th>
                        <th className="px-4 py-2 font-medium text-gray-900">Total</th>
                        <th className="px-4 py-2 font-medium text-gray-900 text-center">Ação</th>
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
                          <td className="px-4 py-2">{formatCurrency(getEmployeeDocumentCost(employee))}</td>
                          <td className="px-4 py-2">{formatCurrency(getEmployeeEpiCost(employee))}</td>
                          <td className="px-4 py-2">{formatCurrency(getEmployeeMedicalExamCost(employee))}</td>
                          <td className="px-4 py-2">
                            {formatCurrency(
                              getEmployeeDocumentCost(employee) +
                                getEmployeeEpiCost(employee) +
                                getEmployeeMedicalExamCost(employee)
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEmployeeModal(employee.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                              <Eye className="h-3 w-3" />
                              Detalhes
                            </button>
                          </td>
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

      <Transition appear show={Boolean(selectedEmployee)} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseEmployeeModal}>
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
                <Dialog.Panel className="h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                          {selectedEmployee?.name ?? "Funcionário"}
                        </Dialog.Title>
                        <p className="text-xs text-gray-500">
                          CPF: {selectedEmployee?.cpf ?? "—"} · RG: {selectedEmployee?.rg ?? "—"}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${assignmentStatusClass(
                            selectedEmployee?.assignments[0]?.status
                          )}`}
                        >
                          {selectedEmployee?.assignments[0]?.status ?? "Situação desconhecida"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseEmployeeModal}
                        className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        Fechar
                      </button>
                    </div>
                    <div className="overflow-y-auto px-6 py-6">
                      {selectedEmployee ? (
                        <div className="space-y-6">
                          <section className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900">Informações gerais</h4>
                            <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-gray-400">CPF</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {selectedEmployee.cpf ?? "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">RG</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {selectedEmployee.rg ?? "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Último status</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {selectedEmployee.assignments[0]?.status ?? "—"}
                                </p>
                              </div>
                            </div>
                          </section>

                          <section className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">Custos</h4>
                              <span className="text-xs text-gray-500">Resumo por categoria</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-wide text-gray-400">Documentos</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatCurrency(getEmployeeDocumentCost(selectedEmployee))}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-wide text-gray-400">EPIs</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatCurrency(getEmployeeEpiCost(selectedEmployee))}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-wide text-gray-400">Outros</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                  {formatCurrency(getEmployeeMedicalExamCost(selectedEmployee))}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                                <p className="text-[11px] uppercase tracking-wide text-blue-500">Total</p>
                                <p className="mt-1 text-sm font-semibold text-blue-700">
                                  {formatCurrency(
                                    getEmployeeDocumentCost(selectedEmployee) +
                                      getEmployeeEpiCost(selectedEmployee) +
                                      getEmployeeMedicalExamCost(selectedEmployee)
                                  )}
                                </p>
                              </div>
                            </div>
                          </section>

                          <section className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">Contratos e atribuições</h4>
                              <span className="text-xs text-gray-500">
                                {selectedEmployee.assignments.length} registro(s)
                              </span>
                            </div>
                            {selectedEmployee.assignments.length === 0 ? (
                              <p className="text-sm text-gray-500">Nenhum contrato registrado.</p>
                            ) : (
                              <ul className="space-y-2">
                                {selectedEmployee.assignments.map((assignment) => (
                                  <li
                                    key={`assignment-${assignment.id}`}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {assignment.job_title}
                                      </p>
                                      <p className="text-[11px] text-gray-500">
                                        {formatDate(assignment.start_date)}
                                        {assignment.end_date
                                          ? ` até ${formatDate(assignment.end_date)}`
                                          : " (em andamento)"}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${assignmentStatusClass(
                                        assignment.status
                                      )}`}
                                    >
                                      {assignment.status ?? "—"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </section>

                          <section className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">Documentos e exames</h4>
                              <span className="text-xs text-gray-500">
                                {selectedEmployee.documents.length} documento(s)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-gray-500">
                              <span className="rounded-full border border-gray-200 px-2 py-1">
                                Até 30 dias: {employeeDocumentBuckets.upTo30}
                              </span>
                              <span className="rounded-full border border-gray-200 px-2 py-1">
                                31 a 60 dias: {employeeDocumentBuckets.upTo60}
                              </span>
                              <span className="rounded-full border border-gray-200 px-2 py-1">
                                61 a 90 dias: {employeeDocumentBuckets.upTo90}
                              </span>
                              <span className="rounded-full border border-gray-200 px-2 py-1">
                                Acima de 90 dias: {employeeDocumentBuckets.above90}
                              </span>
                            </div>
                            {selectedEmployee.documents.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                Nenhum documento cadastrado para este funcionário.
                              </p>
                            ) : (
                              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80 text-xs">
                                <table className="w-full text-left text-sm text-gray-600">
                                  <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                                    <tr>
                                      <th className="px-3 py-2">Documento</th>
                                      <th className="px-3 py-2">Tipo</th>
                                      <th className="px-3 py-2">Emissão</th>
                                      <th className="px-3 py-2">Vencimento</th>
                                      <th className="px-3 py-2">Custo</th>
                                      <th className="px-3 py-2">Prazo</th>
                                      <th className="px-3 py-2">Arquivo</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedEmployee.documents.map((document) => (
                                      <tr
                                        key={`employee-doc-${document.id}`}
                                        className="border-b border-gray-100 bg-white last:border-b-0"
                                      >
                                        <td className="px-3 py-2 font-medium text-gray-900">
                                          {document.document?.name ?? "Documento"}
                                        </td>
                                        <td className="px-3 py-2">
                                          {document.document?.type ?? "—"}
                                        </td>
                                        <td className="px-3 py-2">{formatDate(document.emission_date)}</td>
                                        <td className="px-3 py-2">{formatDate(document.due_date)}</td>
                                        <td className="px-3 py-2">{formatCurrency(document.cost ?? 0)}</td>
                                        <td className="px-3 py-2">
                                          {(() => {
                                            const category = categorizeDocumentDue(document.due_date);
                                            return (
                                              <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${documentDueBadgeClass(
                                                  category
                                                )}`}
                                              >
                                                {category}
                                              </span>
                                            );
                                          })()}
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                          {document.has_file ? (
                                            <button
                                              type="button"
                                              onClick={() => handleViewEmployeeDocument(document)}
                                              className="inline-flex items-center gap-1 rounded-md border border-blue-600 px-2 py-0.5 text-blue-600 transition hover:bg-blue-50"
                                            >
                                              <Eye className="h-3 w-3" />
                                              Visualizar
                                            </button>
                                          ) : (
                                            <span className="text-gray-500">Sem arquivo</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </section>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Selecione um funcionário para visualizar os detalhes.</p>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={Boolean(selectedEventEntry)} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseEventModal}>
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
                <Dialog.Panel className="h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                          {displayEvent?.name ?? selectedEventEntry?.name ?? "Evento"}
                        </Dialog.Title>
                        <p className="text-xs text-gray-500">{displayEventTypeLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseEventModal}
                        className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        Fechar
                      </button>
                    </div>
                    <div className="overflow-y-auto px-6 py-6">
                      {eventDetailLoading ? (
                        <p className="text-sm text-gray-500">Carregando os detalhes...</p>
                      ) : eventDetailError ? (
                        <p className="text-sm text-red-600">{eventDetailError}</p>
                      ) : displayEvent ? (
                        <div className="space-y-6">
                          <section className="space-y-3">
                            <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-gray-400">Período</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {dayjs(displayEvent.start_date).isValid()
                                    ? dayjs(displayEvent.start_date).format("DD/MM/YYYY")
                                    : "—"}
                                  {displayEvent.end_date
                                    ? ` até ${dayjs(displayEvent.end_date).format("DD/MM/YYYY")}`
                                    : ""}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Local</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {displayEvent.location ?? "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Responsável</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {displayEvent.responsible ?? "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Carga horária</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {displayEvent.total_hours != null
                                    ? `${displayEvent.total_hours}h`
                                    : "—"}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Palestrantes: {displayEvent.speakers ?? "—"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Público-alvo: {displayEvent.target_audience ?? "—"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Observações: {displayEvent.notes ?? "—"}
                            </p>
                          </section>

                          <section className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">Álbum de fotos</h4>
                              <span className="text-xs text-gray-500">
                                {eventMediaItems.length} arquivo(s)
                              </span>
                            </div>
                            {eventMediaItems.length > 0 ? (
                              <MediaUploadViewer
                                items={eventMediaItems}
                              onChange={() => {}}
                                readOnly
                                perPage={6}
                              />
                            ) : (
                              <p className="text-sm text-gray-500">Nenhuma mídia registrada para este evento.</p>
                            )}
                          </section>

                          <section className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">
                                Lista de presença
                              </h4>
                              <span className="text-xs text-gray-500">
                                {attendancePresentCount} presentes • {attendanceRecords.length} registros
                              </span>
                            </div>
                            {attendanceRecords.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                Ainda não há registros de presença para este evento.
                              </p>
                            ) : (
                              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80 text-xs">
                                <table className="w-full text-left text-sm text-gray-600">
                                  <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                                    <tr>
                                      <th className="px-3 py-2">Data</th>
                                      <th className="px-3 py-2">Colaborador</th>
                                      <th className="px-3 py-2">Presente</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {attendanceRecords.map((record) => (
                                      <tr
                                        key={`attendance-${record.id}`}
                                        className="border-b border-gray-100 bg-white last:border-b-0"
                                      >
                                        <td className="px-3 py-2 text-xs font-semibold text-gray-900">
                                          {dayjs(record.attendance_date).format("DD/MM/YYYY")}
                                        </td>
                                        <td className="px-3 py-2">
                                          {record.employee?.name ?? `Colaborador #${record.employee_id}`}
                                        </td>
                                        <td className="px-3 py-2">
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                              record.present
                                                ? "bg-green-100 text-green-700"
                                                : "bg-amber-100 text-amber-700"
                                            }`}
                                          >
                                            {record.present ? "Sim" : "Não"}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </section>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Selecione um evento para visualizar os detalhes.</p>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
