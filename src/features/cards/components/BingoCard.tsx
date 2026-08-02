import type { GameCard } from '../../../types/game'

interface BingoCardProps {
  card: GameCard
  drawnNumbers: number[]
  interactive?: boolean
  autoMark?: boolean
  busyNumber?: number
  onToggle?: (number: number) => void
}

export function BingoCard({ card, drawnNumbers, interactive = false, autoMark = false, busyNumber, onToggle }: BingoCardProps) {
  const drawn = new Set(drawnNumbers)
  const marked = new Set(card.markedNumbers)
  const cardNumbers = card.grid.flat().filter((number): number is number => number !== null)
  const matchedNumbers = cardNumbers.filter(number => drawn.has(number)).length
  const completedRows = card.grid.filter(row => row.filter((number): number is number => number !== null).every(number => drawn.has(number))).length
  return (
    <article className="bingo-card" aria-label={`Cartón ${card.externalCode}`}>
      <header><div><span>{card.cardType === 'PHYSICAL' ? 'Cartilla física' : 'Tu cartón digital'}</span><strong>{card.externalCode}</strong></div><div className="card-progress"><b>{matchedNumbers}/15</b><small>aciertos</small></div></header>
      <div className="bingo-grid">
        {card.grid.flatMap((row, rowIndex) => row.map((number, columnIndex) => {
          if (number === null) return <span className="card-cell empty-cell" key={`${rowIndex}-${columnIndex}`} aria-hidden="true" />
          const wasDrawn = drawn.has(number)
          const wasMarked = autoMark ? wasDrawn : marked.has(number)
          return interactive ? (
            <button
              type="button"
              key={number}
              className={`card-cell ${wasDrawn ? 'drawn-cell' : ''} ${wasMarked ? 'marked-cell' : ''}`}
              disabled={autoMark || !wasDrawn || busyNumber === number}
              aria-pressed={wasMarked}
              aria-label={`${wasMarked ? 'Desmarcar' : 'Marcar'} ${number}`}
              onClick={() => onToggle?.(number)}
            >{number}</button>
          ) : <span key={number} className={`card-cell ${wasDrawn ? 'drawn-cell marked-cell' : ''}`}>{number}</span>
        }))}
      </div>
      <footer><span>{completedRows} {completedRows === 1 ? 'línea completa' : 'líneas completas'}</span><span>{15 - matchedNumbers} para bingo</span></footer>
    </article>
  )
}
