import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { BarChart3, Boxes, ChevronDown, FileClock, RotateCw, ShieldAlert, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../../components/Layout/Breadcrumbs";
import Toast from "../../../components/Layout/Feedback/Toast";
import Spinner from "../../../components/Layout/ui/Spinner";
import TableTailwind, { type Column } from "../../../components/Layout/ui/TableTailwind";
import DashboardSectionCard from "../../../components/dashboard/DashboardSectionCard";
import DistributionList, {
  type DistributionListItem,
} from "../../../components/dashboard/DistributionList";
import KpiStatCard from "../../../components/dashboard/KpiStatCard";
import {
  getDocumentsExpiringSoon,
  getExpiredDocuments,
  type DocumentDeadlineIndicator,
} from "../../../services/documentReportService";
import {
  getSystemKpis,
  type LabelTotalItem,
  type ModelItemKpi,
  type SystemKpiResponse,
  type TopEventByParticipants,
  type TopEventParticipant,
  type TopOccurrenceInvolvedEmployee,
} from "../../../services/systemKpiService";
import { normalizeFieldError } from "../../../utils/errorUtils";
import {
  convertToBrazilianDateFormat,
  convertToBrazilianDateTimeFormat,
} from "../../../utils/formatUtils";
import { getDaysUntil } from "../../../utils/deadlineUtils";

type ToastType = "success" | "error" | "info";
type DashboardSection = "overview" | "events" | "occurrences" | "models";

type DashboardToastState = {
  open: boolean;
  message: string;
  type: ToastType;
};

type TopEventRow = TopEventByParticipants & { id: string };
type TopParticipantRow = TopEventParticipant & { id: string };
type TopInvolvedEmployeeRow = TopOccurrenceInvolvedEmployee & { id: string };
type ModelRow = ModelItemKpi & { id: string };

type AxiosValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

type HeroMetricProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
  helperText?: string;
};

const DAYS_MIN = 1;
const DAYS_MAX = 365;
const DAYS_OPTIONS = [
  { value: 7, label: "7 dias" },
  { value: 15, label: "15 dias" },
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
  { value: 180, label: "180 dias" },
  { value: 365, label: "365 dias" },
];

const DASHBOARD_SECTIONS: Array<{ id: DashboardSection; label: string }> = [
  { id: "overview", label: "Visao geral" },
  { id: "events", label: "Eventos" },
  { id: "occurrences", label: "Ocorrencias" },
  { id: "models", label: "Modelos" },
];

const parseDaysInput = (value: string): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return null;
  }
  if (parsed < DAYS_MIN || parsed > DAYS_MAX) {
    return null;
  }

  return parsed;
};

const getPercent = (part: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Number(((part / total) * 100).toFixed(1));
};

const toDistributionItems = (
  items: LabelTotalItem[],
  prefix: string
): DistributionListItem[] =>
  items.map((item, index) => ({
    id: `${prefix}-${index}`,
    label: item.label ?? "",
    total: item.total,
  }));

const toTopEventRows = (rows: TopEventByParticipants[]): TopEventRow[] =>
  rows.map((row, index) => ({
    ...row,
    id: `event-${row.event_id}-${index}`,
  }));

const toTopParticipantRows = (rows: TopEventParticipant[]): TopParticipantRow[] =>
  rows.map((row, index) => ({
    ...row,
    id: `participant-${row.employee_id}-${index}`,
  }));

const toTopInvolvedEmployeeRows = (
  rows: TopOccurrenceInvolvedEmployee[]
): TopInvolvedEmployeeRow[] =>
  rows.map((row, index) => ({
    ...row,
    id: `employee-${row.employee_id}-${index}`,
  }));

const toModelRows = (rows: ModelItemKpi[]): ModelRow[] =>
  rows.map((row, index) => ({
    ...row,
    id: `${row.model}-${index}`,
  }));

function HeroMetric({ icon, label, value, helperText = "" }: HeroMetricProps) {
  return (
    <article className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-100">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="rounded-lg bg-white/20 p-2 text-white">{icon}</div>
      </div>
      {helperText && <p className="mt-2 text-xs text-blue-100">{helperText}</p>}
    </article>
  );
}

