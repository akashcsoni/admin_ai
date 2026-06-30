import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { ApiError, authApi } from '../lib/api'
import { pageSeo } from '../config/seo'
import '../styles/auth.css'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const seo = pageSeo.signUp

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function sendVerificationCode() {
    setLoading(true)
    setError('')
    setInfo('')

    try {
      const response = await authApi.sendCode(email, 'signup')
      setCodeSent(true)
      setCode('')
      setInfo(
        `Code sent to ${email}. Check your inbox, then enter the code below with your password. Expires in ${response.expiresInMinutes} minutes.`,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send verification code')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendCode(event: FormEvent) {
    event.preventDefault()
    await sendVerificationCode()
  }

  async function handleSignUp(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.signUp({
        email,
        code,
        password,
        fullName: fullName || undefined,
      })
      signIn(response.token, response.user)
      navigate('/account')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  function handleChangeEmail() {
    setCodeSent(false)
    setCode('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setInfo('')
  }

  return (
    <>
      <SEO title={seo.title} description={seo.description} path={seo.path} keywords={[...seo.keywords]} />

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-head">
            <p className="auth-eyebrow">Create account</p>
            <h1>Create your Content AI account</h1>
            <p>
              {codeSent
                ? 'Enter the 6-digit code from your email, then choose a password to finish.'
                : 'Enter your email first. We will send a verification code — then you set your password to create the account.'}
            </p>
          </div>

          <div className="auth-steps" aria-label="Sign up progress">
            <span className={codeSent ? 'done' : 'active'}>1. Send code</span>
            <span className={codeSent ? 'active' : ''}>2. Code & password</span>
          </div>

          {error && <p className="auth-alert auth-alert--error">{error}</p>}
          {info && <p className="auth-alert auth-alert--info">{info}</p>}

          {!codeSent ? (
            <form className="auth-form" onSubmit={handleSendCode}>
              <label htmlFor="signup-email">
                Email address
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignUp}>
              <div className="auth-form-section">
                <p className="auth-form-section-title">Your email</p>
                <div className="auth-email-row">
                  <input
                    id="signup-email-readonly"
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                    className="auth-input-readonly"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleChangeEmail}
                    disabled={loading}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="auth-form-section">
                <p className="auth-form-section-title">Verify email</p>
                <label htmlFor="signup-code">
                  Verification code
                  <input
                    id="signup-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code from email"
                    autoComplete="one-time-code"
                    required
                  />
                </label>
              </div>

              <div className="auth-form-section">
                <p className="auth-form-section-title">Set your password</p>
                <label htmlFor="signup-name">
                  Full name (optional)
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label htmlFor="signup-password">
                  Password
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
                <label htmlFor="signup-confirm">
                  Confirm password
                  <input
                    id="signup-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => void sendVerificationCode()}
                disabled={loading}
              >
                Resend code
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}
