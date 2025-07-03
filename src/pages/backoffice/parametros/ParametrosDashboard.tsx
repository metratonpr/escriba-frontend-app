import type { BreadcrumbItem } from '../../../components/Layout/Breadcrumbs'
import Breadcrumbs from '../../../components/Layout/Breadcrumbs'
import ItemMenuCard from '../../../components/Layout/ItemMenuCard'

export default function ParametrosDashboard() {
  const cards = [
    { title: 'Grupos de Empresas', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/company-groups' },
    { title: 'Tipos de Empresa', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/company-types' },
    { title: 'Setores', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/sectors' },
    { title: 'Cargos', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/job-titles' },
    { title: 'Emissores de Documento', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/document-issuers' },
    { title: 'Documentos', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/documents' },
    { title: 'Tipos de Evento', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/event-types' },
    { title: 'Tipos de EPI', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/epi-types' },
    { title: 'Marcas', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/brands' },
    { title: 'EPIs', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/epis' },
    { title: 'Tipos de Ocorrência', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/parametros/occurrence-types' },
  ]

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Parâmetros', to: '/backoffice/parametros' },
  ]


  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Dashboard - Parâmetros</h1>
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
