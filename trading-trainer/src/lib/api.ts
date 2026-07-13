export interface SymbolMeta {
  symbol: string;
  pair: string;
  tvSymbol: string;
  name: string;
}

export interface PricePoint {
  t: number;
  p: number;
}

export interface MarketData {
  symbols: SymbolMeta[];
  mode: 'live' | 'simulation';
  prices: Record<string, { price: number; changePct: number; history: PricePoint[] }>;
}

export interface Position {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entry: number;
  notional: number;
  stopLoss: number | null;
  takeProfit: number | null;
  reason: string;
  openedAt: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
}

export interface Portfolio {
  cash: number;
  equity: number;
  startCapital: number;
  positions: Position[];
  mode: 'live' | 'simulation';
}

export interface Trade {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entry: number;
  exit_price: number;
  notional: number;
  stop_loss: number | null;
  take_profit: number | null;
  reason: string;
  opened_at: number;
  closed_at: number;
  pnl: number;
  close_reason: string;
}

export interface Pattern {
  id: string;
  title: string;
  detected: boolean;
  severity: 'ok' | 'warn' | 'critical';
  finding: string;
  tip: string;
}

export interface JournalStats {
  totalTrades: number;
  winRate: number;
  wins: number;
  losses: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  equityCurve: Array<{ t: number; equity: number }>;
  patterns: Pattern[];
}

export interface AssessmentData {
  id: number;
  symbol: string;
  price: number;
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  bull: string[];
  bear: string[];
  uncertainty: string;
  horizonMin: number;
  createdAt: number;
  evaluatedAt: number | null;
  evalPrice: number | null;
  changePct: number | null;
  correct: boolean | null;
}

export interface AssessmentStats {
  total: number;
  evaluated: number;
  correct: number;
  accuracy: number | null;
  byDirection: Array<{ direction: 'up' | 'down' | 'neutral'; total: number; correct: number }>;
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  offline?: boolean;
}

export interface LessonProgress {
  completedAt: number;
  score: number;
  total: number;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Fehler ${res.status}`);
  return data as T;
}
