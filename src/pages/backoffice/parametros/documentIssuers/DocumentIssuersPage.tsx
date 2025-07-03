// src/pages/backoffice/parametros/documentIssuers/DocumentIssuersPage.tsx
import React, { useEffect, useState } from "react";
import {
  getDocumentIssuers,
  deleteDocumentIssuer,
  type DocumentIssuer,
  type PaginatedResponse,
} from "../../../../services/documentIssuerService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function DocumentIssuersPage() {
  const [data, setData] = useState<PaginatedResponse<DocumentIssuer>>({
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

  const loadIssuers = async (q = "", pg = 1, limit = 25) => {
    setLoading(true);
    try {
      const response = await getDocumentIssuers({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssuers(search, page, perPage);
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
      await deleteDocumentIssuer(selectedId);
      await loadIssuers(search, page, perPage);
      setToast({ open: true, message: `Órgão \"${selectedName}\" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir órgão \"${selectedName}\".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<DocumentIssuer>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Cidade", field: "city", sortable: false },
    { label: "Estado", field: "state", sortable: false },
    { label: "Telefone", field: "phone", sortable: false },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Parâmetros", to: "/backoffice/parametros" }, { label: "Órgãos Emissores", to: "/backoffice/orgaos-emissores" }]} />
      <SearchBar onSearch={(q) => loadIssuers(q)} onClear={() => loadIssuers("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Órgãos Emissores"
          createUrl="/backoffice/orgaos-emissores/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => loadIssuers(search, p, perPage),
            onPerPageChange: (pp) => loadIssuers(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/orgaos-emissores/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmDelete} itemName={selectedName ?? undefined} title="Excluir órgão emissor" />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
