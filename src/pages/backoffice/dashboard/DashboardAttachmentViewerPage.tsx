import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../components/Layout/FileViewer";

type AttachmentState = {
  attachment?: {
    id: number;
    nome_arquivo: string;
    url_arquivo?: string;
  };
  viewUrl?: string;
  downloadUrl?: string;
};

export default function DashboardAttachmentViewerPage() {
  const { attachmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as AttachmentState;
  const attachment = state?.attachment;
  const parsedAttachmentId = Number(attachment?.id ?? attachmentId);
  const fileId = Number.isInteger(parsedAttachmentId) && parsedAttachmentId > 0
    ? parsedAttachmentId
    : null;
  const fileName = attachment?.nome_arquivo || `attachment-${attachmentId}`;
  const viewUrl = state?.viewUrl ?? null;
  const downloadUrl = state?.downloadUrl ?? null;

  if (!fileId && !viewUrl) {
    return (
      <div className="p-4 text-center text-red-600">
        Arquivo nao encontrado ou invalido. Volte e tente novamente.
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] flex-col p-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/backoffice/dashboard" },
          { label: "Vencimentos", to: "/backoffice/dashboard/vencimentos" },
          { label: "Visualizar arquivo", to: "#" },
        ]}
      />

      <h1 className="mb-4 truncate text-xl font-semibold">{fileName}</h1>

      <div className="flex-1 overflow-hidden rounded border">
        <FileViewer
          fileId={fileId}
          fileName={fileName}
          viewUrl={viewUrl}
          downloadUrl={downloadUrl}
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => navigate("/backoffice/dashboard/vencimentos")}
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
