import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsRotate,
  faBolt,
  faCalendarDays,
  faChartLine,
  faEnvelope,
  faKey,
  faLayerGroup,
  faPenToSquare,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export type ContentIconName =
  | 'blog'
  | 'social'
  | 'seo'
  | 'repurpose'
  | 'newsletter'
  | 'schedule'
  | 'keys'
  | 'speed'
  | 'platform'

type ContentIconProps = {
  name: ContentIconName
  className?: string
}

const icons: Record<ContentIconName, IconDefinition> = {
  blog: faPenToSquare,
  social: faShareNodes,
  seo: faChartLine,
  repurpose: faArrowsRotate,
  newsletter: faEnvelope,
  schedule: faCalendarDays,
  keys: faKey,
  speed: faBolt,
  platform: faLayerGroup,
}

export default function ContentIcon({ name, className = '' }: ContentIconProps) {
  return (
    <span className={`content-icon ${className}`.trim()} aria-hidden="true">
      <FontAwesomeIcon icon={icons[name]} />
    </span>
  )
}
