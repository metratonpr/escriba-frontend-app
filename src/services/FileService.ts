import { getFileDownloadUrl, getFileViewUrl } from "../api/apiConfig";
import { getStoredToken } from "./authService";

const DEFAULT_BLOB_FILE_NAME = "arquivo";

const normalizeUrl = (value?: string | null): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

const buildFileName = (fileId?: number | string | null, fileName?: string | null): string => {
  const normalizedName = normalizeUrl(fileName);

  if (normalizedName) {
    return normalizedName;
  }

  if (fileId !== null && fileId !== undefined && String(fileId).trim()) {
    return `${DEFAULT_BLOB_FILE_NAME}-${fileId}`;
  }

  return DEFAULT_BLOB_FILE_NAME;
};

class FileService {
  private getAuthHeaders(): HeadersInit {
    const token = getStoredToken();

    return {
      Accept: "*/*",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private resolveViewUrl(fileId?: number | string | null, viewUrl?: string | null): string | null {
    const explicitUrl = normalizeUrl(viewUrl);

    if (explicitUrl) {
      return explicitUrl;
    }

    if (fileId === null || fileId === undefined || String(fileId).trim() === "") {
      return null;
    }

    return getFileViewUrl(fileId);
  }

  private resolveDownloadUrl(
    fileId?: number | string | null,
    downloadUrl?: string | null
  ): string | null {
    const explicitUrl = normalizeUrl(downloadUrl);

    if (explicitUrl) {
      return explicitUrl;
    }

    if (fileId === null || fileId === undefined || String(fileId).trim() === "") {
      return null;
    }

    return getFileDownloadUrl(fileId);
  }

  private async fetchBlobFromUrl(url: string): Promise<Blob> {
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  async getFileBlob(fileId?: number | string | null, viewUrl?: string | null): Promise<string> {
    const resolvedViewUrl = this.resolveViewUrl(fileId, viewUrl);

    if (!resolvedViewUrl) {
      throw new Error("URL de visualizacao indisponivel.");
    }

    const blob = await this.fetchBlobFromUrl(resolvedViewUrl);
    return URL.createObjectURL(blob);
  }

  async getFileUrl(fileId?: number | string | null, viewUrl?: string | null): Promise<string> {
    return this.getFileBlob(fileId, viewUrl);
  }

  async openFileInNewTab(fileId?: number | string | null, viewUrl?: string | null): Promise<void> {
    const tab = window.open("", "_blank");

    if (!tab) {
      throw new Error("Nao foi possivel abrir uma nova aba.");
    }

    try {
      const blobUrl = await this.getFileBlob(fileId, viewUrl);
      tab.location.href = blobUrl;

      window.setTimeout(() => {
        this.revokeFileUrl(blobUrl);
      }, 60_000);
    } catch (error) {
      tab.close();
      throw error;
    }
  }

  async downloadFile(
    fileId?: number | string | null,
    fileName?: string | null,
    downloadUrl?: string | null
  ): Promise<void> {
    const resolvedDownloadUrl = this.resolveDownloadUrl(fileId, downloadUrl);

    if (!resolvedDownloadUrl) {
      throw new Error("URL de download indisponivel.");
    }

    const blob = await this.fetchBlobFromUrl(resolvedDownloadUrl);
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = blobUrl;
    anchor.download = buildFileName(fileId, fileName);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
      this.revokeFileUrl(blobUrl);
    }, 1_000);
  }

  revokeFileUrl(url: string): void {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
}

export const fileService = new FileService();
export default fileService;
