// src/pages/backoffice/parametros/occurrenceTypes/OccurrenceTypesListPage.tsx
import React, { useEffect, useState } from "react";
import {
  getOccurrenceTypes,
  deleteOccurrenceType,
  type OccurrenceType,
  type PaginatedResponse,
} from "../../../../services/occurrenceTypeService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";

export default function OccurrenceTypesListPage() {
  const [data, setData] = useState<PaginatedResponse<OccurrenceType>>({
    data: [],
    page: 1,
    per_page: 25,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getOccurrenceTypes({
        search,
        page,
        perPage,
        sortBy,
        sortOrder,
      });
      setData(result);
    } catch {
      setToast({ open: true, type: "error", message: "Erro ao carregar os tipos de ocorrência." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page, perPage, sortBy, sortOrder]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteOccurrenceType(selectedId);
      setToast({ open: true, message: `Tipo "${selectedName}" removido com sucesso.`, type: "success" });
      await loadData();
    } catch {
      setToast({ open: true, message: `Erro ao remover "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<OccurrenceType>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Categoria", field: "category", sortable: true },
    { label: "Gravidade", field: "severity_level", sortable: true },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Tipos de Ocorrência", to: "/backoffice/tipos-ocorrencia" },
        ]}
      />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />

      <TableTailwind
        title="Tipos de Ocorrência"
        createUrl="/backoffice/tipos-ocorrencia/novo"
        columns={columns}
        data={data.data}
        pagination={{
          total: data.total,
          currentPage: page,
          perPage: perPage,
          onPageChange: setPage,
          onPerPageChange: setPerPage,
        }}
        onSortChange={(field, order) => {
          setSortBy(field);
          setSortOrder(order);
        }}
        getEditUrl={(id) => `/backoffice/tipos-ocorrencia/editar/${id}`}
        onDelete={(id) => {
          const item = data.data.find((d) => d.id === id);
          setSelectedId(id);
          setSelectedName(item?.name || "Tipo");
          setModalOpen(true);
        }}
      />

      <DeleteModal
        isOpen={modalOpen}
        title="Remover Tipo de Ocorrência"
        itemName={selectedName ?? undefined}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
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
