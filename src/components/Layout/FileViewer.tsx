import { useEffect, useState } from "react";
import { BASE_URL } from "../../api/apiConfig";

interface FileViewerProps {
    fileId: number;
    fileName: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileId, fileName }) => {
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let objUrl: string;

        const fetchFile = async () => {
            try {
                setLoading(true);
                setError("");

                console.log(`Carregando arquivo diretamente: ${BASE_URL}/view/${fileId}`);

                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${BASE_URL}/view/${fileId}`, {
                    method: 'GET',
                    headers,
                });

                console.log(`Resposta da API:`, {
                    status: response.status,
                    contentType: response.headers.get('content-type'),
                    contentLength: response.headers.get('content-length')
                });

                if (!response.ok) {
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }

                const blob = await response.blob();
                console.log(`Arquivo carregado:`, {
                    size: blob.size,
                    type: blob.type
                });

                objUrl = URL.createObjectURL(blob);
                setUrl(objUrl);
                console.log('URL do blob criada:', objUrl);

            } catch (fetchError) {
                console.error('Erro ao carregar arquivo:', fetchError);
                setError(
                    fetchError instanceof Error
                        ? fetchError.message
                        : "Erro desconhecido ao carregar o anexo"
                );
            } finally {
                setLoading(false);
            }
        };

        if (fileId) {
            fetchFile();
        } else {
            setError("ID do arquivo inválido");
            setLoading(false);
        }

        return () => {
            if (objUrl) {
                URL.revokeObjectURL(objUrl);
            }
        };
    }, [fileId]);

    const openInNewTab = () => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Carregando anexo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 p-8">
                <div className="max-w-md text-center bg-white rounded-lg shadow-lg p-8">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar anexo</h3>
                    <p className="text-gray-600 mb-4">{fileName}</p>
                    <p className="text-sm text-gray-500 mb-6">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!url) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center text-gray-500">
                    <p className="text-lg">Nenhum conteúdo para exibir</p>
                </div>
            </div>
        );
    }

    const isImage = /\.(jpe?g|png|webp|gif)$/i.test(fileName);
    const isPdf = /\.pdf$/i.test(fileName);

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header elegante */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            {isPdf && (
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {isImage && (
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {!isImage && !isPdf && (
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">{fileName}</h1>
                            <p className="text-sm text-gray-500 capitalize">
                                {isPdf ? 'Documento PDF' : isImage ? 'Imagem' : 'Arquivo'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={openInNewTab}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Nova Aba
                        </button>
                        {url && (
                            <a
                                href={url}
                                download={fileName}
                                className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Área de visualização - 90% da tela */}
            <div className="flex-1 p-6">
                <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {isImage && (
                        <div className="h-full flex items-center justify-center p-4">
                            <img
                                src={url}
                                alt={`Visualização do arquivo ${fileName}`}
                                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                                onLoad={() => console.log('Imagem carregada com sucesso')}
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    setError("Erro ao carregar imagem");
                                }}
                            />
                        </div>
                    )}

                    {isPdf && (
                        <iframe
                            src={url}
                            className="w-full h-full"
                            title={`Visualização do PDF ${fileName}`}
                            onLoad={() => console.log('PDF carregado no iframe')}
                            onError={(e) => {
                                console.error('Erro ao carregar PDF:', e);
                                setError("Erro ao carregar PDF");
                            }}
                        />
                    )}

                    {!isImage && !isPdf && (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Pré-visualização não disponível</h3>
                                <p className="text-gray-500 mb-6">Use os botões acima para abrir ou baixar o arquivo</p>
                                <div className="flex space-x-3 justify-center">
                                    <button
                                        onClick={openInNewTab}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Abrir em Nova Aba
                                    </button>
                                    <a
                                        href={url}
                                        download={fileName}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors inline-block"
                                    >
                                        Download
                                    </a>
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