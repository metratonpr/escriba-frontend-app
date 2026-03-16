export const DOMINIO = "http://localhost:8000";
// export const DOMINIO = "https://www.grupolw.iapotech.com.br";
export const BASE_URL = `${DOMINIO}/api`;

// Exporta API_URL como alias para BASE_URL para compatibilidade
export const API_URL = BASE_URL;

// Recursos principais
export const API_COMPANY_GROUPS = `${BASE_URL}/company-groups`;
export const API_COMPANY_TYPES = `${BASE_URL}/company-types`;
export const API_COMPANIES = `${BASE_URL}/companies`;
export const API_COMPANIES_WITH_SECTORS = `${BASE_URL}/companies/with-sectors`;
export const API_SECTORS = `${BASE_URL}/sectors`;
export const API_JOB_TITLES = `${BASE_URL}/job-titles`;
export const API_EMPLOYEES = `${BASE_URL}/employees`;
export const API_DOCUMENT_ISSUERS = `${BASE_URL}/document-issuers`;
export const API_DOCUMENT_TYPES = `${BASE_URL}/document-types`;
export const API_DOCUMENTS = `${BASE_URL}/documents`;
export const API_DOCUMENTS_WITH_VERSIONS = `${BASE_URL}/documents/with-versions`;
export const API_DOCUMENT_VERSIONS = `${BASE_URL}/document-versions`;
export const API_UPLOADS = `${BASE_URL}/uploads`;
export const API_EVENT_TYPES = `${BASE_URL}/event-types`;
export const API_EVENTS = `${BASE_URL}/events`;
export const API_EVENTS_COMPLETE = `${BASE_URL}/events/complete`;
export const API_COMPANY_EVENTS = `${BASE_URL}/company-events`;
export const API_EVENT_PARTICIPATIONS = `${BASE_URL}/event-participations`;
export const API_EVENT_ATTENDANCE_LISTS = `${BASE_URL}/event-attendance-lists`;
export const API_CERTIFICATES_GENERATE = `${BASE_URL}/certificates/generate`;
export const API_CERTIFICATES_VERIFY = `${BASE_URL}/certificates/verify`;
export const API_MEDICAL_EXAMS = `${BASE_URL}/medical-exams`;
export const API_EPI_TYPES = `${BASE_URL}/epi-types`;
export const API_BRANDS = `${BASE_URL}/brands`;
export const API_EPIS = `${BASE_URL}/epis`;
export const API_EPI_DELIVERIES = `${BASE_URL}/epi-deliveries`;
export const API_EPI_DELIVERY_ITEMS = `${BASE_URL}/epi-delivery-items`;
export const API_OCCURRENCE_TYPES = `${BASE_URL}/occurrence-types`;
export const API_OCCURRENCES = `${BASE_URL}/occurrences`;
export const API_OCCURRENCE_PARTICIPANTS = `${BASE_URL}/occurrence-participants`;
export const API_USERS = `${BASE_URL}/users`;
export const API_COMPANY_DOCUMENT_VERSION_UPLOADS = `${BASE_URL}/company-doc-uploads`;
export const API_EMPLOYEE_DOCUMENT_VERSION_UPLOADS = `${BASE_URL}/employee-doc-uploads`;
export const API_EVENT_DOCUMENT_VERSION_UPLOADS = `${BASE_URL}/event-document-version-uploads`;
export const API_EPI_DELIVERY_DOCUMENT_UPLOADS = `${BASE_URL}/epi-delivery-document-uploads`;
export const API_MEDICAL_EXAM_DOCUMENT_VERSION_UPLOADS = `${BASE_URL}/medical-exam-document-version-uploads`;
export const API_OCCURRENCE_DOCUMENT_VERSION_UPLOADS = `${BASE_URL}/occurrence-document-version-uploads`;
export const API_DOCUMENTS_EXPIRING_SOON = `${BASE_URL}/documents/expiring-soon`;
export const API_DOCUMENTS_EXPIRED = `${BASE_URL}/documents/expired`;
export const API_KPIS_SYSTEM = `${BASE_URL}/kpis/system`;
export const API_DASHBOARD_AUDIT = `${BASE_URL}/auditoria`;
export const API_FILE_VIEW = `${BASE_URL}/view`;
export const API_FILE_DOWNLOAD = `${BASE_URL}/download`;

// Autenticação (exemplo, ajuste conforme backend)
export const API_LOGIN = `${BASE_URL}/login`;
export const API_LOGOUT = `${BASE_URL}/logout`;
export const API_ME = `${BASE_URL}/me`;
export const API_PROFILE = `${BASE_URL}/profile`;
export const API_CHECK_TOKEN = API_ME;
export const API_FORGOT_PASSWORD = `${BASE_URL}/forgot-password`;
export const API_RESET_PASSWORD = `${BASE_URL}/reset-password`;

export const getFileViewUrl = (id: string | number): string => `${API_FILE_VIEW}/${id}`;
export const getFileDownloadUrl = (id: string | number): string => `${API_FILE_DOWNLOAD}/${id}`;
