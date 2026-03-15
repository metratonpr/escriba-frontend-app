import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useClientPagination } from "../../../../hooks/useClientPagination";
import InlinePagination from "../../../../components/Layout/ui/InlinePagination";

interface Attachment {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
  has_file?: boolean | null;
}

interface CompanyAttachmentListProps {
  companyId: string;
  persisted: Attachment[];
  pending: File[];
  onRemove: (index: number, type: "persisted" | "pending") => void;
}

const CompanyAttachmentList: React.FC<CompanyAttachmentListProps> = ({
  companyId,
  persisted,
  pending,
  onRemove,
}) => {
  const persistedPagination = useClientPagination(persisted, { initialPerPage: 5 });
  const pendingPagination = useClientPagination(pending, { initialPerPage: 5 });
  const canViewAttachment = (attachment: Attachment) => attachment.has_file === true;

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Anexos ja enviados</h3>

      {persisted.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum anexo enviado ainda.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {persistedPagination.paginatedItems.map((file, index) => {
              const absoluteIndex = (persistedPagination.currentPage - 1) * persistedPagination.perPage + index;

              return (
                <li key={file.id} className="flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-200">
                  {canViewAttachment(file) ? (
                    <Link
                      to={`/backoffice/empresas/editar/${companyId}/visualizar-anexo/${file.id}`}
                      state={{ attachment: file }}
                      className="max-w-xs truncate text-blue-600 underline"
                    >
                      {file.nome_arquivo}
                    </Link>
                  ) : (
                    <span className="max-w-xs truncate text-gray-500" title="Arquivo fisico indisponivel">
                      {file.nome_arquivo}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(absoluteIndex, "persisted")}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <InlinePagination
            className="mt-2"
            total={persistedPagination.total}
            currentPage={persistedPagination.currentPage}
            totalPages={persistedPagination.totalPages}
            perPage={persistedPagination.perPage}
            onPageChange={persistedPagination.setCurrentPage}
            onPerPageChange={persistedPagination.setPerPage}
          />
        </>
      )}

      {pending.length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Arquivos pendentes</h3>
          <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {pendingPagination.paginatedItems.map((file, index) => {
              const absoluteIndex = (pendingPagination.currentPage - 1) * pendingPagination.perPage + index;

              return (
                <li key={`${file.name}-${absoluteIndex}`} className="flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-200">
                  <span className="max-w-xs truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(absoluteIndex, "pending")}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <InlinePagination
            className="mt-2"
            total={pendingPagination.total}
            currentPage={pendingPagination.currentPage}
            totalPages={pendingPagination.totalPages}
            perPage={pendingPagination.perPage}
            onPageChange={pendingPagination.setCurrentPage}
            onPerPageChange={pendingPagination.setPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default CompanyAttachmentList;
