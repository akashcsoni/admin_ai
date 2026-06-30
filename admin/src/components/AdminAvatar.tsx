import { getAvatarInitials, getAvatarTone } from '../utils/avatar'

type AdminAvatarProps = {
  fullName: string | null
  email: string
  size?: 'sidebar' | 'table'
}

export default function AdminAvatar({ fullName, email, size = 'table' }: AdminAvatarProps) {
  const initials = getAvatarInitials(fullName, email)
  const tone = getAvatarTone(email)

  return (
    <span
      className={`admin-avatar admin-avatar--tone-${tone} admin-avatar--${size}`}
      aria-hidden="true"
      title={fullName?.trim() || email}
    >
      {initials}
    </span>
  )
}
