import { Link } from 'react-router-dom'
import ContentIcon from '../components/ContentIcon'
import SEO from '../components/SEO'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { liveServices, servicesStats } from '../data/services'
import '../styles/services.css'

export default function ServicesPage() {
  const seo = pageSeo.services
  const liveCount = liveServices.length

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />

      <div className="services-page">
        <section className="services-hero" aria-labelledby="services-heading">
          <div className="services-container">
            <nav className="services-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Services</span>
            </nav>

            <div className="services-hero-grid">
              <div className="services-hero-copy">
                <p className="services-eyebrow">Our services</p>
                <h1 id="services-heading">
                  AI content tools, <span className="text-gradient">one platform</span>
                </h1>
                <p className="services-hero-lead">
                  Auto blog, social posts, and HTML email newsletters — all powered by your own
                  API keys.
                </p>
                <div className="services-hero-actions">
                  <Link to="/contact" className="btn btn-primary btn-lg">
                    Start with auto blog
                  </Link>
                  <Link to="/pricing" className="btn btn-secondary btn-lg">
                    View pricing
                  </Link>
                </div>
              </div>

              <div className="services-hero-stats" aria-label="Services overview">
                {servicesStats.map((stat) => (
                  <article key={stat.label} className="services-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="services-overview" aria-labelledby="overview-heading">
          <div className="services-container">
            <div className="services-section-head">
              <h2 id="overview-heading">Browse all services</h2>
              <p>{liveCount} live service{liveCount === 1 ? '' : 's'} available now</p>
            </div>

            <nav className="services-jump-nav" aria-label="Jump to service">
              {liveServices.map((service) => (
                <a key={service.id} href={`#${service.id}`} className="services-jump-link">
                  <ContentIcon name={service.icon} className="services-jump-icon" />
                  <span>{service.title}</span>
                </a>
              ))}
            </nav>

            <div className="services-overview-grid">
              {liveServices.map((service) => (
                <a
                  key={service.id}
                  href={`#${service.id}`}
                  className="services-overview-card services-overview-card--live"
                >
                  <ContentIcon name={service.icon} />
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                  <span className="services-overview-status">Available now</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="services-details" aria-label="Service details">
          <div className="services-container services-details-list">
            {liveServices.map((service, index) => (
              <article
                key={service.id}
                id={service.id}
                className={`services-detail ${index % 2 === 1 ? 'services-detail--reverse' : ''} services-detail--live`}
                aria-labelledby={`${service.id}-title`}
              >
                <div className="services-detail-copy">
                  <div className="services-detail-top">
                    <ContentIcon name={service.icon} />
                    <span className="services-status-badge services-status-badge--live">Live now</span>
                  </div>
                  <h2 id={`${service.id}-title`}>{service.title}</h2>
                  <p className="services-detail-lead">{service.description}</p>
                  <ul className="feature-list services-feature-list">
                    {service.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link to="/contact" className="btn btn-primary">
                    Get started with {service.title}
                  </Link>
                </div>

                <div className="services-detail-visual">
                  <div className="services-preview">
                    <span className="services-preview-label">Workflow preview</span>
                    <div className="services-preview-steps">
                      <div className="services-preview-step">
                        <span>1</span>
                        <p>Connect OpenAI or Anthropic API key</p>
                      </div>
                      <div className="services-preview-step">
                        <span>2</span>
                        <p>Set topic, tone, keywords & length</p>
                      </div>
                      <div className="services-preview-step">
                        <span>3</span>
                        <p>Export SEO-ready Markdown or HTML</p>
                      </div>
                    </div>
                    <div className="services-preview-tags">
                      <span>BYOK</span>
                      <span>SEO optimized</span>
                      <span>Any CMS</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="services-cta" aria-labelledby="services-cta-heading">
          <div className="services-container services-cta-inner">
            <div>
              <h2 id="services-cta-heading">Start with auto blog creation today</h2>
              <p>
                Connect your API keys and generate your first SEO-friendly draft in minutes.
              </p>
            </div>
            <div className="services-cta-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Get started free
              </Link>
              <Link to="/faq" className="btn btn-ghost btn-lg">
                Read FAQ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
