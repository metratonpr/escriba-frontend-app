import type { BreadcrumbItem } from '../../../components/Layout/Breadcrumbs';
import Breadcrumbs from '../../../components/Layout/Breadcrumbs';
import PaginatedMenuCardGrid from '../../../components/Layout/ui/PaginatedMenuCardGrid';

export default function EmpresasDashboard() {
  const cards = [
    { title: 'Cadastros', imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`, href: '/backoffice/empresas' },
    { title: 'Documentos', imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`, href: '/backoffice/empresas/documentos' },
    { title: 'Gerenciar Eventos', imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`, href: '/backoffice/eventos' },
    { title: 'Gerenciar Ocorrências', imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`, href: '/backoffice/ocorrencias' },
  ]

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Empresas', to: '/backoffice/empresas' },
  ]

  return (
    <>
    <Breadcrumbs items={breadcrumbs} />
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Dashboard - Empresas</h1>
      <p className="mt-2 text-gray-600">Selecione uma categoria para gerenciar</p>

      <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PaginatedMenuCardGrid items={cards} initialPerPage={8} />
      </div>
    </div>
    </>
  )
}
