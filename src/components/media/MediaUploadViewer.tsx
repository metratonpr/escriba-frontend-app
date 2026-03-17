import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

export interface MediaUploadItem {
  id: string;
  name: string;
  previewUrl?: string;
  mimeType?: string;
  file?: File;
  sizeBytes?: number;
  remoteUrl?: string;
}

interface MediaUploadViewerProps {
  items: MediaUploadItem[];
  onChange: (items: MediaUploadItem[]) => void;
  perPage?: number;
  title?: string;
  description?: string;
  readOnly?: boolean;
}

const DEFAULT_PER_PAGE = 3;

export default function MediaUploadViewer({
  items,
  onChange,
  perPage = DEFAULT_PER_PAGE,
  title = "Arquivos do evento",
  description = "Envie imagens, vídeos ou documentos que devem acompanhar o registro.",
  readOnly = false,
}: MediaUploadViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdPreviewsRef = useRef(new Set<string>());
  const [remotePreviews, setRemotePreviews] = useState<Record<string, string>>({});

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const formatBytes = (bytes?: number) => {
    if (!bytes) return null;
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return `${value.toFixed(1)} ${units[index]}`;
  };

  const fileCategory = (mime?: string) => {
    if (!mime) return null;
    const category = mime.split("/")[0];
    if (category === "video") return "Vídeo";
    if (category === "image") return "Imagem";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(
    () => () => {
      createdPreviewsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      createdPreviewsRef.current.clear();
    },
    []
  );

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [currentPage, items, perPage]);

  const registerPreview = (url?: string) => {
    if (!url) {
      return;
    }
    createdPreviewsRef.current.add(url);
  };

  const cleanupPreview = (url?: string) => {
    if (!url || !createdPreviewsRef.current.has(url)) {
      return;
    }
    URL.revokeObjectURL(url);
    createdPreviewsRef.current.delete(url);
  };

  useEffect(() => {
    setRemotePreviews((prev) => {
      const activeIds = new Set(items.map((item) => item.id));
      const next = { ...prev };
      let changed = false;

      Object.keys(prev).forEach((id) => {
        if (!activeIds.has(id)) {
          cleanupPreview(prev[id]);
          delete next[id];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [items]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const controllers: AbortController[] = [];

    items.forEach((item) => {
      if (!item.remoteUrl || remotePreviews[item.id]) {
        return;
      }

      const controller = new AbortController();
      controllers.push(controller);

      fetch(item.remoteUrl, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Falha ao carregar mídia.");
          }
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          registerPreview(url);
          setRemotePreviews((prev) => ({ ...prev, [item.id]: url }));
        })
        .catch(() => {
          // Falha silenciosa, a URL original fica disponível como fallback
        });
    });

    return () => {
      controllers.forEach((controller) => controller.abort());
    };
  }, [items, remotePreviews]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const newItems = Array.from(fileList).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      registerPreview(previewUrl);
      return {
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: file.name,
        mimeType: file.type,
        file,
        previewUrl,
      };
    });

    onChange([...items, ...newItems]);
    setCurrentPage(Math.max(1, Math.ceil((items.length + newItems.length) / perPage)));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    const updated = items.filter((item) => {
      if (item.id === id) {
        cleanupPreview(item.previewUrl);
        return false;
      }
      return true;
    });

    const remotePreviewUrl = remotePreviews[id];
    if (remotePreviewUrl) {
      cleanupPreview(remotePreviewUrl);
      setRemotePreviews((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }

    onChange(updated);
    setCurrentPage((prev) => {
      const nextTotal = Math.max(1, Math.ceil(updated.length / perPage));
      return Math.min(prev, nextTotal);
    });
  };

  const changePage = (next: number) => {
    setCurrentPage((prev) => Math.min(Math.max(1, prev + next), totalPages));
  };

  const renderPreview = (item: MediaUploadItem) => {
    const previewUrl = remotePreviews[item.id] ?? item.previewUrl;

    if (previewUrl && item.mimeType?.startsWith("image/")) {
      return (
        <img
          loading="lazy"
          src={previewUrl}
          alt={item.name}
          className="h-full w-full object-contain"
        />
      );
    }

    if (previewUrl && item.mimeType?.startsWith("video/")) {
      return (
        <video
          src={previewUrl}
          className="h-full w-full object-contain"
          muted
          controls
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-900/5 text-xs text-gray-500">
        {item.name}
      </div>
    );
  };

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <div className="text-xs text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </header>

      <div className="space-y-3">
        {currentItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            Nenhum arquivo carregado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {currentItems.map((item) => {
              const typeLabel = fileCategory(item.mimeType);
              const sizeLabel = formatBytes(item.sizeBytes);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-52 w-full overflow-hidden rounded-t-2xl bg-gray-100">
                    {renderPreview(item)}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/50 to-transparent opacity-0 transition group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        {item.mimeType?.startsWith("video/") ? "Assistir" : "Visualizar"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-4 pb-4 pt-3">
                    <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {typeLabel && (
                        <span className="rounded-full border border-gray-200 px-2 py-0.5">{typeLabel}</span>
                      )}
                      {sizeLabel && (
                        <span className="rounded-full border border-gray-200 px-2 py-0.5">
                          {sizeLabel}
                        </span>
                      )}
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => changePage(-1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-2 rounded-md border border-blue-600/40 px-3 py-1 text-xs font-semibold text-blue-600 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 rounded-md border border-blue-600/40 px-3 py-1 text-xs font-semibold text-blue-600 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próximo
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {items.length} arquivo{items.length === 1 ? "" : "s"}
        </div>
      </div>

      {!readOnly && (
        <label className="relative block rounded-2xl border border-dashed border-blue-500/30 bg-blue-50/60 px-4 py-5 text-center transition hover:border-blue-400 focus-within:border-blue-600 focus-within:ring focus-within:ring-blue-200">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <p className="text-sm font-semibold text-blue-600">Clique ou arraste arquivos</p>
          <p className="text-xs text-blue-600/80">JPG, JPEG, PNG, WEBP, MP4 até 50MB.</p>
        </label>
      )}
    </section>
  );
}
