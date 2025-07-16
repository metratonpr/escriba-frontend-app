import { useEffect, useState } from "react";
import {
  getCompanyGroups,
  deleteCompanyGroup,
  type CompanyGroup,
  type PaginatedResponse,
} from "../../../../services/companyGroupService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function CompanyGroupsPage() {
  const [data, setData] = useState<PaginatedResponse<CompanyGroup>>({
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

  const loadGroups = async (q = search, pg = page, limit = perPage) => {
    setLoading(true);
    try {
      const response = await getCompanyGroups({ search: q, page: pg, perPage: limit });
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q.trim());
    setPage(1);
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
      await deleteCompanyGroup(selectedId);
      await loadGroups();
      setToast({ open: true, message: `Grupo "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir grupo "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<CompanyGroup>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Responsável", field: "responsible", sortable: true },
    { label: "Email", field: "contact_email" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Grupos de Empresa", to: "/backoffice/grupos-empresa" },
        ]}
      />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Grupos de Empresas"
          createUrl="/backoffice/grupos-empresa/novo"
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
          getEditUrl={(id) => `/backoffice/grupos-empresa/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir grupo de empresa"
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
