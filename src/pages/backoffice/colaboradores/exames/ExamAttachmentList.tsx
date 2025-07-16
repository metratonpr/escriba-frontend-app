import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

interface Attachment {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
}

interface ExamAttachmentListProps {
  examId: string;
  persisted: Attachment[];
  pending: File[];
  onRemove: (index: number, type: 'persisted' | 'pending') => void;
}

const ExamAttachmentList: React.FC<ExamAttachmentListProps> = ({
  examId,
  persisted,
  pending,
  onRemove,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">Anexos já enviados</h3>
      {persisted.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum anexo enviado ainda.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {persisted.map((file, index) => (
            <li key={file.id} className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-200">
              <Link
                to={`/backoffice/exames-medicos/editar/${examId}/visualizar-anexo/${file.id}`}
                state={{ attachment: file }}
                className="text-blue-600 underline truncate max-w-xs"
              >
                {file.nome_arquivo}
              </Link>
              <button
                type="button"
                onClick={() => onRemove(index, 'persisted')}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <div className="pt-4">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">Arquivos pendentes</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            {pending.map((file, index) => (
              <li key={index} className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-200">
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index, 'pending')}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExamAttachmentList;
