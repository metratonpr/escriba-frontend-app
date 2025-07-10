import React, { useEffect, useState } from "react";
import { deleteEpiDelivery, getEpiDeliveries } from "../../../services/epiDeliveryService";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../components/Layout/ui/SearchBar";
import Spinner from "../../../components/Layout/ui/Spinner";
import TableTailwind from "../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../components/Layout/ui/DeleteModal";
import Toast from "../../../components/Layout/Feedback/Toast";
import dayjs from "dayjs";


export default function EpiDeliveriesPage() {
  const [data, setData] = useState<PaginatedResponse<EpiDelivery>>({
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);


  const load = async (q = "", pg = 1, limit = 25) => {
    setLoading(true);
    try {
      const response = await getEpiDeliveries({ search: q, page: pg, perPage: limit });
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

  const handleAskDelete = (id: number) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.document_number ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEpiDelivery(selectedId);
      await load(search, page, perPage);
      setToast({ open: true, message: `Entrega \"${selectedName}\" excluída com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir entrega \"${selectedName}\".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<EpiDelivery>[] = [
    {
      label: "Nº Documento",
      field: "document_number",
      sortable: true,
    },
    {
      label: "Data de Entrega",
      field: "delivery_date",
      sortable: true,
      render: (row) => dayjs(row.delivery_date).format("DD/MM/YYYY"),
    },
    {
      label: "Colaborador",
      field: "employee.name",
      render: (row) => row.employee?.name,
    },
  ];


  return (
    <>
      <Breadcrumbs items={[{ label: "Entregas de EPI", to: "/backoffice/entregas-epis" }]} />
      <SearchBar onSearch={(q) => load(q)} onClear={() => load()} />
      {loading && <Spinner />}
      {!loading && (
        <TableTailwind
          title="Entregas de EPI"
          createUrl="/backoffice/entregas-epis/nova"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => load(search, p, perPage),
            onPerPageChange: (pp) => load(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/entregas-epis/editar/${id}`}
          onDelete={(id) => handleAskDelete(id)}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir Entrega de EPI"
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
