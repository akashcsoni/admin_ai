import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBars, faCoins, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'
import { siteConfig } from '../config/site'
import BrandIcon from './BrandIcon'
import '../styles/header.css'

const websiteNavItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

const accountNavItems = [
  { to: '/account', label: 'Dashboard', end: true },
  { to: '/account/billing', label: 'Billing' },
  { to: '/account/usage', label: 'Usage' },
  { to: '/account/support', label: 'Support' },
  { to: '/account/settings', label: 'Settings' },
]

function isAccountRoute(pathname: string): boolean {
  return pathname === '/account' || pathname.startsWith('/account/')
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user, signOut } = useAuth()
  const onAccount = isAccountRoute(location.pathname)
  const navItems = onAccount ? accountNavItems : websiteNavItems
  const logoTo = onAccount ? '/account' : '/'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    if (menuOpen) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}${onAccount ? ' site-header--account' : ''}`}>
      {!onAccount ? (
        <div className="header-topbar">
          <div className="header-container header-topbar-inner">
            <p>
              Auto blog creation with your own AI API keys — full control, zero markup.
            </p>
            <Link to="/services#auto-blog" className="header-topbar-link">
              Learn more
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="header-main">
        <div className="header-container header-main-inner">
          <NavLink to={logoTo} className="header-logo" aria-label={`${siteConfig.name} ${onAccount ? 'account' : 'home'}`}>
            <BrandIcon size="sm" className="logo-icon" />
            <span className="header-logo-text">
              <strong>{siteConfig.name}</strong>
              <small>{siteConfig.tagline}</small>
            </span>
          </NavLink>

          <nav className="header-nav" aria-label={onAccount ? 'Account navigation' : 'Main navigation'}>
            <ul className="header-nav-list">
              {navItems.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      isActive ? 'header-nav-link active' : 'header-nav-link'
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <Link to="/account/billing" className="header-credits-badge" title="Buy credits">
                  <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                  <span>{user?.credits ?? 0}</span>
                </Link>
                {onAccount ? (
                  <Link to="/" className="btn btn-secondary header-btn-secondary">
                    Website
                  </Link>
                ) : (
                  <Link to="/account" className="btn btn-secondary header-btn-secondary">
                    {user?.fullName ?? 'Account'}
                  </Link>
                )}
                <button type="button" className="btn btn-primary header-btn-primary" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn btn-secondary header-btn-secondary">
                  Sign in
                </Link>
                <Link to="/signup" className="btn btn-primary header-btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="header-menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      <div
        className={`header-mobile ${menuOpen ? 'header-mobile--open' : ''}`}
        id="mobile-navigation"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="header-mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
        <div className="header-mobile-panel">
          <div className="header-mobile-head">
            <NavLink to={logoTo} className="header-logo" onClick={() => setMenuOpen(false)}>
              <BrandIcon size="sm" className="logo-icon" />
              <span className="header-logo-text">
                <strong>{siteConfig.name}</strong>
              </span>
            </NavLink>
            <button
              type="button"
              className="header-mobile-close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          <nav className="header-mobile-nav" aria-label={onAccount ? 'Account navigation' : 'Mobile navigation'}>
            <ul>
              {navItems.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      isActive ? 'header-mobile-link active' : 'header-mobile-link'
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-mobile-actions">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account/billing"
                  className="btn btn-secondary btn-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Credits: {user?.credits ?? 0}
                </Link>
                {onAccount ? (
                  <Link
                    to="/"
                    className="btn btn-secondary btn-block"
                    onClick={() => setMenuOpen(false)}
                  >
                    Back to website
                  </Link>
                ) : (
                  <Link
                    to="/account"
                    className="btn btn-secondary btn-block"
                    onClick={() => setMenuOpen(false)}
                  >
                    My account
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    signOut()
                    setMenuOpen(false)
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="btn btn-secondary btn-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Get started free
                </Link>
              </>
            )}
          </div>

          <p className="header-mobile-note">
            {onAccount
              ? 'Manage credits, usage, billing, and your profile'
              : 'OpenAI & Anthropic supported · SEO-ready exports · Your keys, your cost'}
          </p>
        </div>
      </div>
    </header>
  )
}
