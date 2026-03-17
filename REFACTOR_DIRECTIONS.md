# Plano de Otimização e Refatoração

Este documento resume a análise completa do projeto, explica *o que* e *como* melhorar em cada camada e fornece um checklist acionável. O foco é código e componentização — nada altera layouts ou visual final.

## 1. Visão geral
- **Nota de estabilidade:** todas as mudanças planejadas devem preservar o comportamento atual; qualquer refatoração precisa passar nos builds/ testes existentes antes de liberar para QA. Sempre revise se houve regressão visual ou quebra de fluxo.
- **Pilhas envolvidas:** Vite + React 19, React Router 7, Tailwind + componentes próprios (TableTailwind, FileViewer). Muitos estados persistem nos próprios componentes, causando repetição.
- **Principais dependências úteis que ainda podem florescer:** `@tanstack/react-query` (central para cache e deduplicação) e hooks compartilhados como `useClientPagination`.
- **Pontos críticos já corrigidos:** base da API agora respeita `VITE_API_BASE_URL`/HTTPS (`src/api/apiConfig.ts:1-62`), app coloca CSP de runtime (`src/main.tsx:9-48`) e QueryClient global (`src/api/queryClient.ts:1-15`) em funcionamento, mas há oportunidades claras de refino.

## 2. Observações por camada

### 2.1 Camada de dados e autenticação
**O que fazer**
1. Consolidar chamadas HTTP em hooks (ex.: `useDocumentDeadlines`, `useDocumentUploadList`) para isolar erros e loaders, em vez de `useEffect` + `useState` diretamente no componente.
2. Garantir que todos os dados que exigem autenticação utilizem o interceptor de `src/api/http.ts:6-33` e aproveitem `queryClient` para cache/cache invalidation.

**Como fazer**
- Criar hooks por domínio (documentos expirando, documentos com versões) que retornem `{ data, isLoading, error, retry }`.
- Encaminhar esses hooks para as páginas filtradas; por exemplo, `VencimentosPage` deve importar `useDeadlines` e transformar filtros em parâmetros de `useQuery` (`src/pages/backoffice/dashboard/VencimentosPage.tsx`, linhas ~220-330).
- Aproveitar `queryClient.invalidateQueries` sempre que mudanças quebras ocorrerem (ex.—submissão de formulários nas páginas de empresa/colaborador).

**Checklist**
- [ ] Definir hooks compartilhados para `getDocumentsExpiringSoon`, `getExpiredDocuments`, `getDocumentsWithVersions`, etc.
- [ ] Migrar páginas com múltiplos endpoints para depender do hook em vez de `Promise.all` manuais.
- [ ] Verificar se cada hook usa `axios`/`request` central e respeita `API_ORIGIN`/token.

### 2.2 Componentização e reutilização de UI
**O que fazer**
1. Criar containers funcionais (ex.: `<DataDashboard>`, `<FilterPanel>` e `<AttachmentModalHost>`) que encapsulem estados de `loading`, `toast`, `selectedAttachment` e tratem reaproveitar `TableTailwind`.
2. Decompor componentes maiores (`TableTailwind`, `FileViewer`, `MediaUploadViewer`) em pares hook+apresentação para separar lógica de estado da renderização.
3. Padronizar filtros utilizando listas declarativas (`FilterField[]`) e componentes como `FormSelectField`.

**Como fazer**
- Extrair `useTableState` para dividir ordenação/paginação e permitir compartilhamento com outras tabelas simples.
- Criar `useFilePreview` que manipula `URL.createObjectURL`, abort controllers e `pending`/`error`. Reutilizar em `FileViewer` e `MediaUploadViewer`.
- Centralizar componentes de status/filtro em `src/components/Form/` (ex.: `FilterGroup`, `FilterField`, `useFilterState`) para reduzir duplicação de `useState` em telas similares (`Vencimentos`, `DocumentsIndicatorListPage`, formulários de empresa/colaborador).

**Checklist**
- [ ] Reorganizar `TableTailwind` em `TableTailwind.Core` (render) + hook de estado.
- [ ] Criar `DataDashboardLayout` que recebe filtros, tabela e modal para anexos.
- [ ] Refatorar `FileViewer`/`MediaUploadViewer` para usar `useFilePreview`.
- [ ] Declaração de filtros compartilhados (ex.: `const DEADLINE_FILTERS = [...]`) e uso de `FilterGroup`.

### 2.3 Infraestrutura e segurança (para referência)
**O que fazer**
- Continuar fortalecendo CSP e garantir que novas dependências externas (fontes, ícones) usem `integrity`/`crossorigin` se vierem junto.
- Revisar entradas em `localStorage` (token + user) e garantir que apenas o mínimo necessário seja exposto.

**Como fazer**
- Documentar em README regras para usar `import.meta.env.VITE_API_BASE_URL` e evitar reescrever `src/api/apiConfig.ts`.
- Garantir que novos formulários validem dados antes de enviar e reutilizem services (com `zod`, etc.).

**Checklist**
- [ ] Adicionar rotina de auditoria/manual para verificar env (`config:check`).
- [ ] Evitar armazenar campos sensíveis no `auth_user`.

## 3. Cronograma proposto
1. **Fase 1 (2 dias)** – Hooks de dados & QueryClient: criar wrappers de `useQuery`, ajustar `VencimentosPage`, `DocumentsIndicatorListPage`, formulários que consomem `getDocumentsWithVersions`.
2. **Fase 2 (2 dias)** – Componentização: separar `TableTailwind`, criar `DataDashboardLayout` + `FilterGroup`, refatorar `FileViewer`/`MediaUploadViewer`.
3. **Fase 3 (1 dia)** – Revisão geral, testes e documentação (incluir checklist em README e atualizar `REFACTOR_DIRECTIONS.md` se surgirem novas necessidades).

## 4. Como acompanhar
- Atualizar este documento com cada etapa concluída (marcando checkboxes).
- Criar issues correspondentes (nome sugestão: `refactor/data-hooks`, `refactor/layout-shells`, `refactor/file-hooks`).
- Adicionar validações de ESLint/TypeScript que garantam o uso dos novos hooks/componentes onde necessário.
