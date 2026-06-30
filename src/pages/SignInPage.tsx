import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { ApiError, authApi } from '../lib/api'
import { pageSeo } from '../config/seo'
import '../styles/auth.css'

type SignInMode = 'password' | 'code'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn: saveSession } = useAuth()
  const seo = pageSeo.signIn

  const [mode, setMode] = useState<SignInMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSendCode(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    try {
      const response = await authApi.sendCode(email, 'signin')
      setCodeSent(true)
      setInfo(`Sign in code sent to ${email}. Check your inbox. Expires in ${response.expiresInMinutes} minutes.`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send sign in code')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSignIn(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.signIn(email, password)
      saveSession(response.token, response.user)
      navigate('/account')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  async function handleCodeSignIn(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.signInWithCode(email, code)
      saveSession(response.token, response.user)
      navigate('/account')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in with code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title={seo.title} description={seo.description} path={seo.path} keywords={[...seo.keywords]} />

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-head">
            <p className="auth-eyebrow">Welcome back</p>
            <h1>Sign in to Content AI</h1>
            <p>Use your password or request a one-time email verification code.</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Sign in method">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'password'}
              className={mode === 'password' ? 'active' : ''}
              onClick={() => {
                setMode('password')
                setError('')
                setInfo('')
              }}
            >
              Password
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'code'}
              className={mode === 'code' ? 'active' : ''}
              onClick={() => {
                setMode('code')
                setError('')
                setInfo('')
              }}
            >
              Email code
            </button>
          </div>

          {error && <p className="auth-alert auth-alert--error">{error}</p>}
          {info && <p className="auth-alert auth-alert--info">{info}</p>}

          {mode === 'password' ? (
            <form className="auth-form" onSubmit={handlePasswordSignIn}>
              <label htmlFor="signin-email">
                Email address
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label htmlFor="signin-password">
                Password
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={codeSent ? handleCodeSignIn : handleSendCode}>
              <label htmlFor="signin-code-email">
                Email address
                <input
                  id="signin-code-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              {codeSent && (
                <label htmlFor="signin-code">
                  Verification code
                  <input
                    id="signin-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    required
                  />
                </label>
              )}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading
                  ? 'Please wait...'
                  : codeSent
                    ? 'Sign in with code'
                    : 'Send sign in code'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            New to Content AI? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </>
  )
}
