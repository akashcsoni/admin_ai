import { Link } from 'react-router-dom'
import ContentIcon from '../../../components/ContentIcon'
import type { Service } from '../../../data/services'

type ComingSoonWorkspaceProps = {
  service: Service
}

export default function ComingSoonWorkspace({ service }: ComingSoonWorkspaceProps) {
  return (
    <div className="service-coming-soon">
      <div className="service-coming-soon-icon">
        <ContentIcon name={service.icon} />
      </div>
      <h2>{service.title} is coming soon</h2>
      <p>{service.description}</p>
      <ul className="feature-list service-feature-list">
        {service.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <p className="service-coming-soon-note">
        We are building this tool next. You will access it from your account dashboard when it
        launches — no extra setup required.
      </p>
      <div className="service-coming-soon-actions">
        <Link to="/account" className="btn btn-primary">
          Back to dashboard
        </Link>
        <Link to="/contact" className="btn btn-secondary">
          Request early access
        </Link>
      </div>
    </div>
  )
}
