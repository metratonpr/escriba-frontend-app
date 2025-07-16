// pages/backoffice/empresas/companies/CompanyAttachmentViewerPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

export default function CompanyAttachmentViewerPage() {
  const { companyId, attachmentId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Empresas", to: "/backoffice/empresas" },
          { label: "Editar", to: `/backoffice/empresas/editar/${companyId}` },
          { label: "Visualizar Anexo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Visualizar Anexo da Empresa</h1>

      <FileViewer
        fileId={Number(attachmentId)}
        fileName="anexo.pdf" // Substitua pelo nome real, se disponível
      />
      <div className="mt-4">
        <button
          onClick={() => navigate(`/backoffice/empresas/editar/${companyId}`)}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Voltar para edição da empresa
        </button>
      </div>
    </div>
  );
}
