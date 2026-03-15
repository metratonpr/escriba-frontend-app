type AttachmentViewerSkeletonProps = {
  height?: number | string;
  showMeta?: boolean;
};

export default function AttachmentViewerSkeleton({
  height = "70vh",
  showMeta = true,
}: AttachmentViewerSkeletonProps) {
  const viewerHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-8 w-72 max-w-full rounded-xl bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
          {showMeta && (
            <>
              <div className="h-4 w-64 max-w-full rounded-full bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
              <div className="h-4 w-48 max-w-full rounded-full bg-slate-100 skeleton-shimmer dark:bg-slate-700/80" />
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-24 rounded-md bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
          <div className="h-9 w-32 rounded-md bg-slate-200 skeleton-shimmer dark:bg-slate-700" />
          <div className="h-9 w-20 rounded-md bg-slate-300 skeleton-shimmer dark:bg-slate-600" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div
          className="w-full bg-slate-100 skeleton-shimmer dark:bg-slate-700/80"
          style={{ height: viewerHeight }}
        />
      </div>
    </div>
  );
}
