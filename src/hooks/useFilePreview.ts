import { useEffect, useState } from "react";
import fileService from "../services/FileService";

export interface UseFilePreviewParams {
  fileId?: number | null;
  viewUrl?: string | null;
}

export interface UseFilePreviewResult {
  blobUrl: string | null;
  mimeType: string | null;
  loading: boolean;
  error: string;
  reload: () => void;
  setError: (value: string) => void;
}

export function useFilePreview({ fileId, viewUrl }: UseFilePreviewParams): UseFilePreviewResult {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    let currentBlobUrl: string | null = null;

    const load = async () => {
      if (!fileId && !viewUrl) {
        setError("Arquivo invalido.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setMimeType(null);

        const previewData = await fileService.getFilePreviewData(fileId, viewUrl);
        const nextBlobUrl = previewData.url;

        if (!active) {
          fileService.revokeFileUrl(nextBlobUrl);
          return;
        }

        currentBlobUrl = nextBlobUrl;
        setBlobUrl(nextBlobUrl);
        setMimeType(previewData.mimeType);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setBlobUrl(null);
        setMimeType(null);
        setError(loadError instanceof Error && loadError.message ? loadError.message : "Erro desconhecido ao carregar o anexo.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
      if (currentBlobUrl) {
        fileService.revokeFileUrl(currentBlobUrl);
      }
    };
  }, [fileId, viewUrl, reloadKey]);

  return {
    blobUrl,
    mimeType,
    loading,
    error,
    reload: () => setReloadKey((prev) => prev + 1),
    setError,
  };
}
