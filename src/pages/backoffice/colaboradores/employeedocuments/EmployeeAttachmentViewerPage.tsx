// src/pages/backoffice/colaboradores/EmployeeAttachmentViewerPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "../../../../components/Layout/Breadcrumbs";
import FileViewer from "../../../../components/Layout/FileViewer";

export default function EmployeeAttachmentViewerPage() {
  const { employeeId, attachmentId } = useParams();
  const navigate = useNavigate();

  const url = `/api/employee-attachments/${attachmentId}`; // Endpoint Laravel deve servir o arquivo

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Breadcrumbs
        items={[
          { label: "Colaboradores", to: "/backoffice/colaboradores" },
          { label: "Editar", to: `/backoffice/colaboradores/editar/${employeeId}` },
          { label: "Visualizar Anexo", to: "#" },
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Visualizar Anexo do Colaborador</h1>

      <FileViewer
        url={url}
        onBack={() => navigate(`/backoffice/colaboradores/editar/${employeeId}`)}
        className="rounded border shadow"
      />
    </div>
  );
}
