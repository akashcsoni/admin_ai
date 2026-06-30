import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faCircleQuestion,
  faEnvelope,
  faHeadset,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons'
import SEO from '../components/SEO'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { siteConfig } from '../config/site'
import { contactMethods, contactReasons, contactSubjects } from '../data/contact'
import '../styles/contact.css'

const methodIcons = {
  email: faEnvelope,
  clock: faClock,
  help: faCircleQuestion,
} as const

function contactPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${siteConfig.name}`,
    description: pageSeo.contact.description,
    url: `${siteConfig.url.replace(/\/$/, '')}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.name,
      email: siteConfig.contactEmail,
      url: siteConfig.url,
    },
  }
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const seo = pageSeo.contact

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

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
            { name: 'Contact', path: '/contact' },
          ]),
          contactPageJsonLd(),
        ]}
      />

      <div className="contact-page">
        <section className="contact-hero" aria-labelledby="contact-heading">
          <div className="contact-container">
            <nav className="contact-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Contact</span>
            </nav>

            <div className="contact-hero-copy">
              <p className="contact-eyebrow">Get in touch</p>
              <h1 id="contact-heading">
                We&apos;re here to <span className="text-gradient">help you create</span>
              </h1>
              <p className="contact-hero-lead">
                Questions about credits, API keys, or getting started? Send us a message and
                our team will get back to you within 1–2 business days.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-main" aria-label="Contact form and information">
          <div className="contact-container contact-main-grid">
            <div className="contact-form-panel">
              <div className="contact-form-head">
                <h2>Send us a message</h2>
                <p>Fill out the form and we&apos;ll respond as soon as possible.</p>
              </div>

              {submitted ? (
                <div className="contact-success" role="status">
                  <div className="contact-success-icon" aria-hidden="true">
                    ✓
                  </div>
                  <h3>Message sent successfully</h3>
                  <p>
                    Thank you for reaching out. We&apos;ve received your message and will reply
                    to your email within 1–2 business days.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label htmlFor="contact-name">
                        Full name <span className="required">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="contact-email">
                        Email address <span className="required">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-subject">
                      Subject <span className="required">*</span>
                    </label>
                    <select id="contact-subject" name="subject" required defaultValue="">
                      <option value="" disabled>
                        Select a topic
                      </option>
                      {contactSubjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-message">
                      Message <span className="required">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={6}
                      placeholder="Tell us how we can help — credits, API setup, partnerships, or anything else..."
                    />
                  </div>

                  <p className="contact-form-note">
                    By submitting, you agree we may use your email to respond to this inquiry.
                  </p>

                  <button type="submit" className="btn btn-primary btn-lg contact-submit">
                    Send message
                  </button>
                </form>
              )}
            </div>

            <aside className="contact-sidebar">
              <div className="contact-methods">
                {contactMethods.map((method) => (
                  <article key={method.title} className="contact-method-card">
                    <span className="contact-method-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={methodIcons[method.icon]} />
                    </span>
                    <div>
                      <h3>{method.title}</h3>
                      <p>{method.description}</p>
                      {method.href ? (
                        method.href.startsWith('mailto:') ? (
                          <a href={method.href}>{method.value}</a>
                        ) : (
                          <Link to={method.href}>{method.value}</Link>
                        )
                      ) : (
                        <strong>{method.value}</strong>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="contact-info-card">
                <h3>What can we help with?</h3>
                <ul className="contact-reasons">
                  {contactReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="contact-info-card contact-info-card--accent">
                <FontAwesomeIcon icon={faHeadset} className="contact-info-card-icon" />
                <h3>Need a faster answer?</h3>
                <p>
                  Check our FAQ for instant answers about pricing credits, API keys, and blog
                  creation.
                </p>
                <Link to="/faq" className="btn btn-secondary btn-block">
                  Visit help center
                </Link>
              </div>

              <div className="contact-office">
                <FontAwesomeIcon icon={faLocationDot} />
                <span>Remote-first team · Serving creators worldwide</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="contact-cta" aria-labelledby="contact-cta-heading">
          <div className="contact-container contact-cta-inner">
            <div>
              <h2 id="contact-cta-heading">Ready to create your first content?</h2>
              <p>
                Start free with 1 content credit. Connect your API keys and generate your first
                blog draft in minutes.
              </p>
            </div>
            <Link to="/pricing" className="btn btn-primary btn-lg">
              View pricing
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
