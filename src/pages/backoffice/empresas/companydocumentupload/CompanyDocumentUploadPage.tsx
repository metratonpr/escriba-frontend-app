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
    if (row.upload?.has_file !== true) {
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
    };
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
      label: "Status",
      field: "status",
      sortable: true,
    },
    {
      label: "Criado em",
      field: "created_at",
      render: (row) => dayjs(row.created_at).format("DD/MM/YYYY HH:mm"),
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
                onClick={() =>
                  navigate(`/backoffice/empresas/documentos/visualizar-anexo/${attachment.id}`, {
                    state: { attachment },
                  })
                }
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

