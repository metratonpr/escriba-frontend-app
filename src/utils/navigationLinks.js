import {
  FaCity,
  FaClipboardList,
  FaCogs,
  FaEnvelopeOpenText,
  FaGlobeAmericas,
  FaMap,
  FaPeopleCarry,
  FaShoppingCart,
  FaTags,
  FaTrademark,
} from "react-icons/fa";
import {
  FaBox,
  FaCalendar,
  FaChartBar,
  FaDog,
  FaMapPin,
  FaMoneyBillWave,
  FaPaw,
  FaTruck,
  FaUsers,
} from "react-icons/fa";
import { FiClipboard } from "react-icons/fi";

export const navigationLinks = {
  parametros: [
    {
      path: "/countries",
      label: "Países",
      icon: <FaGlobeAmericas className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/states",
      label: "Estados",
      icon: <FaMap className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/cities",
      label: "Municípios",
      icon: <FaCity className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/neighborhoods",
      label: "Bairros",
      icon: <FaMapPin className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/postal-codes",
      label: "Códigos Postais",
      icon: <FaEnvelopeOpenText className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },

    {
      path: "/species",
      label: "Espécies",
      icon: <FaDog className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/sizes",
      label: "Portes",
      icon: <FaBox className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/breeds",
      label: "Raças",
      icon: <FaPaw className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/brands",
      label: "Marcas",
      icon: <FaTrademark className="me-2" />, // ou outro ícone como FaTag ou FaIndustry
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/products",
      label: "Produtos",
      icon: <FaBox className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/product-categories",
      label: "Categorias de Produtos",
      icon: <FaTags className="me-2" />, // ícone sugestivo de etiqueta
      roles: ["Admin", "Administrativo", "Financeiro"],
    },

    {
      path: "/services",
      label: "Serviços",
      icon: <FaCogs className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/chart-of-accounts",
      label: "Plano de Contas",
      icon: <FaChartBar className="me-2" />,
      roles: ["Admin", "Financeiro"],
    },
    {
      path: "/users",
      label: "Usuarios",
      icon: <FaPeopleCarry className="me-2" />,
      roles: ["Admin"],
    },
  ],
  cadastros: [
    {
      path: "/customers",
      label: "Clientes",
      icon: <FaUsers className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/employers",
      label: "Colaboradores",
      icon: <FaUsers className="me-2" />, // Ou escolha outro ícone
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/pets",
      label: "Pets",
      icon: <FiClipboard className="me-2" />,
      roles: ["Admin", "Administrativo"],
    },
    {
      path: "/suppliers",
      label: "Fornecedores",
      icon: <FaTruck className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/plans",
      label: "Pacotes",
      icon: <FaClipboardList className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },

  ],
  movimentos: [
    {
      path: "/appointments",
      label: "Agendamentos",
      icon: <FaCalendar className="me-2" />,
      roles: ["Admin", "PDV"],
    },
    {
      label: "Planos",
      icon: <FaClipboardList className="me-2" />,
      path: "/subscriptions",
      roles: ["Admin", "Administrativo"],
    },
    {
      path: "/purchase-orders",
      label: "Ordens de Compra",
      icon: <FaShoppingCart className="me-2" />,
      roles: ["Admin", "Administrativo", "Financeiro"],
    },
    {
      path: "/cash-flows",
      label: "Fluxo de Caixa",
      icon: <FaMoneyBillWave className="me-2" />,
      roles: ["Admin", "Financeiro"],
    },
    {
      path: "/receivables",
      label: "Contas a Receber",
      icon: <FaMoneyBillWave className="me-2" />,
      roles: ["Admin", "Financeiro"],
    },
    {
      path: "/payables",
      label: "Contas a Pagar",
      icon: <FaMoneyBillWave className="me-2" />,
      roles: ["Admin", "Financeiro"],
    },

  ],
  relatorios: [
    {
      path: "/report/cash-flows",
      label: "Livro Caixa",
      icon: <FaMoneyBillWave className="me-2" />,
      roles: ["Admin", "Financeiro"],
    },
    {
      path: "/report/inventory",
      label: "Estoque",
      icon: <FaBox className="me-2" />,
      roles: ["Admin", "Financeiro"],
    },
    {
      path: "/report/appointments",
      label: "Agendamentos",
      icon: <FaCalendar className="me-2" />,
      roles: ["Admin", "Financeiro", "PDV"],
    },
  ],
};
