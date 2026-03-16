import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

type ExamAttachmentState = {
  attachment?: {
    id: number;
    nome_arquivo: string;
  };
};

export default function ExamAttachmentViewerPage() {
  const { examId, attachmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const attachment = (location.state as ExamAttachmentState | null)?.attachment;

  if (!attachment && !attachmentId) {
    return (
      <div className="p-4 text-center text-red-600">
        Anexo nao encontrado ou invalido. Volte e tente novamente.
      </div>
    );
  }

  const fileId = attachment?.id || Number(attachmentId);
  const fileName = attachment?.nome_arquivo || `attachment-${attachmentId}`;

  if (!fileId) {
    return (
      <div className="p-4 text-center text-red-600">
        ID do anexo invalido. Volte e tente novamente.
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] flex-col p-4">
      <Breadcrumbs
        items={[
          { label: "Backoffice", to: "/backoffice" },
          {
            label: "Exame Medico",
            to: examId
              ? `/backoffice/exames-medicos/editar/${examId}`
              : "/backoffice/exames-medicos",
          },
          { label: "Visualizar Anexo", to: "#" },
        ]}
      />

      <h1 className="mb-4 truncate text-xl font-semibold">{fileName}</h1>

      <div className="flex-1 overflow-hidden rounded border">
        <FileViewer fileId={fileId} fileName={fileName} />
      </div>

      <div className="mt-4">
        <button
          onClick={() =>
            examId
              ? navigate(`/backoffice/exames-medicos/editar/${examId}`)
              : navigate("/backoffice/exames-medicos")
          }
          className="text-sm text-blue-600 hover:underline"
        >
          {"<- Voltar"}
        </button>
      </div>
    </div>
  );
}
