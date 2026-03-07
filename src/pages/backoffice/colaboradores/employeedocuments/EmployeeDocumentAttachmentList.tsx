import { Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientPagination } from "../../../../hooks/useClientPagination";
import InlinePagination from "../../../../components/Layout/ui/InlinePagination";

interface DocumentFile {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
}

interface EmployeeDocumentAttachmentListProps {
  persisted?: DocumentFile[];
  pending?: File[];
  onRemove: (index: number, type: "persisted" | "pending") => void;
}

const EmployeeDocumentAttachmentList: React.FC<EmployeeDocumentAttachmentListProps> = ({
  persisted = [],
  pending = [],
  onRemove,
}) => {
  const navigate = useNavigate();
  const persistedPagination = useClientPagination(persisted, { initialPerPage: 5 });
  const pendingPagination = useClientPagination(pending, { initialPerPage: 5 });

  const handleViewAttachment = (attachment: DocumentFile) => {
    navigate(`/backoffice/colaboradores/documentos/visualizar-anexo/${attachment.id}`, {
      state: { attachment },
    });
  };

  return (
    <div className="space-y-4">
      {persisted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Anexos existentes</h3>
          <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {persistedPagination.paginatedItems.map((file, index) => {
              const absoluteIndex = (persistedPagination.currentPage - 1) * persistedPagination.perPage + index;

              return (
                <li key={file.id} className="flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex flex-1 items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewAttachment(file)}
                      className="max-w-xs truncate text-left text-blue-600 underline hover:text-blue-800"
                      title="Clique para visualizar o arquivo"
                    >
                      {file.nome_arquivo}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewAttachment(file)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      aria-label="Visualizar anexo"
                      title="Visualizar arquivo"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(absoluteIndex, "persisted")}
                    className="ml-2 text-red-500 hover:text-red-700"
                    aria-label="Remover anexo"
                    title="Remover anexo"
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
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Arquivos a enviar</h3>
          <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
            {pendingPagination.paginatedItems.map((file, index) => {
              const absoluteIndex = (pendingPagination.currentPage - 1) * pendingPagination.perPage + index;

              return (
                <li key={`${file.name}-${absoluteIndex}`} className="flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-200">
                  <span className="max-w-xs truncate italic text-gray-500">{file.name} (nao salvo)</span>
                  <button
                    type="button"
                    onClick={() => onRemove(absoluteIndex, "pending")}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remover arquivo pendente"
                    title="Remover arquivo pendente"
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

      {persisted.length === 0 && pending.length === 0 && (
        <div className="py-4 text-center text-gray-500">
          <p>Nenhum arquivo anexado</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocumentAttachmentList;

