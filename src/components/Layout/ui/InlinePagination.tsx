type InlinePaginationProps = {
  total: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
};

export default function InlinePagination({
  total,
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 25, 50],
  className = "",
}: InlinePaginationProps) {
  if (total <= 0) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <span className="text-xs text-gray-500">
        Mostrando {from}-{to} de {total}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="h-8 rounded border border-gray-300 px-2 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-xs text-gray-600">
          Página {currentPage} de {totalPages}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-8 rounded border border-gray-300 px-2 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
        </button>

        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="h-8 rounded border border-gray-300 px-2 text-xs text-gray-700"
        >
          {perPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}/página
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
