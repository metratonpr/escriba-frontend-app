// src/components/backoffice/EmployeeDocumentAttachmentList.tsx
import React from "react";
import { Trash2 } from "lucide-react";

interface Attachment {
  id: number;
  nome_arquivo: string;
  url_arquivo: string;
}

interface EmployeeDocumentAttachmentListProps {
  persisted: Attachment[];
  pending: File[];
  onRemove: (index: number, type: 'persisted' | 'pending') => void;
}

const EmployeeDocumentAttachmentList: React.FC<EmployeeDocumentAttachmentListProps> = ({
  persisted,
  pending,
  onRemove,
}) => {
  return (
    <div className="space-y-4">
      {persisted.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">Anexos existentes</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            {persisted.map((file, index) => (
              <li key={file.id} className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-200">
                <a href={file.url_arquivo} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate max-w-xs">
                  {file.nome_arquivo}
                </a>
                <button
                  type="button"
                  onClick={() => onRemove(index, 'persisted')}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remover anexo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">Arquivos a enviar</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            {pending.map((file, index) => (
              <li key={index} className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-200">
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index, 'pending')}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remover arquivo pendente"
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

export default EmployeeDocumentAttachmentList;
