
import React from "react";

interface FileViewerProps {
  fileUrl: string; // Exemplo: "medical_exams/2025/07/06/arquivo.pdf"
  baseUrl?: string; // Pode vir de env: import.meta.env.VITE_API_BASE_URL
  className?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({
  fileUrl,
  baseUrl = import.meta.env.VITE_API_BASE_URL,
  className = "w-full max-w-2xl mx-auto",
}) => {
  const fullUrl = `${baseUrl}/storage/${fileUrl}`.replace(/([^:]\/)\/+/g, "$1");
  const extension = fileUrl.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "");
  const isPDF = extension === "pdf";

  return (
    <div className={className}>
      {isImage ? (
        <img
          src={fullUrl}
          alt="Visualização do Arquivo"
          className="w-full h-auto rounded shadow"
        />
      ) : isPDF ? (
        <iframe
          src={fullUrl}
          title="Visualização de PDF"
          className="w-full h-[600px] border rounded"
        />
      ) : (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Visualizar Documento
        </a>
      )}
    </div>
  );
};

export default FileViewer;
