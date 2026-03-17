import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { getFileDownloadUrl, getFileViewUrl } from "../../../api/apiConfig";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import FileViewer from "../../../components/Layout/FileViewer";
import FormPageSkeleton from "../../../components/Layout/ui/FormPageSkeleton";
import SearchBar from "../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../components/Layout/ui/TableTailwind";
import FormSelectField from "../../../components/form/FormSelectField";
import {
  getDocumentsExpiringSoon,
  getExpiredDocuments,
  type DocumentDeadlineIndicator,
  type DocumentSourceType,
} from "../../../services/documentReportService";
import { convertToBrazilianDateFormat } from "../../../utils/formatUtils";
import { normalizeFieldError } from "../../../utils/errorUtils";
import {
  EXPIRING_RANGE_OPTIONS,
  getDeadlineBadge,
  getDaysUntil,
  getSourceTypeLabel,
  matchesExpiringRange,
  type ExpiringRangeKey,
} from "../../../utils/deadlineUtils";

type TableRow = DocumentDeadlineIndicator & {
  id: string;
};

type EndpointFilter = "all" | "expired" | "expiring";
type HasFileFilter = "" | "with_file" | "without_file";
type ToastType = "success" | "error" | "info";
type FieldErrors = {
  endpointFilter?: string;
  sampleRange?: string;
};

type AxiosValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

type AttachmentLinks = {
  viewUrl: string | null;
  downloadUrl: string | null;
};

