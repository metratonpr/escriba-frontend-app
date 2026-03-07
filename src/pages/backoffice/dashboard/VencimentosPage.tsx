import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import SearchBar from "../../../components/Layout/ui/SearchBar";
import Spinner from "../../../components/Layout/ui/Spinner";
import TableTailwind, { type Column } from "../../../components/Layout/ui/TableTailwind";
import FormSelectField from "../../../components/form/FormSelectField";
import {
  getDocumentsExpiringSoon,
  getExpiredDocuments,
  type DocumentDeadlineIndicator,
} from "../../../services/documentReportService";
import {
  convertToBrazilianDateFormat,
  convertToBrazilianDateTimeFormat,
} from "../../../utils/formatUtils";
import { normalizeFieldError } from "../../../utils/errorUtils";
import {
  getDeadlineBadge,
  getSourceTypeLabel,
} from "../../../utils/deadlineUtils";

type TableRow = DocumentDeadlineIndicator & {
  id: string;
};

type EndpointFilter = "all" | "expired" | "expiring";
type ToastType = "success" | "error" | "info";
type FieldErrors = {
  endpointFilter?: string;
  sampleDays?: string;
};

type AxiosValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

const ENDPOINT_FILTER_OPTIONS: Array<{ value: EndpointFilter; label: string }> = [
  { value: "all", label: "Todos (a vencer + vencidos)" },
  { value: "expired", label: "Apenas vencidos" },
  { value: "expiring", label: "Apenas a vencer" },
];

const SAMPLE_DAYS_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 7, label: "Ate 7 dias" },
  { value: 15, label: "Ate 15 dias" },
  { value: 30, label: "Ate 30 dias" },
  { value: 59, label: "Abaixo de 60 dias" },
];

const toTableRows = (rows: DocumentDeadlineIndicator[], scope: string): TableRow[] =>
  rows.map((row, index) => ({
    ...row,
    id: `${scope}-${row.source_type}-${row.source_id}-${row.document_id}-${index}`,
  }));

const applySearch = (rows: DocumentDeadlineIndicator[], query: string): DocumentDeadlineIndicator[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return rows;
  }

  return rows.filter((row) => {
    const sourceLabel = getSourceTypeLabel(row.source_type);

    return [
      row.document_name ?? "",
      row.source_name ?? "",
      sourceLabel,
      row.status ?? "",
      row.due_date ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
};

export default function VencimentosPage() {
  const [rows, setRows] = useState<DocumentDeadlineIndicator[]>([]);
  const [endpointFilter, setEndpointFilter] = useState<EndpointFilter>("all");
  const [sampleDays, setSampleDays] = useState<number>(59);
  const [search, setSearch] = useState("");
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

        if (endpointFilter === "expired") {
          result = await getExpiredDocuments();
        } else if (endpointFilter === "expiring") {
          result = await getDocumentsExpiringSoon({ days: sampleDays });
        } else {
          const [expiring, expired] = await Promise.all([
            getDocumentsExpiringSoon({ days: sampleDays }),
            getExpiredDocuments(),
          ]);
          result = [...expired, ...expiring];
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
            sampleDays: normalizeFieldError(errors.days ?? errors.sampleDays),
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
  }, [endpointFilter, sampleDays]);

  const filteredRows = useMemo(() => applySearch(rows, search), [rows, search]);
  const tableRows = useMemo(() => toTableRows(filteredRows, "vencimentos"), [filteredRows]);

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
      render: (row) => row.status ?? "",
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
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
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
    {
      label: "Enviado em",
      field: "uploaded_at",
      sortable: true,
      render: (row) => convertToBrazilianDateTimeFormat(row.uploaded_at ?? ""),
    },
  ];

  return (
    <div className="p-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/backoffice/dashboard" },
          { label: "Vencimentos", to: "#" },
        ]}
      />

      <h1 className="mb-4 text-2xl font-semibold">Vencimentos</h1>
      <p className="mb-4 text-sm text-gray-600">
        Regra de badge: vencido (vermelho), ate 30 dias (amarelo), abaixo de 60 dias
        (verde).
      </p>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          name="sampleDays"
          label="Faixa de amostra (dias)"
          value={sampleDays}
          onChange={(event) => {
            setSampleDays(Number(event.target.value));
            if (fieldErrors.sampleDays) {
              setFieldErrors((prev) => ({ ...prev, sampleDays: "" }));
            }
          }}
          disabled={endpointFilter === "expired"}
          options={SAMPLE_DAYS_OPTIONS}
          error={fieldErrors.sampleDays}
        />
      </div>

      <SearchBar
        placeholder="Buscar por documento, origem ou status..."
        onSearch={setSearch}
        onClear={() => setSearch("")}
      />

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <TableTailwind columns={columns} data={tableRows} />
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
