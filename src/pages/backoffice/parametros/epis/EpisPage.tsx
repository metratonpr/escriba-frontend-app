import { useEffect, useState } from "react";
import {
  getEpis,
  deleteEpi,
  type Epi,
  type PaginatedResponse,
} from "../../../../services/epiService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function EpisPage() {
  const [data, setData] = useState<PaginatedResponse<Epi>>({
    data: [],
    total: 0,
    page: 1,
    per_page: 25,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadEpis = async (
    q = search,
    pg = page,
    limit = perPage
  ): Promise<void> => {
    setLoading(true);
    try {
      const response = await getEpis({ search: q, page: pg, perPage: limit });
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpis();
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q.trim());
    setPage(1); // Resetar para a primeira página
  };

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEpi(selectedId);
      setToast({
        open: true,
        message: `EPI "${selectedName}" excluído com sucesso.`,
        type: "success",
      });
      await loadEpis();
    } catch {
      setToast({
        open: true,
        message: `Erro ao excluir EPI "${selectedName}".`,
        type: "error",
      });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<Epi>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Tipo de EPI", field: "epi_type_name" },
    { label: "Marca", field: "brand_name" },
    { label: "Empresa", field: "company_name" },
    { label: "CA", field: "ca" },
    { label: "Validade CA", field: "ca_expiration" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "EPIs", to: "/backoffice/epis" },
        ]}
      />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="EPIs"
          createUrl="/backoffice/epis/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: setPage,
            onPerPageChange: (pp) => {
              setPage(1);
              setPerPage(pp);
            },
          }}
          getEditUrl={(id) => `/backoffice/epis/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir EPI"
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
