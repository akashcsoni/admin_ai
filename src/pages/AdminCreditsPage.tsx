import { useEffect, useState } from 'react'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminHasPermission } from '../lib/adminPermissions'
import { adminApi, type CreditTransaction } from '../lib/api'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminCreditsPage() {
  const { token, admin } = useAdminAuth()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState(1)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function loadTransactions(nextPage = page) {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await adminApi.listCreditTransactions(token, {
        page: nextPage,
        pageSize,
      })
      setTransactions(response.transactions)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions(page)
  }, [token, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  async function handleAdjust(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.adjustCredits(token, {
        userId: userId.trim(),
        amount,
        reason: reason.trim(),
      })
      setMessage(`${response.message} New balance: ${response.credits}`)
      setUserId('')
      setReason('')
      setAmount(1)
      setPage(1)
      await loadTransactions(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust credits')
    } finally {
      setSubmitting(false)
    }
  }

  const canAdjustCredits = admin ? adminHasPermission(admin.role, 'credits.adjust') : false

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Credits</p>
          <h1>Credits</h1>
          <p className="admin-page-lead">Grant or remove credits and review the transaction ledger.</p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      <div className="admin-accordion">
        {canAdjustCredits && (
        <details className="admin-accordion-section" open>
          <summary>
            <span className="admin-accordion-summary-main">
              <span className="admin-accordion-title">Adjust credits</span>
              <span className="admin-accordion-meta">Manual grant or deduction</span>
            </span>
          </summary>
          <div className="admin-accordion-body">
            <form className="admin-form-grid" onSubmit={handleAdjust}>
              <label className="admin-field">
                <span>User ID</span>
                <input
                  className="admin-input"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="Paste member UUID"
                  required
                />
              </label>
              <label className="admin-field">
                <span>Amount (+ / −)</span>
                <input
                  className="admin-input"
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  required
                />
              </label>
              <label className="admin-field admin-field--wide">
                <span>Reason</span>
                <input
                  className="admin-input"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Support refund, promo grant, etc."
                  required
                />
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn" disabled={submitting}>
                  {submitting ? 'Applying...' : 'Apply adjustment'}
                </button>
              </div>
            </form>
          </div>
        </details>
        )}
      </div>

      <AdminContentCard
        title="Transaction history"
        description="All credit changes recorded by admins."
        meta={
          <span className="admin-chip">
            <strong>{total}</strong> transactions
          </span>
        }
        loading={loading}
        loadingLabel="Loading transactions..."
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
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-data-table-empty">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="admin-data-table-date">{formatDateTime(tx.createdAt)}</td>
                    <td>
                      <strong>{tx.userEmail}</strong>
                    </td>
                    <td className={tx.amount >= 0 ? 'admin-text-success' : 'admin-text-danger'}>
                      <strong>{tx.amount >= 0 ? `+${tx.amount}` : tx.amount}</strong>
                    </td>
                    <td className="admin-data-table-num">{tx.balanceAfter}</td>
                    <td>
                      <span className="admin-chip admin-chip--muted">{tx.type}</span>
                    </td>
                    <td>{tx.reason}</td>
                    <td>{tx.adminEmail || '—'}</td>
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
