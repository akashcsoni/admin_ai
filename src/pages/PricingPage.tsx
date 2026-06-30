import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import {
  creditExamples,
  creditSteps,
  pricingFaqs,
  pricingPlans,
} from '../data/pricing'
import '../styles/pricing.css'

export default function PricingPage() {
  const seo = pageSeo.pricing

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Pricing', path: '/pricing' },
        ])}
      />

      <div className="pricing-page">
        <section className="pricing-hero" aria-labelledby="pricing-heading">
          <div className="pricing-container">
            <nav className="pricing-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Pricing</span>
            </nav>

            <div className="pricing-hero-copy">
              <p className="pricing-eyebrow">Simple pricing</p>
              <h1 id="pricing-heading">
                Start free, pay only for <span className="text-gradient">what you create</span>
              </h1>
              <p className="pricing-hero-lead">
                Get 1 free content on signup. After that, add credits to your account — $1 per
                credit, and 1 credit creates 1 content piece. No monthly subscription required.
              </p>
            </div>
          </div>
        </section>

        <section className="pricing-plans-section" aria-label="Pricing plans">
          <div className="pricing-container">
            <div className="pricing-plans-grid">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.id}
                  className={`pricing-plan-card ${plan.highlighted ? 'pricing-plan-card--featured' : ''}`}
                  aria-labelledby={`plan-${plan.id}`}
                >
                  {plan.highlighted && (
                    <span className="badge badge-accent">Recommended</span>
                  )}
                  <p className="pricing-plan-label">{plan.name}</p>
                  <div className="pricing-plan-amount">
                    <span className="pricing-plan-price">{plan.price}</span>
                    <span className="pricing-plan-period">{plan.period}</span>
                  </div>
                  <p className="pricing-plan-credits">{plan.credits}</p>
                  <p className="pricing-plan-desc">{plan.description}</p>
                  <ul className="feature-list pricing-plan-features">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link
                    to={plan.ctaLink}
                    className={`btn btn-block ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing-section pricing-section--soft" aria-labelledby="credits-heading">
          <div className="pricing-container">
            <div className="pricing-section-head">
              <p className="pricing-eyebrow pricing-eyebrow--plain">Credit system</p>
              <h2 id="credits-heading">$1 = 1 credit = 1 content</h2>
              <p>Add money to your account and receive credits instantly. Each content you create uses one credit.</p>
            </div>

            <div className="pricing-credit-grid">
              {creditExamples.map((example) => (
                <article
                  key={example.amount}
                  className={`pricing-credit-card ${example.amount === 20 ? 'pricing-credit-card--popular' : ''}`}
                >
                  {example.amount === 20 && (
                    <span className="badge badge-accent">Example</span>
                  )}
                  <p className="pricing-credit-label">{example.label}</p>
                  <div className="pricing-credit-amount">
                    <span>${example.amount}</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <strong>{example.credits} credits</strong>
                  </div>
                  <p>{example.credits} content pieces from your account</p>
                </article>
              ))}
            </div>

            <div className="pricing-credit-note">
              <strong>Example:</strong> Add $20 to your account → get 20 credits → create 20 content
              pieces. AI API usage is still billed by your provider through your own keys.
            </div>
          </div>
        </section>

        <section className="pricing-section" aria-labelledby="how-credits-heading">
          <div className="pricing-container">
            <div className="pricing-section-head">
              <p className="pricing-eyebrow pricing-eyebrow--plain">How it works</p>
              <h2 id="how-credits-heading">From signup to published content</h2>
            </div>
            <ol className="pricing-steps">
              {creditSteps.map((step) => (
                <li key={step.number} className="pricing-step">
                  <span className="pricing-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="pricing-section pricing-section--soft" aria-labelledby="pricing-faq-heading">
          <div className="pricing-container">
            <div className="pricing-section-head">
              <p className="pricing-eyebrow pricing-eyebrow--plain">FAQ</p>
              <h2 id="pricing-faq-heading">Pricing questions</h2>
            </div>
            <div className="pricing-faq-list">
              {pricingFaqs.map((faq) => (
                <details key={faq.question} className="pricing-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing-cta" aria-labelledby="pricing-cta-heading">
          <div className="pricing-container pricing-cta-inner">
            <div>
              <h2 id="pricing-cta-heading">Create your first content free</h2>
              <p>
                Sign up today and use your 1 free content credit. Add more credits anytime — $1
                per credit, no subscription required.
              </p>
            </div>
            <div className="pricing-cta-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Get started free
              </Link>
              <Link to="/services" className="btn btn-ghost btn-lg">
                View services
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
