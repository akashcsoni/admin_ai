const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

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

export type PublicUser = {
  id: string
  email: string
  fullName: string | null
  credits: number
  emailVerified: boolean
  isSuspended: boolean
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: PublicUser
}

export type SendCodeResponse = {
  message: string
  expiresInMinutes: number
  devCode?: string
}

export const authApi = {
  sendCode: (email: string, purpose: 'signup' | 'signin') =>
    apiRequest<SendCodeResponse>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),

  signUp: (payload: {
    email: string
    code: string
    password: string
    fullName?: string
  }) =>
    apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  signIn: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signInWithCode: (email: string, code: string) =>
    apiRequest<AuthResponse>('/auth/signin-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  me: (token: string) =>
    apiRequest<{ user: PublicUser }>('/auth/me', { method: 'GET' }, token),

  updateProfile: (token: string, payload: { fullName?: string | null }) =>
    apiRequest<{ user: PublicUser; message: string }>(
      '/auth/profile',
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  changePassword: (
    token: string,
    payload: { currentPassword: string; newPassword: string },
  ) =>
    apiRequest<{ message: string }>(
      '/auth/change-password',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),
}

export type BillingConfig = {
  creditPriceCents: number
  currency: string
  activeMode: 'test' | 'live'
  stripeEnabled: boolean
  stripePublishableKey: string | null
  razorpayEnabled: boolean
  razorpayKeyId: string | null
}

export type UserCreditTransaction = {
  id: string
  amount: number
  balanceAfter: number
  reason: string
  type: string
  createdAt: string
}

export type BillingPurchase = {
  id: string
  provider: 'stripe' | 'razorpay'
  credits: number
  amountCents: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt: string | null
  invoiceId: string | null
  invoiceNumber: string | null
}

export type BillingDailyPoint = {
  date: string
  creditsPurchased: number
  amountCents: number
  purchaseCount: number
}

export type BillingStats = {
  from: string
  to: string
  summary: {
    creditsBalance: number
    creditsPurchased: number
    totalSpentCents: number
    purchaseCount: number
    pendingCount: number
  }
  daily: BillingDailyPoint[]
  recentPurchases: BillingPurchase[]
}

export type UserBillingProfile = {
  userId: string
  billingName: string
  companyName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  taxId: string
  updatedAt: string
}

export type InvoiceLineItem = {
  description: string
  quantity: number
  unitAmountCents: number
  amountCents: number
}

export type InvoiceCompanySnapshot = {
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
}

export type InvoiceRecord = {
  id: string
  purchaseId: string
  userId: string
  invoiceNumber: string
  companySnapshot: InvoiceCompanySnapshot
  customerSnapshot: UserBillingProfile & { accountEmail: string }
  lineItems: InvoiceLineItem[]
  subtotalCents: number
  currency: string
  issuedAt: string
  createdAt: string
}

export type ServiceCreditSetting = {
  serviceId: string
  title: string
  creditCost: number
  sortOrder?: number
  updatedAt?: string
}

export const servicesApi = {
  getCreditCosts: () =>
    apiRequest<{ services: ServiceCreditSetting[] }>('/services/credit-costs', { method: 'GET' }),
}

export const billingApi = {
  getConfig: (token: string) =>
    apiRequest<{ config: BillingConfig }>('/billing/config', { method: 'GET' }, token),

  getBalance: (token: string) =>
    apiRequest<{ credits: number }>('/billing/balance', { method: 'GET' }, token),

  listTransactions: (token: string, params?: { page?: number; pageSize?: number }) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    const query = search.toString()
    return apiRequest<{
      transactions: UserCreditTransaction[]
      total: number
      page: number
      pageSize: number
    }>(`/billing/transactions${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  getStats: (token: string, params?: { from?: string; to?: string }) => {
    const search = new URLSearchParams()
    if (params?.from) search.set('from', params.from)
    if (params?.to) search.set('to', params.to)
    const query = search.toString()
    return apiRequest<{ stats: BillingStats }>(
      `/billing/stats${query ? `?${query}` : ''}`,
      { method: 'GET' },
      token,
    )
  },

  listPurchases: (
    token: string,
    params?: { page?: number; pageSize?: number; from?: string; to?: string },
  ) => {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    if (params?.from) search.set('from', params.from)
    if (params?.to) search.set('to', params.to)
    const query = search.toString()
    return apiRequest<{
      purchases: BillingPurchase[]
      total: number
      page: number
      pageSize: number
    }>(`/billing/purchases${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  createStripeCheckout: (token: string, credits: number) =>
    apiRequest<{ checkoutUrl: string; sessionId: string }>(
      '/billing/checkout/stripe',
      { method: 'POST', body: JSON.stringify({ credits }) },
      token,
    ),

  confirmStripeCheckout: (token: string, sessionId: string) =>
    apiRequest<{ credits: number; addedCredits: number; message: string }>(
      '/billing/checkout/stripe/confirm',
      { method: 'POST', body: JSON.stringify({ sessionId }) },
      token,
    ),

  createRazorpayOrder: (token: string, credits: number) =>
    apiRequest<{
      orderId: string
      amount: number
      currency: string
      keyId: string
      purchaseId: string
    }>('/billing/checkout/razorpay/order', { method: 'POST', body: JSON.stringify({ credits }) }, token),

  verifyRazorpayPayment: (
    token: string,
    payload: {
      purchaseId: string
      orderId: string
      paymentId: string
      signature: string
    },
  ) =>
    apiRequest<{ credits: number; addedCredits: number; message: string }>(
      '/billing/checkout/razorpay/verify',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  getBillingProfile: (token: string) =>
    apiRequest<{ profile: UserBillingProfile }>('/billing/profile', { method: 'GET' }, token),

  saveBillingProfile: (
    token: string,
    payload: {
      billingName?: string
      companyName?: string
      email?: string
      phone?: string
      addressLine1?: string
      addressLine2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
      taxId?: string
    },
  ) =>
    apiRequest<{ profile: UserBillingProfile; message: string }>(
      '/billing/profile',
      { method: 'PATCH', body: JSON.stringify(payload) },
      token,
    ),

  getInvoice: (token: string, purchaseId: string) =>
    apiRequest<{ invoice: InvoiceRecord }>(`/billing/invoices/${purchaseId}`, { method: 'GET' }, token),
}

export type UsageDailyPoint = {
  date: string
  creditsUsed: number
  creditsAdded: number
  requests: number
  tokens: number
}

export type UsageServiceBreakdown = {
  service: string
  label: string
  requests: number
  tokens: number
  creditsUsed: number
}

export type UsageActivityItem = {
  id: string
  service: string
  action: string
  status: string
  title: string
  creditsUsed: number
  tokens: number
  createdAt: string
}

export type UsageStats = {
  from: string
  to: string
  summary: {
    creditsUsed: number
    creditsAdded: number
    creditsBalance: number
    totalTokens: number
    totalRequests: number
    estimatedSpendCents: number
  }
  daily: UsageDailyPoint[]
  services: UsageServiceBreakdown[]
  recentActivity: UsageActivityItem[]
  workActivity: {
    items: UsageActivityItem[]
    total: number
    page: number
    pageSize: number
  }
}

export const usageApi = {
  getStats: (
    token: string,
    params?: { from?: string; to?: string; workPage?: number; workPageSize?: number },
  ) => {
    const search = new URLSearchParams()
    if (params?.from) search.set('from', params.from)
    if (params?.to) search.set('to', params.to)
    if (params?.workPage) search.set('workPage', String(params.workPage))
    if (params?.workPageSize) search.set('workPageSize', String(params.workPageSize))
    const query = search.toString()
    return apiRequest<{ stats: UsageStats }>(`/usage/stats${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },
}

export type AutoBlogProvider = 'openai' | 'anthropic' | 'google' | 'deepseek'
export type AutoBlogGenerationMode = 'single' | 'multi_step'
export type AutoBlogContentLength = 'short' | 'medium' | 'long' | 'extended' | 'custom'
export type AutoBlogContentPromptType =
  | 'news_article'
  | 'seo_blog'
  | 'informative_blog'
  | 'latest_trading_news'
  | 'market_analysis'
  | 'breaking_news'
  | 'custom'
export type AutoBlogPublishStatus = 'draft' | 'published'

export type MultiStepSlug = 'plan' | 'opening' | 'main_body' | 'supporting' | 'closing' | 'schema'

export type MultiStepPromptStep = {
  label: string
  description: string
  placeholders: string[]
  prompt: string
  instruction: string
  max_tokens: number
}

export type MultiStepPrompts = Record<MultiStepSlug, MultiStepPromptStep>

export type AutoBlogSettings = {
  enabled: boolean
  ai_provider: AutoBlogProvider
  ai_model: string
  hasApiKey: boolean
  generation_mode: AutoBlogGenerationMode
  generation_temperature: number
  generation_max_tokens: number
  content_length: AutoBlogContentLength
  content_min_words: number
  content_max_words: number
  content_prompt_type: AutoBlogContentPromptType
  system_prompt: string
  content_language: string
  publish_status: AutoBlogPublishStatus
  seo_enabled: boolean
  featured_image_enabled: boolean
  featured_image_ai_provider: 'openai' | 'google'
  featured_image_ai_model: string
  hasFeaturedImageApiKey: boolean
  featuredImageKeyError: string | null
  multi_step_prompts: MultiStepPrompts
  topic_niche: string
  created_at: string
  updated_at: string
}

export type AutoBlogCategory = {
  id: string
  name: string
  description: string
  prompt: string
  enabled: boolean
  sortOrder: number
  topicCount: number
  pendingTopicCount: number
  createdAt: string
  updatedAt: string
}

export type CategoryConcept = {
  id: string
  label: string
  description: string
}

export type AutoBlogTopic = {
  id: string
  topic: string
  status: string
  source: string
  priority: number
  categoryId: string | null
  categoryName: string | null
  postId: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type AutoBlogPost = {
  id: string
  keyword: string
  title: string
  slug: string | null
  excerpt: string | null
  status: string
  focusKeyword: string | null
  metaDescription: string | null
  seoTitle: string | null
  provider: string | null
  model: string | null
  generationMode: string | null
  topicId: string | null
  topicLabel: string | null
  categoryName: string | null
  tokensTotal: number
  errorMessage: string | null
  featuredImage: string | null
  featuredImageError: string | null
  remotePostId: string | null
  remotePostUrl: string | null
  livePublishError: string | null
  createdAt: string
  updatedAt: string
}

export type AutoBlogLivePublishPlatform =
  | 'wordpress'
  | 'ghost'
  | 'custom_webhook'
  | 'webflow'
  | 'shopify'
  | 'nextjs'

export type AutoBlogLivePublish = {
  enabled: boolean
  platform: AutoBlogLivePublishPlatform
  siteUrl: string
  username: string
  hasApiKey: boolean
  webhookUrl: string
  remoteStatus: 'draft' | 'publish'
  remoteCategoryId: string
  lastTestedAt: string | null
  lastTestStatus: string | null
  lastTestMessage: string
  createdAt: string
  updatedAt: string
}

export type AutoBlogLivePublishPlatformInfo = {
  id: AutoBlogLivePublishPlatform
  label: string
  description: string
  live: boolean
}

export type AutoBlogPostDetail = AutoBlogPost & {
  content: string
  tokensPrompt: number
  tokensCompletion: number
}

export const autoBlogApi = {
  getSettings: (token: string) =>
    apiRequest<{ settings: AutoBlogSettings }>('/auto-blog/settings', { method: 'GET' }, token),

  saveSettings: (token: string, payload: Record<string, unknown>) =>
    apiRequest<{ settings: AutoBlogSettings; message: string }>(
      '/auto-blog/settings',
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  listPosts: (
    token: string,
    params?: { status?: string; page?: number; pageSize?: number },
  ) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    const query = search.toString()
    return apiRequest<{
      posts: AutoBlogPost[]
      total: number
      page: number
      pageSize: number
    }>(`/auto-blog/posts${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  getPost: (token: string, postId: string) =>
    apiRequest<{ post: AutoBlogPostDetail }>(`/auto-blog/posts/${postId}`, { method: 'GET' }, token),

  generatePost: (token: string, payload: { keyword?: string; topicId?: string; postId?: string }) =>
    apiRequest<{ post: AutoBlogPostDetail; message: string; failed?: boolean }>(
      '/auto-blog/posts/generate',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  listCategories: (token: string) =>
    apiRequest<{ categories: AutoBlogCategory[] }>('/auto-blog/categories', { method: 'GET' }, token),

  createCategory: (token: string, payload: { name: string; description?: string; prompt?: string; enabled?: boolean }) =>
    apiRequest<{ category: AutoBlogCategory; message: string }>(
      '/auto-blog/categories',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateCategory: (
    token: string,
    categoryId: string,
    payload: { name?: string; description?: string; prompt?: string; enabled?: boolean },
  ) =>
    apiRequest<{ category: AutoBlogCategory; message: string }>(
      `/auto-blog/categories/${categoryId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteCategory: (token: string, categoryId: string) =>
    apiRequest<{ message: string }>(`/auto-blog/categories/${categoryId}`, { method: 'DELETE' }, token),

  listCategoryConcepts: (token: string) =>
    apiRequest<{ concepts: CategoryConcept[] }>(
      '/auto-blog/categories/concepts',
      { method: 'GET' },
      token,
    ),

  importCategoryConcept: (token: string, payload: { conceptId: string; count?: number }) =>
    apiRequest<{
      created: number
      skipped: number
      total: number
      summary: string
      categories: AutoBlogCategory[]
      message: string
    }>('/auto-blog/categories/import-concept', { method: 'POST', body: JSON.stringify(payload) }, token),

  listTopics: (
    token: string,
    params?: { categoryId?: string; status?: string; page?: number; pageSize?: number },
  ) => {
    const search = new URLSearchParams()
    if (params?.categoryId) search.set('categoryId', params.categoryId)
    if (params?.status) search.set('status', params.status)
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    const query = search.toString()
    return apiRequest<{
      topics: AutoBlogTopic[]
      total: number
      page: number
      pageSize: number
      pendingCount: number
    }>(`/auto-blog/topics${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  addTopic: (
    token: string,
    payload: { topic: string; categoryId?: string | null; priority?: number },
  ) =>
    apiRequest<{ topic: AutoBlogTopic; message: string }>(
      '/auto-blog/topics',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  deleteTopic: (token: string, topicId: string) =>
    apiRequest<{ message: string }>(`/auto-blog/topics/${topicId}`, { method: 'DELETE' }, token),

  resetTopic: (token: string, topicId: string) =>
    apiRequest<{ topic: AutoBlogTopic; message: string }>(
      `/auto-blog/topics/${topicId}/reset`,
      { method: 'POST' },
      token,
    ),

  generateTopics: (token: string, payload?: { count?: number; categoryId?: string | null }) =>
    apiRequest<{
      added: number
      skipped: number
      total: number
      summary: string
      topics: AutoBlogTopic[]
      message: string
    }>('/auto-blog/topics/generate', { method: 'POST', body: JSON.stringify(payload ?? {}) }, token),

  getAddons: (token: string) =>
    apiRequest<{ addons: AutoBlogLivePublish; platforms: AutoBlogLivePublishPlatformInfo[] }>(
      '/auto-blog/addons',
      { method: 'GET' },
      token,
    ),

  saveAddons: (token: string, payload: Record<string, unknown>) =>
    apiRequest<{ addons: AutoBlogLivePublish; message: string }>(
      '/auto-blog/addons',
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  testAddonsConnection: (token: string) =>
    apiRequest<{ addons: AutoBlogLivePublish; message: string }>(
      '/auto-blog/addons/test',
      { method: 'POST', body: JSON.stringify({}) },
      token,
    ),
}

export type SocialContentProvider = 'openai' | 'anthropic' | 'google' | 'deepseek'
export type SocialPlatform = 'linkedin' | 'x' | 'instagram' | 'facebook'
export type SocialContentTone = 'professional' | 'casual' | 'witty' | 'inspirational'

export type SocialContentSettings = {
  enabled: boolean
  ai_provider: SocialContentProvider
  ai_model: string
  hasApiKey: boolean
  brand_voice: string
  default_topic_brief: string
  content_language: string
  content_tone: SocialContentTone
  default_platform: SocialPlatform
  generation_temperature: number
  generation_max_tokens: number
  include_hashtags: boolean
  include_hook: boolean
  post_image_enabled: boolean
  post_image_ai_provider: 'openai' | 'google'
  post_image_ai_model: string
  hasPostImageApiKey: boolean
  postImageKeyError: string | null
  created_at: string
  updated_at: string
}

export type SocialContentPost = {
  id: string
  platform: SocialPlatform
  topic: string
  hook: string | null
  content: string
  hashtags: string[]
  postImage: string | null
  postImageError: string | null
  status: string
  provider: string | null
  model: string | null
  tokensTotal: number
  errorMessage: string | null
  remotePostId: string | null
  remotePostUrl: string | null
  livePublishError: string | null
  createdAt: string
  updatedAt: string
}

export type SocialContentPostDetail = SocialContentPost & {
  tokensPrompt: number
  tokensCompletion: number
}

export type SocialLivePublishPlatform =
  | 'linkedin'
  | 'x'
  | 'facebook'
  | 'instagram'
  | 'custom_webhook'

export type SocialContentLivePublish = {
  platform: SocialLivePublishPlatform
  enabled: boolean
  isConnected: boolean
  accountId: string
  accountName: string
  metaPageId: string
  webhookUrl: string
  hasWebhookSecret: boolean
  tokenExpiresAt: string | null
  lastTestedAt: string | null
  lastTestStatus: string | null
  lastTestMessage: string
  createdAt: string
  updatedAt: string
}

export type SocialContentAddonsState = {
  livePublishEnabled: boolean
  connections: SocialContentLivePublish[]
}

export type SocialContentLivePublishPlatformInfo = {
  id: SocialLivePublishPlatform
  label: string
  description: string
  live: boolean
  oauth: boolean
}

export type MetaPageOption = {
  pageId: string
  pageName: string
  instagramBusinessAccountId: string | null
}

export type SocialContentCategory = {
  id: string
  name: string
  description: string
  prompt: string
  enabled: boolean
  sortOrder: number
  topicCount: number
  pendingTopicCount: number
  createdAt: string
  updatedAt: string
}

export type SocialContentTopic = {
  id: string
  topic: string
  status: string
  source: string
  priority: number
  platform: SocialPlatform | null
  categoryId: string | null
  categoryName: string | null
  postId: string | null
  createdAt: string
  updatedAt: string
}

export const socialContentApi = {
  getSettings: (token: string) =>
    apiRequest<{ settings: SocialContentSettings }>('/social-content/settings', { method: 'GET' }, token),

  saveSettings: (token: string, payload: Record<string, unknown>) =>
    apiRequest<{ settings: SocialContentSettings; message: string }>(
      '/social-content/settings',
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  listPosts: (token: string) =>
    apiRequest<{ posts: SocialContentPost[] }>('/social-content/posts', { method: 'GET' }, token),

  getPost: (token: string, postId: string) =>
    apiRequest<{ post: SocialContentPostDetail }>(`/social-content/posts/${postId}`, { method: 'GET' }, token),

  generatePost: (
    token: string,
    payload: { topic?: string; platform?: SocialPlatform; topicId?: string },
  ) =>
    apiRequest<{ post: SocialContentPostDetail; message: string }>(
      '/social-content/posts/generate',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  deletePost: (token: string, postId: string) =>
    apiRequest<{ message: string }>(`/social-content/posts/${postId}`, { method: 'DELETE' }, token),

  listCategories: (token: string) =>
    apiRequest<{ categories: SocialContentCategory[] }>(
      '/social-content/categories',
      { method: 'GET' },
      token,
    ),

  createCategory: (
    token: string,
    payload: { name: string; description?: string; prompt?: string; enabled?: boolean },
  ) =>
    apiRequest<{ category: SocialContentCategory; message: string }>(
      '/social-content/categories',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateCategory: (
    token: string,
    categoryId: string,
    payload: { name?: string; description?: string; prompt?: string; enabled?: boolean },
  ) =>
    apiRequest<{ category: SocialContentCategory; message: string }>(
      `/social-content/categories/${categoryId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteCategory: (token: string, categoryId: string) =>
    apiRequest<{ message: string }>(`/social-content/categories/${categoryId}`, { method: 'DELETE' }, token),

  listCategoryConcepts: (token: string) =>
    apiRequest<{ concepts: CategoryConcept[] }>(
      '/social-content/categories/concepts',
      { method: 'GET' },
      token,
    ),

  importCategoryConcept: (token: string, payload: { conceptId: string; count?: number }) =>
    apiRequest<{
      created: number
      skipped: number
      total: number
      summary: string
      categories: SocialContentCategory[]
      message: string
    }>(
      '/social-content/categories/import-concept',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  listTopics: (
    token: string,
    params?: { categoryId?: string; status?: string; page?: number; pageSize?: number },
  ) => {
    const query = new URLSearchParams()
    if (params?.categoryId) query.set('categoryId', params.categoryId)
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const suffix = query.toString()
    return apiRequest<{
      topics: SocialContentTopic[]
      total: number
      page: number
      pageSize: number
      pendingCount: number
    }>(`/social-content/topics${suffix ? `?${suffix}` : ''}`, { method: 'GET' }, token)
  },

  addTopic: (
    token: string,
    payload: {
      topic: string
      categoryId?: string | null
      platform?: SocialPlatform | null
      priority?: number
    },
  ) =>
    apiRequest<{ topic: SocialContentTopic; message: string }>(
      '/social-content/topics',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  deleteTopic: (token: string, topicId: string) =>
    apiRequest<{ message: string }>(`/social-content/topics/${topicId}`, { method: 'DELETE' }, token),

  resetTopic: (token: string, topicId: string) =>
    apiRequest<{ topic: SocialContentTopic; message: string }>(
      `/social-content/topics/${topicId}/reset`,
      { method: 'POST' },
      token,
    ),

  generateTopics: (
    token: string,
    payload?: { count?: number; categoryId?: string | null },
  ) =>
    apiRequest<{
      added: number
      skipped: number
      total: number
      summary: string
      topics: SocialContentTopic[]
      message: string
    }>('/social-content/topics/generate', { method: 'POST', body: JSON.stringify(payload ?? {}) }, token),

  getAddons: (token: string) =>
    apiRequest<
      SocialContentAddonsState & {
        platforms: SocialContentLivePublishPlatformInfo[]
      }
    >('/social-content/addons', { method: 'GET' }, token),

  saveAddons: (token: string, payload: Record<string, unknown>) =>
    apiRequest<SocialContentAddonsState & { message: string }>(
      '/social-content/addons',
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  startOAuth: (token: string, platform: SocialLivePublishPlatform) =>
    apiRequest<{ authorizeUrl: string }>(
      '/social-content/addons/oauth/start',
      { method: 'POST', body: JSON.stringify({ platform }) },
      token,
    ),

  listMetaPages: (token: string, platform: 'facebook' | 'instagram') =>
    apiRequest<{ pages: MetaPageOption[]; platform: string }>(
      `/social-content/addons/meta-pages?platform=${platform}`,
      { method: 'GET' },
      token,
    ),

  selectMetaPage: (
    token: string,
    payload: { pageId: string; platform: 'facebook' | 'instagram' },
  ) =>
    apiRequest<SocialContentAddonsState & { message: string }>(
      '/social-content/addons/meta-page',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  disconnectAddons: (token: string, platform: SocialLivePublishPlatform) =>
    apiRequest<SocialContentAddonsState & { message: string }>(
      '/social-content/addons/disconnect',
      { method: 'POST', body: JSON.stringify({ platform }) },
      token,
    ),

  testAddonsConnection: (token: string, platform: SocialLivePublishPlatform) =>
    apiRequest<SocialContentAddonsState & { message: string }>(
      '/social-content/addons/test',
      { method: 'POST', body: JSON.stringify({ platform }) },
      token,
    ),
}

export type EmailNewsletterProvider = 'openai' | 'anthropic' | 'google' | 'deepseek'
export type EmailNewsletterTone = 'professional' | 'casual' | 'friendly' | 'promotional'
export type EmailTemplateStyle = 'classic' | 'minimal' | 'promotional'
export type EmailNewsletterFormat = 'content_email' | 'blog_sections'

export type EmailNewsletterSettings = {
  enabled: boolean
  ai_provider: EmailNewsletterProvider
  ai_model: string
  hasApiKey: boolean
  brand_voice: string
  newsletter_format: EmailNewsletterFormat
  company_name: string
  from_name: string
  default_topic_brief: string
  content_language: string
  content_tone: EmailNewsletterTone
  email_template_style: EmailTemplateStyle
  include_cta: boolean
  default_cta_text: string
  default_cta_url: string
  footer_text: string
  generation_temperature: number
  generation_max_tokens: number
  email_image_enabled: boolean
  email_image_ai_provider: 'openai' | 'google'
  email_image_ai_model: string
  hasEmailImageApiKey: boolean
  emailImageKeyError: string | null
  created_at: string
  updated_at: string
}

export type EmailNewsletter = {
  id: string
  topic: string
  subject: string
  previewText: string
  htmlContent: string
  plainText: string
  status: string
  provider: string | null
  model: string | null
  tokensTotal: number
  emailImage: string | null
  emailImageError: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type EmailNewsletterDetail = EmailNewsletter & {
  tokensPrompt: number
  tokensCompletion: number
}

export type EmailNewsletterCategory = {
  id: string
  name: string
  description: string
  prompt: string
  enabled: boolean
  sortOrder: number
  topicCount: number
  pendingTopicCount: number
  createdAt: string
  updatedAt: string
}

export type EmailNewsletterTopic = {
  id: string
  topic: string
  status: string
  source: string
  priority: number
  categoryId: string | null
  categoryName: string | null
  postId: string | null
  createdAt: string
  updatedAt: string
}

export const emailNewsletterApi = {
  getSettings: (token: string) =>
    apiRequest<{ settings: EmailNewsletterSettings }>(
      '/email-newsletters/settings',
      { method: 'GET' },
      token,
    ),

  saveSettings: (token: string, payload: Record<string, unknown>) =>
    apiRequest<{ settings: EmailNewsletterSettings; message: string }>(
      '/email-newsletters/settings',
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  listNewsletters: (token: string) =>
    apiRequest<{ newsletters: EmailNewsletter[] }>(
      '/email-newsletters/newsletters',
      { method: 'GET' },
      token,
    ),

  getNewsletter: (token: string, newsletterId: string) =>
    apiRequest<{ newsletter: EmailNewsletterDetail }>(
      `/email-newsletters/newsletters/${newsletterId}`,
      { method: 'GET' },
      token,
    ),

  generateNewsletter: (token: string, payload: { topic?: string; topicId?: string }) =>
    apiRequest<{ newsletter: EmailNewsletterDetail; message: string }>(
      '/email-newsletters/newsletters/generate',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  deleteNewsletter: (token: string, newsletterId: string) =>
    apiRequest<{ message: string }>(
      `/email-newsletters/newsletters/${newsletterId}`,
      { method: 'DELETE' },
      token,
    ),

  listCategories: (token: string) =>
    apiRequest<{ categories: EmailNewsletterCategory[] }>(
      '/email-newsletters/categories',
      { method: 'GET' },
      token,
    ),

  createCategory: (
    token: string,
    payload: { name: string; description?: string; prompt?: string; enabled?: boolean },
  ) =>
    apiRequest<{ category: EmailNewsletterCategory; message: string }>(
      '/email-newsletters/categories',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  updateCategory: (
    token: string,
    categoryId: string,
    payload: { name?: string; description?: string; prompt?: string; enabled?: boolean },
  ) =>
    apiRequest<{ category: EmailNewsletterCategory; message: string }>(
      `/email-newsletters/categories/${categoryId}`,
      { method: 'PUT', body: JSON.stringify(payload) },
      token,
    ),

  deleteCategory: (token: string, categoryId: string) =>
    apiRequest<{ message: string }>(`/email-newsletters/categories/${categoryId}`, { method: 'DELETE' }, token),

  listCategoryConcepts: (token: string) =>
    apiRequest<{ concepts: CategoryConcept[] }>(
      '/email-newsletters/categories/concepts',
      { method: 'GET' },
      token,
    ),

  importCategoryConcept: (token: string, payload: { conceptId: string; count?: number }) =>
    apiRequest<{
      created: number
      skipped: number
      total: number
      summary: string
      categories: EmailNewsletterCategory[]
      message: string
    }>('/email-newsletters/categories/import-concept', { method: 'POST', body: JSON.stringify(payload) }, token),

  listTopics: (
    token: string,
    params?: { categoryId?: string; status?: string; page?: number; pageSize?: number },
  ) => {
    const search = new URLSearchParams()
    if (params?.categoryId) search.set('categoryId', params.categoryId)
    if (params?.status) search.set('status', params.status)
    if (params?.page) search.set('page', String(params.page))
    if (params?.pageSize) search.set('pageSize', String(params.pageSize))
    const query = search.toString()
    return apiRequest<{
      topics: EmailNewsletterTopic[]
      total: number
      page: number
      pageSize: number
      pendingCount: number
    }>(`/email-newsletters/topics${query ? `?${query}` : ''}`, { method: 'GET' }, token)
  },

  addTopic: (
    token: string,
    payload: { topic: string; categoryId?: string | null; priority?: number },
  ) =>
    apiRequest<{ topic: EmailNewsletterTopic; message: string }>(
      '/email-newsletters/topics',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  deleteTopic: (token: string, topicId: string) =>
    apiRequest<{ message: string }>(`/email-newsletters/topics/${topicId}`, { method: 'DELETE' }, token),

  resetTopic: (token: string, topicId: string) =>
    apiRequest<{ topic: EmailNewsletterTopic; message: string }>(
      `/email-newsletters/topics/${topicId}/reset`,
      { method: 'POST' },
      token,
    ),

  generateTopics: (token: string, payload?: { count?: number; categoryId?: string | null }) =>
    apiRequest<{
      added: number
      skipped: number
      total: number
      summary: string
      topics: EmailNewsletterTopic[]
      message: string
    }>('/email-newsletters/topics/generate', { method: 'POST', body: JSON.stringify(payload ?? {}) }, token),
}

export type PublicBlogPostSummary = {
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
  status: 'published'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PublicBlogPost = PublicBlogPostSummary & {
  content: string
}

export const blogApi = {
  listPosts: (params?: { page?: number; pageSize?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const suffix = query.toString()
    return apiRequest<{
      posts: PublicBlogPostSummary[]
      total: number
      page: number
      pageSize: number
    }>(`/blog/posts${suffix ? `?${suffix}` : ''}`)
  },

  getPost: (slug: string) =>
    apiRequest<{ post: PublicBlogPost }>(`/blog/posts/${encodeURIComponent(slug)}`),
}

export type SupportTicketCategory = 'billing' | 'credits' | 'technical' | 'account' | 'general'
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SupportTicketPriority = 'low' | 'normal' | 'high'

export type SupportTicketMessage = {
  id: string
  ticketId: string
  authorType: 'user' | 'admin'
  authorUserId: string | null
  authorAdminId: string | null
  authorName: string | null
  message: string
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

export const supportApi = {
  listTickets: (token: string, params?: { page?: number; pageSize?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const suffix = query.toString()
    return apiRequest<{
      tickets: SupportTicketSummary[]
      total: number
      page: number
      pageSize: number
    }>(`/support/tickets${suffix ? `?${suffix}` : ''}`, { method: 'GET' }, token)
  },

  getTicket: (token: string, ticketId: string) =>
    apiRequest<{ ticket: SupportTicketDetail }>(`/support/tickets/${ticketId}`, { method: 'GET' }, token),

  createTicket: (
    token: string,
    payload: {
      subject: string
      category: SupportTicketCategory
      priority?: SupportTicketPriority
      message: string
    },
  ) =>
    apiRequest<{ ticket: SupportTicketDetail; message: string }>(
      '/support/tickets',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),

  reply: (token: string, ticketId: string, message: string) =>
    apiRequest<{ ticket: SupportTicketDetail; message: string }>(
      `/support/tickets/${ticketId}/messages`,
      { method: 'POST', body: JSON.stringify({ message }) },
      token,
    ),
}
