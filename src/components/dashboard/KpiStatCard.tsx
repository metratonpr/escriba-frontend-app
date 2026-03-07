type KpiStatTone = "blue" | "emerald" | "amber" | "red" | "slate";

type KpiStatCardProps = {
  title: string;
  value: number | string;
  helperText?: string;
  tone?: KpiStatTone;
};

const TONE_CLASSES: Record<KpiStatTone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-900",
  slate: "border-slate-200 bg-slate-50 text-slate-900",
};

export default function KpiStatCard({
  title,
  value,
  helperText = "",
  tone = "slate",
}: KpiStatCardProps) {
  return (
    <article className={`rounded-xl border p-4 shadow-sm ${TONE_CLASSES[tone]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {helperText && <p className="mt-2 text-xs opacity-80">{helperText}</p>}
    </article>
  );
}
