// src/components/backoffice/CompanyDocumentAttachmentView.tsx
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { getUploadViewById, type UploadViewData } from "../../../../services/viewService.ts";
import fileService from "../../../../services/FileService.ts";

type Props = {
    attachmentId: number | string;            // ID do /view/{id}
    height?: number | string;                 // altura do viewer (ex.: 560, "70vh"); padrão "70vh"
    onBack?: () => void;                      // callback de voltar (opcional)
    className?: string;                       // classes extras
    showMeta?: boolean;                       // exibir metadados (datas/descrição)
};

const isImage = (nameOrUrl: string) =>
    /\.(png|jpe?g|webp|gif|svg)$/i.test(nameOrUrl);

const isPdf = (nameOrUrl: string) =>
    /\.pdf($|\?)/i.test(nameOrUrl);

const CompanyDocumentAttachmentView: React.FC<Props> = ({
                                                            attachmentId,
                                                            height = "70vh",
                                                            onBack,
                                                            className = "",
                                                            showMeta = true,
                                                        }) => {
    const [data, setData] = useState<UploadViewData | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const idNum = useMemo(() => {
        const n = Number(attachmentId);
        return Number.isFinite(n) ? n : null;
    }, [attachmentId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!idNum) {
                setErrorMsg("Anexo inválido.");
                setLoading(false);
                return;
            }

            try {
                // Busca metadados
                const metadata = await getUploadViewById(idNum);
                setData(metadata);

                // Usa o FileService que contorna problemas de CORS/interceptors
                const fileUrl = await fileService.getFileUrl(idNum);
                setFileUrl(fileUrl);
                setErrorMsg("");

            } catch (error) {
                console.error('Erro ao carregar anexo:', error);
                setErrorMsg("Erro ao carregar o anexo.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            fileService.revokeFileUrl(fileUrl || "");
        };
    }, [idNum, fileUrl]);

    const viewerHeight = typeof height === "number" ? `${height}px` : height;
    const fileName = data?.nome_arquivo ?? `anexo-${idNum ?? ""}`;

    const previewType = useMemo<"image" | "pdf" | "none">(() => {
        if (!fileUrl) return "none";
        if (isImage(fileName)) return "image";
        if (isPdf(fileName)) return "pdf";
        return "none";
    }, [fileUrl, fileName]);

    const handleOpenNewTab = () => {
        if (!fileUrl) return;
        window.open(fileUrl, "_blank", "noopener,noreferrer");
    };

    const handleDownload = () => {
        if (!fileUrl) return;
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Cabeçalho */}
            <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {fileName}
                    </h1>
                    {showMeta && data && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Criado em:{" "}
                            {data.created_at && dayjs(data.created_at).isValid()
                                ? dayjs(data.created_at).format("DD/MM/YYYY HH:mm")
                                : "-"}
                            {" • "}Atualizado em:{" "}
                            {data.updated_at && dayjs(data.updated_at).isValid()
                                ? dayjs(data.updated_at).format("DD/MM/YYYY HH:mm")
                                : "-"}
                        </p>
                    )}
                    {showMeta && data?.descricao && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.descricao}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            aria-label="Voltar"
                        >
                            ← Voltar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleOpenNewTab}
                        disabled={!fileUrl}
                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        Abrir em nova aba
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!fileUrl}
                        className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        Baixar
                    </button>
                </div>
            </div>

            {/* Área do viewer */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
                {loading ? (
                    <div className="h-[300px]" style={{ height: viewerHeight }}>
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full" />
                        </div>
                    </div>
                ) : errorMsg ? (
                    <div className="p-4 text-sm text-red-600 text-center">{errorMsg}</div>
                ) : !fileUrl ? (
                    <div className="p-4 text-sm text-red-600">Arquivo não disponível.</div>
                ) : previewType === "image" ? (
                    <div className="w-full" style={{ height: viewerHeight }}>
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
                            onError={() => setErrorMsg("Erro ao carregar imagem.")}
                        />
                    </div>
                ) : previewType === "pdf" ? (
                    <div className="w-full" style={{ height: viewerHeight }}>
                        <iframe
                            title={fileName}
                            src={fileUrl}
                            className="w-full h-full"
                            onError={() => setErrorMsg("Erro ao carregar PDF.")}
                        />
                    </div>
                ) : (
                    <div className="p-4 text-sm text-gray-700 dark:text-gray-300 text-center">
                        <div className="mb-2">Pré-visualização não disponível para este tipo de arquivo.</div>
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="text-blue-600 underline hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Baixar ou abrir o arquivo
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDocumentAttachmentView;