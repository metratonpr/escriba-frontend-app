import type { BreadcrumbItem } from '../../../components/Layout/Breadcrumbs'
import Breadcrumbs from '../../../components/Layout/Breadcrumbs'
import ItemMenuCard from '../../../components/Layout/ItemMenuCard'

export default function ParametrosDashboard() {
  const cards = [
    { title: 'Grupos de Empresas', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/grupos-empresa' },
    { title: 'Tipos de Empresa', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/tipos-empresa' },
    { title: 'Setores', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/setores' },
    { title: 'Cargos', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/cargos' },
    { title: 'Emissores de Documento', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/orgaos-emissores' },
    { title: 'Tipos de Documento', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/tipos-documento' },
    { title: 'Documentos', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/documentos' },
    { title: 'Tipos de Evento', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/tipos-evento' },
    { title: 'Tipos de EPI', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/tipos-epi' },
    { title: 'Marcas', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/brands' },
    { title: 'EPIs', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/epis' },
    { title: 'Tipos de Ocorrência', imageSrc: "/images/logo_iapotech.png", href: '/backoffice/occurrence-types' },
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
