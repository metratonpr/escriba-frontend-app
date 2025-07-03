// src/pages/backoffice/parametros/epiTypes/EpiTypesPage.tsx
import React, { useEffect, useState } from "react";
import {
  getEpiTypes,
  deleteEpiType,
  type EpiType,
  type PaginatedResponse,
} from "../../../../services/epiTypeService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function EpiTypesPage() {
  const [data, setData] = useState<PaginatedResponse<EpiType>>({ data: [], total: 0, page: 1, per_page: 25 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadEpiTypes = async (q = "", pg = 1, limit = 25) => {
    setLoading(true);
    try {
      const response = await getEpiTypes({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpiTypes(search, page, perPage);
  }, []);

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEpiType(selectedId);
      await loadEpiTypes(search, page, perPage);
      setToast({ open: true, message: `Tipo \"${selectedName}\" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir tipo \"${selectedName}\".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<EpiType>[] = [
    { label: "Nome", field: "name", sortable: true },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Parâmetros", to: "/backoffice/parametros" }, { label: "Tipos de EPI", to: "/backoffice/tipos-epi" }]} />
      <SearchBar onSearch={(q) => loadEpiTypes(q)} onClear={() => loadEpiTypes("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Tipos de EPI"
          createUrl="/backoffice/tipos-epi/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => loadEpiTypes(search, p, perPage),
            onPerPageChange: (pp) => loadEpiTypes(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/tipos-epi/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir tipo de EPI"
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
