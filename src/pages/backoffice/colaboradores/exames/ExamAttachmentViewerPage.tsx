import { useParams, useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

export default function ExamAttachmentViewerPage() {
  const { examId, attachmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const attachment = (location.state as any)?.attachment;

  if (!attachment || !attachment.id) {
    return (
      <div className="p-4 text-center text-red-600">
        Anexo não encontrado ou inválido. Volte e tente novamente.
      </div>
    );
  }

  return (
    <div className="h-[90vh] p-4 flex flex-col">
      <Breadcrumbs
        items={[
          { label: "Backoffice", to: "/backoffice" },
          {
            label: "Exame Médico",
            to: `/backoffice/exames-medicos/editar/${examId}`,
          },
          { label: "Visualizar Anexo", to: "#" },
        ]}
      />

      <h1 className="text-xl font-semibold mb-4 truncate">{attachment.nome_arquivo}</h1>

      <div className="flex-1 border rounded overflow-hidden">
        <FileViewer fileId={attachmentId ? Number(attachmentId) : attachment.id} fileName={attachment.nome_arquivo} />
      </div>

      <div className="mt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}
