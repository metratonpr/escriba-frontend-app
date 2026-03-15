type FormControlSkeletonProps = {
  label: string;
  className?: string;
  required?: boolean;
};

export default function FormControlSkeleton({
  label,
  className = "",
  required = false,
}: FormControlSkeletonProps) {
  return (
    <div className={`w-full ${className}`} aria-busy="true">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="h-10 w-full rounded-lg bg-slate-100 skeleton-shimmer dark:bg-slate-700/80" />
    </div>
  );
}
