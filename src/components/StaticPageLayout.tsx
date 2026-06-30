import { Link } from 'react-router-dom'
import SEO from './SEO'
import { breadcrumbJsonLd, type PageSeo } from '../config/seo'
import type { StaticPageConfig } from '../data/staticPages'
import '../styles/static-page.css'

type StaticPageLayoutProps = {
  page: StaticPageConfig
  seo: PageSeo
}

const statusLabels = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
} as const

export default function StaticPageLayout({ page, seo }: StaticPageLayoutProps) {
  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: page.breadcrumb, path: page.path },
        ])}
      />

      <div className="static-page">
        <section className="static-hero" aria-labelledby="static-page-heading">
          <div className="static-container">
            <nav className="static-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>{page.breadcrumb}</span>
            </nav>

            <p className="static-eyebrow">{page.eyebrow}</p>
            <h1 id="static-page-heading">{page.title}</h1>
            <p className="static-hero-lead">{page.lead}</p>
            {page.updated && <p className="static-updated">{page.updated}</p>}
          </div>
        </section>

        <section className="static-content" aria-label="Page content">
          <div className="static-container">
            {page.statusItems && (
              <ul className="static-status-list">
                {page.statusItems.map((item) => (
                  <li key={item.name} className="static-status-item">
                    <div>
                      <strong>{item.name}</strong>
                      {item.detail && <span>{item.detail}</span>}
                    </div>
                    <span
                      className={`static-status-badge static-status-badge--${item.status}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {page.guideLinks && (
              <div className="static-guide-grid">
                {page.guideLinks.map((guide) => (
                  <Link key={guide.title} to={guide.to} className="static-guide-card">
                    <h3>{guide.title}</h3>
                    <p>{guide.description}</p>
                  </Link>
                ))}
              </div>
            )}

            {page.sections.map((section) => (
              <article key={section.heading} className="static-section">
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        {page.cta && (
          <section className="static-cta" aria-labelledby="static-cta-heading">
            <div className="static-container static-cta-inner">
              <div>
                <h2 id="static-cta-heading">{page.cta.title}</h2>
                <p>{page.cta.description}</p>
              </div>
              <div className="static-cta-actions">
                <Link to={page.cta.primary.to} className="btn btn-primary btn-lg">
                  {page.cta.primary.label}
                </Link>
                {page.cta.secondary && (
                  <Link to={page.cta.secondary.to} className="btn btn-secondary btn-lg">
                    {page.cta.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
