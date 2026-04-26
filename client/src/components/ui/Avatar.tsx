type AvatarProps = {
  fullName: string
  avatarUrl?: string
  size?: 'sm' | 'md'
}

export function Avatar({ fullName, avatarUrl, size = 'md' }: AvatarProps) {
  const firstLetter = fullName.trim().charAt(0).toUpperCase()

  const sizeClass =
    size === 'sm' ? 'h-8 w-8 text-sm' : 'h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className={`${sizeClass} rounded-full object-cover`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-gray-900 font-medium text-white`}
    >
      {firstLetter || '?'}
    </div>
  )
}