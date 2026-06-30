import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminAuthApi, ApiError } from '../lib/api'

export default function AdminSignInPage() {
  const navigate = useNavigate()
  const { signIn } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await adminAuthApi.signIn(email, password)
      signIn(response.token, response.admin)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        <p className="admin-page-eyebrow">WBBYWRITER</p>
        <h1>Admin sign in</h1>
        <p>Use your admin portal account. This is separate from member accounts.</p>

        {error && <p className="admin-auth-error">{error}</p>}

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Email</span>
            <input
              className="admin-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="admin-field">
            <span>Password</span>
            <input
              className="admin-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in to admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
