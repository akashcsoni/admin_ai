import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins, faWallet } from '@fortawesome/free-solid-svg-icons'

type UsageCreditBalanceCardProps = {
  available: number
  total: number
  periodAmount: number
  progressPercent: number
  periodLabel?: string
  buyCreditsHref?: string
  showBuyLink?: boolean
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value)
}

export default function UsageCreditBalanceCard({
  available,
  total,
  periodAmount,
  progressPercent,
  periodLabel = 'purchased in this period',
  buyCreditsHref = '/account/billing',
  showBuyLink = true,
}: UsageCreditBalanceCardProps) {
  const safeProgress = Math.min(100, Math.max(0, progressPercent))

  return (
    <div className="usage-credit-card">
      <div className="usage-credit-card-body">
        <div className="usage-credit-card-top">
          <span className="usage-credit-card-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faWallet} />
          </span>
          <div className="usage-credit-card-head">
            <div className="usage-credit-card-headline">
              <h3>Credit balance</h3>
              <span className="usage-credit-card-badge">
                {formatNumber(available)} available
              </span>
            </div>
            {showBuyLink ? (
              <Link to={buyCreditsHref} className="usage-credit-card-link">
                <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                Buy credits
              </Link>
            ) : null}
          </div>
        </div>

        <p className="usage-credit-card-value">
          <span className="usage-credit-card-value-current">{formatNumber(available)}</span>
          <span className="usage-credit-card-value-separator">/</span>
          <span className="usage-credit-card-value-total">{formatNumber(total)} total</span>
        </p>

        <div className="usage-credit-card-progress" aria-hidden="true">
          <div className="usage-credit-card-progress-fill" style={{ width: `${safeProgress}%` }} />
        </div>

        <p className="usage-credit-card-note">
          <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
          {formatNumber(periodAmount)} {periodLabel}
        </p>
      </div>
    </div>
  )
}
