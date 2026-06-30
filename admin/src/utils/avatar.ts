export function getAvatarInitials(fullName: string | null, email: string): string {
  const name = fullName?.trim()
  const local = (email.split('@')[0] ?? email).trim()

  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    if (parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase()
    }
  }

  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase()
  }

  if (name) {
    return name[0].toUpperCase()
  }

  return email.slice(0, 2).toUpperCase()
}

export function getAvatarTone(seed: string): 1 | 2 | 3 | 4 | 5 | 6 {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return ((Math.abs(hash) % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6
}
