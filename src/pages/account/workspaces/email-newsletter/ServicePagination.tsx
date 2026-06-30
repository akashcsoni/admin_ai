type ServicePaginationProps = {
  page: number
  totalPages: number
  total: number
  onPrevious: () => void
  onNext: () => void
  label?: string
  className?: string
}

export default function ServicePagination({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
  label = 'items',
  className = 'service-pagination',
}: ServicePaginationProps) {
  if (totalPages <= 1 && total === 0) return null

  return (
    <div className={className}>
      <button type="button" className="service-pagination-btn" disabled={page <= 1} onClick={onPrevious}>
        Previous
      </button>
      <span className="service-pagination-meta">
        Page {page} of {Math.max(totalPages, 1)} · {total} {label}
      </span>
      <button
        type="button"
        className="service-pagination-btn"
        disabled={page >= totalPages}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  )
}
