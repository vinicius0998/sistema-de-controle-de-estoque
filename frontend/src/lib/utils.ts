export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string): string {
  const d = new Date(date)
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR')}`
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('pt-BR')
}
