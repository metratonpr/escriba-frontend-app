import React, { useRef, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import DeleteModal from "../Layout/ui/DeleteModal";

export type UploadFile =
  | File
  | {
    id: number;
    nome_arquivo: string;
    url_arquivo: string;
  };

interface FileUploadProps {
  label?: string;
  files: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  showToast: (msg: string, type?: "error" | "success") => void;
  multiple?: boolean;
  maxSizeMB?: number;
  baseUrl?: string;
  onRemove?: (index: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label = "Enviar Arquivos",
  files,
  setFiles,
  showToast,
  multiple = true,
  maxSizeMB = 50,
  baseUrl = "",
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null);

  const ACCEPT = [
    ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".mp4", ".mov", ".avi", ".mkv", ".webm",
    ".txt", ".csv", ".zip", ".rar",
  ].join(",");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        showToast(`Arquivo "${file.name}" excede o limite de ${maxSizeMB}MB.`, "error");
        return false;
      }
      return true;
    });

    setFiles(multiple ? [...files, ...validFiles] : validFiles);
  };

  const confirmRemove = () => {
    if (fileToDeleteIndex === null) return;
    if (onRemove) onRemove(fileToDeleteIndex);
    setFiles(files.filter((_, i) => i !== fileToDeleteIndex));
    setFileToDeleteIndex(null);
  };

  const renderName = (file: UploadFile) =>
    file instanceof File ? file.name : file.nome_arquivo;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        <UploadCloud className="w-6 h-6 text-gray-500 dark:text-gray-300" />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Clique ou arraste arquivos (máx {maxSizeMB}MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT}
          multiple={multiple}
          onChange={handleFileChange}
        />
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-4">
          {files.map((file, index) => {
            const fileName = renderName(file);

            const isPersisted = !(file instanceof File);
            const viewerUrl = isPersisted ? `/backoffice/exames-medicos/anexo/${(file as any).id}` : undefined;

            return (
              <li
                key={index}
                className="flex justify-between items-center py-2 text-sm text-gray-700 dark:text-gray-200"
              >
                {viewerUrl ? (
                  <Link
                    to={`/backoffice/exames-medicos/anexo/${(file as any).id}`}
                    state={{ attachment: file }}
                    className="text-blue-600 underline truncate max-w-xs"
                  >
                    {fileName}
                  </Link>
                ) : (
                  <span className="truncate max-w-xs">{fileName}</span>
                )}

                <button
                  type="button"
                  onClick={() => setFileToDeleteIndex(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remover arquivo ${fileName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <DeleteModal
        isOpen={fileToDeleteIndex !== null}
        onClose={() => setFileToDeleteIndex(null)}
        onConfirm={confirmRemove}
        itemName={fileToDeleteIndex !== null ? renderName(files[fileToDeleteIndex]) : ""}
        description="Tem certeza que deseja excluir este arquivo? Esta ação não poderá ser desfeita."
      />
    </div>
  );
};

export default FileUpload;
