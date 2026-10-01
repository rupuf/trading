export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  chartType: 'candles' | 'line' | 'bars';
  defaultLeverage: number;
  defaultMarginMode: 'isolated' | 'cross';
  notifications: boolean;
  sound: boolean;
  confirmOrders: boolean;
}

export interface Market {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  decimals: number;
  priceDecimals: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  spread: number;
  spreadPercent: number;
}

export type OrderType = 'market' | 'limit' | 'stop';
export type Side = 'long' | 'short';
export type MarginMode = 'isolated' | 'cross';
export type OrderStatus = 'open' | 'filled' | 'cancelled' | 'partial';

export interface Order {
  id: string;
  symbol: string;
  side: Side;
  type: OrderType;
  price: number;
  quantity: number;
  leverage: number;
  marginMode: MarginMode;
  stopPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  status: OrderStatus;
  createdAt: string;
  filledAt?: string;
  filledPrice?: number;
  reduceOnly: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  side: Side;
  size: number;
  entryPrice: number;
  markPrice: number;
  notional: number;
  margin: number;
  leverage: number;
  marginMode: MarginMode;
  unrealizedPnl: number;
  roi: number;
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  openedAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  symbol: string;
  side: Side;
  price: number;
  quantity: number;
  fee: number;
  realizedPnl: number;
  orderId: string;
  positionId?: string;
  timestamp: string;
}

export interface PortfolioStats {
  totalEquity: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnl: number;
  realizedPnl: number;
  todayPnl: number;
  roi: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export interface EquityPoint {
  time: number;
  equity: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface CreatorConfig {
  startingBalance: number;
  entryPrice: number;
  positionSize: number;
  leverage: number;
  side: Side;
  takeProfit: number;
  stopLoss: number;
  speed: number;
  profitScenario: boolean;
  volatility: number;
  tradingFee: number;
  fundingRate: number;
  isRunning: boolean;
  isPaused: boolean;
}

export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W';

export interface Indicator {
  id: string;
  type: 'EMA' | 'SMA' | 'RSI' | 'MACD' | 'BB' | 'Volume';
  params: Record<string, number>;
  visible: boolean;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  price: number;
  direction: 'above' | 'below';
  active: boolean;
  createdAt: string;
}
