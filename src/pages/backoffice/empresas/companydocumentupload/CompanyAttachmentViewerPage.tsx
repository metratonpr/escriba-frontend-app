import { useParams, useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

interface DocumentFile {
    id: number;
    nome_arquivo: string;
    url_arquivo: string;
    links?: {
        view?: string;
        download?: string;
    };
}

interface LocationState {
    attachment?: DocumentFile;
}

export default function CompanyAttachmentViewerPage() {
    const { companyId, attachmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as LocationState;
    const attachment = state?.attachment;

    // Se não tiver attachment no state, tenta usar só o attachmentId
    if (!attachment && !attachmentId) {
        return (
            <div className="p-4 text-center text-red-600">
                Anexo não encontrado ou inválido. Volte e tente novamente.
            </div>
        );
    }

    const fileId = attachment?.id || Number(attachmentId);
    const fileName = attachment?.nome_arquivo || `attachment-${attachmentId}`;
    const viewUrl = attachment?.links?.view ?? attachment?.url_arquivo ?? null;
    const downloadUrl = attachment?.links?.download ?? null;

    if (!fileId) {
        return (
            <div className="p-4 text-center text-red-600">
                ID do anexo inválido. Volte e tente novamente.
            </div>
        );
    }

    return (
        <div className="h-[90vh] p-4 flex flex-col">
            <Breadcrumbs
                items={[
                    { label: "Backoffice", to: "/backoffice" },
                    { label: "Empresas", to: "/backoffice/empresas" },
                    { label: "Documentos", to: "/backoffice/empresas/documentos" },
                    { label: "Visualizar Anexo", to: "#" },
                ]}
            />

            <h1 className="text-xl font-semibold mb-4 truncate">
                {fileName}
            </h1>

            <div className="flex-1 overflow-hidden">
                <FileViewer
                    embedded
                    fileId={fileId}
                    fileName={fileName}
                    viewUrl={viewUrl}
                    downloadUrl={downloadUrl}
                />
            </div>

            <div className="mt-4">
                <button
                    onClick={() =>
                        companyId
                            ? navigate(`/backoffice/empresas/editar/${companyId}`)
                            : navigate("/backoffice/empresas/documentos")
                    }
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Voltar
                </button>
            </div>
        </div>
    );
}
