export function roleLabelUk(role: string | undefined): string {
  if (role === 'teacher') return 'Викладач'
  if (role === 'student') return 'Студент'
  return role ?? '—'
}

export function roleInSentence(role: string | undefined): string {
  if (role === 'teacher') return 'викладач'
  if (role === 'student') return 'студент'
  return role ?? '—'
}
