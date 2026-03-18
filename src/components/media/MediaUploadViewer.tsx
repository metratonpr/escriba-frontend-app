import { Dialog, Transition } from "@headlessui/react";
import { Eye } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import FileViewer from "../Layout/FileViewer";

export interface MediaUploadItem {
  id: string;
  name: string;
  previewUrl?: string;
  mimeType?: string;
  file?: File;
  sizeBytes?: number;
  remoteUrl?: string;
  downloadUrl?: string;
  fileId?: number | null;
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
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<MediaUploadItem | null>(null);

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

  const resolveViewUrl = (item: MediaUploadItem) =>
    remotePreviews[item.id] ?? item.previewUrl ?? item.remoteUrl ?? null;

  const canOpenViewer = (item: MediaUploadItem) => Boolean(resolveViewUrl(item) || item.fileId);

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
    setPreviewLoading((prev) => {
      const activeIds = new Set(items.map((item) => item.id));
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach((id) => {
        if (!activeIds.has(id)) {
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

      setPreviewLoading((prev) => ({ ...prev, [item.id]: true }));

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
          setPreviewLoading((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
        })
        .catch(() => {
          // Falha silenciosa, a URL original fica disponível como fallback
          setPreviewLoading((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
          });
        });
    });

    return () => {
      controllers.forEach((controller) => controller.abort());
    };
  }, [items, remotePreviews]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const newItems: MediaUploadItem[] = Array.from(fileList).map((file: File) => {
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

  const handleOpenViewer = (item: MediaUploadItem) => {
    if (!canOpenViewer(item)) {
      return;
    }

    setSelectedItem(item);
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
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Arquivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tamanho
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((item) => {
                    const typeLabel = fileCategory(item.mimeType) ?? "-";
                    const sizeLabel = formatBytes(item.sizeBytes) ?? "-";
                    const loadingPreview = previewLoading[item.id] && !resolveViewUrl(item);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                            {loadingPreview && (
                              <p className="mt-1 text-xs text-gray-500">Carregando visualização...</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{typeLabel}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sizeLabel}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenViewer(item)}
                              disabled={!canOpenViewer(item)}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-600 px-2 py-0.5 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Visualizar ${item.name}`}
                              title="Visualizar arquivo"
                            >
                              <Eye className="h-3 w-3" />
                              Visualizar
                            </button>
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                className="inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-800"
                              >
                                Remover
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

      <Transition appear show={selectedItem !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedItem(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto p-4">
            <div className="flex min-h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                  <Dialog.Title className="sr-only">
                    {selectedItem?.name ?? "Visualizar arquivo"}
                  </Dialog.Title>

                  {selectedItem && (
                    <FileViewer
                      embedded
                      fileId={selectedItem.fileId}
                      fileName={selectedItem.name}
                      viewUrl={resolveViewUrl(selectedItem)}
                      downloadUrl={selectedItem.downloadUrl}
                      onClose={() => setSelectedItem(null)}
                    />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </section>
  );
}
