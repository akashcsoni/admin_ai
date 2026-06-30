import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faCircleCheck,
  faCoins,
  faGaugeHigh,
  faWallet,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

type AccountTab = 'dashboard' | 'billing' | 'usage' | 'settings' | 'support'

type BreadcrumbItem = {
  label: string
  to?: string
}

type AccountHeroProps = {
  activeTab: AccountTab
  eyebrow: string
  title: string
  lead: string
  breadcrumb: BreadcrumbItem[]
  action?: ReactNode
}

function getInitials(fullName: string | null, email: string): string {
  const name = fullName?.trim()
  const local = (email.split('@')[0] ?? email).trim()

  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase()
    }
  }

  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase()
  }

  return email.slice(0, 2).toUpperCase()
}

function formatMemberSince(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function AccountHero({
  activeTab,
  eyebrow,
  title,
  lead,
  breadcrumb,
  action,
}: AccountHeroProps) {
  const { user } = useAuth()

  if (!user) return null

  const displayName = user.fullName?.trim() || 'Content AI member'
  const initials = getInitials(user.fullName, user.email)
  const memberSince = formatMemberSince(user.createdAt)
  const hasCredits = user.credits > 0

  return (
    <section className="account-hero" aria-labelledby="account-hero-heading">
      <div className="account-container">
        <nav className="account-breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`} className="account-breadcrumb-item">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
            </span>
          ))}
        </nav>

        <div className="account-hero-card">
          <div className="account-hero-card-top">
            <div className="account-hero-identity">
              <span className="account-hero-avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="account-hero-identity-copy">
                <strong>{displayName}</strong>
                <span>{user.email}</span>
                <div className="account-hero-chips">
                  {user.emailVerified ? (
                    <span className="account-hero-chip account-hero-chip--success">
                      <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                      Verified
                    </span>
                  ) : (
                    <span className="account-hero-chip">Unverified</span>
                  )}
                  <span className="account-hero-chip">
                    <FontAwesomeIcon icon={faCalendarDays} aria-hidden="true" />
                    Since {memberSince}
                  </span>
                </div>
              </div>
            </div>

            <div className="account-hero-metrics">
              <div className="account-hero-metric account-hero-metric--featured">
                <span className="account-hero-metric-label">
                  <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                  Credits
                </span>
                <strong>{user.credits}</strong>
                <span>{hasCredits ? 'Ready to create' : 'Top up to continue'}</span>
              </div>
              {activeTab === 'dashboard' ? (
                <Link to="/account/billing" className="account-hero-metric account-hero-metric--action">
                  <span className="account-hero-metric-label">
                    <FontAwesomeIcon icon={faWallet} aria-hidden="true" />
                    Billing
                  </span>
                  <strong>Buy credits</strong>
                  <span>$1 per credit</span>
                </Link>
              ) : activeTab === 'usage' ? (
                <Link to="/account/billing" className="account-hero-metric account-hero-metric--action">
                  <span className="account-hero-metric-label">
                    <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                    Balance
                  </span>
                  <strong>{user.credits} credits</strong>
                  <span>{hasCredits ? 'Available now' : 'Top up to continue'}</span>
                </Link>
              ) : (
                <div className="account-hero-metric">
                  <span className="account-hero-metric-label">
                    <FontAwesomeIcon icon={faGaugeHigh} aria-hidden="true" />
                    Pricing
                  </span>
                  <strong>$1</strong>
                  <span>1 credit = 1 content</span>
                </div>
              )}
            </div>
          </div>

          <div className="account-hero-card-body">
            <div className="account-hero-copy">
              <p className="account-eyebrow">{eyebrow}</p>
              <h1 id="account-hero-heading">{title}</h1>
              <p className="account-hero-lead">{lead}</p>
              {action}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
