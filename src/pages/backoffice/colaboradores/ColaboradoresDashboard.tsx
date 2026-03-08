import type { BreadcrumbItem } from '../../../components/Layout/Breadcrumbs';
import Breadcrumbs from '../../../components/Layout/Breadcrumbs';
import PaginatedMenuCardGrid from '../../../components/Layout/ui/PaginatedMenuCardGrid';

export default function ColaboradoresDashboard() {
    const cards = [
        {
            title: "Funcionários",
            imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
            href: "/backoffice/colaboradores",
        },
        {
            title: "Documentos",
            imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
            href: "/backoffice/colaboradores/documentos",
        },
        {
            title: "Entrega de EPI",
            imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
            href: "/backoffice/entregas-epis",
        },
        // futuramente:
        // { title: "Exames Médicos", imageSrc: `${import.meta.env.BASE_URL}images/logo.png`, href: "/backoffice/exames-medicos" },
        // { title: "Eventos", imageSrc: `${import.meta.env.BASE_URL}images/logo.png`, href: "/backoffice/eventos" },
        // { title: "Ocorrências", imageSrc: `${import.meta.env.BASE_URL}images/logo.png`, href: "/backoffice/ocorrencias" },
    ];

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Colaboradores', to: '/backoffice/colaboradores' },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Dashboard - Colaboradores</h1>
        <p className="mt-2 text-gray-600">Selecione uma categoria para gerenciar</p>

        <div className="mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PaginatedMenuCardGrid items={cards} initialPerPage={8} />
        </div>
      </div>
    </>
  )
}
