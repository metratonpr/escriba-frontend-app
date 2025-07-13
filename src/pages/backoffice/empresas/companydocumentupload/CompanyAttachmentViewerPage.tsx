// pages/backoffice/empresas/companies/CompanyAttachmentViewerPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

export default function CompanyAttachmentViewerPage() {
  const { companyId, attachmentId } = useParams();
  const navigate = useNavigate();

  const url = `/api/company-attachments/${attachmentId}`; // Endpoint Laravel deve servir o arquivo

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
        url={url}
        onBack={() => navigate(`/backoffice/empresas/editar/${companyId}`)}
        className="rounded border shadow"
      />
    </div>
  );
}
