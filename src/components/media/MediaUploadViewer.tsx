import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

export interface MediaUploadItem {
  id: string;
  name: string;
  previewUrl?: string;
  mimeType?: string;
  file?: File;
}

interface MediaUploadViewerProps {
  items: MediaUploadItem[];
  onChange: (items: MediaUploadItem[]) => void;
  perPage?: number;
  title?: string;
  description?: string;
}

const DEFAULT_PER_PAGE = 3;

export default function MediaUploadViewer({
  items,
  onChange,
  perPage = DEFAULT_PER_PAGE,
  title = "Arquivos do evento",
  description = "Envie imagens, vídeos ou documentos que devem acompanhar o registro.",
}: MediaUploadViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdPreviewsRef = useRef(new Set<string>());

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

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
    if (item.previewUrl && item.mimeType?.startsWith("image/")) {
      return (
        <img
          loading="lazy"
          src={item.previewUrl}
          alt={item.name}
          className="h-32 w-32 object-cover"
        />
      );
    }

    if (item.previewUrl && item.mimeType?.startsWith("video/")) {
      return (
        <video
          src={item.previewUrl}
          className="h-32 w-32 rounded-xl object-cover"
          muted
          controls
        />
      );
    }

    if (item.previewUrl) {
      return (
        <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-900/5 text-xs text-gray-500">
          {item.name}
        </div>
      );
    }

    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-900/5 text-xs text-gray-500">
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {currentItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 p-3"
              >
                {renderPreview(item)}
                <div className="flex w-full flex-col items-center text-center text-xs text-gray-500">
                  <p className="truncate text-sm font-semibold text-gray-700">{item.name}</p>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
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

      <label className="block rounded-2xl border border-dashed border-blue-500/30 bg-blue-50/60 px-4 py-5 text-center transition hover:border-blue-400 focus-within:border-blue-600 focus-within:ring focus-within:ring-blue-200">
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
    </section>
  );
}
