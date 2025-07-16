import { useEffect, useState } from "react";
import { BASE_URL } from "../../api/apiConfig";


interface FileViewerProps {
  fileId: number;
  fileName: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileId, fileName }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let objUrl: string;

    const fetchFile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/view/${fileId}`);
        if (!response.ok) throw new Error("Falha ao carregar arquivo");
        const blob = await response.blob();
        objUrl = URL.createObjectURL(blob);
        setUrl(objUrl);
      } catch {
        setError("Erro ao carregar o anexo.");
      }
    };

    fetchFile();

    return () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [fileId]);

  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!url) return <div className="text-center text-gray-500">Carregando anexo...</div>;

  const isImage = /\.(jpe?g|png|webp|gif)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  return (
    <div className="w-full h-[90vh] mx-auto flex justify-center items-center">
      {isImage && (
        <img
          src={url}
          alt={`Visualização do arquivo ${fileName}`}
          className="max-h-full max-w-full rounded shadow object-contain"
        />
      )}
      {isPdf && (
        <iframe
          src={url}
          className="w-full h-full border rounded"
          title={`Visualização do PDF ${fileName}`}
        />
      )}
      {!isImage && !isPdf && (
        <a
          href={url}
          download={fileName}
          className="text-blue-600 underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Baixar ou abrir o arquivo
        </a>
      )}
    </div>
  );
};

export default FileViewer;
