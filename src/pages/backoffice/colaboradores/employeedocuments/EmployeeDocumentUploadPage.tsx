// src/pages/backoffice/colaboradores/employee-documents/EmployeeDocumentUploadPage.tsx

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  getEmployeeDocumentUploads,
  deleteEmployeeDocumentUpload,
  type EmployeeDocumentUpload,
  type PaginatedResponse,
} from "../../../../services/employeeDocumentService";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Spinner from "../../../../components/Layout/ui/Spinner";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function EmployeeDocumentUploadPage() {
  const [data, setData] = useState<PaginatedResponse<EmployeeDocumentUpload>>({
    data: [],
    total: 0,
    page: 1,
    per_page: 25,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<string | undefined>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadDocuments = async (
    q = search,
    pg = page,
    limit = perPage,
    sort = sortBy,
    order = sortOrder
  ) => {
    setLoading(true);
    try {
      const response = await getEmployeeDocumentUploads({
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
    loadDocuments();
  }, [search, page, perPage, sortBy, sortOrder]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.employee?.name ?? null);

    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEmployeeDocumentUpload(selectedId);
      await loadDocuments();
      setToast({ open: true, message: `Documento de "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir documento de "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

 const columns: Column<EmployeeDocumentUpload>[] = [
  {
    label: "Funcionário",
    field: "employee.name",
    render: (row) => row.employee?.name ?? "-",
    sortable: true,
  },
  {
    label: "Versão do Documento",
    field: "document_version.code",
    render: (row) =>
      `${row.document_version?.code ?? "-"} - ${row.document_version?.version ?? "-"}`,
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
      <Breadcrumbs items={[{ label: "Documentos de Colaboradores", to: "/backoffice/colaboradores/documentos" }]} />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Documentos de Colaboradores"
          createUrl="/backoffice/colaboradores/documentos/novo"
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
          getEditUrl={(id) => `/backoffice/colaboradores/documentos/editar/${id}`}
          onDelete={handleAskDelete}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
            setPage(1);
          }}
        />
      )}

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
