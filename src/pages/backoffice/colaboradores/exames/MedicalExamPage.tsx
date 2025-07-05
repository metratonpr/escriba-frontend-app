import React, { useEffect, useState } from "react";
import {
  getMedicalExams,
  deleteMedicalExam,
  type MedicalExam,
  type PaginatedResponse,
} from "../../../../services/medicalExamService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Spinner from "../../../../components/Layout/ui/Spinner";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function MedicalExamPage() {
  const [data, setData] = useState<PaginatedResponse<MedicalExam>>({ data: [], total: 0, page: 1, per_page: 10 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const fetchExams = async (q = "", pg = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await getMedicalExams({ search: q, page: pg, perPage: limit });
      setData({
        data: response.data,
        total: response.total,
        page: response.current_page,
        per_page: response.per_page,
      });
      setPage(response.current_page);
      setPerPage(response.per_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(search, page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedEmployee(item?.employee?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteMedicalExam(selectedId);

      // Recalcula página se apagou o último item da última página
      const isLastItem = data.data.length === 1 && page > 1;
      const newPage = isLastItem ? page - 1 : page;

      await fetchExams(search, newPage, perPage);

      setToast({ open: true, message: `Exame de "${selectedEmployee}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir exame de "${selectedEmployee}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedEmployee(null);
    }
  };

  const columns: Column<MedicalExam>[] = [
    { label: "Colaborador", field: "employee.name", render: (row) => row.employee?.name || "-" },
    { label: "Tipo", field: "exam_type" },
    { label: "Data", field: "exam_date" },
    {
      label: "Apto",
      field: "fit",
      render: (row) => (
        <span className={`font-semibold ${row.fit ? "text-green-600" : "text-red-600"}`}>
          {row.fit ? "Sim" : "Não"}
        </span>
      ),
    },
    { label: "CID", field: "cid", render: (row) => row.cid || "-" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
        ]}
      />

      <SearchBar
        onSearch={(q) => {
          setSearch(q);
          fetchExams(q, 1, perPage);
        }}
        onClear={() => {
          setSearch("");
          fetchExams("", 1, perPage);
        }}
      />

      {loading && <Spinner />}

      {!loading && (
        <TableTailwind
          title="Exames Médicos"
          createUrl="/backoffice/exames-medicos/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: (p) => fetchExams(search, p, perPage),
            onPerPageChange: (pp) => fetchExams(search, 1, pp),
          }}
          getEditUrl={(id) => `/backoffice/exames-medicos/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedEmployee ?? undefined}
        title="Excluir Exame"
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