type SelectedAttachment = {
  fileId: number | null;
  fileName: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

const DEFAULT_ENDPOINT_FILTER: EndpointFilter = "all";
const DEFAULT_SAMPLE_RANGE: ExpiringRangeKey = "up_to_30";
const DEFAULT_SOURCE_TYPE_FILTER: DocumentSourceType | "" = "";
const DEFAULT_STATUS_FILTER = "";
const DEFAULT_HAS_FILE_FILTER: HasFileFilter = "";

const ENDPOINT_FILTER_OPTIONS: Array<{ value: EndpointFilter; label: string }> = [
  { value: "all", label: "Todos (a vencer + vencidos)" },
  { value: "expired", label: "Apenas vencidos" },
  { value: "expiring", label: "Apenas a vencer" },
];

const SOURCE_TYPE_OPTIONS: Array<{ value: DocumentSourceType | ""; label: string }> = [
  { value: "", label: "Todos os tipos de origem" },
  { value: "company", label: "Empresa" },
  { value: "employee", label: "Colaborador" },
  { value: "event", label: "Evento" },
  { value: "epi_delivery", label: "Entrega EPI" },
  { value: "occurrence", label: "Ocorrencia" },
  { value: "medical_exam", label: "Exame medico" },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos os status" },
  { value: "pendente", label: "Pendente" },
  { value: "enviado", label: "Enviado" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
];

const HAS_FILE_OPTIONS: Array<{ value: HasFileFilter; label: string }> = [
  { value: "", label: "Todos" },
  { value: "with_file", label: "Com arquivo" },
  { value: "without_file", label: "Sem arquivo" },
];

const toTableRows = (rows: DocumentDeadlineIndicator[], scope: string): TableRow[] =>
  rows.map((row, index) => ({
    ...row,
    id: `${scope}-${row.source_type}-${row.source_id}-${row.document_id}-${index}`,
  }));

const filterExpiringRowsByRange = (
  rows: DocumentDeadlineIndicator[],
  range: ExpiringRangeKey
): DocumentDeadlineIndicator[] =>
  rows.filter((row) => matchesExpiringRange(getDaysUntil(row.due_date), range));

const applyFilters = (
  rows: DocumentDeadlineIndicator[],
  query: string,
  sourceType: DocumentSourceType | "",
  status: string,
  hasFileFilter: HasFileFilter
): DocumentDeadlineIndicator[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return rows.filter((row) => {
    const normalizedStatus = row.status?.trim().toLowerCase() ?? "";
    const hasAvailableFile = getHasAvailableFile(row);

    if (sourceType && row.source_type !== sourceType) {
      return false;
    }

    if (status && normalizedStatus !== status) {
      return false;
    }

    if (hasFileFilter === "with_file" && !hasAvailableFile) {
      return false;
    }

    if (hasFileFilter === "without_file" && hasAvailableFile) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      row.source_type ?? "",
      getSourceTypeLabel(row.source_type),
      row.source_name ?? "",
      row.document_name ?? "",
      row.status ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
};

const formatStatusLabel = (value: string | null): string => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const normalizeLinkValue = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

const parseAttachmentId = (value: unknown): number | null => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const extractAttachmentIdFromLink = (value?: string | null): number | null => {
  const normalizedValue = normalizeLinkValue(value);

  if (!normalizedValue) {
    return null;
  }

  const match = normalizedValue.match(/\/(?:view|download)\/(\d+)(?:[/?#]|$)/i);
  return parseAttachmentId(match?.[1]);
};

const getAttachmentId = (row: DocumentDeadlineIndicator): number | null => {
  return (
    parseAttachmentId(row.upload?.id ?? row.upload_id ?? null) ??
    extractAttachmentIdFromLink(row.links?.view) ??
    extractAttachmentIdFromLink(row.upload?.links?.view) ??
    extractAttachmentIdFromLink(row.links?.download) ??
    extractAttachmentIdFromLink(row.upload?.links?.download)
  );
};

const getAttachmentLinks = (row: DocumentDeadlineIndicator): AttachmentLinks => {
  const attachmentId = getAttachmentId(row);
  const viewUrl =
    normalizeLinkValue(row.links?.view) ??
    normalizeLinkValue(row.upload?.links?.view) ??
    (attachmentId ? getFileViewUrl(attachmentId) : null);
  const downloadUrl =
    normalizeLinkValue(row.links?.download) ??
    normalizeLinkValue(row.upload?.links?.download) ??
    (attachmentId ? getFileDownloadUrl(attachmentId) : null);

  return { viewUrl, downloadUrl };
};

const getHasAvailableFile = (row: DocumentDeadlineIndicator): boolean => {
  return row.has_file === true;
};

export default function VencimentosPage() {
  const [endpointFilter, setEndpointFilter] = useState<EndpointFilter>(DEFAULT_ENDPOINT_FILTER);
  const [sampleRange, setSampleRange] = useState<ExpiringRangeKey>(DEFAULT_SAMPLE_RANGE);
  const [search, setSearch] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] =
    useState<DocumentSourceType | "">(DEFAULT_SOURCE_TYPE_FILTER);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);
  const [hasFileFilter, setHasFileFilter] = useState<HasFileFilter>(DEFAULT_HAS_FILE_FILTER);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: ToastType;
  }>({
    open: false,
    message: "",
    type: "info",
  });
  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);

  const selectedRange = useMemo(
    () =>
      EXPIRING_RANGE_OPTIONS.find((option) => option.key === sampleRange) ??
      EXPIRING_RANGE_OPTIONS[0],
    [sampleRange]
  );

  const expiringQuery = useQuery({
    queryKey: ["documents-deadlines", "expiring", selectedRange.queryDays],
    queryFn: () => getDocumentsExpiringSoon({ days: selectedRange.queryDays }),
    enabled: endpointFilter !== "expired",
  });

  const expiredQuery = useQuery({
    queryKey: ["documents-deadlines", "expired"],
    queryFn: getExpiredDocuments,
    enabled: endpointFilter !== "expiring",
  });

  const isLoading = useMemo(() => {
    if (endpointFilter === "expired") {
      return expiredQuery.isLoading;
    }

    if (endpointFilter === "expiring") {
      return expiringQuery.isLoading;
    }

    return expiringQuery.isLoading || expiredQuery.isLoading;
  }, [endpointFilter, expiringQuery.isLoading, expiredQuery.isLoading]);

  const combinedRows = useMemo(() => {
    const expiringRows = expiringQuery.data ?? [];
    const expiredRows = expiredQuery.data ?? [];

    if (endpointFilter === "expired") {
      return expiredRows;
    }

    if (endpointFilter === "expiring") {
      return filterExpiringRowsByRange(expiringRows, sampleRange);
    }

    return [...expiredRows, ...filterExpiringRowsByRange(expiringRows, sampleRange)];
  }, [endpointFilter, expiringQuery.data, expiredQuery.data, sampleRange]);

  const rows = useMemo(() => {
    return [...combinedRows].sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
  }, [combinedRows]);

  useEffect(() => {
    const error = expiringQuery.error ?? expiredQuery.error;

    if (!error) {
      setFieldErrors({});
      return;
    }

    let message = "Erro ao carregar vencimentos.";

    if (axios.isAxiosError<AxiosValidationErrorResponse>(error)) {
      const responseData = error.response?.data;
      const errors = responseData?.errors ?? {};

      setFieldErrors({
        endpointFilter: normalizeFieldError(
          errors.endpointFilter ?? errors.filter ?? errors.type ?? errors.mode
        ),
        sampleRange: normalizeFieldError(errors.days ?? errors.sampleDays),
      });

      if (typeof responseData?.message === "string" && responseData.message.trim()) {
        message = responseData.message;
      }
    }

    setToast({
      open: true,
      message,
      type: "error",
    });
  }, [expiringQuery.error, expiredQuery.error]);

  const filteredRows = useMemo(
    () => applyFilters(rows, search, sourceTypeFilter, statusFilter, hasFileFilter),
    [rows, search, sourceTypeFilter, statusFilter, hasFileFilter]
  );
  const tableRows = useMemo(() => toTableRows(filteredRows, "vencimentos"), [filteredRows]);

  const handleClearFilters = () => {
    setSearch("");
    setEndpointFilter(DEFAULT_ENDPOINT_FILTER);
    setSampleRange(DEFAULT_SAMPLE_RANGE);
    setSourceTypeFilter(DEFAULT_SOURCE_TYPE_FILTER);
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setHasFileFilter(DEFAULT_HAS_FILE_FILTER);
    setFieldErrors({});
  };

  const handleCloseViewer = () => {
    setSelectedAttachment(null);
  };

  const handleViewDocument = (row: TableRow) => {
    if (!getHasAvailableFile(row)) {
      return;
    }

    const attachmentId = getAttachmentId(row);
    const { viewUrl, downloadUrl } = getAttachmentLinks(row);

    if (!attachmentId && !viewUrl) {
      setToast({
        open: true,
        message:
          "Visualizacao indisponivel: o endpoint de vencimentos nao retornou links.view nem upload_id para este documento.",
        type: "info",
      });
      return;
    }

    setSelectedAttachment({
      fileId: attachmentId,
      fileName:
        row.upload?.nome_arquivo || row.document_name || `attachment-${attachmentId ?? "arquivo"}`,
      viewUrl,
      downloadUrl,
    });
  };

  const columns: Column<TableRow>[] = [
    {
      label: "Documento",
      field: "document_name",
      sortable: true,
      render: (row) => row.document_name ?? "",
    },
    {
      label: "Origem",
      field: "source_name",
      sortable: true,
      render: (row) => row.source_name ?? "",
    },
    {
      label: "Tipo origem",
      field: "source_type",
      sortable: true,
      render: (row) => getSourceTypeLabel(row.source_type),
    },
    {
      label: "Status",
      field: "status",
      sortable: true,
      render: (row) => formatStatusLabel(row.status),
    },
    {
      label: "Emissao",
      field: "emission_date",
      sortable: true,
      render: (row) => convertToBrazilianDateFormat(row.emission_date ?? ""),
    },
    {
      label: "Vencimento",
      field: "due_date",
      sortable: true,
      render: (row) => convertToBrazilianDateFormat(row.due_date ?? ""),
    },
    {
      label: "Faixa",
      field: "due_date",
      sortable: true,
      render: (row) => {
        const badge = getDeadlineBadge(row.due_date);
        if (!badge.label) {
          return "";
        }

        return (
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      label: "Dias",
      field: "days_remaining",
      sortable: true,
      render: (row) => getDeadlineBadge(row.due_date).daysLabel,
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/backoffice/dashboard" },
          { label: "Vencimentos", to: "#" },
        ]}
      />

      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
        <SearchBar
          placeholder="Buscar por tipo de origem, origem, documento ou status..."
          onSearch={setSearch}
          onClear={handleClearFilters}
          fullWidth
        />

        <p className="mb-4 text-xs text-gray-500">
          Campos pesquisaveis: source_type, source_name, document_name e status.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <FormSelectField
            id="vencimentos-filter"
            name="endpointFilter"
            label="Tipo de consulta"
            value={endpointFilter}
            onChange={(event) => {
              setEndpointFilter(event.target.value as EndpointFilter);
              if (fieldErrors.endpointFilter) {
                setFieldErrors((prev) => ({ ...prev, endpointFilter: "" }));
              }
            }}
            options={ENDPOINT_FILTER_OPTIONS}
            error={fieldErrors.endpointFilter}
          />

          <FormSelectField
            id="vencimentos-range"
            name="sampleRange"
            label="Faixa de vencimento"
            value={sampleRange}
            onChange={(event) => {
              setSampleRange(event.target.value as ExpiringRangeKey);
              if (fieldErrors.sampleRange) {
                setFieldErrors((prev) => ({ ...prev, sampleRange: "" }));
              }
            }}
            disabled={endpointFilter === "expired"}
            options={EXPIRING_RANGE_OPTIONS.map((option) => ({
              value: option.key,
              label: option.label,
            }))}
            error={fieldErrors.sampleRange}
          />

          <FormSelectField
            id="vencimentos-source-type"
            name="sourceTypeFilter"
            label="Tipo de origem"
            value={sourceTypeFilter}
            onChange={(event) => {
              setSourceTypeFilter(event.target.value as DocumentSourceType | "");
            }}
            options={SOURCE_TYPE_OPTIONS}
          />

          <FormSelectField
            id="vencimentos-status"
            name="statusFilter"
            label="Status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
            }}
            options={STATUS_OPTIONS}
          />

          <FormSelectField
            id="vencimentos-has-file"
            name="hasFileFilter"
            label="Arquivo fisico"
            value={hasFileFilter}
            onChange={(event) => {
              setHasFileFilter(event.target.value as HasFileFilter);
            }}
            options={HAS_FILE_OPTIONS}
          />
        </div>
      </div>

      {isLoading ? (
        <FormPageSkeleton className="mt-4 px-0" fields={6} />
      ) : (
        <TableTailwind
          title="Vencimentos"
          columns={columns}
          data={tableRows}
          renderActions={(row) =>
            getHasAvailableFile(row) ? (
              <button
                type="button"
                onClick={() => handleViewDocument(row)}
                aria-label="Visualizar documento"
                title="Visualizar documento"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Eye size={16} />
              </button>
            ) : null
          }
        />
      )}

      <Transition appear show={selectedAttachment !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseViewer}>
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
                    {selectedAttachment?.fileName ?? "Visualizar arquivo"}
                  </Dialog.Title>

                  {selectedAttachment && (
                    <FileViewer
                      embedded
                      fileId={selectedAttachment.fileId}
                      fileName={selectedAttachment.fileName}
                      viewUrl={selectedAttachment.viewUrl}
                      downloadUrl={selectedAttachment.downloadUrl}
                      onClose={handleCloseViewer}
                    />
                  )}
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
    </>
  );
}
