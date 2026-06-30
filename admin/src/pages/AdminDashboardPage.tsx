import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCoins, faGaugeHigh, faPenToSquare, faUserShield, faUsers } from '@fortawesome/free-solid-svg-icons'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminNavItems } from '../data/adminNav'
import { adminHasPermission } from '../lib/adminPermissions'
import { adminApi, type AdminStats } from '../lib/api'

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

const statCards = [
  {
    key: 'users',
    label: 'Total members',
    icon: faUsers,
    tone: 'violet',
    getValue: (stats: AdminStats) => stats.totalUsers,
    getMeta: (stats: AdminStats) => `${formatNumber(stats.signupsThisWeek)} joined this week`,
  },
  {
    key: 'credits',
    label: 'Credits in system',
    icon: faCoins,
    tone: 'blue',
    getValue: (stats: AdminStats) => stats.totalCredits,
    getMeta: (stats: AdminStats) => `${formatNumber(stats.suspendedUsers)} suspended members`,
  },
  {
    key: 'posts',
    label: 'Auto blog posts',
    icon: faPenToSquare,
    tone: 'green',
    getValue: (stats: AdminStats) => stats.totalPosts,
    getMeta: (stats: AdminStats) => `${formatNumber(stats.generationsToday)} generations today`,
  },
  {
    key: 'admins',
    label: 'Admin accounts',
    icon: faUserShield,
    tone: 'amber',
    getValue: (stats: AdminStats) => stats.totalAdmins,
    getMeta: (stats: AdminStats) =>
      `${formatNumber(stats.totalTopics)} topics · ${formatNumber(stats.totalCategories)} categories`,
  },
] as const

const quickActionGroups = [
  {
    id: 'members',
    label: 'Members & support',
    description: 'Accounts, tickets, credits, and activity',
    itemIds: ['users', 'support', 'billing', 'credits', 'activity'],
  },
  {
    id: 'content',
    label: 'Content',
    description: 'Site blog, auto blog, and services',
    itemIds: ['blog-cms', 'auto-blog', 'services'],
  },
  {
    id: 'system',
    label: 'Portal settings',
    description: 'Staff access and payment configuration',
    itemIds: ['staff', 'payment'],
  },
] as const

const quickActionTones: Record<string, 'violet' | 'blue' | 'green' | 'amber' | 'rose'> = {
  users: 'violet',
  support: 'amber',
  billing: 'blue',
  credits: 'blue',
  activity: 'green',
  'blog-cms': 'violet',
  'auto-blog': 'green',
  services: 'blue',
  staff: 'rose',
  payment: 'amber',
}

export default function AdminDashboardPage() {
  const { token, admin } = useAdminAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const quickGroups = useMemo(() => {
    if (!admin) return []

    return quickActionGroups
      .map((group) => ({
        ...group,
        items: group.itemIds
          .map((id) => adminNavItems.find((item) => item.id === id))
          .filter((item): item is (typeof adminNavItems)[number] => Boolean(item))
          .filter(
            (item) => !item.permission || adminHasPermission(admin.role, item.permission),
          ),
      }))
      .filter((group) => group.items.length > 0)
  }, [admin])

  const quickActionCount = quickGroups.reduce((total, group) => total + group.items.length, 0)

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getStats(token!)
        setStats(response.stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  return (
    <div className="admin-page admin-dashboard-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Overview</p>
          <h1>Welcome back{admin?.fullName ? `, ${admin.fullName.split(' ')[0]}` : ''}</h1>
          <p className="admin-page-lead">
            Platform metrics, member activity, and quick links to every admin tool.
          </p>
        </div>
        <div className="admin-page-header-badge">
          <FontAwesomeIcon icon={faGaugeHigh} />
          <span>Admin dashboard</span>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {loading ? (
        <p className="admin-content-loading">Loading dashboard...</p>
      ) : stats ? (
        <>
          <section className="admin-stat-grid admin-stat-grid--dashboard" aria-label="Platform statistics">
            {statCards.map((card) => (
              <article key={card.key} className={`admin-stat-card admin-stat-card--${card.tone}`}>
                <div className="admin-stat-card-top">
                  <span className="admin-stat-card-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={card.icon} />
                  </span>
                  <p className="admin-stat-label">{card.label}</p>
                </div>
                <p className="admin-stat-value">{formatNumber(card.getValue(stats))}</p>
                <p className="admin-stat-meta">{card.getMeta(stats)}</p>
              </article>
            ))}
          </section>

          <section className="admin-dashboard-quick" aria-label="Quick actions">
            <div className="admin-dashboard-quick-head">
              <div>
                <h2>Quick actions</h2>
                <p>Jump into the tools you use most — filtered by your role permissions.</p>
              </div>
              <span className="admin-chip">
                <strong>{quickActionCount}</strong> available
              </span>
            </div>

            <div className="admin-dashboard-quick-groups">
              {quickGroups.map((group) => (
                <div key={group.id} className="admin-dashboard-quick-group">
                  <div className="admin-dashboard-quick-group-head">
                    <h3>{group.label}</h3>
                    <p>{group.description}</p>
                  </div>

                  <div className="admin-quick-grid">
                    {group.items.map((item) => {
                      const tone = quickActionTones[item.id] ?? 'violet'

                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`admin-quick-card admin-quick-card--${tone}`}
                        >
                          <div className="admin-quick-card-top">
                            <span className="admin-quick-card-icon" aria-hidden="true">
                              <FontAwesomeIcon icon={item.icon} />
                            </span>
                            <span className="admin-quick-card-arrow" aria-hidden="true">
                              <FontAwesomeIcon icon={faArrowRight} />
                            </span>
                          </div>
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
