import { Dialog, Transition } from "@headlessui/react";
import dayjs from "dayjs";
import { Fragment, useEffect, useState } from "react";
import { Download, Eye } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  deleteEpiDelivery,
  getEpiDeliveries,
  getEpiDeliveryTermBlob,
  getEpiDeliveryTermUrl,
  type PaginatedResponse,
} from "../../../services/epiDeliveryService";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import FileViewer from "../../../components/Layout/FileViewer";
import DeleteModal from "../../../components/Layout/ui/DeleteModal";
import SearchBar from "../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../components/Layout/ui/TableTailwind";
import type { EpiDelivery } from "../../../types/epi";

type SelectedTerm = {
  fileName: string;
  viewUrl: string;
  downloadUrl: string;
};

function getTermFileName(row: EpiDelivery): string {
  const safeDocumentNumber = (row.document_number || `entrega-epi-${row.id}`)
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeDocumentNumber || `entrega-epi-${row.id}`}-termo.pdf`;
}

export default function EpiDeliveriesPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResponse<EpiDelivery>>({
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
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);
  const shortcutId = searchParams.get("termId") ?? searchParams.get("id");
  const parsedShortcutId = shortcutId ? Number(shortcutId) : null;
  const hasValidShortcutId =
    parsedShortcutId !== null &&
    Number.isInteger(parsedShortcutId) &&
    parsedShortcutId > 0;

  const loadEpiDeliveries = async (q = search, pg = page, limit = perPage) => {
    setLoading(true);
    try {
      const response = await getEpiDeliveries({ search: q, page: pg, perPage: limit });
      setData(response);
      setPage(pg);
      setPerPage(limit);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasValidShortcutId) {
      return;
    }

    void loadEpiDeliveries();
  }, [search, page, perPage, hasValidShortcutId]);

  useEffect(() => {
    if (!shortcutId) {
      return;
    }

    if (!hasValidShortcutId || parsedShortcutId === null) {
      setToast({
        open: true,
        message: 'Informe um ID valido para o atalho do termo. Ex.: "/backoffice/entregas-epis?termId=123".',
        type: "error",
      });
      return;
    }

    window.location.assign(getEpiDeliveryTermUrl(parsedShortcutId));
  }, [shortcutId, parsedShortcutId, hasValidShortcutId]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleAskDelete = (id: number) => {
    const item = data.data.find((delivery: EpiDelivery) => delivery.id === id);
    setSelectedId(id);
    setSelectedName(item?.document_number ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) {
      return;
    }

    try {
      await deleteEpiDelivery(selectedId);
      await loadEpiDeliveries();
      setToast({ open: true, message: `Entrega "${selectedName}" excluida com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir entrega "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const handleViewTerm = (row: EpiDelivery) => {
    const termUrl = getEpiDeliveryTermUrl(row.id);

    setSelectedTerm({
      fileName: getTermFileName(row),
      viewUrl: termUrl,
      downloadUrl: termUrl,
    });
  };

  const handleDownloadTerm = async (row: EpiDelivery) => {
    setDownloadingId(row.id);

    try {
      const blob = await getEpiDeliveryTermBlob(row.id);
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = getTermFileName(row);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setToast({
        open: true,
        message: `Erro ao baixar o termo da entrega "${row.document_number ?? row.id}".`,
        type: "error",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const columns: Column<EpiDelivery>[] = [
    {
      label: "No Documento",
      field: "document_number",
      sortable: true,
      render: (row) => row.document_number?.trim() || "",
    },
    {
      label: "Data de Entrega",
      field: "delivery_date",
      sortable: true,
      render: (row) =>
        row.delivery_date && dayjs(row.delivery_date).isValid()
          ? dayjs(row.delivery_date).format("DD/MM/YYYY")
          : "",
    },
    {
      label: "Colaborador",
      field: "employee.name",
      render: (row) => row.employee?.name?.trim() || "",
    },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Entregas de EPI", to: "/backoffice/entregas-epis" }]} />
      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />

      <TableTailwind
        loading={loading}
        title="Entregas de EPI"
        createUrl="/backoffice/entregas-epis/nova"
        columns={columns}
        data={data.data}
        renderActions={(row) => (
          <>
            <button
              type="button"
              onClick={() => handleViewTerm(row)}
              aria-label="Visualizar termo"
              title="Visualizar termo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadTerm(row)}
              disabled={downloadingId === row.id}
              aria-label="Baixar termo"
              title="Baixar termo"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Download size={16} />
            </button>
          </>
        )}
        pagination={{
          total: data.total,
          perPage: data.per_page,
          currentPage: page,
          onPageChange: (nextPage) => setPage(nextPage),
          onPerPageChange: (nextPerPage) => {
            setPerPage(nextPerPage);
            setPage(1);
          },
        }}
        getEditUrl={(id) => `/backoffice/entregas-epis/editar/${id}`}
        onDelete={handleAskDelete}
      />

      <Transition appear show={selectedTerm !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedTerm(null)}>
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
                    {selectedTerm?.fileName ?? "Visualizar termo"}
                  </Dialog.Title>

                  {selectedTerm ? (
                    <FileViewer
                      embedded
                      fileName={selectedTerm.fileName}
                      viewUrl={selectedTerm.viewUrl}
                      downloadUrl={selectedTerm.downloadUrl}
                      onClose={() => setSelectedTerm(null)}
                    />
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedName ?? undefined}
        title="Excluir Entrega de EPI"
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
