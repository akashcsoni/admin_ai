import { Link } from 'react-router-dom'
import ContentIcon, { type ContentIconName } from '../components/ContentIcon'
import SEO from '../components/SEO'
import ServiceCard from '../components/ServiceCard'
import { organizationJsonLd, pageSeo, websiteJsonLd } from '../config/seo'
import { liveServices, services } from '../data/services'
import '../styles/home.css'

const steps = [
  {
    number: '01',
    title: 'Connect your API key',
    description:
      'Add your OpenAI, Anthropic, or compatible provider key. You pay your provider directly — we never resell tokens.',
  },
  {
    number: '02',
    title: 'Define your content',
    description:
      'Pick a topic, keywords, tone, and length. Our prompts are tuned for SEO-friendly structure and readable drafts.',
  },
  {
    number: '03',
    title: 'Generate & publish',
    description:
      'Get a full blog draft in minutes. Export as Markdown or HTML and publish to WordPress, Ghost, or any CMS.',
  },
]

const benefits: { icon: ContentIconName; title: string; description: string }[] = [
  {
    icon: 'keys',
    title: 'Bring your own keys',
    description: 'Full control over AI provider, model choice, and spend. No hidden token markup.',
  },
  {
    icon: 'seo',
    title: 'Built for SEO',
    description: 'Structured outlines, headings, and keyword targeting baked into every blog draft.',
  },
  {
    icon: 'speed',
    title: 'Ship content faster',
    description: 'Go from blank page to publish-ready draft in minutes instead of hours.',
  },
  {
    icon: 'platform',
    title: 'Three tools, one platform',
    description: 'Auto blog, social posts, and HTML email newsletters — all in one workflow.',
  },
]

const stats = [
  { value: '5 min', label: 'Average draft time' },
  { value: '100%', label: 'Your API keys' },
  { value: String(liveServices.length), label: 'Content services' },
  { value: 'SEO', label: 'Ready exports' },
]

