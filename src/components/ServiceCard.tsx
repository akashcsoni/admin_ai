import { Link } from 'react-router-dom'
import type { Service } from '../data/services'
import ContentIcon from './ContentIcon'

type ServiceCardProps = {
  service: Service
  linkTo?: string
}

export default function ServiceCard({ service, linkTo }: ServiceCardProps) {
  const content = (
    <>
      <ContentIcon name={service.icon} />
      <h3>{service.title}</h3>
      <p>{service.shortDescription}</p>
      {service.available ? (
        <span className="service-card-link">Learn more →</span>
      ) : (
        <span className="badge">Coming soon</span>
      )}
    </>
  )

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className={`service-card service-card--link ${service.available ? '' : 'service-card--soon'}`}
      >
        {content}
      </Link>
    )
  }

  return (
    <article className={`service-card ${service.available ? '' : 'service-card--soon'}`}>
      {content}
    </article>
  )
}
