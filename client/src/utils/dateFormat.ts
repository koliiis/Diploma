export function formatMessageTime(dateString: string) {
    return new Intl.DateTimeFormat('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  export function formatMessageDate(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()

    yesterday.setDate(today.getDate() - 1)

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()

    if (isSameDay(date, today)) return 'Сьогодні'
    if (isSameDay(date, yesterday)) return 'Вчора'

    return new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }