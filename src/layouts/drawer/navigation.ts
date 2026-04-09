import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  FileStack,
  FileText,
  HardHat,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Stethoscope,
  Tags,
  Users,
  UserSquare2,
  Wrench,
} from "lucide-react";

export interface DrawerNavItem {
  to: string;
  label: string;
  icon?: LucideIcon;
  requiresAdmin?: boolean;
}

export interface BackofficeMainSection {
  key: string;
  label: string;
  to: string;
  icon: LucideIcon;
  matchPrefixes: string[];
  items: DrawerNavItem[];
}

export const matchesPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const BACKOFFICE_MAIN_SECTIONS: BackofficeMainSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/backoffice/dashboard",
    icon: LayoutDashboard,
    matchPrefixes: ["/backoffice/dashboard"],
      items: [
        { to: "/backoffice/dashboard", label: "Visão geral", icon: LayoutDashboard },
        { to: "/backoffice/dashboard/vencimentos", label: "Vencimentos", icon: CalendarClock },
        {
          to: "/backoffice/dashboard/auditoria/vencimentos-versoes-documentos",
          label: "Vencimentos de versões",
          icon: FileStack,
        },
        { to: "/backoffice/auditoria", label: "Auditoria", icon: ShieldCheck },
      ],
  },
  {
    key: "empresas",
    label: "Empresas",
    to: "/backoffice/entidades",
    icon: Building2,
    matchPrefixes: ["/backoffice/entidades", "/backoffice/empresas"],
    items: [
      { to: "/backoffice/empresas", label: "Cadastro de empresas", icon: Building2 },
      { to: "/backoffice/empresas/documentos", label: "Documentos empresas", icon: FileText },
    ],
  },
  {
    key: "equipes",
    label: "Equipes",
    to: "/backoffice/equipes",
    icon: Users,
    matchPrefixes: [
      "/backoffice/equipes",
      "/backoffice/colaboradores",
      "/backoffice/aso",
      "/backoffice/exames-medicos",
      "/backoffice/entregas-epis",
      "/backoffice/ocorrencias",
    ],
    items: [
      { to: "/backoffice/colaboradores", label: "Colaboradores", icon: Users },
      { to: "/backoffice/colaboradores/documentos", label: "Documentos colaboradores", icon: FileText },
      { to: "/backoffice/aso", label: "ASO", icon: Stethoscope },
      { to: "/backoffice/entregas-epis", label: "Entregas EPI", icon: HardHat },
      { to: "/backoffice/ocorrencias", label: "Ocorrências", icon: ClipboardList },
    ],
  },
  {
    key: "eventos",
    label: "Eventos",
    to: "/backoffice/eventos-acoes",
    icon: CalendarDays,
    matchPrefixes: ["/backoffice/eventos-acoes", "/backoffice/eventos"],
    items: [
      { to: "/backoffice/eventos", label: "Eventos", icon: CalendarDays },
    ],
  },
  {
    key: "parametros",
    label: "Parâmetros",
    to: "/backoffice/parametros",
    icon: Settings,
    matchPrefixes: [
      "/backoffice/parametros",
      "/backoffice/grupos-empresa",
      "/backoffice/tipos-empresa",
      "/backoffice/setores",
      "/backoffice/cargos",
      "/backoffice/orgaos-emissores",
      "/backoffice/tipos-documento",
      "/backoffice/documentos",
      "/backoffice/tipos-evento",
      "/backoffice/tipos-epi",
      "/backoffice/marcas",
      "/backoffice/epis",
      "/backoffice/tipos-ocorrencia",
    ],
    items: [
      { to: "/backoffice/grupos-empresa", label: "Grupos de empresa", icon: Briefcase },
      { to: "/backoffice/tipos-empresa", label: "Tipos de empresa", icon: Building2 },
      { to: "/backoffice/setores", label: "Setores", icon: Wrench },
      { to: "/backoffice/cargos", label: "Cargos", icon: Users },
      { to: "/backoffice/orgaos-emissores", label: "Órgãos emissores", icon: ShieldCheck },
      { to: "/backoffice/tipos-documento", label: "Tipos de documento", icon: Tags },
      { to: "/backoffice/documentos", label: "Documentos", icon: FileStack },
      { to: "/backoffice/tipos-evento", label: "Tipos de evento", icon: CalendarDays },
      { to: "/backoffice/tipos-epi", label: "Tipos de EPI", icon: HardHat },
      { to: "/backoffice/marcas", label: "Marcas", icon: Tags },
      { to: "/backoffice/epis", label: "EPIs", icon: HardHat },
      { to: "/backoffice/tipos-ocorrencia", label: "Tipos de ocorrência", icon: ClipboardList },
    ],
  },
  {
    key: "perfil",
    label: "Perfil",
    to: "/backoffice/perfil",
    icon: UserSquare2,
    matchPrefixes: ["/backoffice/perfil", "/backoffice/perfil/usuarios"],
    items: [
      { to: "/backoffice/perfil", label: "Meu perfil", icon: UserSquare2 },
      { to: "/backoffice/perfil/usuarios", label: "Usuários", icon: Users, requiresAdmin: true },
    ],
  },
];

export const resolveBackofficeSectionByPath = (pathname: string): BackofficeMainSection =>
  BACKOFFICE_MAIN_SECTIONS.find((section) =>
    section.matchPrefixes.some((prefix) => matchesPrefix(pathname, prefix))
  ) ?? BACKOFFICE_MAIN_SECTIONS[0];

export const resolveDrawerItemByPath = (
  pathname: string,
  items: DrawerNavItem[]
): DrawerNavItem | null =>
  items
    .filter((item) => matchesPrefix(pathname, item.to))
    .sort((left, right) => right.to.length - left.to.length)[0] ?? null;
