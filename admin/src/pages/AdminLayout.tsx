import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faEllipsis,
  faRightFromBracket,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useAdminAuth } from '../context/AdminAuthContext'
import AdminAvatar from '../components/AdminAvatar'
import { adminNavItems, adminSecondaryNav } from '../data/adminNav'
import { ADMIN_ROLE_LABELS, adminHasPermission } from '../lib/adminPermissions'

const SIDEBAR_COLLAPSED_KEY = 'content_ai_admin_sidebar_collapsed'
const SIDEBAR_PROMO_KEY = 'content_ai_admin_sidebar_promo_dismissed'

function SidebarToggleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 2.5V15.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export default function AdminLayout() {
  const { admin, signOut } = useAdminAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1')
  const [promoDismissed, setPromoDismissed] = useState(
    () => localStorage.getItem(SIDEBAR_PROMO_KEY) === '1',
  )
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  if (!admin) return null

  const visibleNavItems = adminNavItems.filter(
    (item) => !item.permission || adminHasPermission(admin.role, item.permission),
  )

  function handleSignOut() {
    signOut()
    navigate('/signin')
  }

  function dismissPromo() {
    localStorage.setItem(SIDEBAR_PROMO_KEY, '1')
    setPromoDismissed(true)
  }

  return (
    <div className={`admin-shell${collapsed ? ' admin-shell--sidebar-collapsed' : ''}`}>
      <aside
        className={`admin-sidebar${collapsed ? ' admin-sidebar--collapsed' : ''}`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-top">
          <button type="button" className="admin-sidebar-project" aria-label="Content AI admin">
            <span className="admin-sidebar-project-label">Content AI</span>
            {!collapsed && <FontAwesomeIcon icon={faChevronDown} className="admin-sidebar-project-chevron" />}
          </button>
          <button
            type="button"
            className="admin-sidebar-collapse"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <SidebarToggleIcon />
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <ul>
            {visibleNavItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `admin-sidebar-link${isActive ? ' admin-sidebar-link--active' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="admin-sidebar-link-icon">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className="admin-sidebar-link-label">{item.label}</span>
                </NavLink>
              </li>
            ))}

            <li className="admin-sidebar-more">
              <button
                type="button"
                className={`admin-sidebar-link admin-sidebar-link--button${moreOpen ? ' admin-sidebar-link--active' : ''}`}
                onClick={() => setMoreOpen((current) => !current)}
                aria-expanded={moreOpen}
                title={collapsed ? 'More' : undefined}
              >
                <span className="admin-sidebar-link-icon">
                  <FontAwesomeIcon icon={faEllipsis} />
                </span>
                <span className="admin-sidebar-link-label">More</span>
              </button>

              {moreOpen && !collapsed && (
                <ul className="admin-sidebar-subnav">
                  {adminSecondaryNav.map((item) => (
                    <li key={item.id}>
                      <a href={item.path} className="admin-sidebar-sublink" target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={item.icon} />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <button type="button" className="admin-sidebar-sublink" onClick={handleSignOut}>
                      <FontAwesomeIcon icon={faRightFromBracket} />
                      <span>Sign out</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {!promoDismissed && !collapsed && (
          <div className="admin-sidebar-promo">
            <button
              type="button"
              className="admin-sidebar-promo-close"
              onClick={dismissPromo}
              aria-label="Dismiss"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <strong>We&apos;ve cleaned things up</strong>
            <p>Explore what&apos;s changed with the redesigned navigation.</p>
            <button type="button" className="admin-sidebar-promo-btn" onClick={dismissPromo}>
              Learn more
            </button>
          </div>
        )}

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-sidebar-profile"
            onClick={handleSignOut}
            title={collapsed ? admin.fullName?.trim() || admin.email : 'Sign out'}
          >
            <AdminAvatar fullName={admin.fullName} email={admin.email} size="sidebar" />
            <div className="admin-sidebar-profile-copy">
              <strong>{admin.fullName?.trim() || 'Admin'}</strong>
              <span>{ADMIN_ROLE_LABELS[admin.role]}</span>
            </div>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}
