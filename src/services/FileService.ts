// src/services/fileService.ts
import { BASE_URL } from "../api/apiConfig";

/**
 * Service específico para download de arquivos
 * Replica exatamente o comportamento do Insomnia que funciona
 */
class FileService {
    /**
     * Baixa um arquivo via endpoint /view/{id} exatamente como o Insomnia
     */
    async getFileBlob(fileId: number): Promise<string> {
        try {
            console.log('🔄 Baixando arquivo via /view/ (igual Insomnia):', fileId);

            // Replica exatamente a requisição do Insomnia
            const response = await fetch(`${BASE_URL}/view/${fileId}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*', // Igual ao Insomnia
                    // SEM Authorization - é isso que faz funcionar
                },
            });

            console.log('📋 Response status:', response.status);
            console.log('📋 Response headers:', response.headers);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            console.log('✅ Arquivo baixado com sucesso via /view/ (igual Insomnia)');
            console.log('📄 Blob URL criada:', blobUrl);
            return blobUrl;

        } catch (error) {
            console.error('❌ Erro ao baixar arquivo via /view/:', error);
            throw error;
        }
    }

    /**
     * Método principal: usa apenas /view/{id} como no Insomnia
     */
    async getFileUrl(fileId: number): Promise<string> {
        try {
            // Tenta /view/{id} primeiro (igual Insomnia)
            return await this.getFileBlob(fileId);

        } catch (error) {
            console.error('❌ Falhou igual ao que deveria funcionar no Insomnia:', error);
            throw new Error('Erro ao carregar arquivo - mesmo método que funciona no Insomnia');
        }
    }

    /**
     * Limpa blob URL da memória
     */
    revokeFileUrl(url: string): void {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
            console.log('🧹 Blob URL limpa da memória');
        }
    }
}

// Instância singleton
export const fileService = new FileService();
export default fileService;