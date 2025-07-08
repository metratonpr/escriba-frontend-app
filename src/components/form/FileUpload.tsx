import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";

export type UploadFile =
  | File
  | {
      id: number;
      nome_arquivo: string;
      url_arquivo: string;
    };

interface FileUploadProps {
  label?: string;
  files?: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  showToast: (msg: string, type?: "error" | "success") => void;
  multiple?: boolean;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label = "Enviar Arquivos",
  files = [],
  setFiles,
  showToast,
  multiple = true,
  maxSizeMB = 50,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

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
    e.target.value = ""; // limpa input
  };

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
    </div>
  );
};

export default FileUpload;
