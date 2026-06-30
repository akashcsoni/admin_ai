import { Link, Navigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCircleCheck,
  faCoins,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { getServiceById, getServiceInitials } from '../data/services'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { formatCreditCostLabel, useServiceCreditCost } from '../context/ServiceCreditsContext'
import { breadcrumbJsonLd } from '../config/seo'
import AutoBlogWorkspace from './account/workspaces/AutoBlogWorkspace'
import SocialContentWorkspace from './account/workspaces/SocialContentWorkspace'
import EmailNewsletterWorkspace from './account/workspaces/EmailNewsletterWorkspace'
import '../styles/account.css'
import '../styles/account-service.css'

export default function AccountServicePage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const { user } = useAuth()
  const service = serviceId ? getServiceById(serviceId) : undefined
  const creditCost = useServiceCreditCost(serviceId ?? '')

  if (!user) return null
  if (!service) return <Navigate to="/account" replace />
  if (!service.available) return <Navigate to="/account" replace />

  const pageTitle = `${service.title} — Content AI`
  const hasCredits = user.credits >= creditCost
  const creditCostLabel = formatCreditCostLabel(creditCost)

  return (
    <>
      <SEO
        title={pageTitle}
        description={service.shortDescription}
        path={`/account/services/${service.id}`}
        keywords={[service.title, 'Content AI workspace', 'AI content tools']}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Account', path: '/account' },
          { name: service.title, path: `/account/services/${service.id}` },
        ])}
      />

      <div className="account-page account-service-page">
        <section className="account-service-hero" aria-labelledby="service-workspace-heading">
          <div className="account-container">
            <nav className="account-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/account">Account</Link>
              <span aria-hidden="true">/</span>
              <span>{service.title}</span>
            </nav>

            <div className="account-service-hero-card">
              <div className="account-service-hero-card-top">
                <div className="account-service-hero-identity">
                  <span className="account-service-hero-icon-wrap" aria-hidden="true">
                    {getServiceInitials(service.title)}
                  </span>
                  <div className="account-service-hero-identity-copy">
                    <strong>{service.title}</strong>
                    <div className="account-service-hero-chips">
                      <span
                        className={`account-service-hero-chip${
                          service.available ? ' account-service-hero-chip--live' : ''
                        }`}
                      >
                        {service.available ? (
                          <>
                            <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                            Live
                          </>
                        ) : (
                          'Coming soon'
                        )}
                      </span>
                      <span className="account-service-hero-chip">
                        <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                        {creditCostLabel} per use
                      </span>
                    </div>
                  </div>
                </div>

                <div className="account-hero-metrics">
                  <div className="account-hero-metric">
                    <span className="account-hero-metric-label">
                      <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                      Cost
                    </span>
                    <strong>{creditCost}</strong>
                    <span>{creditCostLabel} per generation</span>
                  </div>
                  <div className="account-hero-metric account-hero-metric--featured">
                    <span className="account-hero-metric-label">
                      <FontAwesomeIcon icon={faWallet} aria-hidden="true" />
                      Your balance
                    </span>
                    <strong>{user.credits}</strong>
                    <span>{hasCredits ? 'Ready to create' : 'Top up to continue'}</span>
                  </div>
                  <Link to="/account/billing" className="account-hero-metric account-hero-metric--action">
                    <span className="account-hero-metric-label">
                      <FontAwesomeIcon icon={faWallet} aria-hidden="true" />
                      Billing
                    </span>
                    <strong>Buy credits</strong>
                    <span>$1 per credit</span>
                  </Link>
                </div>
              </div>

              <div className="account-service-hero-card-body">
                <div className="account-service-hero-copy">
                  <p className="account-eyebrow">Service workspace</p>
                  <h1 id="service-workspace-heading">{service.title}</h1>
                  <p className="account-hero-lead">{service.shortDescription}</p>
                </div>

                <Link to="/account" className="account-service-hero-back">
                  <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                  All services
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="account-service-body" aria-label={`${service.title} workspace`}>
          <div className="account-container">
            {service.id === 'auto-blog' ? (
              <AutoBlogWorkspace service={service} />
            ) : service.id === 'social-content' ? (
              <SocialContentWorkspace service={service} />
            ) : service.id === 'email-newsletters' ? (
              <EmailNewsletterWorkspace service={service} />
            ) : null}
          </div>
        </section>
      </div>
    </>
  )
}
