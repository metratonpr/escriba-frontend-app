
import ItemMenuCard from '../../../components/Layout/ItemMenuCard';
import type { BreadcrumbItem } from '../../../components/Layout/Breadcrumbs';
import Breadcrumbs from '../../../components/Layout/Breadcrumbs';

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
            {cards.map((card) => (
              <ItemMenuCard
                key={card.title}
                title={card.title}
                imageSrc={card.imageSrc}
                href={card.href}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}