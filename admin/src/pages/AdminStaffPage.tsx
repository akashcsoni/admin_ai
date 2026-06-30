import { Fragment, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRotateRight,
  faCircleCheck,
  faKey,
  faMagnifyingGlass,
  faPlus,
  faShieldHalved,
  faUserPlus,
  faUserShield,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  type AdminRole,
} from '../lib/adminPermissions'
import { adminApi, type AdminStaffMember } from '../lib/api'

function formatCreated(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function memberLabel(member: AdminStaffMember): string {
  const name = member.fullName?.trim()
  return name ? `${name} · ${member.email}` : member.email
}

function roleBadgeClass(role: AdminRole): string {
  if (role === 'administrator') return 'admin-staff-role admin-staff-role--administrator'
  if (role === 'manager') return 'admin-staff-role admin-staff-role--manager'
  if (role === 'support') return 'admin-staff-role admin-staff-role--support'
  if (role === 'editor') return 'admin-staff-role admin-staff-role--editor'
  return 'admin-staff-role admin-staff-role--staff'
}

function roleSelectClass(role: AdminRole): string {
  return `admin-staff-role-select admin-staff-role-select--${role}`
}

const ROLE_SUMMARIES: Record<AdminRole, string> = {
  administrator: 'Full portal access including staff and payment settings.',
  manager: 'Members, credits, activity, and content — no staff or payment config.',
  staff: 'View members, activity, auto blog, and services.',
  support: 'Handle member support tickets, billing questions, and account help.',
  editor: 'Create and publish SEO blog posts on the public website.',
}

const emptyCreateForm = {
  email: '',
  password: '',
  fullName: '',
  role: 'staff' as AdminRole,
}

type StaffTab = 'all' | 'active' | 'inactive' | 'administrators'

const staffTabs: { value: StaffTab; label: string }[] = [
  { value: 'all', label: 'All staff' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'administrators', label: 'Administrators' },
]

export default function AdminStaffPage() {
  const { token, admin } = useAdminAuth()
  const [staff, setStaff] = useState<AdminStaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [creating, setCreating] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<StaffTab>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all')

  async function loadStaff() {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.listStaff(token)
      setStaff(response.staff)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStaff()
  }, [token])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuery(search.trim())
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  const filteredStaff = useMemo(() => {
    let result = staff

    if (activeTab === 'active') {
      result = result.filter((member) => member.isActive)
    } else if (activeTab === 'inactive') {
      result = result.filter((member) => !member.isActive)
    } else if (activeTab === 'administrators') {
      result = result.filter((member) => member.role === 'administrator')
    }

    if (roleFilter !== 'all') {
      result = result.filter((member) => member.role === roleFilter)
    }

    if (query) {
      const needle = query.toLowerCase()
      result = result.filter(
        (member) =>
          member.email.toLowerCase().includes(needle) ||
          (member.fullName?.toLowerCase().includes(needle) ?? false),
      )
    }

    return result
  }, [staff, activeTab, roleFilter, query])

  function flashSuccess(nextMessage: string) {
    setMessage(nextMessage)
    setError('')
    window.setTimeout(() => setMessage(''), 3500)
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    setCreating(true)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.createStaff(token, {
        email: createForm.email.trim(),
        password: createForm.password,
        fullName: createForm.fullName.trim() || null,
        role: createForm.role,
      })
      flashSuccess(response.message)
      setCreateForm(emptyCreateForm)
      await loadStaff()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create staff member')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdate(
    member: AdminStaffMember,
    updates: {
      email?: string
      fullName?: string | null
      role?: AdminRole
      isActive?: boolean
      password?: string
    },
  ) {
    if (!token) return

    setSavingId(member.id)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.updateStaff(token, member.id, updates)
      flashSuccess(response.message)
      setStaff((current) =>
        current.map((item) => (item.id === member.id ? response.staff : item)),
      )
      if (updates.password) {
        setResettingId(null)
        setResetPassword('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update staff member')
    } finally {
      setSavingId(null)
    }
  }

  const stats = useMemo(() => {
    const activeCount = staff.filter((member) => member.isActive).length
    const adminCount = staff.filter((member) => member.role === 'administrator').length
    const inactiveCount = staff.length - activeCount

    return { activeCount, adminCount, inactiveCount }
  }, [staff])

  return (
    <div className="admin-page admin-staff-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Team access</p>
          <h1>Admin staff</h1>
          <p className="admin-page-lead">
            Manage portal logins with role-based access for administrators, managers, staff, and
            support.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => void loadStaff()}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} aria-hidden="true" />
            Refresh
          </button>
          {admin ? (
            <span className="admin-page-header-badge">
              <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
              {ADMIN_ROLE_LABELS[admin.role]}
            </span>
          ) : null}
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      <section className="admin-stat-grid admin-stat-grid--dashboard" aria-label="Staff overview">
        <article className="admin-stat-card admin-stat-card--violet">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            <p className="admin-stat-label">Total staff</p>
          </div>
          <p className="admin-stat-value">{staff.length}</p>
          <p className="admin-stat-meta">Portal accounts with admin access</p>
        </article>

        <article className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faCircleCheck} />
            </span>
            <p className="admin-stat-label">Active</p>
          </div>
          <p className="admin-stat-value">{stats.activeCount}</p>
          <p className="admin-stat-meta">
            {stats.inactiveCount} inactive account{stats.inactiveCount === 1 ? '' : 's'}
          </p>
        </article>

        <article className="admin-stat-card admin-stat-card--amber">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faUserShield} />
            </span>
            <p className="admin-stat-label">Administrators</p>
          </div>
          <p className="admin-stat-value">{stats.adminCount}</p>
          <p className="admin-stat-meta">Can manage staff and payment settings</p>
        </article>

        <article className="admin-stat-card admin-stat-card--blue">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faKey} />
            </span>
            <p className="admin-stat-label">Your access</p>
          </div>
          <p className="admin-stat-value admin-staff-stat-role">
            {admin ? ADMIN_ROLE_LABELS[admin.role] : '—'}
          </p>
          <p className="admin-stat-meta">
            {admin ? ROLE_SUMMARIES[admin.role] : 'Signed in as admin'}
          </p>
        </article>
      </section>

      <div className="admin-staff-layout">
        <section className="admin-logs-panel admin-staff-roster-panel" aria-label="Staff roster">
          <div className="admin-staff-roster-head">
            <div>
              <h2>Staff roster</h2>
              <p>Update roles, reset passwords, or deactivate portal access.</p>
            </div>
          </div>

          <nav className="admin-logs-tabs" aria-label="Staff filters">
            {staffTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`admin-logs-tab${activeTab === tab.value && roleFilter === 'all' ? ' admin-logs-tab--active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.value)
                  setRoleFilter('all')
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="admin-logs-toolbar">
            <form
              className="admin-logs-search"
              onSubmit={(event) => {
                event.preventDefault()
                setQuery(search.trim())
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
              <input
                type="search"
                value={search}
                placeholder="Search..."
                aria-label="Search staff"
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>

            <button
              type="button"
              className={`admin-logs-filter-btn${showFilters ? ' admin-logs-filter-btn--active' : ''}`}
              onClick={() => setShowFilters((current) => !current)}
            >
              <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
              Add filter
            </button>

            <span className="admin-logs-count">
              {loading
                ? 'Loading...'
                : `${filteredStaff.length.toLocaleString()} result${filteredStaff.length === 1 ? '' : 's'}`}
            </span>
          </div>

          {showFilters && (
            <div className="admin-logs-filters">
              <label className="admin-logs-filter-field">
                <span>Role</span>
                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value as AdminRole | 'all')
                  }
                >
                  <option value="all">Any role</option>
                  {ADMIN_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ADMIN_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <div className="admin-logs-body">
            {loading ? (
              <p className="admin-logs-loading">Loading staff...</p>
            ) : filteredStaff.length === 0 ? (
              <div className="admin-logs-empty">
                <p>{staff.length === 0 ? 'No staff members yet' : 'No staff found'}</p>
                <span>
                  {staff.length === 0
                    ? 'Create the first admin account using the form on the right.'
                    : 'Try a different search or filter.'}
                </span>
              </div>
            ) : (
              <div className="admin-logs-table-wrap">
                <table className="admin-logs-table admin-staff-roster-table">
                  <thead>
                    <tr>
                      <th scope="col" className="admin-staff-col-member">
                        Member
                      </th>
                      <th scope="col" className="admin-staff-col-role">
                        Role
                      </th>
                      <th scope="col" className="admin-staff-col-status">
                        Status
                      </th>
                      <th scope="col" className="admin-staff-col-created">
                        Created
                      </th>
                      <th scope="col" className="admin-staff-col-actions">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => {
                      const isSelf = member.id === admin?.id
                      const isSaving = savingId === member.id
                      const isResetting = resettingId === member.id

                      return (
                        <Fragment key={member.id}>
                          <tr
                            className={
                              !member.isActive
                                ? 'admin-logs-table-row admin-logs-table-row--muted'
                                : 'admin-logs-table-row'
                            }
                          >
                            <td className="admin-staff-roster-member">
                              <div className="admin-staff-member-cell">
                                <span className="admin-logs-cell-text">{memberLabel(member)}</span>
                                {isSelf ? (
                                  <span className="admin-staff-tag admin-staff-tag--you">You</span>
                                ) : null}
                              </div>
                            </td>
                            <td className="admin-staff-roster-role">
                              <select
                                className={`admin-input ${roleSelectClass(member.role)}`}
                                value={member.role}
                                disabled={isSelf || isSaving}
                                aria-label={`Role for ${member.email}`}
                                onChange={(event) =>
                                  void handleUpdate(member, { role: event.target.value as AdminRole })
                                }
                              >
                                {ADMIN_ROLES.map((role) => (
                                  <option key={role} value={role}>
                                    {ADMIN_ROLE_LABELS[role]}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="admin-staff-roster-status">
                              <span className="admin-logs-status">
                                {member.isActive ? (
                                  <>
                                    <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                                    Active
                                  </>
                                ) : (
                                  <>Inactive</>
                                )}
                              </span>
                            </td>
                            <td className="admin-staff-roster-created admin-logs-table-date">
                              {formatCreated(member.createdAt)}
                            </td>
                            <td className="admin-staff-roster-actions">
                              <div className="admin-staff-actions">
                                <button
                                  type="button"
                                  className="admin-btn admin-btn--ghost admin-staff-action-btn"
                                  disabled={isSelf || isSaving}
                                  onClick={() =>
                                    void handleUpdate(member, { isActive: !member.isActive })
                                  }
                                >
                                  {member.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn--ghost admin-staff-action-btn"
                                  disabled={isSaving}
                                  onClick={() => {
                                    setResettingId(isResetting ? null : member.id)
                                    setResetPassword('')
                                  }}
                                >
                                  Reset password
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isResetting ? (
                            <tr className="admin-staff-reset-row">
                              <td colSpan={5}>
                                <form
                                  className="admin-staff-reset-form"
                                  onSubmit={(event) => {
                                    event.preventDefault()
                                    if (resetPassword.length < 8) {
                                      setError('Password must be at least 8 characters')
                                      return
                                    }
                                    void handleUpdate(member, { password: resetPassword })
                                  }}
                                >
                                  <label className="admin-staff-reset-label">
                                    <span>New password for {member.email}</span>
                                    <input
                                      type="password"
                                      className="admin-input"
                                      value={resetPassword}
                                      minLength={8}
                                      autoComplete="new-password"
                                      placeholder="Minimum 8 characters"
                                      onChange={(event) => setResetPassword(event.target.value)}
                                    />
                                  </label>
                                  <div className="admin-staff-reset-actions">
                                    <button
                                      type="submit"
                                      className="admin-btn admin-btn--primary"
                                      disabled={isSaving || resetPassword.length < 8}
                                    >
                                      {isSaving ? 'Saving...' : 'Save password'}
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn--ghost"
                                      onClick={() => {
                                        setResettingId(null)
                                        setResetPassword('')
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <aside className="admin-staff-sidebar">
          <AdminContentCard
            title="Add staff member"
            description="Only administrators can create and manage admin portal accounts."
          >
            <form className="admin-staff-create-form" onSubmit={handleCreate}>
              <label className="admin-field">
                <span>Full name</span>
                <input
                  type="text"
                  className="admin-input"
                  value={createForm.fullName}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  placeholder="Jane Admin"
                />
              </label>
              <label className="admin-field">
                <span>Email</span>
                <input
                  type="email"
                  className="admin-input"
                  required
                  value={createForm.email}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="admin@example.com"
                />
              </label>
              <label className="admin-field">
                <span>Password</span>
                <input
                  type="password"
                  className="admin-input"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Minimum 8 characters"
                />
              </label>
              <label className="admin-field">
                <span>Role</span>
                <select
                  className="admin-input"
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      role: event.target.value as AdminRole,
                    }))
                  }
                >
                  {ADMIN_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ADMIN_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn admin-btn--primary" disabled={creating}>
                  <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
                  {creating ? 'Creating...' : 'Create staff member'}
                </button>
              </div>
            </form>
          </AdminContentCard>

          <section className="admin-content-card admin-staff-roles-card">
            <div className="admin-content-card-head">
              <div className="admin-content-card-head-copy">
                <h2>Role permissions</h2>
                <p>What each role can access in the admin portal.</p>
              </div>
            </div>
            <div className="admin-content-card-body admin-staff-roles-body">
              {ADMIN_ROLES.map((role) => (
                <article key={role} className="admin-staff-role-card">
                  <div className="admin-staff-role-card-head">
                    <span className={roleBadgeClass(role)}>{ADMIN_ROLE_LABELS[role]}</span>
                    <span className="admin-staff-role-count">
                      {ROLE_PERMISSIONS[role].length} permissions
                    </span>
                  </div>
                  <p>{ROLE_SUMMARIES[role]}</p>
                  <ul className="admin-staff-permission-list">
                    {ROLE_PERMISSIONS[role].map((permission) => (
                      <li key={permission}>{permission.replace(/\./g, ' · ')}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
