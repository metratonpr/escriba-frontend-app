// src/pages/backoffice/parametros/documents/DocumentsPage.tsx
import React, { useEffect, useState } from "react";
import {
  getDocuments,
  deleteDocument,
  type Document,
  type PaginatedResponse,
} from "../../../../services/documentService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function DocumentsPage() {
  const [data, setData] = useState<PaginatedResponse<Document>>({ data: [], total: 0, page: 1, per_page: 25 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const loadDocuments = async (q = "", pg = 1, limit = 25) => {
    setLoading(true);
    try {
      const response = await getDocuments({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments(search, page, perPage);
  }, []);

  const handleAskDelete = (id: string) => {
    const doc = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(doc?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteDocument(selectedId);
      await loadDocuments(search, page, perPage);
      setToast({ open: true, message: `Documento \"${selectedName}\" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir documento \"${selectedName}\".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<Document>[] = [
    { label: "Código", field: "code", sortable: true },
    { label: "Nome", field: "name", sortable: true },
    { label: "Categoria", field: "category", sortable: false },
    { label: "Versão", field: "version", sortable: false },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Parâmetros", to: "/backoffice/parametros" }, { label: "Documentos", to: "/backoffice/documentos" }]} />
      <SearchBar onSearch={(q) => loadDocuments(q)} onClear={() => loadDocuments("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Documentos"
          createUrl="/backoffice/documentos/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => loadDocuments(search, p, perPage),
            onPerPageChange: (pp) => loadDocuments(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/documentos/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmDelete} itemName={selectedName ?? undefined} title="Excluir documento" />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}