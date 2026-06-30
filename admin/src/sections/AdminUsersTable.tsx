import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faUser } from '@fortawesome/free-solid-svg-icons'
import type { AdminUserListItem } from '../lib/api'

function formatCreated(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function memberLabel(user: AdminUserListItem): string {
  const name = user.fullName?.trim()
  return name ? `${name} · ${user.email}` : user.email
}

function activitySummary(user: AdminUserListItem): string {
  const parts: string[] = []
  if (user.postCount > 0) {
    parts.push(`${user.postCount} post${user.postCount === 1 ? '' : 's'}`)
  }
  if (user.topicCount > 0) {
    parts.push(`${user.topicCount} topic${user.topicCount === 1 ? '' : 's'}`)
  }
  if (parts.length === 0) {
    return 'No activity yet'
  }
  return parts.join(' · ')
}

type AdminUsersTableProps = {
  users: AdminUserListItem[]
}

export default function AdminUsersTable({ users }: AdminUsersTableProps) {
  const navigate = useNavigate()

  if (users.length === 0) {
    return (
      <div className="admin-logs-empty">
        <p>No member users found.</p>
        <span>Try a different search or filter.</span>
      </div>
    )
  }

  return (
    <div className="admin-logs-table-wrap">
      <table className="admin-logs-table">
        <thead>
          <tr>
            <th scope="col" className="admin-logs-col-member">
              Member
            </th>
            <th scope="col" className="admin-logs-col-activity">
              Activity
            </th>
            <th scope="col" className="admin-logs-col-credits">
              Credits
            </th>
            <th scope="col" className="admin-logs-col-status">
              Status
            </th>
            <th scope="col" className="admin-logs-col-created">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className={`admin-logs-table-row${user.isSuspended ? ' admin-logs-table-row--muted' : ''}`}
              tabIndex={0}
              onClick={() => navigate(`/users/${user.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(`/users/${user.id}`)
                }
              }}
            >
              <td className="admin-logs-table-primary">
                <span className="admin-logs-cell-text">{memberLabel(user)}</span>
              </td>
              <td>
                <span className="admin-logs-cell-with-icon">
                  <span className="admin-logs-cell-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <span className="admin-logs-cell-text admin-logs-cell-text--truncate">
                    {activitySummary(user)}
                  </span>
                </span>
              </td>
              <td>
                <span className="admin-logs-cell-mono">{user.credits}</span>
              </td>
              <td>
                <span className="admin-logs-status">
                  {user.isSuspended ? (
                    <>
                      <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
                      Suspended
                    </>
                  ) : user.emailVerified ? (
                    <>
                      <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                      Active
                    </>
                  ) : (
                    <>Unverified</>
                  )}
                </span>
              </td>
              <td className="admin-logs-table-date">{formatCreated(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
