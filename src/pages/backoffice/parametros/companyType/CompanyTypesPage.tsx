import { useEffect, useState } from "react";
import {
  getCompanyTypes,
  deleteCompanyType,
  type CompanyType,
  type PaginatedResponse,
} from "../../../../services/companyTypeService";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function CompanyTypesPage() {
  const [data, setData] = useState<PaginatedResponse<CompanyType>>({
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

  const loadCompanyTypes = async (
    q: string = search,
    pg: number = page,
    limit: number = perPage
  ) => {
    setLoading(true);
    try {
      const response = await getCompanyTypes({ search: q, page: pg, perPage: limit });
      setData(response);
    } catch {
      setToast({
        open: true,
        message: "Erro ao carregar tipos de empresa.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyTypes();
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q.trim());
    setPage(1);
  };

  const handleAskDelete = (id: number) => {
  const item = data.data.find((d) => Number(d.id) === id);
  setSelectedId(id);
  setSelectedName(item?.name ?? null);
  setModalOpen(true);
};

const handleConfirmDelete = async () => {
  if (!selectedId) return;
  try {
    await deleteCompanyType(String(selectedId));
    setToast({
      open: true,
      message: `Tipo "${selectedName}" excluído com sucesso.`,
      type: "success",
    });
    await loadCompanyTypes();
  } catch {
    setToast({
      open: true,
      message: `Erro ao excluir tipo "${selectedName}".`,
      type: "error",
    });
  } finally {
    setModalOpen(false);
    setSelectedId(null);
    setSelectedName(null);
  }
};


  const columns: Column<CompanyType>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "Descrição", field: "description" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Tipos de Empresa", to: "/backoffice/tipos-empresa" },
        ]}
      />

      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />

      {loading ? (
        <Spinner />
      ) : (
        <TableTailwind
          title="Tipos de Empresa"
          createUrl="/backoffice/tipos-empresa/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: setPage,
            onPerPageChange: (pp: number) => {
              setPerPage(pp);
              setPage(1);
            },
          }}
          getEditUrl={(id) => `/backoffice/tipos-empresa/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir tipo de empresa"
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
