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
      { path: 'secoes', element: <SecoesDashboard /> },
    ],
  },
]);
