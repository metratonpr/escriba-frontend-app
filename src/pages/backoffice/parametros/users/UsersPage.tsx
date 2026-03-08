import { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import Toast from "../../../../components/Layout/Feedback/Toast";
import DeleteModal from "../../../../components/Layout/ui/DeleteModal";
import SearchBar from "../../../../components/Layout/ui/SearchBar";
import Spinner from "../../../../components/Layout/ui/Spinner";
import TableTailwind, { type Column } from "../../../../components/Layout/ui/TableTailwind";
import { getStoredUser } from "../../../../services/authService";
import {
  deleteUser,
  getUsers,
  sendUserPasswordResetLink,
  type PaginatedUsersResponse,
  type User,
} from "../../../../services/userService";

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: unknown } } })?.response;
  const message = response?.data?.message;
  return typeof message === "string" && message.trim().length > 0 ? message : fallback;
};

export default function UsersPage() {
  const [data, setData] = useState<PaginatedUsersResponse>({
    data: [],
    total: 0,
    per_page: 25,
    current_page: 1,
    last_page: 1,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [resettingUserId, setResettingUserId] = useState<number | string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  const currentUserId = useMemo(() => {
    const user = getStoredUser();
    return user?.id != null ? String(user.id) : "";
  }, []);

  const loadUsers = async (
    query: string = search,
    currentPage: number = page,
    limit: number = perPage,
    orderField: string = sortBy,
    orderDirection: "asc" | "desc" = sortOrder
  ) => {
    setLoading(true);
    try {
      const response = await getUsers({
        search: query,
        page: currentPage,
        perPage: limit,
        sortBy: orderField,
        sortOrder: orderDirection,
      });
      setData(response);
    } catch (error) {
      setToast({
        open: true,
        message: resolveErrorMessage(error, "Erro ao carregar usuários."),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [search, page, perPage, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearch(query.trim());
    setPage(1);
  };

  const handleAskDelete = (id: number | string) => {
    if (String(id) === currentUserId) {
      setToast({
        open: true,
        message: "Você não pode excluir o próprio usuário.",
        type: "info",
      });
      return;
    }

    const item = data.data.find((user) => String(user.id) === String(id));
    setSelectedId(id);
    setSelectedName(item?.name ?? null);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId == null) {
      return;
    }

    try {
      await deleteUser(String(selectedId));
      setToast({
        open: true,
        message: `Usuário "${selectedName ?? ""}" excluído com sucesso.`,
        type: "success",
      });
      await loadUsers();
    } catch (error) {
      setToast({
        open: true,
        message: resolveErrorMessage(error, `Erro ao excluir usuário "${selectedName ?? ""}".`),
        type: "error",
      });
    } finally {
      setModalOpen(false);
      setSelectedId(null);
      setSelectedName(null);
    }
  };

  const handleSendResetLink = async (user: User) => {
    setResettingUserId(user.id);

    try {
      const response = await sendUserPasswordResetLink(String(user.id));
      setToast({
        open: true,
        message: response.message || `Link de redefinição enviado para ${user.email}.`,
        type: "success",
      });
    } catch (error) {
      setToast({
        open: true,
        message: resolveErrorMessage(error, `Não foi possível enviar o link para ${user.email}.`),
        type: "error",
      });
    } finally {
      setResettingUserId(null);
    }
  };

  const columns: Column<User>[] = [
    { label: "Nome", field: "name", sortable: true },
    { label: "E-mail", field: "email", sortable: true },
    {
      label: "Perfil",
      field: "is_admin",
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.is_admin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.is_admin ? "Administrador" : "Padrão"}
        </span>
      ),
    },
    {
      label: "Senha",
      field: "id",
      render: (row) => {
        const isSending = String(resettingUserId) === String(row.id);
        return (
          <button
            type="button"
            onClick={() => void handleSendResetLink(row)}
            disabled={isSending}
            className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSending ? "Enviando..." : "Enviar redefinição"}
          </button>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Perfil", to: "/backoffice/perfil" },
          { label: "Usuários", to: "/backoffice/perfil/usuarios" },
        ]}
      />

      <SearchBar onSearch={handleSearch} onClear={() => handleSearch("")} />

      {loading ? (
        <Spinner />
      ) : (
        <TableTailwind
          title="Usuários"
          createUrl="/backoffice/perfil/usuarios/novo"
          columns={columns}
          data={data.data}
          pagination={{
            total: data.total,
            perPage: data.per_page,
            currentPage: page,
            onPageChange: setPage,
            onPerPageChange: (nextPerPage: number) => {
              setPerPage(nextPerPage);
              setPage(1);
            },
          }}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
            setPage(1);
          }}
          getEditUrl={(id) => `/backoffice/perfil/usuarios/editar/${id}`}
          onDelete={handleAskDelete}
        />
      )}

      <DeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => void handleConfirmDelete()}
        itemName={selectedName ?? undefined}
        title="Excluir usuário"
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
