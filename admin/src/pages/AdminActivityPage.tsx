import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, type AdminUserActivity, type AdminUserListItem } from '../lib/api'

function formatMemberLabel(user: AdminUserListItem): string {
  const name = user.fullName?.trim()
  return name ? `${name} (${user.email})` : user.email
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatServiceLabel(service: string): string {
  return service.replace(/_/g, ' ')
}

function formatActionLabel(action: string): string {
  return action.replace(/_/g, ' ')
}

function statusChipClass(status: string): string {
  if (status === 'completed') return 'admin-chip admin-chip--success'
  if (status === 'failed') return 'admin-chip admin-chip--danger'
  return 'admin-chip admin-chip--muted'
}

export default function AdminActivityPage() {
  const { token } = useAdminAuth()
  const [searchParams] = useSearchParams()
  const [activities, setActivities] = useState<AdminUserActivity[]>([])
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [error, setError] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState(() => searchParams.get('userId') ?? '')

  useEffect(() => {
    if (!token) return

    async function loadUsers() {
      setUsersLoading(true)
      try {
        const response = await adminApi.listUsers(token!, { page: 1, pageSize: 200 })
        setUsers(response.users)
      } catch {
        setUsers([])
      } finally {
        setUsersLoading(false)
      }
    }

    void loadUsers()
  }, [token])

  useEffect(() => {
    if (!token || !userFilter) return
    if (users.some((user) => user.id === userFilter)) return

    async function loadSelectedUser() {
      try {
        const response = await adminApi.getUser(token!, userFilter)
        setUsers((current) => {
          if (current.some((user) => user.id === response.user.id)) return current
          return [response.user, ...current]
        })
      } catch {
        // Selected user may have been removed; keep filter for API result.
      }
    }

    void loadSelectedUser()
  }, [token, userFilter, users])

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.listActivities(token!, {
          page,
          pageSize,
          userId: userFilter || undefined,
          service: serviceFilter || undefined,
          status: statusFilter || undefined,
        })
        setActivities(response.activities)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, page, pageSize, serviceFilter, statusFilter, userFilter])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Monitoring</p>
          <h1>Activity</h1>
          <p className="admin-page-lead">
            Member actions across all services — blog creation, and more as features launch.
          </p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <AdminContentCard
        title="All user activity"
        description="Latest member actions, newest first."
        meta={
          <span className="admin-chip">
            <strong>{total}</strong> events
          </span>
        }
        toolbar={
          <div className="admin-activity-filters">
            <label className="admin-activity-filter">
              <FontAwesomeIcon icon={faFilter} aria-hidden="true" />
              <select
                value={userFilter}
                disabled={usersLoading}
                onChange={(event) => {
                  setPage(1)
                  setUserFilter(event.target.value)
                }}
              >
                <option value="">All members</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {formatMemberLabel(user)}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-activity-filter">
              <select
                value={serviceFilter}
                onChange={(event) => {
                  setPage(1)
                  setServiceFilter(event.target.value)
                }}
              >
                <option value="">All services</option>
                <option value="auto_blog">Auto blog</option>
                <option value="social_content">Social media</option>
                <option value="email_newsletter">Email newsletters</option>
              </select>
            </label>
            <label className="admin-activity-filter">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1)
                  setStatusFilter(event.target.value)
                }}
              >
                <option value="">All statuses</option>
                <option value="started">In progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </label>
          </div>
        }
        loading={loading}
        loadingLabel="Loading activity..."
        footer={
          !loading ? (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPrevious={() => setPage((current) => current - 1)}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : undefined
        }
      >
        <div className="admin-data-table-wrap">
          <table className="admin-data-table admin-activity-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Member</th>
                <th>Service</th>
                <th>Action</th>
                <th>Status</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-data-table-empty">
                    {userFilter || serviceFilter || statusFilter
                      ? 'No activity matches the selected filters.'
                      : 'No activity recorded yet.'}
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="admin-data-table-date">{formatDateTime(activity.createdAt)}</td>
                    <td className="admin-activity-member">
                      <Link to={`/users/${activity.userId}`}>
                        <strong>{activity.userFullName?.trim() || activity.userEmail}</strong>
                      </Link>
                      <span>{activity.userEmail}</span>
                    </td>
                    <td>
                      <span className="admin-chip admin-chip--muted">
                        {formatServiceLabel(activity.service)}
                      </span>
                    </td>
                    <td>{formatActionLabel(activity.action)}</td>
                    <td>
                      <span className={statusChipClass(activity.status)}>{activity.status}</span>
                    </td>
                    <td className="admin-activity-summary">
                      <strong>{activity.title}</strong>
                      {activity.detail ? <span>{activity.detail}</span> : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminContentCard>
    </div>
  )
}
