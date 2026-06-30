import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarDays,
  faCircleCheck,
  faCoins,
  faCreditCard,
  faGaugeHigh,
  faLock,
  faReceipt,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import AccountHero from '../components/AccountHero'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { ApiError, authApi, billingApi } from '../lib/api'
import '../styles/account.css'
import '../styles/account-dashboard.css'
import '../styles/account-settings.css'

function formatMemberSince(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortMemberSince(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })
}

export default function AccountSettingsPage() {
  const { user, token, refreshUser, signOut } = useAuth()
  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [billingSaving, setBillingSaving] = useState(false)
  const [billingLoading, setBillingLoading] = useState(true)
  const [billingName, setBillingName] = useState('')
  const [billingCompanyName, setBillingCompanyName] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [billingPhone, setBillingPhone] = useState('')
  const [billingAddressLine1, setBillingAddressLine1] = useState('')
  const [billingAddressLine2, setBillingAddressLine2] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingPostalCode, setBillingPostalCode] = useState('')
  const [billingCountry, setBillingCountry] = useState('')
  const [billingTaxId, setBillingTaxId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const seo = pageSeo.settings

  useEffect(() => {
    setFullName(user?.fullName ?? '')
  }, [user?.fullName])

  useEffect(() => {
    if (!token) return

    async function loadBillingProfile() {
      setBillingLoading(true)
      try {
        const response = await billingApi.getBillingProfile(token!)
        const profile = response.profile
        setBillingName(profile.billingName)
        setBillingCompanyName(profile.companyName)
        setBillingEmail(profile.email || user?.email || '')
        setBillingPhone(profile.phone)
        setBillingAddressLine1(profile.addressLine1)
        setBillingAddressLine2(profile.addressLine2)
        setBillingCity(profile.city)
        setBillingState(profile.state)
        setBillingPostalCode(profile.postalCode)
        setBillingCountry(profile.country)
        setBillingTaxId(profile.taxId)
      } catch {
        setBillingEmail(user?.email ?? '')
      } finally {
        setBillingLoading(false)
      }
    }

    loadBillingProfile()
  }, [token, user?.email])

  function flashSuccess(message: string) {
    setSuccess(message)
    setError('')
    window.setTimeout(() => setSuccess(''), 3000)
  }

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    setProfileSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await authApi.updateProfile(token, {
        fullName: fullName.trim() || null,
      })
      await refreshUser()
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setPasswordSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await authApi.changePassword(token, {
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleBillingSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    setBillingSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await billingApi.saveBillingProfile(token, {
        billingName: billingName.trim(),
        companyName: billingCompanyName.trim(),
        email: billingEmail.trim(),
        phone: billingPhone.trim(),
        addressLine1: billingAddressLine1.trim(),
        addressLine2: billingAddressLine2.trim(),
        city: billingCity.trim(),
        state: billingState.trim(),
        postalCode: billingPostalCode.trim(),
        country: billingCountry.trim(),
        taxId: billingTaxId.trim(),
      })
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save billing details')
    } finally {
      setBillingSaving(false)
    }
  }

  if (!user) return null

  const displayName = user.fullName?.trim() || 'Not set'
  const hasCredits = user.credits > 0

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Account', path: '/account' },
          { name: 'Settings', path: '/account/settings' },
        ])}
      />

      <div className="account-page account-settings-page">
        <AccountHero
          activeTab="settings"
          eyebrow="Member account"
          title="Settings"
          lead={`Manage profile and security${user.fullName ? ` for ${user.fullName.split(' ')[0]}` : ''}. Your email and credits stay linked to this account.`}
          breadcrumb={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Settings' },
          ]}
        />

        <section className="account-dashboard account-settings-dashboard" aria-label="Account settings">
          <div className="account-container">
            {error && <p className="account-alert account-alert--error">{error}</p>}
            {success && <p className="account-alert account-alert--success">{success}</p>}

            <div className="account-home-stats account-settings-stats">
              <div className="account-home-stat account-home-stat--featured">
                <div className="account-home-stat-head">
                  <span>Credit balance</span>
                  <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">{user.credits}</p>
                <p className="account-home-stat-sub">
                  {hasCredits ? 'Available for content generation' : 'Add credits to start creating'}
                </p>
                <Link to="/account/billing" className="account-home-stat-action">
                  <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" />
                  Add credits
                </Link>
              </div>

              <div className="account-home-stat">
                <div className="account-home-stat-head">
                  <span>Email status</span>
                  <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </p>
                <p className="account-home-stat-sub">{user.email}</p>
              </div>

              <div className="account-home-stat">
                <div className="account-home-stat-head">
                  <span>Member since</span>
                  <FontAwesomeIcon icon={faCalendarDays} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">{formatShortMemberSince(user.createdAt)}</p>
                <p className="account-home-stat-sub">{formatMemberSince(user.createdAt)}</p>
              </div>

              <div className="account-home-stat">
                <div className="account-home-stat-head">
                  <span>Display name</span>
                  <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value account-settings-stat-name">{displayName}</p>
                <p className="account-home-stat-sub">Shown in your dashboard and workspace</p>
              </div>
            </div>

            <div className="account-home-layout account-settings-layout">
              <div className="account-settings-main">
                <div className="account-panel account-settings-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>
                        <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                        Profile
                      </h2>
                      <p>Your display name appears in the account header and workspace.</p>
                    </div>
                  </div>

                  <form className="account-settings-form" onSubmit={handleProfileSubmit}>
                    <label className="account-settings-field">
                      <span>Full name</span>
                      <input
                        className="account-settings-input"
                        type="text"
                        value={fullName}
                        maxLength={120}
                        placeholder="Your name"
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </label>

                    <label className="account-settings-field">
                      <span>Email</span>
                      <input
                        className="account-settings-input account-settings-input--readonly"
                        type="email"
                        value={user.email}
                        readOnly
                        aria-readonly="true"
                      />
                      <span className="account-settings-hint">
                        Email cannot be changed here. Contact support if you need help.
                      </span>
                    </label>

                    <div className="account-settings-actions">
                      <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                        {profileSaving ? 'Saving...' : 'Save profile'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="account-panel account-settings-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>
                        <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                        Password
                      </h2>
                      <p>Use at least 8 characters. You will stay signed in on this device.</p>
                    </div>
                  </div>

                  <form className="account-settings-form" onSubmit={handlePasswordSubmit}>
                    <label className="account-settings-field">
                      <span>Current password</span>
                      <input
                        className="account-settings-input"
                        type="password"
                        value={currentPassword}
                        autoComplete="current-password"
                        required
                        onChange={(event) => setCurrentPassword(event.target.value)}
                      />
                    </label>

                    <label className="account-settings-field">
                      <span>New password</span>
                      <input
                        className="account-settings-input"
                        type="password"
                        value={newPassword}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        onChange={(event) => setNewPassword(event.target.value)}
                      />
                    </label>

                    <label className="account-settings-field">
                      <span>Confirm new password</span>
                      <input
                        className="account-settings-input"
                        type="password"
                        value={confirmPassword}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                    </label>

                    <div className="account-settings-actions">
                      <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                        {passwordSaving ? 'Updating...' : 'Change password'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="account-panel account-settings-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>
                        <FontAwesomeIcon icon={faReceipt} aria-hidden="true" />
                        Billing details
                      </h2>
                      <p>
                        Used on invoices for credit purchases. Update before checkout if you need a
                        company name or tax ID on your receipt.
                      </p>
                    </div>
                  </div>

                  {billingLoading ? (
                    <p className="account-muted">Loading billing details...</p>
                  ) : (
                    <form className="account-settings-form" onSubmit={handleBillingSubmit}>
                      <div className="account-settings-grid">
                        <label className="account-settings-field">
                          <span>Billing name</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingName}
                            maxLength={200}
                            placeholder={user.fullName ?? 'Your name'}
                            onChange={(event) => setBillingName(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>Company name</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingCompanyName}
                            maxLength={200}
                            placeholder="Optional"
                            onChange={(event) => setBillingCompanyName(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>Billing email</span>
                          <input
                            className="account-settings-input"
                            type="email"
                            value={billingEmail}
                            maxLength={255}
                            placeholder={user.email}
                            onChange={(event) => setBillingEmail(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>Phone</span>
                          <input
                            className="account-settings-input"
                            type="tel"
                            value={billingPhone}
                            maxLength={50}
                            onChange={(event) => setBillingPhone(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field account-settings-field--full">
                          <span>Address line 1</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingAddressLine1}
                            maxLength={255}
                            onChange={(event) => setBillingAddressLine1(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field account-settings-field--full">
                          <span>Address line 2</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingAddressLine2}
                            maxLength={255}
                            onChange={(event) => setBillingAddressLine2(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>City</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingCity}
                            maxLength={120}
                            onChange={(event) => setBillingCity(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>State / region</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingState}
                            maxLength={120}
                            onChange={(event) => setBillingState(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>Postal code</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingPostalCode}
                            maxLength={30}
                            onChange={(event) => setBillingPostalCode(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field">
                          <span>Country</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingCountry}
                            maxLength={120}
                            onChange={(event) => setBillingCountry(event.target.value)}
                          />
                        </label>

                        <label className="account-settings-field account-settings-field--full">
                          <span>Tax ID / VAT number</span>
                          <input
                            className="account-settings-input"
                            type="text"
                            value={billingTaxId}
                            maxLength={80}
                            placeholder="Optional"
                            onChange={(event) => setBillingTaxId(event.target.value)}
                          />
                        </label>
                      </div>

                      <div className="account-settings-actions">
                        <button type="submit" className="btn btn-primary" disabled={billingSaving}>
                          {billingSaving ? 'Saving...' : 'Save billing details'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <aside className="account-dashboard-sidebar">
                <div className="account-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>Account info</h2>
                      <p>Read-only details for your membership.</p>
                    </div>
                  </div>

                  <dl className="account-details account-settings-details">
                    <div className="account-detail-row">
                      <dt>Status</dt>
                      <dd>
                        {user.emailVerified ? (
                          <span className="account-settings-status account-settings-status--verified">
                            <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                            Verified
                          </span>
                        ) : (
                          'Unverified'
                        )}
                      </dd>
                    </div>
                    <div className="account-detail-row">
                      <dt>Credits</dt>
                      <dd>{user.credits}</dd>
                    </div>
                    <div className="account-detail-row">
                      <dt>Member since</dt>
                      <dd>{formatMemberSince(user.createdAt)}</dd>
                    </div>
                    <div className="account-detail-row">
                      <dt>Account ID</dt>
                      <dd>
                        <code className="account-settings-id">{user.id}</code>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="account-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>Quick links</h2>
                      <p>Jump back to dashboard, usage, and billing.</p>
                    </div>
                  </div>

                  <div className="account-home-quick-links">
                    <Link to="/account" className="account-home-quick-link">
                      <div>
                        <strong>Dashboard</strong>
                        <span>Credits, usage, and services overview</span>
                      </div>
                      <em>Open →</em>
                    </Link>
                    <Link to="/account/usage" className="account-home-quick-link">
                      <div>
                        <strong>Usage</strong>
                        <span>Requests, tokens, and activity history</span>
                      </div>
                      <em>View →</em>
                    </Link>
                    <Link to="/account/billing" className="account-home-quick-link">
                      <div>
                        <strong>Billing</strong>
                        <span>Purchase credits and view payment history</span>
                      </div>
                      <em>Manage →</em>
                    </Link>
                  </div>
                </div>

                <div className="account-panel account-settings-actions-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>Session</h2>
                      <p>Sign out on this device when you are done.</p>
                    </div>
                  </div>

                  <div className="account-sidebar-actions">
                    <Link to="/account/billing" className="btn btn-secondary btn-block">
                      <FontAwesomeIcon icon={faReceipt} aria-hidden="true" />
                      Buy credits
                    </Link>
                    <Link to="/account" className="btn btn-secondary btn-block">
                      <FontAwesomeIcon icon={faGaugeHigh} aria-hidden="true" />
                      Back to dashboard
                    </Link>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block account-signout"
                      onClick={signOut}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
