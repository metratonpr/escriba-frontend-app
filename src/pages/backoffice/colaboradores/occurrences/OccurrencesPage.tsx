import { useEffect, useState } from "react";
import {
  getOccurrences,
  deleteOccurrence,
  type Occurrence,
  type PaginatedResponse,
} from "../../../../services/occurrenceService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function OccurrencesPage() {
  const [data, setData] = useState<PaginatedResponse<Occurrence>>({
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

  const loadOccurrences = async (q = search, pg = page, limit = perPage) => {
    setLoading(true);
    try {
      const response = await getOccurrences({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOccurrences(search, page, perPage);
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAskDelete = (id: number) => {
    const item = data.data.find((o) => o.id === id);
    setSelectedId(id);
    setSelectedName(item?.employee_name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId == null) return;
    try {
      await deleteOccurrence(selectedId);
      await loadOccurrences(search, page, perPage);
      setToast({
        open: true,
        message: `Ocorrência de "${selectedName}" excluída com sucesso.`,
        type: "success",
      });
    } catch {
      setToast({
        open: true,
        message: `Erro ao excluir ocorrência de "${selectedName}".`,
        type: "error",
      });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<Occurrence>[] = [
    { label: "Colaborador", field: "employee_name", render: (row) => row.employee_name ?? "-" },
    { label: "Empresa", field: "company_name", render: (row) => row.company_name ?? "-" },
    { label: "Tipo", field: "type_name", render: (row) => row.type_name ?? "-" },
    { label: "Data", field: "occurrence_date", render: (row) => new Date(row.occurrence_date).toLocaleDateString("pt-BR") },
    { label: "Descrição", field: "description", render: (row) => row.description ?? "-" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Ocorrências", to: "/backoffice/ocorrencias" },
        ]}
      />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Ocorrências"
          createUrl="/backoffice/ocorrencias/novo"
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
          getEditUrl={(id) => `/backoffice/ocorrencias/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir Ocorrência"
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
