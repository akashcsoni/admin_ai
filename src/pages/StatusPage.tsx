import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRotateRight,
  faCircleCheck,
  faClock,
  faHeadset,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import SEO from '../components/SEO'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { siteConfig } from '../config/site'
import {
  getOverallStatusFromGroups,
  overallStatus,
  resolvedIncidents,
  statusGroups,
  statusHelpLinks,
  statusLabels,
  statusMetrics,
  type ServiceStatus,
} from '../data/status'
import '../styles/status.css'

const statusIcons: Record<ServiceStatus, typeof faCircleCheck> = {
  operational: faCircleCheck,
  degraded: faClock,
  outage: faShieldHalved,
  maintenance: faArrowRotateRight,
}

function formatToday(): string {
  return new Date().toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function StatusPage() {
  const seo = pageSeo.status
  const globalStatus = getOverallStatusFromGroups(statusGroups)
  const banner = globalStatus === 'operational' ? overallStatus : {
    ...overallStatus,
    state: globalStatus,
    label: statusLabels[globalStatus],
    message: 'Some services may be affected. See details below.',
  }

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Status', path: '/status' },
        ])}
      />

      <div className="status-page">
        <section className="status-hero" aria-labelledby="status-heading">
          <div className="status-container">
            <nav className="status-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Status</span>
            </nav>

            <div className="status-hero-grid">
              <div className="status-hero-copy">
                <p className="status-eyebrow">System status</p>
                <h1 id="status-heading">
                  {siteConfig.name} <span className="text-gradient">platform health</span>
                </h1>
                <p className="status-hero-lead">
                  Real-time operational status for our website, content generation, billing, and
                  support services.
                </p>
              </div>

              <div
                className={`status-banner status-banner--${banner.state}`}
                role="status"
                aria-live="polite"
              >
                <span className="status-banner-indicator" aria-hidden="true" />
                <div>
                  <strong>{banner.label}</strong>
                  <p>{banner.message}</p>
                  <time className="status-banner-time" dateTime={new Date().toISOString()}>
                    {formatToday()} · {banner.lastUpdated}
                  </time>
                </div>
                <FontAwesomeIcon icon={statusIcons[banner.state]} className="status-banner-icon" />
              </div>
            </div>
          </div>
        </section>

        <section className="status-metrics" aria-label="Platform metrics">
          <div className="status-container">
            <div className="status-metrics-grid">
              {statusMetrics.map((metric) => (
                <article key={metric.label} className="status-metric-card">
                  <span className="status-metric-label">{metric.label}</span>
                  <strong className="status-metric-value">{metric.value}</strong>
                  <span className="status-metric-detail">{metric.detail}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="status-services" aria-labelledby="services-heading">
          <div className="status-container">
            <div className="status-section-head">
              <h2 id="services-heading">Service status</h2>
              <p>Grouped by product area. Green means the service is fully available.</p>
            </div>

            <div className="status-groups">
              {statusGroups.map((group) => (
                <article key={group.id} className="status-group-card">
                  <header className="status-group-header">
                    <h3>{group.name}</h3>
                    <span className="status-group-count">
                      {group.services.filter((service) => service.status === 'operational').length}/
                      {group.services.length} operational
                    </span>
                  </header>
                  <ul className="status-service-list">
                    {group.services.map((service) => (
                      <li key={service.id} className="status-service-row">
                        <div className="status-service-info">
                          <span
                            className={`status-dot status-dot--${service.status}`}
                            aria-hidden="true"
                          />
                          <div>
                            <strong>{service.name}</strong>
                            <span>{service.description}</span>
                          </div>
                        </div>
                        <span className={`status-pill status-pill--${service.status}`}>
                          {statusLabels[service.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="status-incidents" aria-labelledby="incidents-heading">
          <div className="status-container">
            <div className="status-section-head">
              <h2 id="incidents-heading">Incident history</h2>
              <p>Past incidents and scheduled maintenance windows.</p>
            </div>

            {resolvedIncidents.length === 0 ? (
              <div className="status-empty-incidents">
                <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                <div>
                  <strong>No recent incidents</strong>
                  <p>There are no reported outages in the last 90 days.</p>
                </div>
              </div>
            ) : (
              <ul className="status-incident-list">
                {resolvedIncidents.map((incident) => (
                  <li key={incident.id} className="status-incident-card">
                    <div className="status-incident-meta">
                      <time dateTime={incident.date}>{incident.date}</time>
                      <span className={`status-incident-badge status-incident-badge--${incident.status}`}>
                        {incident.status}
                      </span>
                    </div>
                    <h3>{incident.title}</h3>
                    <p>{incident.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="status-help" aria-labelledby="status-help-heading">
          <div className="status-container">
            <div className="status-help-panel">
              <div className="status-help-copy">
                <FontAwesomeIcon icon={faHeadset} className="status-help-icon" aria-hidden="true" />
                <div>
                  <h2 id="status-help-heading">Experiencing an issue?</h2>
                  <p>
                    If something is not working and it is not listed here, contact support with
                    your account email, the service affected, and when the issue started.
                  </p>
                </div>
              </div>
              <div className="status-help-actions">
                <Link to="/contact" className="btn btn-primary">
                  Contact support
                </Link>
                <Link to="/faq" className="btn btn-secondary">
                  Visit help center
                </Link>
              </div>
            </div>

            <div className="status-help-grid">
              {statusHelpLinks.map((link) => (
                <Link key={link.title} to={link.to} className="status-help-card">
                  <h3>{link.title}</h3>
                  <p>{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
