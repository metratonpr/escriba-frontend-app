

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Gera array dos números visíveis da paginação com base na tela (simplificado)
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i)
    }
    return range
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex justify-center mt-6" aria-label="Paginação">
      <ul className="inline-flex -space-x-px text-sm">
        <li>
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 border border-gray-300 rounded-l hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
        </li>

        {/* Mostrar botão 1 e ... se necessário */}
        {pageNumbers[0] > 1 && (
          <>
            <li>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1 border border-gray-300 hover:bg-gray-100"
              >
                1
              </button>
            </li>
            {pageNumbers[0] > 2 && (
              <li className="px-3 py-1 border border-gray-300 cursor-default select-none">...</li>
            )}
          </>
        )}

        {/* Botões das páginas visíveis */}
        {pageNumbers.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`px-3 py-1 border border-gray-300 hover:bg-gray-100 ${
                page === currentPage ? 'bg-blue-500 text-white cursor-default' : ''
              }`}
              disabled={page === currentPage}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Mostrar ... e último botão se necessário */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <li className="px-3 py-1 border border-gray-300 cursor-default select-none">...</li>
            )}
            <li>
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 border border-gray-300 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 border border-gray-300 rounded-r hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  )
}
