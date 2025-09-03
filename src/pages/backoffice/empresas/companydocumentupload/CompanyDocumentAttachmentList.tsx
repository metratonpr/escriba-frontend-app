// src/components/backoffice/CompanyDocumentAttachmentList.tsx

import { Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocumentFile {
    id: number;
    nome_arquivo: string;
    url_arquivo: string;
}

interface CompanyDocumentAttachmentListProps {
    persisted?: DocumentFile[];
    pending?: File[];
    onRemove: (index: number, type: 'persisted' | 'pending') => void;
}

const CompanyDocumentAttachmentList: React.FC<CompanyDocumentAttachmentListProps> = ({
                                                                                         persisted = [],
                                                                                         pending = [],
                                                                                         onRemove,
                                                                                     }) => {
    const navigate = useNavigate();

    const handleViewAttachment = (attachment: DocumentFile) => {
        navigate(`/backoffice/empresas/documentos/visualizar-anexo/${attachment.id}`, {
            state: { attachment }
        });
    };

    return (
        <div className="space-y-4">
            {persisted.length > 0 && (
                <div>
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">Anexos existentes</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-2">
                        {persisted.map((file, index) => (
                            <li key={file.id} className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-200">
                                <div className="flex items-center space-x-2 flex-1">
                                    <button
                                        type="button"
                                        onClick={() => handleViewAttachment(file)}
                                        className="text-blue-600 hover:text-blue-800 underline truncate max-w-xs text-left"
                                        title="Clique para visualizar o arquivo"
                                    >
                                        {file.nome_arquivo}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleViewAttachment(file)}
                                        className="text-blue-500 hover:text-blue-700 p-1"
                                        aria-label="Visualizar anexo"
                                        title="Visualizar arquivo"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemove(index, 'persisted')}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                    aria-label="Remover anexo"
                                    title="Remover anexo"
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
                <span className="truncate max-w-xs text-gray-500 italic">
                  {file.name} (não salvo)
                </span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(index, 'pending')}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label="Remover arquivo pendente"
                                    title="Remover arquivo pendente"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {persisted.length === 0 && pending.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                    <p>Nenhum arquivo anexado</p>
                </div>
            )}
        </div>
    );
};

export default CompanyDocumentAttachmentList;