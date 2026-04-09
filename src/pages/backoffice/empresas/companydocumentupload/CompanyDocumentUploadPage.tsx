import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getCompanyDocumentUploads,
  deleteCompanyDocumentUpload,
  type CompanyDocumentUpload,
  type PaginatedResponse,
} from "../../../../services/companyDocumentService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

type ToastType = "success" | "error";

type TemporalidadeBadge = {
  label: string;
  className: string;
};

const getTemporalidadeBadge = (dueDateValue?: string | null): TemporalidadeBadge => {
  if (!dueDateValue) {
    return { label: "Sem Vencimento", className: "" };
  }

  const dueDate = dayjs(dueDateValue);
  if (!dueDate.isValid()) {
    return { label: "Sem Vencimento", className: "" };
  }

  const daysRemaining = dueDate.startOf("day").diff(dayjs().startOf("day"), "day");

  if (daysRemaining < 0) {
    return { label: "Vencido", className: "bg-red-100 text-red-700 border border-red-200" };
  }

  if (daysRemaining <= 30) {
    return { label: `${daysRemaining} dias`, className: "bg-yellow-100 text-yellow-800 border border-yellow-200" };
  }

  if (daysRemaining <= 60) {
    return { label: `${daysRemaining} dias`, className: "bg-green-100 text-green-700 border border-green-200" };
  }

  if (daysRemaining <= 90) {
    return { label: `${daysRemaining} dias`, className: "bg-blue-100 text-blue-700 border border-blue-200" };
  }

  return { label: `${daysRemaining} dias`, className: "bg-white text-gray-700 border border-gray-200" };
};

const formatDateOrEmpty = (value?: string | null, emptyLabel = "Sem vencimento") => {
  if (!value || !dayjs(value).isValid()) {
    return emptyLabel;
  }

  return dayjs(value).format("DD/MM/YYYY");
};

export default function CompanyDocumentUploadPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<CompanyDocumentUpload>>({
    data: [],
    total: 0,
    page: 1,
    per_page: 25,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: ToastType }>({
    open: false,
    message: "",
    type: "success",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadCompanyDocuments = async (
    q = search,
    pg = page,
    limit = perPage,
    sort = sortBy,
    order = sortOrder
  ) => {
    setLoading(true);
    try {
      const response = await getCompanyDocumentUploads({
        search: q,
        page: pg,
        perPage: limit,
        sortBy: sort,
        sortOrder: order,
      });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyDocuments();
  }, [search, page, perPage, sortBy, sortOrder]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAskDelete = (id: string | number) => {
    const normalizedId = String(id);
    const item = data.data.find((d: CompanyDocumentUpload) => String(d.id) === normalizedId);
    setSelectedId(normalizedId);
    setSelectedName(item?.company?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteCompanyDocumentUpload(selectedId);
      await loadCompanyDocuments();
      setToast({
        open: true,
        message: `Documento de "${selectedName}" excluído com sucesso.`,
        type: "success",
      });
    } catch {
      setToast({
        open: true,
        message: `Erro ao excluir documento de "${selectedName}".`,
        type: "error",
      });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const getViewableAttachment = (row: CompanyDocumentUpload) => {
    const hasFile = row.upload?.has_file === true || row.has_file === true;
    if (!hasFile) {
      return null;
    }

    const attachmentId = Number(row.upload?.id ?? row.upload_id ?? 0);
    if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
      return null;
    }

    return {
      id: attachmentId,
      nome_arquivo: row.upload?.nome_arquivo ?? `attachment-${attachmentId}`,
      url_arquivo: row.upload?.url_arquivo ?? "",
      links: {
        view: row.upload?.links?.view ?? null,
        download: row.upload?.links?.download ?? null,
      },
    };
  };

  const handleViewAttachment = (row: CompanyDocumentUpload) => {
    const attachment = getViewableAttachment(row);

    if (!attachment) {
      return;
    }

    navigate(`/backoffice/empresas/documentos/visualizar-anexo/${attachment.id}`, {
      state: { attachment },
    });
  };

  const columns: Column<CompanyDocumentUpload>[] = [
    {
      label: "Empresa",
      field: "company.name",
      render: (row) => row.company?.name ?? "",
      sortable: true,
    },
    {
      label: "Documento",
      field: "document.code",
      render: (row) => {
        const doc = row.document ?? row.document_version;
        if (!doc) {
          return "";
        }

        if (doc.name) {
          return `${doc.code} - ${doc.name}`;
        }

        return `${doc.code}${doc.version ? ` (${doc.version})` : ""}`;
      },
      sortable: true,
    },
    {
      label: "Emissão",
      field: "emission_date",
      sortable: true,
      render: (row) => <div className="font-medium text-gray-900 dark:text-white">{formatDateOrEmpty(row.emission_date, "Sem emissão")}</div>,
    },
    {
      label: "Vencimento",
      field: "due_date",
      sortable: true,
      render: (row) => <div className="font-medium text-gray-900 dark:text-white">{formatDateOrEmpty(row.due_date)}</div>,
    },
    {
      label: "Temporalidade",
      field: "due_date",
      sortable: true,
      render: (row) => {
        const badge = getTemporalidadeBadge(row.due_date);

        if (!badge.className) {
          return <span className="font-medium text-gray-900 dark:text-white">Sem Vencimento</span>;
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      label: "Status",
      field: "status",
      sortable: true,
      render: (row) => {
        if (!row.status) return "";
        const clean = row.status.trim().toLowerCase();
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      },
    },
    {
      label: "Criado em",
      field: "created_at",
      render: (row) =>
        row.created_at && dayjs(row.created_at).isValid()
          ? dayjs(row.created_at).format("DD/MM/YYYY HH:mm")
          : "",
      sortable: true,
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Documentos das Empresas", to: "/backoffice/empresas/documentos" }]} />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
              <TableTailwind
          loading={loading}
          title="Documentos de Empresas"
          createUrl="/backoffice/empresas/documentos/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => setPage(p),
            onPerPageChange: (pp) => {
              setPerPage(pp);
              setPage(1);
            },
          }}
          renderActions={(row) => {
            const attachment = getViewableAttachment(row);

            if (!attachment) {
              return null;
            }

            return (
              <button
                type="button"
                onClick={() => handleViewAttachment(row)}
                aria-label="Visualizar anexo"
                title="Visualizar anexo"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <Eye size={16} />
              </button>
            );
          }}
          getEditUrl={(id) => `/backoffice/empresas/documentos/editar/${id}`}
          onDelete={handleAskDelete}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
            setPage(1);
          }}
        />

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir Documento"
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  );
}
