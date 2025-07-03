// src/routes/router.tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import EmpresasDashboard from '../pages/backoffice/empresas/EmpresasDashboard'
import Login from '../pages/Login'


const PublicLayout = () => (
  <div className="flex items-center justify-center h-screen">
    <a href="/backoffice/empresas" className="text-white bg-blue-600 px-6 py-3 rounded-lg shadow">
      Entrar no Backoffice
    </a>
  </div>
)

const PrivateLayout = () => (
  <div className="min-h-screen flex">
    <aside className="w-64 bg-gray-800 text-white p-4">Sidebar</aside>
    <main className="flex-1 p-6">
      <Outlet />
    </main>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/backoffice',
    element: <PrivateLayout />,
    children: [
      {
        path: 'empresas',
        element: <EmpresasDashboard />,
      },
    ],
  },
])