export default function HomePage() {
  const seo = pageSeo.home
  const featuredService = services.find((service) => service.id === 'auto-blog')

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={[organizationJsonLd, websiteJsonLd]}
      />

      <div className="home">
        <section className="home-hero" aria-labelledby="home-heading">
          <div className="home-container home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-eyebrow">
                <span className="home-eyebrow-dot" aria-hidden="true" />
                AI content platform · BYOK
              </p>
              <h1 id="home-heading">
                Generate blogs with <span className="text-gradient">your AI</span>, on your terms
              </h1>
              <p className="home-hero-lead">
                Content AI turns your API keys into a content engine. Auto-create SEO-friendly
                blogs, scale your publishing, and keep full control of cost, data, and quality.
              </p>
              <div className="home-hero-actions">
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Start free
                </Link>
                <Link to="/services" className="btn btn-secondary btn-lg">
                  View services
                </Link>
              </div>
              <ul className="home-hero-checklist" aria-label="Key benefits">
                <li>No credit card required</li>
                <li>OpenAI & Anthropic supported</li>
                <li>Export to any CMS</li>
              </ul>
            </div>

            <div className="home-hero-visual" aria-hidden="true">
              <div className="home-mockup">
                <div className="home-mockup-top">
                  <span className="home-mockup-dot home-mockup-dot--red" />
                  <span className="home-mockup-dot home-mockup-dot--yellow" />
                  <span className="home-mockup-dot home-mockup-dot--green" />
                  <span className="home-mockup-title">Blog Generator</span>
                </div>
                <div className="home-mockup-body">
                  <div className="home-mockup-row">
                    <span className="home-mockup-label">API Status</span>
                    <span className="home-mockup-pill home-mockup-pill--success">
                      OpenAI connected
                    </span>
                  </div>
                  <div className="home-mockup-field">
                    <span className="home-mockup-label">Topic</span>
                    <p>10 AI content trends for 2026</p>
                  </div>
                  <div className="home-mockup-field">
                    <span className="home-mockup-label">Outline</span>
                    <ul>
                      <li>Introduction & hook</li>
                      <li>Key trends breakdown</li>
                      <li>Actionable takeaways</li>
                    </ul>
                  </div>
                  <div className="home-mockup-progress">
                    <div className="home-mockup-progress-bar" />
                    <span>Generating draft… 78%</span>
                  </div>
                </div>
              </div>
              <div className="home-mockup-glow" />
            </div>
          </div>
        </section>

        <section className="home-trust" aria-label="Supported AI providers">
          <div className="home-container">
            <p>Works with your favorite AI providers</p>
            <ul className="home-trust-list">
              <li>OpenAI</li>
              <li>Anthropic</li>
              <li>Compatible APIs</li>
              <li>WordPress</li>
              <li>Ghost</li>
              <li>Notion</li>
            </ul>
          </div>
        </section>

        <section className="home-stats-section" aria-label="Platform highlights">
          <div className="home-container home-stats-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="home-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="how-it-works-heading">
          <div className="home-container">
            <div className="home-section-header">
              <p className="home-eyebrow home-eyebrow--plain">How it works</p>
              <h2 id="how-it-works-heading">From API key to published blog in 3 steps</h2>
              <p>
                No complex setup. Connect once, configure your preferences, and generate
                content whenever you need it.
              </p>
            </div>
            <ol className="home-steps">
              {steps.map((step) => (
                <li key={step.number} className="home-step">
                  <span className="home-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="home-section home-section--soft" aria-labelledby="services-overview-heading">
          <div className="home-container">
            <div className="home-section-header">
              <p className="home-eyebrow home-eyebrow--plain">Services</p>
              <h2 id="services-overview-heading">Everything you need to grow with content</h2>
              <p>Three AI-powered tools for creators, marketers, and teams — starting with auto blog creation.</p>
            </div>
            <div className="home-service-grid">
              {liveServices.map((service) => (
                <ServiceCard key={service.id} service={service} linkTo={`/services#${service.id}`} />
              ))}
            </div>
          </div>
        </section>

        {featuredService && (
          <section className="home-feature" aria-labelledby="featured-service-heading">
            <div className="home-container home-feature-grid">
              <div className="home-feature-copy">
                <p className="home-eyebrow home-eyebrow--plain">Featured service</p>
                <h2 id="featured-service-heading">{featuredService.title}</h2>
                <p className="home-feature-lead">{featuredService.description}</p>
                <ul className="feature-list home-feature-list">
                  {featuredService.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link to="/services#auto-blog" className="btn btn-primary">
                  Explore auto blog creation
                </Link>
              </div>
              <div className="home-feature-panel">
                <div className="home-feature-card">
                  <span className="home-feature-card-label">Sample output</span>
                  <h3>How to scale content with your own AI keys</h3>
                  <p>
                    Publishing consistently does not require a bigger team — it requires
                    smarter workflows. With Content AI, you connect your provider once and
                    generate structured, SEO-ready drafts on demand…
                  </p>
                  <div className="home-feature-tags">
                    <span>1,240 words</span>
                    <span>SEO optimized</span>
                    <span>Markdown</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="home-section" aria-labelledby="benefits-heading">
          <div className="home-container">
            <div className="home-section-header">
              <p className="home-eyebrow home-eyebrow--plain">Why Content AI</p>
              <h2 id="benefits-heading">Built for creators who want control</h2>
              <p>Unlike all-in-one AI subscriptions, we put your keys, budget, and brand first.</p>
            </div>
            <div className="home-benefits-grid">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="home-benefit">
                  <ContentIcon name={benefit.icon} />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-cta" aria-labelledby="cta-heading">
          <div className="home-container home-cta-inner">
            <div>
              <h2 id="cta-heading">Ready to automate your blog workflow?</h2>
              <p>
                Join creators using Content AI to publish faster with their own API keys.
                Start free — upgrade when you are ready.
              </p>
            </div>
            <div className="home-cta-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Get started free
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
