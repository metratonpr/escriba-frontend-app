import type { DocumentSourceType } from "../services/documentReportService";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const SOURCE_TYPE_LABEL: Record<DocumentSourceType, string> = {
  company: "Empresa",
  employee: "Colaborador",
  event: "Evento",
  epi_delivery: "Entrega EPI",
  occurrence: "Ocorrencia",
  medical_exam: "Exame medico",
};

export const getSourceTypeLabel = (value: string): string =>
  SOURCE_TYPE_LABEL[value as DocumentSourceType] ?? value;

export const getDaysUntil = (dateValue: string | null): number | null => {
  if (!dateValue) {
    return null;
  }

  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const now = new Date();
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((targetStart.getTime() - todayStart.getTime()) / MS_PER_DAY);
};

export interface DeadlineBadge {
  label: string;
  className: string;
  order: number;
  daysLabel: string;
}

export const getDeadlineBadge = (dueDate: string | null): DeadlineBadge => {
  const days = getDaysUntil(dueDate);

  if (days === null) {
    return {
      label: "",
      className: "bg-gray-100 text-gray-700",
      order: 99,
      daysLabel: "",
    };
  }

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      label: "Vencido",
      className: "bg-red-100 text-red-700",
      order: 0,
      daysLabel: overdueDays === 0 ? "Venceu hoje" : `${overdueDays} dia(s) vencido`,
    };
  }

  if (days <= 30) {
    return {
      label: "30 dias",
      className: "bg-yellow-100 text-yellow-700",
      order: 1,
      daysLabel: days === 0 ? "Hoje" : `${days} dia(s)`,
    };
  }

  if (days < 60) {
    return {
      label: "60 dias",
      className: "bg-green-100 text-green-700",
      order: 2,
      daysLabel: `${days} dia(s)`,
    };
  }

  return {
    label: "",
    className: "bg-gray-100 text-gray-700",
    order: 3,
    daysLabel: `${days} dia(s)`,
  };
};
