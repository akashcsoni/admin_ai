import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, type PublicUser } from '../lib/api'

const TOKEN_KEY = 'content_ai_token'

type AuthContextValue = {
  user: PublicUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (token: string, user: PublicUser) => void
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const signIn = useCallback((nextToken: string, nextUser: PublicUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      return
    }

    const response = await authApi.me(token)
    setUser(response.user)
  }, [token])

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await authApi.me(token)
        setUser(response.user)
      } catch {
        signOut()
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token, signOut])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      signIn,
      signOut,
      refreshUser,
    }),
    [user, token, loading, signIn, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
