import React, { useEffect, useState } from "react";
import {
    getOccurrences,
    deleteOccurrence,
    type Occurrence,
    type PaginatedResponse,
} from "../../../../services/occurrenceService";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import Spinner from "../../../../components/Layout/ui/Spinner";
import Toast from "../../../../components/Layout/Feedback/Toast";

export default function OccurrencesPage() {
    const [data, setData] = useState<PaginatedResponse<Occurrence>>({
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
    const [sortBy, setSortBy] = useState<string | undefined>("occurrence_date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const load = async (
        q = "",
        pg = 1,
        limit = 25,
        sort = sortBy,
        order = sortOrder
    ) => {
        setLoading(true);
        try {
            const response = await getOccurrences({
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
        load(search, page, perPage);
    }, []);

    const handleAskDelete = (id: string) => {
        const item = data.data.find((d) => d.id === id);
        setSelectedId(id);
        setSelectedName(item?.employee.name ?? null);
        setModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedId) return;
        try {
            await deleteOccurrence(selectedId);
            await load(search, page, perPage);
            setToast({ open: true, message: `Ocorrência de "${selectedName}" excluída com sucesso.`, type: "success" });
        } catch {
            setToast({ open: true, message: `Erro ao excluir ocorrência de "${selectedName}".`, type: "error" });
        } finally {
            setModalOpen(false);
            setSelectedId(null);
            setSelectedName(null);
        }
    };

    const columns: Column<Occurrence>[] = [
        { label: "Data", field: "occurrence_date", sortable: true },
        { label: "Hora", field: "occurrence_time" },
        { label: "Colaborador", field: "employee_name", sortable: true },
        { label: "Empresa", field: "company_name", sortable: true },
        { label: "Tipo", field: "type_name", sortable: true },
        { label: "Classificação", field: "classification", sortable: true },
        { label: "Gravidade", field: "severity", sortable: true },
        { label: "Status", field: "status", sortable: true },
    ];

    return (
        <>
            <Breadcrumbs items={[{ label: "Ocorrências", to: "/backoffice/ocorrencias" }]} />
            <SearchBar onSearch={(q) => load(q)} onClear={() => load()} />
            {loading && <Spinner />}
            {!loading && (
                <TableTailwind
                    title="Ocorrências"
                    createUrl="/backoffice/ocorrencias/novo"
                    columns={columns}
                    data={data.data}
                    pagination={{
                        total: data.total,
                        perPage: data.per_page,
                        currentPage: page,
                        onPageChange: (p) => load(search, p, perPage),
                        onPerPageChange: (pp) => load(search, 1, pp),
                    }}
                    getEditUrl={(id) => `/backoffice/ocorrencias/editar/${id}`}
                    onDelete={handleAskDelete}
                />
            )}

            <DeleteModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={selectedName ?? undefined}
                title="Excluir Ocorrência"
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