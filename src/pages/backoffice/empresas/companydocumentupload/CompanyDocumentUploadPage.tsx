import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
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
import Spinner from "../../../../components/Layout/ui/Spinner";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function CompanyDocumentUploadListPage() {
  const [data, setData] = useState<PaginatedResponse<CompanyDocumentUpload>>({
    data: [],
    total: 0,
    page: 1,
    per_page: 25,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as const });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | undefined>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const load = async (
    q = "",
    pg = 1,
    limit = 25,
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
    load(search, page, perPage);
  }, []);

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.company?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteCompanyDocumentUpload(selectedId);
      await load(search, page, perPage);
      setToast({ open: true, message: `Documento de "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir documento de "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<CompanyDocumentUpload>[] = [
    {
      label: "Empresa",
      field: "company_name",
      render: (row) => row.company?.name ?? "-",
      sortable: true,
      sortField: "company.name",
    },
    {
      label: "Versão do Documento",
      field: "document_version_name",
      render: (row) => `${row.document_version?.code} - ${row.document_version?.version}`,
      sortable: true,
      sortField: "document_version.code",
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
      <SearchBar onSearch={(q) => load(q)} onClear={() => load()} />
      {loading && <Spinner />}
      {!loading && (
        <TableTailwind
          title="Documentos de Empresas"
          createUrl="/backoffice/empresas/documentos/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => load(search, p, perPage),
            onPerPageChange: (pp) => load(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/empresas/documentos/editar/${id}`}
          onDelete={handleAskDelete}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
            load(search, 1, perPage, field, order);
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
