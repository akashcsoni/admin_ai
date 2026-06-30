import type { ReactNode } from 'react'

type AdminContentCardProps = {
  title?: string
  description?: string
  meta?: ReactNode
  toolbar?: ReactNode
  customHead?: ReactNode
  footer?: ReactNode
  children: ReactNode
  loading?: boolean
  loadingLabel?: string
  className?: string
}

export default function AdminContentCard({
  title,
  description,
  meta,
  toolbar,
  customHead,
  footer,
  children,
  loading = false,
  loadingLabel = 'Loading...',
  className,
}: AdminContentCardProps) {
  const showDefaultHead = !customHead && (title || toolbar || meta)

  return (
    <section className={`admin-content-card${className ? ` ${className}` : ''}`}>
      {customHead}
      {showDefaultHead && (
        <div className="admin-content-card-head">
          <div className="admin-content-card-head-copy">
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {meta && <div className="admin-content-card-meta">{meta}</div>}
          {toolbar && <div className="admin-content-card-toolbar">{toolbar}</div>}
        </div>
      )}

      <div className="admin-content-card-body">
        {loading ? <p className="admin-content-loading">{loadingLabel}</p> : children}
      </div>

      {footer}
    </section>
  )
}
