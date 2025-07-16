// src/components/backoffice/CompanyDocumentAttachmentView.tsx

import { FileText } from "lucide-react";

interface CompanyDocumentAttachmentViewProps {
  url?: string;
  name?: string;
}

export default function CompanyDocumentAttachmentView({
  url,
  name = "Visualizar Arquivo",
}: CompanyDocumentAttachmentViewProps) {
  if (!url) return null;

  return (
    <div className="mt-4 border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-blue-500" />
        <span className="text-sm text-gray-800 dark:text-gray-100 truncate">{name}</span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        Visualizar
      </a>
    </div>
  );
}
