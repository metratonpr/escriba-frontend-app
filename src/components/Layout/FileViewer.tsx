import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import fileService from "../../services/FileService";

interface FileViewerProps {
  fileId?: number | null;
  fileName: string;
  viewUrl?: string | null;
  downloadUrl?: string | null;
  embedded?: boolean;
  showOpenInNewTab?: boolean;
  showDownload?: boolean;
  onClose?: () => void;
}

const isImageFile = (name: string) => /\.(jpe?g|png|webp|gif|svg)$/i.test(name);
const isPdfFile = (name: string) => /\.pdf$/i.test(name);

const formatViewerError = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Erro desconhecido ao carregar o anexo.";
};

const FileViewer: React.FC<FileViewerProps> = ({
  fileId,
  fileName,
  viewUrl,
  downloadUrl,
  embedded = false,
  showOpenInNewTab = true,
  showDownload = true,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const normalizedFileId =
    typeof fileId === "number" && Number.isInteger(fileId) && fileId > 0 ? fileId : null;
  const isImage = useMemo(() => isImageFile(fileName), [fileName]);
  const isPdf = useMemo(() => isPdfFile(fileName), [fileName]);
  const containerHeightClassName = embedded ? "h-full min-h-[24rem]" : "h-screen";

  useEffect(() => {
    let active = true;
    let currentBlobUrl: string | null = null;

    const loadFile = async () => {
      if (!normalizedFileId && !viewUrl) {
        setLoadError("Arquivo invalido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");
        setActionError("");

        const nextBlobUrl = await fileService.getFileUrl(normalizedFileId, viewUrl);

        if (!active) {
          fileService.revokeFileUrl(nextBlobUrl);
          return;
        }

        currentBlobUrl = nextBlobUrl;
        setBlobUrl(nextBlobUrl);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setBlobUrl(null);
        setLoadError(formatViewerError(loadError));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadFile();

    return () => {
      active = false;

      if (currentBlobUrl) {
        fileService.revokeFileUrl(currentBlobUrl);
      }
    };
  }, [normalizedFileId, viewUrl, reloadKey]);

  const handleOpenInNewTab = async () => {
    try {
      if (blobUrl) {
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        return;
      }

      setActionError("");
      await fileService.openFileInNewTab(normalizedFileId, viewUrl);
    } catch (openError) {
      setActionError(formatViewerError(openError));
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setActionError("");
      await fileService.downloadFile(normalizedFileId, fileName, downloadUrl);
    } catch (downloadError) {
      setActionError(formatViewerError(downloadError));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${containerHeightClassName}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-lg text-gray-600">Carregando anexo...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 p-8 ${containerHeightClassName}`}>
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-red-500">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">Erro ao carregar anexo</h3>
          <p className="mb-4 text-gray-600">{fileName}</p>
          <p className="mb-6 text-sm text-gray-500">{loadError}</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => {
                if (onClose) {
                  onClose();
                  return;
                }

                window.history.back();
              }}
              className="w-full rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${containerHeightClassName}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg">Nenhum conteudo para exibir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-gray-50 ${containerHeightClassName}`}>
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isPdf && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {isImage && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {!isImage && !isPdf && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                  <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="max-w-md truncate text-lg font-semibold text-gray-900">{fileName}</h1>
              <p className="text-sm text-gray-500">
                {isPdf ? "Documento PDF" : isImage ? "Imagem" : "Arquivo"}
              </p>
              {actionError && <p className="mt-2 text-sm text-red-600">{actionError}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showOpenInNewTab && (
              <button
                type="button"
                onClick={() => void handleOpenInNewTab()}
                className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Nova aba
              </button>
            )}
            {showDownload && (
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloading}
                className="inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {downloading ? "Baixando..." : "Download"}
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar visualizador"
                title="Fechar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {isImage && (
            <div className="flex h-full items-center justify-center p-4">
              <img
                src={blobUrl}
                alt={`Visualizacao do arquivo ${fileName}`}
                className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
                onError={() => setLoadError("Erro ao carregar imagem.")}
              />
            </div>
          )}

          {isPdf && (
            <iframe
              src={blobUrl}
              className="h-full w-full"
              title={`Visualizacao do PDF ${fileName}`}
              onError={() => setLoadError("Erro ao carregar PDF.")}
            />
          )}

          {!isImage && !isPdf && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
                  <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Pre-visualizacao nao disponivel
                </h3>
                <p className="mb-6 text-gray-500">
                  Use os botoes acima para abrir ou baixar o arquivo.
                </p>
                <div className="flex justify-center gap-3">
                  {showOpenInNewTab && (
                    <button
                      type="button"
                      onClick={() => void handleOpenInNewTab()}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                    >
                      Abrir em nova aba
                    </button>
                  )}
                  {showDownload && (
                    <button
                      type="button"
                      onClick={() => void handleDownload()}
                      disabled={downloading}
                      className="rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloading ? "Baixando..." : "Download"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
