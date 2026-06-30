import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import ContentIcon from '../components/ContentIcon'
import SEO from '../components/SEO'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { siteConfig } from '../config/site'
import { faqCategories, faqPageJsonLd } from '../data/faq'
import '../styles/faq.css'

type ActiveFilter = 'all' | string

export default function FAQPage() {
  const seo = pageSeo.faq
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    return faqCategories
      .filter((category) => activeFilter === 'all' || category.id === activeFilter)
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter((faq) => {
          if (!normalizedQuery) return true
          return (
            faq.question.toLowerCase().includes(normalizedQuery) ||
            faq.answer.toLowerCase().includes(normalizedQuery)
          )
        }),
      }))
      .filter((category) => category.faqs.length > 0)
  }, [activeFilter, normalizedQuery])

  const totalResults = filteredCategories.reduce(
    (count, category) => count + category.faqs.length,
    0,
  )

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          faqPageJsonLd(),
        ]}
      />

      <div className="faq-page">
        <section className="faq-hero" aria-labelledby="faq-heading">
          <div className="faq-container">
            <nav className="faq-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>FAQ</span>
            </nav>

            <div className="faq-hero-copy">
              <p className="faq-eyebrow">Help center</p>
              <h1 id="faq-heading">
                Answers to your <span className="text-gradient">top questions</span>
              </h1>
              <p className="faq-hero-lead">
                Everything about credits, API keys, content creation, and support — organized
                so you find what you need fast.
              </p>
            </div>

            <div className="faq-search" role="search">
              <label className="visually-hidden" htmlFor="faq-search-input">
                Search FAQs
              </label>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="faq-search-icon" />
              <input
                id="faq-search-input"
                type="search"
                placeholder="Search questions… e.g. credits, API keys, export"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="faq-search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="faq-body" aria-label="FAQ categories and answers">
          <div className="faq-container">
            <div className="faq-toolbar">
              <div className="faq-filters" role="tablist" aria-label="Filter by category">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === 'all'}
                  className={`faq-filter ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All topics
                </button>
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === category.id}
                    className={`faq-filter ${activeFilter === category.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(category.id)}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
              <p className="faq-result-count" aria-live="polite">
                {totalResults} {totalResults === 1 ? 'answer' : 'answers'} found
              </p>
            </div>

            {totalResults === 0 ? (
              <div className="faq-empty">
                <h2>No results found</h2>
                <p>Try a different search term or browse all topics.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveFilter('all')
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="faq-categories">
                {filteredCategories.map((category) => (
                  <section
                    key={category.id}
                    className="faq-category-block"
                    aria-labelledby={`faq-cat-${category.id}`}
                  >
                    <div className="faq-category-head">
                      <ContentIcon name={category.icon} className="faq-category-icon" />
                      <div>
                        <h2 id={`faq-cat-${category.id}`}>{category.title}</h2>
                        <p>{category.description}</p>
                      </div>
                    </div>

                    <div className="faq-accordion">
                      {category.faqs.map((faq) => (
                        <details key={faq.question} className="faq-item">
                          <summary>{faq.question}</summary>
                          <p>{faq.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="faq-quick-links" aria-label="Quick help links">
          <div className="faq-container faq-quick-grid">
            <Link to="/pricing" className="faq-quick-card">
              <ContentIcon name="keys" className="faq-quick-icon" />
              <h3>Pricing & credits</h3>
              <p>Free plan + $1 per credit explained</p>
            </Link>
            <Link to="/services" className="faq-quick-card">
              <ContentIcon name="blog" className="faq-quick-icon" />
              <h3>Our services</h3>
              <p>Explore all 6 content tools</p>
            </Link>
            <Link to="/contact" className="faq-quick-card">
              <ContentIcon name="newsletter" className="faq-quick-icon" />
              <h3>Contact support</h3>
              <p>{siteConfig.contactEmail}</p>
            </Link>
          </div>
        </section>

        <section className="faq-cta" aria-labelledby="faq-cta-heading">
          <div className="faq-container faq-cta-inner">
            <div>
              <h2 id="faq-cta-heading">Still have questions?</h2>
              <p>
                Our team is happy to help with credits, API keys, or getting your first content
                created. We typically reply within 1–2 business days.
              </p>
            </div>
            <div className="faq-cta-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Contact us
              </Link>
              <Link to="/pricing" className="btn btn-ghost btn-lg">
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
