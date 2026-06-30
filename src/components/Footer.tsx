import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGithub,
  faLinkedin,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faHeadset, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import {
  footerColumns,
  footerContactInfo,
  footerHighlights,
  footerSocialLinks,
} from '../data/footer'
import { siteConfig } from '../config/site'
import BrandIcon from './BrandIcon'

const socialIcons = {
  'x-twitter': faXTwitter,
  linkedin: faLinkedin,
  github: faGithub,
  youtube: faYoutube,
} as const

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false)

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo" aria-label="Content AI home">
              <BrandIcon size="sm" className="logo-icon" />
              <span>{siteConfig.name}</span>
            </Link>
            <p className="footer-about">
              {siteConfig.description}
            </p>

            <ul className="footer-highlights">
              {footerHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="footer-contact-block">
              <h3>Contact</h3>
              <ul className="footer-contact-list">
                <li>
                  <FontAwesomeIcon icon={faEnvelope} />
                  <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
                </li>
                {footerContactInfo.slice(1).map((item) => (
                  <li key={item.label}>
                    <FontAwesomeIcon icon={item.label === 'Support hours' ? faHeadset : faLocationDot} />
                    <span>
                      <strong>{item.label}:</strong> {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-social">
              <h3>Follow us</h3>
              <ul className="footer-social-list">
                {footerSocialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <FontAwesomeIcon icon={socialIcons[social.icon]} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-links-grid">
            {footerColumns.map((column) => (
              <div key={column.title} className="footer-column">
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a href={link.to} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.to}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-newsletter">
          <div className="footer-newsletter-copy">
            <h3>Stay in the loop</h3>
            <p>
              Get product updates, content tips, and early access to new AI writing tools.
            </p>
          </div>
          <form
            className="footer-newsletter-form"
            onSubmit={handleNewsletterSubmit}
            aria-label="Newsletter signup"
          >
            <label className="visually-hidden" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
            {subscribed && (
              <p className="footer-newsletter-success" role="status">
                Thanks for subscribing!
              </p>
            )}
          </form>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="footer-bottom-links">
            <li>
              <Link to="/privacy">Privacy</Link>
            </li>
            <li>
              <Link to="/terms">Terms</Link>
            </li>
            <li>
              <a href="/sitemap.xml">Sitemap</a>
            </li>
          </ul>
          <p className="footer-tagline">{siteConfig.tagline} · Powered by your AI keys</p>
        </div>
      </div>
    </footer>
  )
}
