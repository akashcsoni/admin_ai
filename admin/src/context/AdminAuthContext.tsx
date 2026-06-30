import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { adminAuthApi, type PublicAdminUser } from '../lib/api'

const TOKEN_KEY = 'content_ai_admin_token'

type AdminAuthContextValue = {
  admin: PublicAdminUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (token: string, admin: PublicAdminUser) => void
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<PublicAdminUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setAdmin(null)
  }, [])

  const signIn = useCallback((nextToken: string, nextAdmin: PublicAdminUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
    setAdmin(nextAdmin)
  }, [])

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await adminAuthApi.me(token)
        setAdmin(response.admin)
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
      admin,
      token,
      loading,
      isAuthenticated: Boolean(admin && token),
      signIn,
      signOut,
    }),
    [admin, token, loading, signIn, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
