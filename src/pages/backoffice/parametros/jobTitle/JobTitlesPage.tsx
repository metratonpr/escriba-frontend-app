// src/pages/backoffice/parametros/jobTitles/JobTitlesPage.tsx
import React, { useEffect, useState } from "react";
import {
  getJobTitles,
  deleteJobTitle,
  type JobTitle,
  type PaginatedResponse
} from "../../../../services/jobTitleService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function JobTitlesPage() {
  const [data, setData] = useState<PaginatedResponse<JobTitle>>({ data: [], total: 0, page: 1, per_page: 25 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadJobTitles = async (q = "", pg = 1, limit = 25) => {
    setLoading(true);
    try {
      const response = await getJobTitles({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobTitles(search, page, perPage); }, []);

  const handleAskDelete = (id: string) => {
    const item = data.data.find((t) => t.id === id);
    setSelectedId(id);
    setSelectedName(item?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteJobTitle(selectedId);
      await loadJobTitles(search, page, perPage);
      setToast({ open: true, message: `Cargo "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir cargo "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<JobTitle>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Descrição", field: "description", sortable: false },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Parâmetros", to: "/backoffice/parametros" }, { label: "Cargos", to: "/backoffice/cargos" }]} />
      <SearchBar onSearch={(q) => loadJobTitles(q)} onClear={() => loadJobTitles("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Cargos"
          createUrl="/backoffice/cargos/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => loadJobTitles(search, p, perPage),
            onPerPageChange: (pp) => loadJobTitles(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/cargos/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmDelete} itemName={selectedName ?? undefined} title="Excluir cargo" />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
