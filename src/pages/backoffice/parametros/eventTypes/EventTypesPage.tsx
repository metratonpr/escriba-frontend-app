// src/pages/backoffice/parametros/eventTypes/EventTypesPage.tsx
import React, { useEffect, useState } from "react";
import {
  getEventTypes,
  deleteEventType,
  type EventType,
  type PaginatedResponse,
} from "../../../../services/eventTypeService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function EventTypesPage() {
  const [data, setData] = useState<PaginatedResponse<EventType>>({ data: [], total: 0, page: 1, per_page: 25 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadEventTypes = async (q = "", pg = 1, limit = 25) => {
    setLoading(true);
    try {
      const response = await getEventTypes({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventTypes(search, page, perPage);
  }, []);

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.nome_tipo_evento ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEventType(selectedId);
      await loadEventTypes(search, page, perPage);
      setToast({ open: true, message: `Tipo \"${selectedName}\" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir tipo \"${selectedName}\".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<EventType>[] = [
    { label: "Nome do Tipo de Evento", field: "nome_tipo_evento", sortable: true },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Parâmetros", to: "/backoffice/parametros" }, { label: "Tipos de Evento", to: "/backoffice/tipos-evento" }]} />
      <SearchBar onSearch={(q) => loadEventTypes(q)} onClear={() => loadEventTypes("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Tipos de Evento"
          createUrl="/backoffice/tipos-evento/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => loadEventTypes(search, p, perPage),
            onPerPageChange: (pp) => loadEventTypes(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/tipos-evento/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir tipo de evento"
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}