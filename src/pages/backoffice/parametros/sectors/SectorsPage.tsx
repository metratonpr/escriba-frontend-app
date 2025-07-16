// src/pages/backoffice/parametros/sectors/SectorsPage.tsx
import { useEffect, useState } from "react";
import {
  getSectors,
  deleteSector,
  type Sector,
  type PaginatedResponse
} from "../../../../services/sectorService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function SectorsPage() {
  const [data, setData] = useState<PaginatedResponse<Sector>>({
    data: [],
    total: 0,
    page: 1,
    per_page: 25,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadSectors = async (
    query = "",
    currentPage = 1,
    currentPerPage = 25
  ) => {
    setLoading(true);
    try {
      const response = await getSectors({ search: query, page: currentPage, perPage: currentPerPage });
      setData(response);
      setPage(currentPage);
      setPerPage(currentPerPage);
    } catch {
      setToast({ open: true, message: "Erro ao carregar setores.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectors(search, page, perPage);
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    loadSectors(query, 1, perPage);
  };

  const handleClear = () => {
    setSearch("");
    loadSectors("", 1, perPage);
  };

  const handlePageChange = (newPage: number) => {
    loadSectors(search, newPage, perPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    loadSectors(search, 1, newPerPage);
  };

  const handleAskDelete = (id: string) => {
    const sector = data.data.find((s) => s.id === id);
    setSelectedId(id);
    setSelectedName(sector?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteSector(selectedId);
      await loadSectors(search, page, perPage);
      setToast({ open: true, message: `Setor "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir setor "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<Sector>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Descrição", field: "description", sortable: false },
  ];

  const breadcrumbs = [
    { label: "Parâmetros", to: "/backoffice/parametros" },
    { label: "Setores", to: "/backoffice/setores" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <SearchBar onSearch={handleSearch} onClear={handleClear} />

      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Setores"
          createUrl="/backoffice/setores/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange,
          }}
          getEditUrl={(id) => `/backoffice/setores/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir setor"
      />

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
