// src/pages/backoffice/medical-exams/ExamAttachmentViewerPage.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";


export default function ExamAttachmentViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const attachment = (location.state as any)?.attachment;

  if (!attachment || !attachment.id) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center text-red-600">
        Anexo não encontrado ou inválido. Volte e tente novamente.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumbs
        items={[
          { label: "Backoffice", to: "/backoffice" },
          { label: "Exames Médicos", to: "/backoffice/exames-medicos" },
          { label: "Visualizar Anexo", to: "#" },
        ]}
      />

      <h1 className="text-2xl font-bold mb-4">{attachment.nome_arquivo}</h1>

      <div className="mb-6">
        <FileViewer fileId={attachment.id} fileName={attachment.nome_arquivo} />
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
          ← Voltar
        </button>
      </div>
    </div>
  );
}
