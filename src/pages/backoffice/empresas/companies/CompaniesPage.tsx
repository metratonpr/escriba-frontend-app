import { useEffect, useState } from "react";
import {
  getCompanies,
  deleteCompany,
  type CompanyResponse,
  type PaginatedResponse,
} from "../../../../services/companyService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function CompaniesPage() {
  const [data, setData] = useState<PaginatedResponse<CompanyResponse>>({
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

  const loadCompanies = async (q = search, pg = page, limit = perPage) => {
    setLoading(true);
    try {
      const response = await getCompanies({ search: q, page: pg, perPage: limit });
      const transformed = {
        ...response,
        data: response.data.map((c) => ({
          ...c,
          company_group_name: c.group?.name ?? "-",
          company_type_name: c.type?.name ?? "-",
        })),
      };
      setData(transformed);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q);
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
      await deleteCompany(selectedId);
      await loadCompanies();
      setToast({ open: true, message: `Empresa "${selectedName}" excluída com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir empresa "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const columns: Column<CompanyResponse>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Grupo", field: "company_group_name" },
    { label: "Tipo", field: "company_type_name" },
    { label: "CNPJ", field: "cnpj" },
    { label: "Cidade", field: "city" },
    { label: "Estado", field: "state" },
    { label: "Responsável", field: "responsible" },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Empresas", to: "/backoffice/empresas" }]} />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Empresas"
          createUrl="/backoffice/empresas/nova"
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
          getEditUrl={(id) => `/backoffice/empresas/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir Empresa"
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
