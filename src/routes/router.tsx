import { createBrowserRouter } from 'react-router-dom'
import EmpresasDashboard from '../pages/backoffice/empresas/EmpresasDashboard'
import Login from '../pages/Login'
import BackofficeLayout from '../layouts/BackofficeLayout'
import ColaboradoresDashboard from '../pages/backoffice/colaboradores/ColaboradoresDashboard'
import EventosDashboard from '../pages/backoffice/eventos/EventosDashboard'
import ParametrosDashboard from '../pages/backoffice/parametros/ParametrosDashboard'
import SecoesDashboard from '../pages/backoffice/secoes/SecoesDashboard'


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
      { path: 'secoes', element: <SecoesDashboard /> },
    ],
  },
])
