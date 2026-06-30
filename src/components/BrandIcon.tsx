type BrandIconProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'brand-icon--sm',
  md: 'brand-icon--md',
  lg: 'brand-icon--lg',
} as const

export default function BrandIcon({ className = '', size = 'md' }: BrandIconProps) {
  return (
    <span className={`brand-icon ${sizeClass[size]} ${className}`.trim()}>
      <img src="/favicon.svg" alt="" width={48} height={46} decoding="async" />
    </span>
  )
}
