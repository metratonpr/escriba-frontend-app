import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import {
  getEmployeeDocumentUploads,
  deleteEmployeeDocumentUpload,
  type EmployeeDocumentUpload,
  type PaginatedResponse,
} from "../../../../services/employeeDocumentService";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Toast from "../../../../components/Layout/Feedback/Toast";
import FileViewer from "../../../../components/Layout/FileViewer";

type SelectedAttachment = {
  fileId: number;
  fileName: string;
  viewUrl: string | null;
  downloadUrl: string | null;
};

type DeadlineInfo = {
  dueDate: dayjs.Dayjs | null;
  daysRemaining: number | null;
  label: string;
  className: string;
};

const getDocumentValidityDays = (row: EmployeeDocumentUpload): number | null => {
  const validityDays =
    row.document_version?.validity_days ?? row.document?.validity_days ?? null;

  return typeof validityDays === "number" && Number.isFinite(validityDays) ? validityDays : null;
};

const getBaseDate = (row: EmployeeDocumentUpload): string | null =>
  row.issued_at ?? row.emission_date ?? row.created_at ?? null;

const resolveDueDate = (row: EmployeeDocumentUpload): dayjs.Dayjs | null => {
  const explicitDueDate = row.due_date ?? row.expires_at ?? null;
  if (explicitDueDate && dayjs(explicitDueDate).isValid()) {
    return dayjs(explicitDueDate);
  }

  const baseDate = getBaseDate(row);
  const validityDays = getDocumentValidityDays(row);

  if (!baseDate || validityDays === null) {
    return null;
  }

  const parsedBaseDate = dayjs(baseDate);
  if (!parsedBaseDate.isValid()) {
    return null;
  }

  return parsedBaseDate.add(validityDays, "day");
};

const getDeadlineInfo = (row: EmployeeDocumentUpload): DeadlineInfo => {
  const dueDate = resolveDueDate(row);

  if (!dueDate) {
    return {
      dueDate: null,
      daysRemaining: null,
      label: "Sem vencimento",
      className: "",
    };
  }

  const today = dayjs().startOf("day");
  const dueDay = dueDate.startOf("day");
  const daysRemaining = dueDay.diff(today, "day");

  if (daysRemaining < 0) {
    return {
      dueDate,
      daysRemaining,
      label: "Vencido",
      className: "bg-red-100 text-red-700 border border-red-200",
    };
  }

  if (daysRemaining <= 30) {
    return {
      dueDate,
      daysRemaining,
      label: `${daysRemaining} dias`,
      className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    };
  }

  if (daysRemaining <= 60) {
    return {
      dueDate,
      daysRemaining,
      label: `${daysRemaining} dias`,
      className: "bg-green-100 text-green-700 border border-green-200",
    };
  }

  if (daysRemaining <= 90) {
    return {
      dueDate,
      daysRemaining,
      label: `${daysRemaining} dias`,
      className: "bg-blue-100 text-blue-700 border border-blue-200",
    };
  }

  return {
    dueDate,
    daysRemaining,
    label: `${daysRemaining} dias`,
    className: "bg-white text-gray-700 border border-gray-200",
  };
};

export default function EmployeeDocumentUploadPage() {
  const [data, setData] = useState<PaginatedResponse<EmployeeDocumentUpload>>({
    data: [],
    total: 0,
    page: 1,
    per_page: 25,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<string | undefined>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" as "success" | "error" });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);

  const loadDocuments = async (
    q = search,
    pg = page,
    limit = perPage,
    sort = sortBy,
    order = sortOrder
  ) => {
    setLoading(true);
    try {
      const response = await getEmployeeDocumentUploads({
        search: q,
        page: pg,
        perPage: limit,
        sortBy: sort,
        sortOrder: order,
      });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [search, page, perPage, sortBy, sortOrder]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAskDelete = (id: string) => {
    const item = data.data.find((d) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.employee?.name ?? null);

    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEmployeeDocumentUpload(selectedId);
      await loadDocuments();
      setToast({ open: true, message: `Documento de "${selectedName}" excluído com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir documento de "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const getViewableAttachment = (row: EmployeeDocumentUpload) => {
    if (row.upload?.has_file !== true) {
      return null;
    }

    const attachmentId = Number(row.upload?.id ?? row.upload_id ?? 0);
    if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
      return null;
    }

    return {
      id: attachmentId,
      nome_arquivo: row.upload?.nome_arquivo ?? `attachment-${attachmentId}`,
      url_arquivo: row.upload?.url_arquivo ?? "",
      links: {
        view: row.upload?.links?.view ?? null,
        download: row.upload?.links?.download ?? null,
      },
    };
  };

  const columns: Column<EmployeeDocumentUpload>[] = [
    {
      label: "Funcionario",
      field: "employee.name",
      render: (row) => row.employee?.name ?? "",
      sortable: true,
    },
    {
      label: "Documento",
      field: "document.code",
      render: (row) => {
        const doc = row.document ?? row.document_version;
        if (!doc) {
          return "";
        }

        if (doc.name) {
          return `${doc.code} - ${doc.name}`;
        }

        return `${doc.code}${doc.version ? ` (${doc.version})` : ""}`;
      },
      sortable: true,
    },
    {
      label: "Vencimento",
      field: "due_date",
      sortable: true,
      render: (row) => {
        const deadlineInfo = getDeadlineInfo(row);

        return (
          <div className="font-medium text-gray-900 dark:text-white">
            {deadlineInfo.dueDate ? deadlineInfo.dueDate.format("DD/MM/YYYY") : "Sem vencimento"}
          </div>
        );
      },
    },
    {
      label: "Temporalidade",
      field: "due_date",
      sortable: true,
      render: (row) => {
        const deadlineInfo = getDeadlineInfo(row);

        if (!deadlineInfo.dueDate) {
          return <span className="font-medium text-gray-900 dark:text-white">Sem Vencimento</span>;
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${deadlineInfo.className}`}
          >
            {deadlineInfo.label}
          </span>
        );
      },
    },
    {
      label: "Status",
      field: "status",
      sortable: true,
      render: (row) => {
        if (!row.status) return "";
        const clean = row.status.trim().toLowerCase();
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      },
    },
    {
      label: "Criado em",
      field: "created_at",
      render: (row) =>
        row.created_at && dayjs(row.created_at).isValid()
          ? dayjs(row.created_at).format("DD/MM/YYYY HH:mm")
          : "",
      sortable: true,
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Documentos de Colaboradores", to: "/backoffice/colaboradores/documentos" }]} />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />
              <TableTailwind
          loading={loading}
          title="Documentos de Colaboradores"
          createUrl="/backoffice/colaboradores/documentos/novo"
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
                    fileId: attachment.id,
                    fileName: attachment.nome_arquivo,
                    viewUrl: attachment.links?.view ?? attachment.url_arquivo ?? null,
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
          getEditUrl={(id) => `/backoffice/colaboradores/documentos/editar/${id}`}
          onDelete={handleAskDelete}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
            setPage(1);
          }}
        />

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir Documento"
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