export default function DashboardPage() {
  const [daysInput, setDaysInput] = useState("60");
  const [daysError, setDaysError] = useState("");
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [kpis, setKpis] = useState<SystemKpiResponse | null>(null);
  const [expiringRows, setExpiringRows] = useState<DocumentDeadlineIndicator[]>([]);
  const [expiredRows, setExpiredRows] = useState<DocumentDeadlineIndicator[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<DashboardToastState>({
    open: false,
    message: "",
    type: "info",
  });

  const loadDashboard = useCallback(async (days: number) => {
    setLoading(true);
    setDaysError("");

    try {
      const [systemKpis, expiringSoon, expired] = await Promise.all([
        getSystemKpis({ days }),
        getDocumentsExpiringSoon({ days }),
        getExpiredDocuments(),
      ]);

      setKpis(systemKpis);
      setExpiringRows(expiringSoon);
      setExpiredRows(expired);
      setDaysInput(String(systemKpis.window_days));
    } catch (error) {
      const fallbackMessage = "Erro ao carregar indicadores do dashboard.";
      let message = fallbackMessage;

      if (axios.isAxiosError<AxiosValidationErrorResponse>(error)) {
        const responseData = error.response?.data;
        const errorDays = responseData?.errors?.days;
        const normalizedDaysError = normalizeFieldError(errorDays);
        if (normalizedDaysError) {
          setDaysError(normalizedDaysError);
        }
        if (typeof responseData?.message === "string" && responseData.message.trim()) {
          message = responseData.message;
        }
      }

      setToast({
        open: true,
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(60);
  }, [loadDashboard]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedDays = parseDaysInput(daysInput);

    if (parsedDays === null) {
      setDaysError("Informe um numero inteiro entre 1 e 365.");
      return;
    }

    void loadDashboard(parsedDays);
  };

  const documentKpis = useMemo(() => {
    const expiringToday = expiringRows.filter((row) => getDaysUntil(row.due_date) === 0).length;
    const expiringIn7Days = expiringRows.filter((row) => {
      const days = getDaysUntil(row.due_date);
      return days !== null && days >= 0 && days <= 7;
    }).length;

    return {
      expiring: expiringRows.length,
      expired: expiredRows.length,
      expiringToday,
      expiringIn7Days,
      trackedTotal: expiringRows.length + expiredRows.length,
    };
  }, [expiringRows, expiredRows]);

  const rates = useMemo(() => {
    if (!kpis) {
      return {
        expiredShare: 0,
        eventCompletion: 0,
        occurrenceClosure: 0,
      };
    }

    return {
      expiredShare: getPercent(documentKpis.expired, documentKpis.trackedTotal),
      eventCompletion: getPercent(kpis.events.totals.completed, kpis.events.totals.total),
      occurrenceClosure: getPercent(kpis.occurrences.totals.closed, kpis.occurrences.totals.total),
    };
  }, [documentKpis.expired, documentKpis.trackedTotal, kpis]);

  const strategicInsights = useMemo(() => {
    if (!kpis) {
      return [];
    }

    return [
      {
        id: "risk",
        title: "Risco documental",
        value: `${rates.expiredShare}%`,
        text: "Participacao dos documentos vencidos no volume monitorado.",
      },
      {
        id: "events",
        title: "Conclusao de eventos",
        value: `${rates.eventCompletion}%`,
        text: "Percentual de eventos concluido no historico total.",
      },
      {
        id: "occurrences",
        title: "Encerramento de ocorrencias",
        value: `${rates.occurrenceClosure}%`,
        text: "Taxa de ocorrencias encerradas no ciclo operacional.",
      },
      {
        id: "presence",
        title: "Taxa de presenca em eventos",
        value: `${kpis.events.participations.presence_rate_percent.toFixed(2)}%`,
        text: "Presenca registrada em participacoes de eventos.",
      },
    ];
  }, [kpis, rates.eventCompletion, rates.expiredShare, rates.occurrenceClosure]);

  const eventByTypeDistribution = useMemo<DistributionListItem[]>(() => {
    const rows = kpis?.events.by_type ?? [];
    return rows.map((row, index) => ({
      id: `event-type-${row.event_type_id ?? "none"}-${index}`,
      label: row.event_type_name ?? "",
      total: row.total,
    }));
  }, [kpis]);

  const occurrenceStatusDistribution = useMemo<DistributionListItem[]>(
    () => toDistributionItems(kpis?.occurrences.by_status ?? [], "status"),
    [kpis]
  );
  const occurrenceSeverityDistribution = useMemo<DistributionListItem[]>(
    () => toDistributionItems(kpis?.occurrences.by_severity ?? [], "severity"),
    [kpis]
  );
  const occurrenceClassificationDistribution = useMemo<DistributionListItem[]>(
    () => toDistributionItems(kpis?.occurrences.by_classification ?? [], "classification"),
    [kpis]
  );

  const topEventsRows = useMemo(
    () => toTopEventRows(kpis?.events.top_events_by_participants ?? []),
    [kpis]
  );
  const topParticipantsRows = useMemo(
    () => toTopParticipantRows(kpis?.events.top_participants ?? []),
    [kpis]
  );
  const topInvolvedEmployeesRows = useMemo(
    () => toTopInvolvedEmployeeRows(kpis?.occurrences.top_involved_employees ?? []),
    [kpis]
  );
  const modelRows = useMemo(() => toModelRows(kpis?.models.items ?? []), [kpis]);

  const topEventsColumns: Column<TopEventRow>[] = [
    {
      label: "Evento",
      field: "event_name",
      sortable: true,
      render: (row) => row.event_name ?? "",
    },
    {
      label: "Participantes",
      field: "participants_total",
      sortable: true,
      render: (row) => row.participants_total,
    },
    {
      label: "Inicio",
      field: "start_date",
      sortable: true,
      render: (row) => convertToBrazilianDateFormat(row.start_date ?? ""),
    },
    {
      label: "Fim",
      field: "end_date",
      sortable: true,
      render: (row) => convertToBrazilianDateFormat(row.end_date ?? ""),
    },
  ];

  const topParticipantsColumns: Column<TopParticipantRow>[] = [
    {
      label: "Colaborador",
      field: "employee_name",
      sortable: true,
      render: (row) => row.employee_name ?? "",
    },
    {
      label: "Eventos",
      field: "events_total",
      sortable: true,
      render: (row) => row.events_total,
    },
    {
      label: "Presencas",
      field: "presences_total",
      sortable: true,
      render: (row) => row.presences_total,
    },
    {
      label: "Taxa de presenca",
      field: "presence_rate_percent",
      sortable: true,
      render: (row) => `${row.presence_rate_percent.toFixed(2)}%`,
    },
  ];

  const topInvolvedEmployeesColumns: Column<TopInvolvedEmployeeRow>[] = [
    {
      label: "Colaborador",
      field: "employee_name",
      sortable: true,
      render: (row) => row.employee_name ?? "",
    },
    {
      label: "Principal",
      field: "as_primary_total",
      sortable: true,
      render: (row) => row.as_primary_total,
    },
    {
      label: "Participante",
      field: "as_participant_total",
      sortable: true,
      render: (row) => row.as_participant_total,
    },
    {
      label: "Total",
      field: "involvements_total",
      sortable: true,
      render: (row) => row.involvements_total,
    },
  ];

  const modelColumns: Column<ModelRow>[] = [
    {
      label: "Model",
      field: "model",
      sortable: true,
      render: (row) => row.model,
    },
    {
      label: "Tabela",
      field: "table",
      sortable: true,
      render: (row) => row.table,
    },
    {
      label: "Ativos",
      field: "active_count",
      sortable: true,
      render: (row) => row.active_count,
    },
    {
      label: "Total",
      field: "all_count",
      sortable: true,
      render: (row) => row.all_count,
    },
    {
      label: "Soft delete",
      field: "supports_soft_deletes",
      sortable: true,
      render: (row) => (row.supports_soft_deletes ? "Sim" : "Nao"),
    },
  ];

  const generatedAtLabel = kpis?.generated_at
    ? convertToBrazilianDateTimeFormat(kpis.generated_at)
    : "";
  const parsedWindow = Number(daysInput);

  return (
    <div className="space-y-6 p-4">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/backoffice/dashboard" }]} />

      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Inteligencia Operacional
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Dashboard Executivo</h1>
            <p className="mt-2 text-sm text-blue-100">
              Visao consolidada para decisao rapida sobre documentos, eventos, ocorrencias e
              volume de dados.
            </p>
          </div>
          {generatedAtLabel && (
            <div className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-blue-100">
              Atualizado em: {generatedAtLabel}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            icon={<FileClock size={18} />}
            label="Documentos a vencer"
            value={documentKpis.expiring}
            helperText={`Intervalo ativo: ${daysInput} dias`}
          />
          <HeroMetric
            icon={<ShieldAlert size={18} />}
            label="Documentos vencidos"
            value={documentKpis.expired}
            helperText="Volume total vencido"
          />
          <HeroMetric
            icon={<BarChart3 size={18} />}
            label="Eventos em andamento"
            value={kpis?.events.totals.ongoing ?? 0}
            helperText={`Conclusao: ${rates.eventCompletion}%`}
          />
          <HeroMetric
            icon={<Users size={18} />}
            label="Ocorrencias abertas"
            value={kpis?.occurrences.totals.open ?? 0}
            helperText={`Encerramento: ${rates.occurrenceClosure}%`}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Controle do painel
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Atualizacao de indicadores
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Selecione a janela de analise e atualize os dados em tempo real.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid w-full grid-cols-1 gap-3 md:grid-cols-[220px_auto_auto] md:items-end lg:w-auto"
          >
            <div className="w-full">
              <label
                htmlFor="days"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Intervalo dos KPIs (dias)
              </label>

              <div className="relative">
                <select
                  id="days"
                  name="days"
                  value={daysInput}
                  onChange={(event) => {
                    setDaysInput(event.target.value);
                    if (daysError) {
                      setDaysError("");
                    }
                  }}
                  aria-invalid={Boolean(daysError)}
                  aria-describedby={daysError ? "days-error" : undefined}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 pr-10 text-sm font-medium text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {daysError && (
                <p id="days-error" className="mt-1 text-sm text-red-600">
                  {daysError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 md:self-end"
            >
              <RotateCw size={15} className={loading ? "animate-spin" : ""} />
              Atualizar indicadores
            </button>

            <Link
              to="/backoffice/dashboard/vencimentos"
              className="inline-flex h-11 items-center justify-center self-end rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 md:self-end"
            >
              Abrir vencimentos
            </Link>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Atalhos:
          </span>
          {DAYS_OPTIONS.map((option) => {
            const isActive = parsedWindow === option.value;
            return (
              <button
                key={`window-${option.value}`}
                type="button"
                disabled={loading}
                onClick={() => {
                  setDaysInput(String(option.value));
                  if (daysError) {
                    setDaysError("");
                  }
                  void loadDashboard(option.value);
                }}
                className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <nav className="flex flex-wrap gap-2">
          {DASHBOARD_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : !kpis ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          Nenhum indicador disponivel.
        </div>
      ) : (
        <div className="space-y-6">
          {activeSection === "overview" && (
            <>
              <DashboardSectionCard
                title="Indicadores estrategicos"
                subtitle="Leitura executiva para priorizacao"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {strategicInsights.map((insight) => (
                    <article
                      key={insight.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="text-sm font-medium text-gray-700">{insight.title}</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{insight.value}</p>
                      <p className="mt-2 text-xs text-gray-500">{insight.text}</p>
                    </article>
                  ))}
                </div>
              </DashboardSectionCard>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <DashboardSectionCard
                  title="Documentos em foco"
                  subtitle={`Janela de ${kpis.window_days} dias`}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <KpiStatCard
                      title="A vencer"
                      value={documentKpis.expiring}
                      helperText="Documentos dentro da janela"
                      tone="amber"
                    />
                    <KpiStatCard
                      title="Vencidos"
                      value={documentKpis.expired}
                      helperText="Necessitam regularizacao"
                      tone="red"
                    />
                    <KpiStatCard
                      title="Vencem hoje"
                      value={documentKpis.expiringToday}
                      helperText="Prioridade do dia"
                      tone="blue"
                    />
                    <KpiStatCard
                      title="Vencem em 7 dias"
                      value={documentKpis.expiringIn7Days}
                      helperText="Curto prazo"
                      tone="emerald"
                    />
                  </div>
                </DashboardSectionCard>

                <DashboardSectionCard title="Distribuicoes chave" subtitle="Corte rapido">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-700">Eventos por tipo</h3>
                      <DistributionList
                        items={eventByTypeDistribution}
                        emptyMessage="Nenhum evento por tipo encontrado."
                        barClassName="bg-blue-500"
                      />
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-700">
                        Ocorrencias por status
                      </h3>
                      <DistributionList
                        items={occurrenceStatusDistribution}
                        emptyMessage="Nenhuma ocorrencia por status."
                        barClassName="bg-emerald-500"
                      />
                    </div>
                  </div>
                </DashboardSectionCard>
              </div>

              <DashboardSectionCard title="Top eventos por participantes">
                <TableTailwind columns={topEventsColumns} data={topEventsRows} />
              </DashboardSectionCard>
            </>
          )}

          {activeSection === "events" && (
            <>
              <DashboardSectionCard
                title="Resumo de eventos"
                subtitle={`Ciclo monitorado: ${kpis.window_days} dias`}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiStatCard
                    title="Total de eventos"
                    value={kpis.events.totals.total}
                    helperText={`Criados na janela: ${kpis.events.totals.created_in_window}`}
                    tone="blue"
                  />
                  <KpiStatCard
                    title="Concluidos"
                    value={kpis.events.totals.completed}
                    helperText={`Conclusao: ${rates.eventCompletion}%`}
                    tone="emerald"
                  />
                  <KpiStatCard
                    title="Em andamento"
                    value={kpis.events.totals.ongoing}
                    helperText={`Proximos: ${kpis.events.totals.upcoming}`}
                    tone="amber"
                  />
                  <KpiStatCard
                    title="Taxa de presenca"
                    value={`${kpis.events.participations.presence_rate_percent.toFixed(2)}%`}
                    helperText={`Participacoes: ${kpis.events.participations.total}`}
                    tone="slate"
                  />
                </div>
              </DashboardSectionCard>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <DashboardSectionCard title="Eventos por tipo" subtitle="Distribuicao">
                  <DistributionList
                    items={eventByTypeDistribution}
                    emptyMessage="Nenhum evento por tipo encontrado."
                    barClassName="bg-blue-500"
                  />
                </DashboardSectionCard>
                <DashboardSectionCard title="Top participantes em eventos">
                  <TableTailwind columns={topParticipantsColumns} data={topParticipantsRows} />
                </DashboardSectionCard>
              </div>

              <DashboardSectionCard title="Top eventos por participantes">
                <TableTailwind columns={topEventsColumns} data={topEventsRows} />
              </DashboardSectionCard>
            </>
          )}

          {activeSection === "occurrences" && (
            <>
              <DashboardSectionCard
                title="Resumo de ocorrencias"
                subtitle={`Ciclo monitorado: ${kpis.window_days} dias`}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiStatCard
                    title="Total de ocorrencias"
                    value={kpis.occurrences.totals.total}
                    helperText={`Criadas na janela: ${kpis.occurrences.totals.created_in_window}`}
                    tone="blue"
                  />
                  <KpiStatCard
                    title="Abertas"
                    value={kpis.occurrences.totals.open}
                    helperText="Ocorrencias pendentes"
                    tone="red"
                  />
                  <KpiStatCard
                    title="Encerradas"
                    value={kpis.occurrences.totals.closed}
                    helperText={`Taxa de encerramento: ${rates.occurrenceClosure}%`}
                    tone="emerald"
                  />
                  <KpiStatCard
                    title="Tempo medio de fechamento"
                    value={
                      kpis.occurrences.closure_time_days.average === null
                        ? "0"
                        : kpis.occurrences.closure_time_days.average
                    }
                    helperText="Em dias"
                    tone="slate"
                  />
                </div>
              </DashboardSectionCard>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <DashboardSectionCard title="Por status">
                  <DistributionList
                    items={occurrenceStatusDistribution}
                    emptyMessage="Nenhuma ocorrencia por status."
                    barClassName="bg-emerald-500"
                  />
                </DashboardSectionCard>
                <DashboardSectionCard title="Por severidade">
                  <DistributionList
                    items={occurrenceSeverityDistribution}
                    emptyMessage="Nenhuma ocorrencia por severidade."
                    barClassName="bg-amber-500"
                  />
                </DashboardSectionCard>
                <DashboardSectionCard title="Por classificacao">
                  <DistributionList
                    items={occurrenceClassificationDistribution}
                    emptyMessage="Nenhuma ocorrencia por classificacao."
                    barClassName="bg-indigo-500"
                  />
                </DashboardSectionCard>
              </div>

              <DashboardSectionCard title="Top colaboradores envolvidos em ocorrencias">
                <TableTailwind
                  columns={topInvolvedEmployeesColumns}
                  data={topInvolvedEmployeesRows}
                />
              </DashboardSectionCard>
            </>
          )}

          {activeSection === "models" && (
            <DashboardSectionCard
              title="Inventario de models"
              subtitle="Volume ativo e total por tabela"
              action={
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Boxes size={14} />
                  <span>{kpis.models.summary.total_models} models mapeados</span>
                </div>
              }
            >
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KpiStatCard
                  title="Registros ativos"
                  value={kpis.models.summary.active_records_total}
                  tone="blue"
                />
                <KpiStatCard
                  title="Registros totais"
                  value={kpis.models.summary.all_records_total}
                  tone="slate"
                />
              </div>
              <TableTailwind columns={modelColumns} data={modelRows} />
            </DashboardSectionCard>
          )}
        </div>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
