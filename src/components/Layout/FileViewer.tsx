import { useEffect, useState } from "react";

interface FileViewerProps {
  fileId: number;
  fileName: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileId, fileName }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8000/api/view/${fileId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar");
        return res.blob();
      })
      .then((blob) => {
        const objUrl = URL.createObjectURL(blob);
        setUrl(objUrl);
      })
      .catch(() => setError("Erro ao carregar o anexo"));
  }, [fileId]);

  if (error) return <div className="text-red-600 text-center">{error}</div>;
  if (!url) return <div className="text-center text-gray-500">Carregando...</div>;

  const isImage = /\.(jpe?g|png|webp|gif)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);

  return (
    <div className="w-full h-[90vh] mx-auto flex justify-center items-center">
      {isImage && (
        <img
          src={url}
          alt={fileName}
          className="max-h-full max-w-full rounded shadow object-contain"
        />
      )}
      {isPdf && (
        <iframe
          src={url}
          className="w-full h-full border rounded"
          title="PDF Viewer"
        ></iframe>
      )}
      {!isImage && !isPdf && (
        <a
          href={url}
          download
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Baixar ou abrir
        </a>
      )}
    </div>
  );
};

export default FileViewer;
