import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  deleteEpiDelivery,
  getEpiDeliveries,
  getEpiDeliveryTermBlob,
  getEpiDeliveryTermUrl,
  type PaginatedResponse,
} from "../../../services/epiDeliveryService";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../components/Layout/ui/DeleteModal";
import Toast from "../../../components/Layout/Feedback/Toast";
import type { EpiDelivery } from "../../../types/epi";

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
    const item = data.data.find((d: EpiDelivery) => d.id === id);
    setSelectedId(id);
    setSelectedName(item?.document_number ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteEpiDelivery(selectedId);
      await loadEpiDeliveries();
      setToast({ open: true, message: `Entrega "${selectedName}" excluída com sucesso.`, type: "success" });
    } catch {
      setToast({ open: true, message: `Erro ao excluir entrega "${selectedName}".`, type: "error" });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const handleDownloadTerm = async (row: EpiDelivery) => {
    setDownloadingId(row.id);

    try {
      const blob = await getEpiDeliveryTermBlob(row.id);
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeDocumentNumber = (row.document_number || `entrega-epi-${row.id}`)
        .trim()
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      anchor.href = objectUrl;
      anchor.download = `${safeDocumentNumber || `entrega-epi-${row.id}`}-termo.pdf`;
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
            label: "Nº Documento",
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
          )}
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
          getEditUrl={(id) => `/backoffice/entregas-epis/editar/${id}`}
          onDelete={handleAskDelete}
        />

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



