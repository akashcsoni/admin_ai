import { Link } from 'react-router-dom'
import ContentIcon from '../components/ContentIcon'
import SEO from '../components/SEO'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { siteConfig } from '../config/site'
import {
  aboutAudiences,
  aboutMilestones,
  aboutStats,
  aboutValues,
} from '../data/about'
import '../styles/about.css'

export default function AboutPage() {
  const seo = pageSeo.about

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />

      <div className="about-page">
        <section className="about-hero" aria-labelledby="about-heading">
          <div className="about-container">
            <nav className="about-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>About</span>
            </nav>

            <div className="about-hero-grid">
              <div className="about-hero-copy">
                <p className="about-eyebrow">About {siteConfig.name}</p>
                <h1 id="about-heading">
                  AI content tools that put <span className="text-gradient">you in control</span>
                </h1>
                <p className="about-hero-lead">
                  {siteConfig.name} was built for creators, marketers, and teams who want
                  powerful AI writing workflows without giving up their API keys, budget, or
                  brand voice.
                </p>
                <div className="about-hero-actions">
                  <Link to="/contact" className="btn btn-primary btn-lg">
                    Work with us
                  </Link>
                  <Link to="/services" className="btn btn-secondary btn-lg">
                    Explore services
                  </Link>
                </div>
              </div>

              <div className="about-hero-panel">
                <p className="about-hero-panel-label">At a glance</p>
                <ul className="about-hero-facts">
                  <li>Bring your own OpenAI & Anthropic keys</li>
                  <li>No hidden token markup on AI usage</li>
                  <li>SEO-friendly blog generation live today</li>
                  <li>Social posts and HTML email newsletters included</li>
                </ul>
                <div className="about-hero-stats">
                  {aboutStats.map((stat) => (
                    <article key={stat.label} className="about-stat">
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-story" aria-labelledby="story-heading">
          <div className="about-container about-story-grid">
            <div className="about-story-copy">
              <p className="about-eyebrow about-eyebrow--plain">Our story</p>
              <h2 id="story-heading">Why we built Content AI</h2>
              <p>
                Most AI writing platforms lock you into their subscriptions, their models, and
                their markup. We saw creators paying twice — once for a SaaS tool and again
                for tokens they could buy directly from OpenAI or Anthropic.
              </p>
              <p>
                Content AI takes a different approach. You connect your own API keys, choose
                your models, and use our workflows to generate blogs and content faster. We
                focus on prompts, structure, and export — the parts that save you time — while
                you stay in full control of cost and data.
              </p>
            </div>
            <blockquote className="about-quote">
              <p>
                &ldquo;AI should amplify your creativity, not replace it — and you should
                always own your keys, your content, and your spend.&rdquo;
              </p>
              <footer>— The {siteConfig.name} team</footer>
            </blockquote>
          </div>
        </section>

        <section className="about-section about-section--soft" aria-labelledby="values-heading">
          <div className="about-container">
            <div className="about-section-head">
              <p className="about-eyebrow about-eyebrow--plain">Our values</p>
              <h2 id="values-heading">What we stand for</h2>
              <p>Principles that guide every feature we ship.</p>
            </div>
            <div className="about-values-grid">
              {aboutValues.map((value) => (
                <article key={value.title} className="about-value-card">
                  <ContentIcon name={value.icon} />
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" aria-labelledby="audience-heading">
          <div className="about-container">
            <div className="about-section-head">
              <p className="about-eyebrow about-eyebrow--plain">Who we serve</p>
              <h2 id="audience-heading">Built for every content workflow</h2>
              <p>From solo bloggers to agencies — Content AI scales with you.</p>
            </div>
            <div className="about-audience-grid">
              {aboutAudiences.map((audience) => (
                <article key={audience.title} className="about-audience-card">
                  <h3>{audience.title}</h3>
                  <p className="about-audience-desc">{audience.description}</p>
                  <ul className="feature-list">
                    {audience.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section about-section--soft" aria-labelledby="timeline-heading">
          <div className="about-container">
            <div className="about-section-head">
              <p className="about-eyebrow about-eyebrow--plain">Our journey</p>
              <h2 id="timeline-heading">Where we are today</h2>
            </div>
            <ol className="about-timeline">
              {aboutMilestones.map((milestone) => (
                <li key={milestone.title} className="about-timeline-item">
                  <span className="about-timeline-year">{milestone.year}</span>
                  <div>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-cta" aria-labelledby="about-cta-heading">
          <div className="about-container about-cta-inner">
            <div>
              <h2 id="about-cta-heading">Ready to create on your terms?</h2>
              <p>
                Join creators and teams using {siteConfig.name} to publish faster with their
                own AI keys. Start free — no credit card required.
              </p>
            </div>
            <div className="about-cta-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Get in touch
              </Link>
              <Link to="/pricing" className="btn btn-ghost btn-lg">
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
