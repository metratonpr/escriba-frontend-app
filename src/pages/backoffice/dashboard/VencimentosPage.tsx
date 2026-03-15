import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
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
type ToastType = "success" | "error" | "info";
type FieldErrors = {
  endpointFilter?: string;
  sampleRange?: string;
};

type AxiosValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const DEFAULT_ENDPOINT_FILTER: EndpointFilter = "all";
const DEFAULT_SAMPLE_RANGE: ExpiringRangeKey = "up_to_30";
const DEFAULT_SOURCE_TYPE_FILTER: DocumentSourceType | "" = "";
const DEFAULT_STATUS_FILTER = "";

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
  status: string
): DocumentDeadlineIndicator[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return rows.filter((row) => {
    const normalizedStatus = row.status?.trim().toLowerCase() ?? "";

    if (sourceType && row.source_type !== sourceType) {
      return false;
    }

    if (status && normalizedStatus !== status) {
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

export default function VencimentosPage() {
  const [rows, setRows] = useState<DocumentDeadlineIndicator[]>([]);
  const [endpointFilter, setEndpointFilter] = useState<EndpointFilter>(DEFAULT_ENDPOINT_FILTER);
  const [sampleRange, setSampleRange] = useState<ExpiringRangeKey>(DEFAULT_SAMPLE_RANGE);
  const [search, setSearch] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] =
    useState<DocumentSourceType | "">(DEFAULT_SOURCE_TYPE_FILTER);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setFieldErrors({});

      try {
        let result: DocumentDeadlineIndicator[] = [];
        const selectedRange =
          EXPIRING_RANGE_OPTIONS.find((option) => option.key === sampleRange) ??
          EXPIRING_RANGE_OPTIONS[0];

        if (endpointFilter === "expired") {
          result = await getExpiredDocuments();
        } else if (endpointFilter === "expiring") {
          const expiring = await getDocumentsExpiringSoon({
            days: selectedRange.queryDays,
          });
          result = filterExpiringRowsByRange(expiring, sampleRange);
        } else {
          const [expiring, expired] = await Promise.all([
            getDocumentsExpiringSoon({ days: selectedRange.queryDays }),
            getExpiredDocuments(),
          ]);
          result = [...expired, ...filterExpiringRowsByRange(expiring, sampleRange)];
        }

        setRows(result.sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? "")));
      } catch (error) {
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
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [endpointFilter, sampleRange]);

  const filteredRows = useMemo(
    () => applyFilters(rows, search, sourceTypeFilter, statusFilter),
    [rows, search, sourceTypeFilter, statusFilter]
  );
  const tableRows = useMemo(() => toTableRows(filteredRows, "vencimentos"), [filteredRows]);

  const handleClearFilters = () => {
    setSearch("");
    setEndpointFilter(DEFAULT_ENDPOINT_FILTER);
    setSampleRange(DEFAULT_SAMPLE_RANGE);
    setSourceTypeFilter(DEFAULT_SOURCE_TYPE_FILTER);
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setFieldErrors({});
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        </div>
      </div>

      <TableTailwind
        loading={loading}
        title="Vencimentos"
        columns={columns}
        data={tableRows}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
