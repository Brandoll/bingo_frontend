export type GameStatus = 'RUNNING' | 'PAUSED' | 'VALIDATING_PRIZE' | 'ROUND_FINISHED' | 'CLOSED'
export type PrizeType = 'LINE' | 'DOUBLE_LINE' | 'BINGO'
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type CardType = 'DIGITAL' | 'PHYSICAL'

export interface RankingEntry {
  cardId: string
  displayName: string
  cardCode: string
  matchedNumbers: number
  completedRows: number
  remainingForBingo: number
}

export interface PrizeClaim {
  id: string
  cardId: string
  displayName: string
  cardCode: string
  prizeType: PrizeType
  status: ClaimStatus
  claimedAt: string
  validatedAt?: string
  rejectionReason?: string
}

export interface GameSnapshot {
  id: string
  roomId: string
  roundNumber: number
  status: GameStatus
  currentNumber?: number
  previousNumber?: number
  drawnNumbers: number[]
  remainingNumbers: number
  automaticDrawEnabled: boolean
  automaticDrawIntervalSeconds: number
  lineEnabled: boolean
  doubleLineEnabled: boolean
  bingoEnabled: boolean
  rankingPublic: boolean
  automaticBingoDetectionEnabled: boolean
  stopOnBingoEnabled: boolean
  winnerAnnouncementEnabled: boolean
  startedAt: string
  pausedAt?: string
  endedAt?: string
  ranking: RankingEntry[]
  claims: PrizeClaim[]
}

export type GameSettings = Pick<GameSnapshot,
  | 'lineEnabled'
  | 'doubleLineEnabled'
  | 'bingoEnabled'
  | 'rankingPublic'
  | 'automaticBingoDetectionEnabled'
  | 'stopOnBingoEnabled'
  | 'winnerAnnouncementEnabled'
>

export interface GameCard {
  id: string
  cardType: CardType
  displayName: string
  externalCode: string
  grid: Array<Array<number | null>>
  markedNumbers: number[]
  matchedNumbers: number
  completedRows: number
  active: boolean
}

export interface PhysicalCard {
  id: string
  externalId: string
  numbers: number[]
  grid: Array<Array<number | null>>
}

export interface RoomStatistics {
  roomId: string
  totalRounds: number
  totalDraws: number
  totalCards: number
  physicalCards: number
  approvedPrizes: number
  rounds: Array<{
    gameId: string
    roundNumber: number
    status: GameStatus
    drawnNumbers: number
    assignedCards: number
    physicalCards: number
    approvedPrizes: number
    startedAt: string
    endedAt?: string
  }>
}
