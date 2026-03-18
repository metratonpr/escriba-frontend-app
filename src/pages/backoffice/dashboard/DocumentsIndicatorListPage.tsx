import { useEffect, useMemo, useState } from "react";
import Toast from "../../../components/Layout/Feedback/Toast";
import FilterGroup from "../../../components/Layout/FilterGroup";
import TableTailwind, { type Column } from "../../../components/Layout/ui/TableTailwind";
import DataDashboardLayout from "../../../components/Layout/DataDashboardLayout";
import { useDocumentDeadlines, type DeadlineEndpointFilter } from "../../../hooks/useDocumentDeadlines";
import { type DocumentDeadlineIndicator } from "../../../services/documentReportService";
import {
  convertToBrazilianDateFormat,
  convertToBrazilianDateTimeFormat,
} from "../../../utils/formatUtils";

type IndicatorMode = "expiring" | "expired";

type DocumentsIndicatorListPageProps = {
  mode: IndicatorMode;
};

type TableRow = DocumentDeadlineIndicator & {
  id: string;
};

const SOURCE_TYPE_LABEL: Record<string, string> = {
  company: "Empresa",
  employee: "Colaborador",
  event: "Evento",
  epi_delivery: "Entrega EPI",
  occurrence: "Ocorrência",
  medical_exam: "Exame médico",
};

const buildRowId = (row: DocumentDeadlineIndicator, index: number) =>
  `${row.source_type}-${row.source_id}-${row.document_id}-${index}`;

const formatRemainingDays = (value: number | null, mode: IndicatorMode): string => {
  if (value === null) {
    return "";
  }

  const days = Math.abs(value);
  if (days === 0) {
    return mode === "expiring" ? "Hoje" : "Venceu hoje";
  }

  if (mode === "expired") {
    return `${days} dia(s) vencido(s)`;
  }

  return `${days} dia(s)`;
};

export default function DocumentsIndicatorListPage({ mode }: DocumentsIndicatorListPageProps) {
  const isExpiring = mode === "expiring";
  const title = isExpiring ? "Documentos a Vencer" : "Documentos Vencidos";
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  const endpointFilter: DeadlineEndpointFilter = isExpiring ? "expiring" : "expired";
  const { rows, isLoading, error } = useDocumentDeadlines({
    endpointFilter,
    rangeKey: "up_to_30",
  });

  useEffect(() => {
    if (!error) {
      return;
    }

    setToast({
      open: true,
      message: `Erro ao carregar ${title.toLowerCase()}.`,
      type: "error",
    });
  }, [error, title]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) => {
      const sourceLabel = SOURCE_TYPE_LABEL[row.source_type] ?? row.source_type;
      return [
        row.document_name ?? "",
        row.source_name ?? "",
        row.status ?? "",
        sourceLabel,
        row.due_date ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, search]);

  const tableRows: TableRow[] = useMemo(
    () => filteredRows.map((row, index) => ({ ...row, id: buildRowId(row, index) })),
    [filteredRows]
  );

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
      label: "Tipo Origem",
      field: "source_type",
      sortable: true,
      render: (row) => SOURCE_TYPE_LABEL[row.source_type] ?? row.source_type,
    },
    {
      label: "Status",
      field: "status",
      sortable: true,
      render: (row) => row.status ?? "",
    },
    {
      label: "Emissão",
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
      label: "Dias",
      field: "days_remaining",
      sortable: true,
      render: (row) => formatRemainingDays(row.days_remaining, mode),
    },
    {
      label: "Enviado em",
      field: "uploaded_at",
      sortable: true,
      render: (row) => convertToBrazilianDateTimeFormat(row.uploaded_at ?? ""),
    },
  ];

  const filters = (
    <>
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <FilterGroup
        search={{
          onSearch: setSearch,
          onClear: () => setSearch(""),
          placeholder: "Buscar por documento, origem ou status...",
        }}
      />
    </>
  );

  return (
    <>
      <DataDashboardLayout
        breadcrumbs={[
          { label: "Dashboard", to: "/backoffice/dashboard" },
          { label: title, to: "#" },
        ]}
        filterPanel={filters}
      >
        <TableTailwind loading={isLoading} columns={columns} data={tableRows} />
      </DataDashboardLayout>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
