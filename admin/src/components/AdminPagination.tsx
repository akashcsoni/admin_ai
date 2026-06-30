type AdminPaginationProps = {
  page: number
  totalPages: number
  total?: number
  onPrevious: () => void
  onNext: () => void
  className?: string
}

export default function AdminPagination({
  page,
  totalPages,
  total,
  onPrevious,
  onNext,
  className = 'admin-content-footer',
}: AdminPaginationProps) {
  return (
    <div className={className}>
      <button type="button" className="admin-btn admin-btn--ghost" disabled={page <= 1} onClick={onPrevious}>
        Previous
      </button>
      <span className="admin-content-footer-meta">
        Page {page} of {totalPages}
        {total !== undefined ? ` · ${total} total` : ''}
      </span>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={page >= totalPages}
        onClick={onNext}
      >
        Next
      </button>
    </div>
  )
}
