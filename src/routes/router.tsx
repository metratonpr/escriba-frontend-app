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


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/backoffice',
    element: <BackofficeLayout />,
    children: [
      { path: 'empresas', element: <EmpresasDashboard /> },
      { path: 'colaboradores', element: <ColaboradoresDashboard /> },
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

      { path: 'secoes', element: <SecoesDashboard /> },
    ],
  },
]);
