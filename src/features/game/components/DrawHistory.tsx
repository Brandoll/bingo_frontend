interface DrawHistoryProps {
  numbers: number[]
  limit?: number
}

export function DrawHistory({ numbers, limit = 12 }: DrawHistoryProps) {
  const recent = numbers.slice(-limit).reverse()
  return (
    <div className="draw-history" aria-label="Últimas bolas">
      {recent.length ? recent.map((number, index) => <span className={index === 0 ? 'latest' : ''} key={number}>{number}</span>) : <small>Aún no hay bolas extraídas</small>}
    </div>
  )
}
