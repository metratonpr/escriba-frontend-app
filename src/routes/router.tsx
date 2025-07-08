import { createBrowserRouter } from 'react-router-dom'
import EmpresasDashboard from '../pages/backoffice/empresas/EmpresasDashboard'
import Login from '../pages/Login'
import BackofficeLayout from '../layouts/BackofficeLayout'
import ColaboradoresDashboard from '../pages/backoffice/colaboradores/ColaboradoresDashboard'
import EventosDashboard from '../pages/backoffice/eventos/EventosDashboard'
import ParametrosDashboard from '../pages/backoffice/parametros/ParametrosDashboard'
import SecoesDashboard from '../pages/backoffice/secoes/SecoesDashboard'
import CompanyGroupsPage from '../pages/backoffice/parametros/companyGroups/CompanyGroupsPage'
import CompanyGroupFormPage from '../pages/backoffice/parametros/companyGroups/CompanyGroupFormPage'
import CompanyTypesPage from '../pages/backoffice/parametros/companyType/CompanyTypesPage'
import CompanyTypeFormPage from '../pages/backoffice/parametros/companyType/CompanyTypeFormPage'
import SectorsPage from '../pages/backoffice/parametros/sectors/SectorsPage'
import SectorFormPage from '../pages/backoffice/parametros/sectors/SectorFormPage'
import JobTitlesPage from '../pages/backoffice/parametros/jobTitle/JobTitlesPage'
import JobTitleFormPage from '../pages/backoffice/parametros/jobTitle/JobTitleFormPage'
import DocumentIssuersPage from '../pages/backoffice/parametros/documentIssuers/DocumentIssuersPage'
import DocumentIssuerFormPage from '../pages/backoffice/parametros/documentIssuers/DocumentIssuerFormPage'
import DocumentsPage from '../pages/backoffice/parametros/document/DocumentsPage'
import DocumentFormPage from '../pages/backoffice/parametros/document/DocumentFormPage'
import DocumentTypesPage from '../pages/backoffice/parametros/documentTypes/DocumentTypesPage'
import DocumentTypeFormPage from '../pages/backoffice/parametros/documentTypes/DocumentTypeFormPage'
import EventTypesPage from '../pages/backoffice/parametros/eventTypes/EventTypesPage'
import EventTypeFormPage from '../pages/backoffice/parametros/eventTypes/EventTypeFormPage'
import EpiTypesPage from '../pages/backoffice/parametros/epiTypes/EpiTypesPage'
import EpiTypeFormPage from '../pages/backoffice/parametros/epiTypes/EpiTypeFormPage'
import BrandsPage from '../pages/backoffice/parametros/brands/BrandsPage'
import BrandFormPage from '../pages/backoffice/parametros/brands/BrandFormPage'
import EpisPage from '../pages/backoffice/parametros/epis/EpisPage'
import EpiFormPage from '../pages/backoffice/parametros/epis/EpiFormPage'
import OccurrenceTypeFormPage from '../pages/backoffice/parametros/occurrenceTypes/OccurrenceTypeFormPage'
import OccurrenceTypesListPage from '../pages/backoffice/parametros/occurrenceTypes/OccurrenceTypesListPage'
import CompanyFormPage from '../pages/backoffice/empresas/companies/CompanyFormPage'
import CompaniesPage from '../pages/backoffice/empresas/companies/CompaniesPage'
import EmployeesPage from '../pages/backoffice/colaboradores/employee/EmployeesPage'
import EmployeeFormPage from '../pages/backoffice/colaboradores/employee/EmployeeFormPage'
import MedicalExamPage from '../pages/backoffice/colaboradores/exames/MedicalExamPage'
import MedicalExamFormPage from '../pages/backoffice/colaboradores/exames/MedicalExamFormPage'
import ExamAttachmentViewerPage from '../pages/backoffice/colaboradores/exames/ExamAttachmentViewerPage'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/backoffice',
    element: <BackofficeLayout />,
    children: [
      { path: 'entidades', element: <EmpresasDashboard /> },
      { path: 'equipes', element: <ColaboradoresDashboard /> },
      { path: 'eventos', element: <EventosDashboard /> },
      { path: 'parametros', element: <ParametrosDashboard /> },
      { path: 'grupos-empresa', element: <CompanyGroupsPage /> },  // rota no nível do backoffice
      { path: 'grupos-empresa/novo', element: <CompanyGroupFormPage /> },
      { path: 'grupos-empresa/editar/:id', element: <CompanyGroupFormPage /> },
      { path: 'tipos-empresa', element: <CompanyTypesPage /> },
      { path: 'tipos-empresa/novo', element: <CompanyTypeFormPage /> },
      { path: 'tipos-empresa/editar/:id', element: <CompanyTypeFormPage /> },
      { path: 'setores', element: <SectorsPage /> },
      { path: 'setores/novo', element: <SectorFormPage /> },
      { path: 'setores/editar/:id', element: <SectorFormPage /> },
      { path: 'cargos', element: <JobTitlesPage /> },
      { path: 'cargos/novo', element: <JobTitleFormPage /> },
      { path: 'cargos/editar/:id', element: <JobTitleFormPage /> },
      { path: 'orgaos-emissores', element: <DocumentIssuersPage /> },
      { path: 'orgaos-emissores/novo', element: <DocumentIssuerFormPage /> },
      { path: 'orgaos-emissores/editar/:id', element: <DocumentIssuerFormPage /> },
      { path: 'tipos-documento', element: <DocumentTypesPage /> },
      { path: 'tipos-documento/novo', element: <DocumentTypeFormPage /> },
      { path: 'tipos-documento/editar/:id', element: <DocumentTypeFormPage /> },
      { path: 'documentos', element: <DocumentsPage /> },
      { path: 'documentos/novo', element: <DocumentFormPage /> },
      { path: 'documentos/editar/:id', element: <DocumentFormPage /> },
      { path: 'tipos-evento', element: <EventTypesPage /> },
      { path: 'tipos-evento/novo', element: <EventTypeFormPage /> },
      { path: 'tipos-evento/editar/:id', element: <EventTypeFormPage /> },
      { path: 'tipos-epi', element: <EpiTypesPage /> },
      { path: 'tipos-epi/novo', element: <EpiTypeFormPage /> },
      { path: 'tipos-epi/editar/:id', element: <EpiTypeFormPage /> },
      { path: 'marcas', element: <BrandsPage /> },
      { path: 'marcas/novo', element: <BrandFormPage /> },
      { path: 'marcas/editar/:id', element: <BrandFormPage /> },
      { path: 'epis', element: <EpisPage /> },
      { path: 'epis/novo', element: <EpiFormPage /> },
      { path: 'epis/editar/:id', element: <EpiFormPage /> },
      { path: 'tipos-ocorrencia', element: <OccurrenceTypesListPage /> },
      { path: 'tipos-ocorrencia/novo', element: <OccurrenceTypeFormPage /> },
      { path: 'tipos-ocorrencia/editar/:id', element: <OccurrenceTypeFormPage /> },
      { path: 'empresas', element: <CompaniesPage /> },
      { path: 'empresas/nova', element: <CompanyFormPage /> },
      { path: 'empresas/editar/:id', element: <CompanyFormPage /> },
      { path: 'colaboradores', element: <EmployeesPage /> },
      { path: 'colaboradores/novo', element: <EmployeeFormPage /> },
      { path: 'colaboradores/editar/:id', element: <EmployeeFormPage /> },
      { path: 'exames-medicos', element: <MedicalExamPage /> },
      { path: 'exames-medicos/novo', element: <MedicalExamFormPage /> },
      { path: 'exames-medicos/editar/:id', element: <MedicalExamFormPage /> },
      { path: 'exames-medicos/editar/:id', element: <MedicalExamFormPage /> },
      { path: "exames-medicos/anexo/:id", element: <ExamAttachmentViewerPage /> },
    ],
  },
]);
