export default function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-slate-200 skeleton-shimmer" />
            <div className="h-9 w-72 rounded-xl bg-slate-100 skeleton-shimmer" />
            <div className="h-4 w-80 max-w-full rounded-full bg-slate-100 skeleton-shimmer" />
            <div className="h-4 w-64 max-w-full rounded-full bg-slate-100 skeleton-shimmer" />
          </div>
          <div className="h-10 w-40 rounded-lg bg-blue-50 skeleton-shimmer" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-blue-100 bg-blue-50 p-4"
            >
              <div className="h-3 w-24 rounded-full bg-slate-200 skeleton-shimmer" />
              <div className="mt-3 h-8 w-20 rounded-xl bg-white skeleton-shimmer" />
              <div className="mt-3 h-3 w-28 rounded-full bg-slate-100 skeleton-shimmer" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-slate-200 skeleton-shimmer" />
            <div className="h-6 w-52 rounded-xl bg-slate-100 skeleton-shimmer" />
            <div className="h-4 w-72 max-w-full rounded-full bg-slate-100 skeleton-shimmer" />
          </div>

          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[220px_auto_auto] lg:w-auto">
            <div className="h-11 rounded-xl bg-gray-100 skeleton-shimmer" />
            <div className="h-11 rounded-xl bg-blue-600/15 skeleton-shimmer" />
            <div className="h-11 rounded-xl bg-gray-100 skeleton-shimmer" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 w-20 rounded-full bg-gray-100 skeleton-shimmer" />
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 w-28 rounded-lg bg-gray-100 skeleton-shimmer" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-56 rounded-full bg-slate-200 skeleton-shimmer" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="h-3 w-24 rounded-full bg-slate-200 skeleton-shimmer" />
                <div className="mt-3 h-7 w-20 rounded-xl bg-slate-100 skeleton-shimmer" />
                <div className="mt-3 h-3 w-32 rounded-full bg-slate-200 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-5 w-44 rounded-full bg-slate-200 skeleton-shimmer" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <div key={rowIndex} className="space-y-2">
                    <div className="h-3 w-24 rounded-full bg-slate-200 skeleton-shimmer" />
                    <div className="h-3 w-full rounded-full bg-slate-100 skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-52 rounded-full bg-slate-200 skeleton-shimmer" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((__, cellIndex) => (
                  <div
                    key={cellIndex}
                    className="h-4 rounded-full bg-slate-200 skeleton-shimmer"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
