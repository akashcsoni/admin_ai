import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { servicesApi } from '../lib/api'
import { getServiceById } from '../data/services'

type ServiceCreditsContextValue = {
  loading: boolean
  getCreditCost: (serviceId: string) => number
  refreshCreditCosts: () => Promise<void>
}

const ServiceCreditsContext = createContext<ServiceCreditsContextValue | undefined>(undefined)

export function ServiceCreditsProvider({ children }: { children: ReactNode }) {
  const [costs, setCosts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const refreshCreditCosts = useCallback(async () => {
    try {
      const response = await servicesApi.getCreditCosts()
      const next: Record<string, number> = {}
      for (const row of response.services) {
        next[row.serviceId] = row.creditCost
      }
      setCosts(next)
    } catch {
      setCosts({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshCreditCosts()
  }, [refreshCreditCosts])

  const getCreditCost = useCallback(
    (serviceId: string) => {
      if (serviceId in costs) return costs[serviceId]
      return getServiceById(serviceId)?.creditCost ?? 1
    },
    [costs],
  )

  const value = useMemo(
    () => ({
      loading,
      getCreditCost,
      refreshCreditCosts,
    }),
    [loading, getCreditCost, refreshCreditCosts],
  )

  return <ServiceCreditsContext.Provider value={value}>{children}</ServiceCreditsContext.Provider>
}

export function useServiceCredits() {
  const context = useContext(ServiceCreditsContext)
  if (!context) {
    throw new Error('useServiceCredits must be used within ServiceCreditsProvider')
  }
  return context
}

export function useServiceCreditCost(serviceId: string): number {
  const { getCreditCost } = useServiceCredits()
  return getCreditCost(serviceId)
}

export function formatCreditCostLabel(cost: number): string {
  const rounded = Math.round(cost * 100) / 100
  const label = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${label} credit${rounded === 1 ? '' : 's'}`
}
