import type { BreadcrumbItem } from "../../../components/Layout/Breadcrumbs";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import PaginatedMenuCardGrid from "../../../components/Layout/ui/PaginatedMenuCardGrid";

export default function ParametrosDashboard() {
  const cards = [
    {
      title: "Grupos de Empresas",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/grupos-empresa",
    },
    {
      title: "Tipos de Empresa",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/tipos-empresa",
    },
    {
      title: "Setores",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/setores",
    },
    {
      title: "Cargos",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/cargos",
    },
    {
      title: "Emissores de documento",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/orgaos-emissores",
    },
    {
      title: "Tipos de Documento",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/tipos-documento",
    },
    {
      title: "Documentos",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/documentos",
    },
    {
      title: "Tipos de Evento",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/tipos-evento",
    },
    {
      title: "Tipos de EPI",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/tipos-epi",
    },
    {
      title: "Marcas",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/marcas",
    },
    {
      title: "EPIs",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/epis",
    },
    {
      title: "Tipos de ocorrência",
      imageSrc: `${import.meta.env.BASE_URL}images/logo_iapotech.jpg`,
      href: "/backoffice/tipos-ocorrencia",
    },
  ];

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Parâmetros", to: "/backoffice/parametros" }];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Dashboard - Parâmetros</h1>
        <p className="mt-2 text-gray-600">Selecione uma categoria para gerenciar</p>

        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <PaginatedMenuCardGrid items={cards} initialPerPage={8} />
        </div>
      </div>
    </>
  );
}
