// src/pages/backoffice/parametros/companyTypes/CompanyTypesPage.tsx
import React, { useEffect, useState } from "react";
import {
  getCompanyTypes,
  deleteCompanyType,
  type CompanyType,
  type PaginatedResponse
} from "../../../../services/companyTypeService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function CompanyTypesPage() {
  const [typesData, setTypesData] = useState<PaginatedResponse<CompanyType>>({ data: [], total: 0, per_page: 25, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const loadTypes = async (query = '', pageNumber = 1, perPageCount = 25) => {
    setLoading(true);
    try {
      const response = await getCompanyTypes({ search: query, page: pageNumber, perPage: perPageCount });
      setTypesData(response);
      setPage(pageNumber);
      setPerPage(perPageCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTypes(search, page, perPage); }, []);

  const handleAskDelete = (id: number) => {
    const type = typesData.data.find((t) => t.id === id);
    setSelectedId(id);
    setSelectedName(type?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteCompanyType(selectedId);
      await loadTypes(search, page, perPage);
      setToast({ open: true, message: `Tipo "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir tipo "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<CompanyType>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Descrição", field: "description", sortable: false },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Parâmetros", to: "/backoffice/parametros" }, { label: "Tipos de Empresa", to: "/backoffice/tipos-empresa" }]} />
      <SearchBar onSearch={(q) => loadTypes(q)} onClear={() => loadTypes("")} />
      {loading ? <Spinner /> : (
        <TableTailwind
          title="Tipos de Empresa"
          createUrl="/backoffice/tipos-empresa/novo"
          columns={columns}
          data={typesData.data}
          pagination={{
            total: typesData.total,
            perPage: typesData.per_page,
            currentPage: page,
            onPageChange: (p) => loadTypes(search, p, perPage),
            onPerPageChange: (pp) => loadTypes(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/tipos-empresa/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmDelete} itemName={selectedName ?? undefined} title="Excluir tipo de empresa" />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </>
  );
}
