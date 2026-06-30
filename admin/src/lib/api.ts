const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? 'https://webbywrites.webbydemo.in/api' : '/api')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed', response.status)
  }

  return data as T
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  return parseResponse<T>(response)
}

export type PublicAdminUser = {
  id: string
  email: string
  fullName: string | null
  role: import('./adminPermissions').AdminRole
  isActive: boolean
  createdAt: string
}

export type AdminStaffMember = {
  id: string
  email: string
  fullName: string | null
  role: import('./adminPermissions').AdminRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CmsPostStatus = 'draft' | 'published'

export type CmsBlogPostSummary = {
  id: string
  authorId: string | null
  authorName: string | null
  title: string
  slug: string
  excerpt: string
  focusKeyword: string
  metaDescription: string
  seoTitle: string
  featuredImage: string
  status: CmsPostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CmsBlogPost = CmsBlogPostSummary & {
  content: string
}

import type { SitePageBlock } from './sitePageBlocks'

export type { SitePageBlock, SitePageBlockType } from './sitePageBlocks'

export type SitePageSeoRecord = {
  id: string
  pageKey: string
  pageName: string
  pageCategory: string
  path: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  h1: string
  ogType: 'website' | 'article'
  ogImage: string
  noindex: boolean
  schemaTypes: string[]
  schemaJson: Record<string, unknown>[] | null
  contentBlocks: SitePageBlock[] | null
  contentActive: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceCreditSetting = {
  serviceId: string
  title: string
  creditCost: number
  sortOrder: number
  updatedAt: string
}

export type SupportTicketCategory = 'billing' | 'credits' | 'technical' | 'account' | 'general'
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SupportTicketPriority = 'low' | 'normal' | 'high'

export type SupportTicketAttachment = {
  id: string
  messageId: string
  ticketId: string
  fileName: string
  mimeType: string
  fileSize: number
  createdAt: string
}

export type SupportTicketMessage = {
  id: string
  ticketId: string
  authorType: 'user' | 'admin'
  authorUserId: string | null
  authorAdminId: string | null
  authorName: string | null
  message: string
  attachments: SupportTicketAttachment[]
  createdAt: string
}

export type SupportTicketSummary = {
  id: string
  userId: string
  userEmail: string
  userFullName: string | null
  subject: string
  category: SupportTicketCategory
  status: SupportTicketStatus
  priority: SupportTicketPriority
  assignedAdminId: string | null
  assignedAdminName: string | null
  messageCount: number
  lastMessagePreview: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export type SupportTicketDetail = SupportTicketSummary & {
  messages: SupportTicketMessage[]
}

export type AdminAuthResponse = {
  token: string
  admin: PublicAdminUser
}

export type AdminStats = {
  totalUsers: number
  totalAdmins: number
  suspendedUsers: number
  totalCredits: number
  totalPosts: number
  totalTopics: number
  totalCategories: number
  generationsToday: number
  signupsThisWeek: number
}

export type AdminUserListItem = {
  id: string
  email: string
  fullName: string | null
  credits: number
  isSuspended: boolean
  emailVerified: boolean
  postCount: number
  topicCount: number
  createdAt: string
}

export type AdminUserDetail = AdminUserListItem & {
  categoryCount: number
  lastPostAt: string | null
  lastGenerationAt: string | null
}

export type CreditTransaction = {
  id: string
  userId: string
  userEmail: string
  adminId: string | null
  adminEmail: string | null
  amount: number
  balanceAfter: number
  reason: string
  type: string
  createdAt: string
}

export type AdminBillingPurchase = {
  id: string
  userId: string
  userEmail: string
  userFullName: string | null
  provider: 'stripe' | 'razorpay'
  credits: number
  amountCents: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt: string | null
}

export type AdminBillingOverview = {
  from: string
  to: string
  summary: {
    totalCreditsInSystem: number
    completedPurchases: number
    totalRevenueCents: number
    creditsSold: number
    pendingPurchases: number
    failedPurchases: number
    stripePurchases: number
    razorpayPurchases: number
  }
  paymentMode: 'test' | 'live'
  stripeEnabled: boolean
  razorpayEnabled: boolean
}

export type AdminGenerationLog = {
  id: string
  userId: string
  userEmail: string
  postId: string | null
  keyword: string
  status: string
  provider: string | null
  model: string | null
  tokensTotal: number
  errorMessage: string | null
  createdAt: string
}

export type AdminPostListItem = {
  id: string
  userId: string
  userEmail: string
  title: string
  keyword: string
  status: string
  provider: string | null
  model: string | null
  tokensTotal: number
  createdAt: string
}

export type AdminUserActivity = {
  id: string
  userId: string
  userEmail: string
  userFullName: string | null
  service: string
  action: string
  status: string
  title: string
  detail: string
  metadata: Record<string, unknown>
  referenceId: string | null
  createdAt: string
  updatedAt: string
}

export const adminAuthApi = {
  signIn: (email: string, password: string) =>
    apiRequest<AdminAuthResponse>('/admin/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    apiRequest<{ admin: PublicAdminUser }>('/admin/auth/me', { method: 'GET' }, token),
}

export const adminApi = {
  getStats: (token: string) =>
    apiRequest<{ stats: AdminStats }>('/admin/stats', { method: 'GET' }, token),

  listUsers: (
    token: string,
    params?: {
      search?: string
      page?: number
      pageSize?: number
      filter?: 'all' | 'active' | 'suspended' | 'unverified' | 'verified'
    },
  ) => {
    const search = new URLSearchParams()
    if (params?.search) search.set('search', params.search)
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.filter && params.filter !== 'all') search.set('filter', params.filter)
    const query = search.toString()
    return apiRequest<{
      users: AdminUserListItem[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/users${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  getUser: (token: string, userId: string) =>
    apiRequest<{ user: AdminUserDetail }>(`/admin/users/${userId}`, { method: 'GET' }, token),

  updateUser: (
    token: string,
    userId: string,
    payload: {
      credits?: number
      isSuspended?: boolean
      fullName?: string | null
    },
  ) =>
    apiRequest<{ user: AdminUserDetail; message: string }>(
      `/admin/users/${userId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  adjustCredits: (
    token: string,
    payload: { userId: string; amount: number; reason: string },
  ) =>
    apiRequest<{
      credits: number
      transaction: CreditTransaction
      message: string
    }>('/admin/credits/adjust', { method: 'POST', body: JSON.stringify(payload) }, token),

  listCreditTransactions: (
    token: string,
    params?: { page?: number; pageSize?: number; userId?: string },
  ) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.userId) search.set('userId', params.userId)
    const query = search.toString()
    return apiRequest<{
      transactions: CreditTransaction[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/credits/transactions${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  getBillingOverview: (token: string, params?: { from?: string; to?: string }) => {
    const search = new URLSearchParams()
    if (params?.from) search.set('from', params.from)
    if (params?.to) search.set('to', params.to)
    const query = search.toString()
    return apiRequest<{ overview: AdminBillingOverview }>(
      `/admin/billing/overview${query ? `?${query}` : ''}`,
      { method: 'GET' },
      token,
    )
  },

  listBillingPurchases: (
    token: string,
    params?: {
      page?: number
      pageSize?: number
      status?: 'pending' | 'completed' | 'failed' | 'all'
      provider?: 'stripe' | 'razorpay' | 'all'
      search?: string
      from?: string
      to?: string
    },
  ) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.status) search.set('status', params.status)
    if (params?.provider) search.set('provider', params.provider)
    if (params?.search) search.set('search', params.search)
    if (params?.from) search.set('from', params.from)
    if (params?.to) search.set('to', params.to)
    const query = search.toString()
    return apiRequest<{
      purchases: AdminBillingPurchase[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/billing/purchases${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  listActivities: (
    token: string,
    params?: {
      page?: number
      pageSize?: number
      userId?: string
      service?: string
      action?: string
      status?: string
    },
  ) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.userId) search.set('userId', params.userId)
    if (params?.service) search.set('service', params.service)
    if (params?.action) search.set('action', params.action)
    if (params?.status) search.set('status', params.status)
    const query = search.toString()
    return apiRequest<{
      activities: AdminUserActivity[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/activities${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  listGenerationLogs: (token: string, params?: { page?: number; pageSize?: number; status?: string; userId?: string }) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.status) search.set('status', params.status)
    if (params?.userId) search.set('userId', params.userId)
    const query = search.toString()
    return apiRequest<{
      items: AdminGenerationLog[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/auto-blog/generation-logs${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  listPosts: (token: string, params?: { page?: number; pageSize?: number; search?: string; userId?: string }) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.search) search.set('search', params.search)
    if (params?.userId) search.set('userId', params.userId)
    const query = search.toString()
    return apiRequest<{
      items: AdminPostListItem[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/auto-blog/posts${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  getPaymentSettings: (token: string) =>
    apiRequest<{ settings: PaymentSettings }>('/admin/settings/payment', { method: 'GET' }, token),

  savePaymentSettings: (
    token: string,
    payload: {
      activeMode?: PaymentMode
      stripeEnabled?: boolean
      stripeTestPublishableKey?: string
      stripeTestSecretKey?: string
      stripeLivePublishableKey?: string
      stripeLiveSecretKey?: string
      razorpayEnabled?: boolean
      razorpayTestKeyId?: string
      razorpayTestKeySecret?: string
      razorpayLiveKeyId?: string
      razorpayLiveKeySecret?: string
    },
  ) =>
    apiRequest<{ settings: PaymentSettings; message: string }>(
      '/admin/settings/payment',
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  getInvoiceCompanySettings: (token: string) =>
    apiRequest<{ settings: InvoiceCompanySettings }>(
      '/admin/settings/invoice-company',
      { method: 'GET' },
      token,
    ),

  saveInvoiceCompanySettings: (
    token: string,
    payload: {
      companyName?: string
      companyEmail?: string
      companyPhone?: string
      companyAddressLine1?: string
      companyAddressLine2?: string
      companyCity?: string
      companyState?: string
      companyPostalCode?: string
      companyCountry?: string
      taxId?: string
      invoicePrefix?: string
      invoiceFooter?: string
    },
  ) =>
    apiRequest<{ settings: InvoiceCompanySettings; message: string }>(
      '/admin/settings/invoice-company',
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  getServiceCreditSettings: (token: string) =>
    apiRequest<{ services: ServiceCreditSetting[] }>(
      '/admin/services/credits',
      { method: 'GET' },
      token,
    ),

  saveServiceCreditSettings: (
    token: string,
    payload: { services: Array<{ serviceId: string; creditCost: number }> },
  ) =>
    apiRequest<{ services: ServiceCreditSetting[]; message: string }>(
      '/admin/services/credits',
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  listStaff: (token: string) =>
    apiRequest<{ staff: AdminStaffMember[] }>('/admin/staff', { method: 'GET' }, token),

  createStaff: (
    token: string,
    payload: {
      email: string
      password: string
      fullName?: string | null
      role: AdminStaffMember['role']
    },
  ) =>
    apiRequest<{ staff: AdminStaffMember; message: string }>(
      '/admin/staff',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateStaff: (
    token: string,
    staffId: string,
    payload: {
      email?: string
      password?: string
      fullName?: string | null
      role?: AdminStaffMember['role']
      isActive?: boolean
    },
  ) =>
    apiRequest<{ staff: AdminStaffMember; message: string }>(
      `/admin/staff/${staffId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  listCmsPosts: (
    token: string,
    params?: {
      search?: string
      status?: 'all' | 'draft' | 'published'
      page?: number
      pageSize?: number
    },
  ) => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const suffix = query.toString()
    return apiRequest<{
      posts: CmsBlogPostSummary[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/cms/posts${suffix ? `?${suffix}` : ''}`, { method: 'GET' }, token)
  },

  getCmsPost: (token: string, postId: string) =>
    apiRequest<{ post: CmsBlogPost }>(`/admin/cms/posts/${postId}`, { method: 'GET' }, token),

  createCmsPost: (
    token: string,
    payload: {
      title: string
      slug?: string
      excerpt?: string
      content?: string
      focusKeyword?: string
      metaDescription?: string
      seoTitle?: string
      featuredImage?: string
      status?: CmsPostStatus
    },
  ) =>
    apiRequest<{ post: CmsBlogPost; message: string }>(
      '/admin/cms/posts',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateCmsPost: (
    token: string,
    postId: string,
    payload: {
      title?: string
      slug?: string
      excerpt?: string
      content?: string
      focusKeyword?: string
      metaDescription?: string
      seoTitle?: string
      featuredImage?: string
      status?: CmsPostStatus
    },
  ) =>
    apiRequest<{ post: CmsBlogPost; message: string }>(
      `/admin/cms/posts/${postId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  deleteCmsPost: (token: string, postId: string) =>
    apiRequest<{ message: string }>(`/admin/cms/posts/${postId}`, { method: 'DELETE' }, token),

  getSupportStats: (token: string) =>
    apiRequest<{
      stats: { open: number; inProgress: number; resolved: number; closed: number }
    }>('/admin/support/stats', { method: 'GET' }, token),

  listSupportTickets: (
    token: string,
    params?: {
      search?: string
      status?: SupportTicketStatus | 'all'
      page?: number
      pageSize?: number
    },
  ) => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const suffix = query.toString()
    return apiRequest<{
      tickets: SupportTicketSummary[]
      total: number
      page: number
      pageSize: number
    }>(`/admin/support/tickets${suffix ? `?${suffix}` : ''}`, { method: 'GET' }, token)
  },

  getSupportTicket: (token: string, ticketId: string) =>
    apiRequest<{ ticket: SupportTicketDetail }>(
      `/admin/support/tickets/${ticketId}`,
      { method: 'GET' },
      token,
    ),

  replySupportTicket: (token: string, ticketId: string, message: string) =>
    apiRequest<{ ticket: SupportTicketDetail; message: string }>(
      `/admin/support/tickets/${ticketId}/messages`,
      { method: 'POST', body: JSON.stringify({ message }) },
      token,
    ),

  updateSupportTicket: (
    token: string,
    ticketId: string,
    payload: {
      status?: SupportTicketStatus
      priority?: SupportTicketPriority
      assignedAdminId?: string | null
    },
  ) =>
    apiRequest<{ ticket: SupportTicketDetail; message: string }>(
      `/admin/support/tickets/${ticketId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  downloadSupportAttachment: async (
    token: string,
    ticketId: string,
    attachment: SupportTicketAttachment,
  ) => {
    const response = await fetch(
      `${API_BASE}/admin/support/tickets/${ticketId}/attachments/${attachment.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new ApiError(data.message ?? 'Failed to download attachment', response.status)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.fileName
    link.click()
    URL.revokeObjectURL(url)
  },

  listSiteSeoPages: (token: string) =>
    apiRequest<{ pages: SitePageSeoRecord[] }>('/admin/site-seo/pages', { method: 'GET' }, token),

  getSiteSeoPage: (token: string, pageKey: string) =>
    apiRequest<{ page: SitePageSeoRecord }>(
      `/admin/site-seo/pages/${encodeURIComponent(pageKey)}`,
      { method: 'GET' },
      token,
    ),

  updateSiteSeoPage: (
    token: string,
    pageKey: string,
    payload: {
      metaTitle?: string
      metaDescription?: string
      keywords?: string[]
      h1?: string
      ogType?: 'website' | 'article'
      ogImage?: string
      noindex?: boolean
      schemaTypes?: string[]
      schemaJson?: Record<string, unknown>[] | null
      contentBlocks?: SitePageBlock[] | null
      contentActive?: boolean
      isActive?: boolean
    },
  ) =>
    apiRequest<{ page: SitePageSeoRecord; message: string }>(
      `/admin/site-seo/pages/${encodeURIComponent(pageKey)}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  resetSiteSeoPage: (token: string, pageKey: string) =>
    apiRequest<{ page: SitePageSeoRecord; message: string }>(
      `/admin/site-seo/pages/${encodeURIComponent(pageKey)}/reset`,
      { method: 'POST' },
      token,
    ),

  resetSiteSeoContent: (token: string, pageKey: string) =>
    apiRequest<{ page: SitePageSeoRecord; message: string }>(
      `/admin/site-seo/pages/${encodeURIComponent(pageKey)}/reset-content`,
      { method: 'POST' },
      token,
    ),
}

export type PaymentMode = 'test' | 'live'

export type PaymentSettings = {
  activeMode: PaymentMode
  stripeEnabled: boolean
  stripeTestPublishableKey: string
  stripeLivePublishableKey: string
  hasStripeTestSecret: boolean
  hasStripeLiveSecret: boolean
  razorpayEnabled: boolean
  razorpayTestKeyId: string
  razorpayLiveKeyId: string
  hasRazorpayTestSecret: boolean
  hasRazorpayLiveSecret: boolean
  updatedAt: string
}

export type InvoiceCompanySettings = {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddressLine1: string
  companyAddressLine2: string
  companyCity: string
  companyState: string
  companyPostalCode: string
  companyCountry: string
  taxId: string
  invoicePrefix: string
  invoiceFooter: string
  nextInvoiceNumber: number
  updatedAt: string
}
