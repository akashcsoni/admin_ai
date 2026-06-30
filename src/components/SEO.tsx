import { useEffect } from 'react'
import { siteConfig } from '../config/site'

type JsonLd = Record<string, unknown> | Record<string, unknown>[]

type SEOProps = {
  title: string
  description: string
  path: string
  keywords?: string[]
  jsonLd?: JsonLd
  noindex?: boolean
  ogType?: 'website' | 'article'
  image?: string
}

const JSON_LD_ID = 'page-json-ld'

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    Object.entries(attributes).forEach(([key, value]) => {
      element!.setAttribute(key, value)
    })
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function upsertJsonLd(jsonLd: JsonLd | undefined) {
  const existing = document.getElementById(JSON_LD_ID)
  existing?.remove()

  if (!jsonLd) return

  const script = document.createElement('script')
  script.id = JSON_LD_ID
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(jsonLd)
  document.head.appendChild(script)
}

export default function SEO({
  title,
  description,
  path,
  keywords = [],
  jsonLd,
  noindex = false,
  ogType = 'website',
  image,
}: SEOProps) {
  useEffect(() => {
    const canonicalUrl = `${siteConfig.url.replace(/\/$/, '')}${path}`
    const robots = noindex ? 'noindex, nofollow' : 'index, follow'
    const ogImage = image?.trim()

    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description' }, description)
    upsertMeta('meta[name="robots"]', { name: 'robots' }, robots)
    upsertMeta('meta[name="author"]', { name: 'author' }, siteConfig.name)
    upsertMeta(
      'meta[name="keywords"]',
      { name: 'keywords' },
      keywords.length > 0 ? keywords.join(', ') : siteConfig.name,
    )

    upsertLink('canonical', canonicalUrl)

    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, ogType)
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, siteConfig.name)
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title)
    upsertMeta(
      'meta[property="og:description"]',
      { property: 'og:description' },
      description,
    )
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, siteConfig.locale)
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image' }, ogImage)
    }

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: 'twitter:description' },
      description,
    )
    if (ogImage) {
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, ogImage)
    }
    upsertMeta(
      'meta[name="twitter:site"]',
      { name: 'twitter:site' },
      siteConfig.twitterHandle,
    )

    upsertJsonLd(jsonLd)
  }, [title, description, path, keywords.join(','), JSON.stringify(jsonLd), noindex, ogType, image])

  return null
}
