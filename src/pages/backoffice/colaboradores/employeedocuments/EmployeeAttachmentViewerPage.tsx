// src/pages/backoffice/colaboradores/employeedocuments/EmployeeAttachmentViewerPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

export default function EmployeeAttachmentViewerPage() {
  const { attachmentId } = useParams<{ attachmentId: string }>();
  const navigate = useNavigate();

  const fileId = Number(attachmentId);
  const fileName = attachmentId ? `attachment-${attachmentId}` : "";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Colaboradores", to: "/backoffice/colaboradores" },
          { label: "Visualizar Anexo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Visualizar Anexo do Colaborador</h1>
      <div className="rounded border shadow">
        <FileViewer fileId={fileId} fileName={fileName} />
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        ← Voltar
      </button>
    </div>
  );
}
