import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Eye } from "lucide-react";
import {
  getMedicalExams,
  deleteMedicalExam,
  type MedicalExam,
  type PaginatedResponse,
} from "../../../../services/medicalExamService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FileViewer from "../../../../components/Layout/FileViewer";
import {
  convertToBrazilianDateFormat,
  formatCurrency,
} from "../../../../utils/formatUtils";

type SelectedAttachment = {
  fileId: number;
  fileName: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

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
  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);

  const loadMedicalExams = async (q = search, pg = page, limit = perPage) => {
    setLoading(true);
    try {
      const response = await getMedicalExams({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(response.page);
      setPerPage(response.per_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalExams();
  }, [search, page, perPage]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedEmployee(item?.employee_name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteMedicalExam(selectedId);

      const isLastItem = data.data.length === 1 && page > 1;
      const newPage = isLastItem ? page - 1 : page;

      await loadMedicalExams(search, newPage, perPage);

      setToast({ open: true, message: `Exame de "${selectedEmployee}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir exame de "${selectedEmployee}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedEmployee(null);
    }
  };

  const getViewableAttachment = (exam: MedicalExam) =>
    exam.uploads?.find((attachment) => {
      const attachmentId = Number(attachment.upload_id ?? attachment.id);
      return attachment.has_file === true && Number.isInteger(attachmentId) && attachmentId > 0;
    }) ?? null;

  const columns: Column<MedicalExam>[] = [
    { label: "Colaborador", field: "employee_name" },
    { label: "Tipo", field: "exam_type" },
    {
      label: "Data",
      field: "exam_date",
      render: (row) => (row.exam_date ? convertToBrazilianDateFormat(row.exam_date) : "-"),
    },
    {
      label: "Apto",
      field: "fit",
      render: (row) => (
        <span className={`font-semibold ${row.fit ? "text-green-600" : "text-red-600"}`}>
          {row.fit ? "Sim" : "Não"}
        </span>
      ),
    },
    {
      label: "Custo",
      field: "cost",
      render: (row) => (row.cost == null ? "-" : formatCurrency(row.cost)),
    },
    { label: "CID", field: "cid", render: (row) => row.cid || "" },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Parâmetros", to: "/backoffice/parametros" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
        ]}
      />

      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />

              <TableTailwind
          loading={loading}
          title="Exames Médicos"
          createUrl="/backoffice/exames-medicos/novo"
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
          renderActions={(row) => {
            const attachment = getViewableAttachment(row);

            if (!attachment) {
              return null;
            }

            return (
              <button
                type="button"
                onClick={() =>
                  setSelectedAttachment({
                    fileId: Number(attachment.upload_id ?? attachment.id),
                    fileName: attachment.nome_arquivo,
                    viewUrl: attachment.links?.view ?? null,
                    downloadUrl: attachment.links?.download ?? null,
                  })
                }
                aria-label="Visualizar anexo"
                title="Visualizar anexo"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                <Eye size={16} />
              </button>
            );
          }}
          getEditUrl={(id) => `/backoffice/exames-medicos/editar/${id}`}
          onDelete={handleAskDelete}
        />

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

      <Transition appear show={selectedAttachment !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedAttachment(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Dialog.Title className="sr-only">
                    {selectedAttachment?.fileName ?? "Visualizar arquivo"}
                  </Dialog.Title>

                  {selectedAttachment && (
                    <FileViewer
                      embedded
                      fileId={selectedAttachment.fileId}
                      fileName={selectedAttachment.fileName}
                      viewUrl={selectedAttachment.viewUrl}
                      downloadUrl={selectedAttachment.downloadUrl}
                      onClose={() => setSelectedAttachment(null)}
                    />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}


