import { useEffect, useState } from "react";
import {
  deleteEvent,
  getEvents,
  type Event,
  type PaginatedResponse,
} from "../../../../services/eventService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import Spinner from "../../../../components/Layout/ui/Spinner";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function EventPage() {
  const [data, setData] = useState<PaginatedResponse<Event>>({
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

  const loadEvents = async (q = search, pg = page, limit = perPage) => {
    setLoading(true);
    try {
      const response = await getEvents({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q.trim());
    setPage(1);
  };

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d: Event) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEvent(selectedId);
      await loadEvents();
      setToast({ open: true, message: `Evento "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir evento "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<Event>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Tipo", field: "event_type_id" },
    { label: "Início", field: "start_date" },
    { label: "Término", field: "end_date" },
    { label: "Local", field: "location" },
    { label: "Responsável", field: "responsible" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Eventos", to: "/backoffice/eventos" },
        ]}
      />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
      {loading && <Spinner />}
      {!loading && (
        <TableTailwind
          title="Eventos"
          createUrl="/backoffice/eventos/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: setPage,
            onPerPageChange: (pp) => {
              setPerPage(pp);
              setPage(1);
            },
          }}
          getEditUrl={(id) => `/backoffice/eventos/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}
      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir evento"
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
