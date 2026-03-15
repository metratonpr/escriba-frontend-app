type FormPageSkeletonProps = {
  className?: string;
  fields?: number;
};

export default function FormPageSkeleton({
  className = "",
  fields = 8,
}: FormPageSkeletonProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl p-6 ${className}`}>
      <div className="mb-4 h-4 w-56 rounded-full bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: fields }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
              <div className="h-11 rounded-xl bg-slate-100 skeleton-shimmer dark:bg-slate-700/80" />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <div className="h-10 w-28 rounded-xl bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
          <div className="h-10 w-36 rounded-xl bg-slate-300 skeleton-shimmer dark:bg-slate-600" />
        </div>
      </div>
    </div>
  );
}
