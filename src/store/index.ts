import { create } from 'zustand';
import { User, Position, Order, Trade, Notification, CreatorConfig, Market, EquityPoint, WatchlistItem, PriceAlert, PortfolioStats, UserSettings } from '../types';
import { priceEngine } from '../engine';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, username: string, password: string) => boolean;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Trading
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  balance: number;
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  equityHistory: EquityPoint[];
  watchlist: WatchlistItem[];
  alerts: PriceAlert[];

  // Actions
  openPosition: (symbol: string, side: 'long' | 'short', size: number, leverage: number, marginMode: 'isolated' | 'cross', tp?: number, sl?: number) => boolean;
  closePosition: (positionId: string) => void;
  updatePositionTPSL: (positionId: string, tp?: number, sl?: number) => void;
  addMargin: (positionId: string, amount: number) => boolean;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  cancelOrder: (orderId: string) => void;

  // Portfolio
  getPortfolioStats: () => PortfolioStats;

  // Markets
  markets: Market[];
  updateMarkets: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification['type'], title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Creator
  creatorConfig: CreatorConfig;
  updateCreatorConfig: (config: Partial<CreatorConfig>) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;

  // UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showMobileMenu: boolean;
  toggleMobileMenu: () => void;

  // Persistence
  saveState: () => void;
  loadState: () => void;

  // Watchlist
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;

  // Alerts
  addAlert: (symbol: string, price: number, direction: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  chartType: 'candles',
  defaultLeverage: 10,
  defaultMarginMode: 'isolated',
  notifications: true,
  sound: false,
  confirmOrders: true,
};

const defaultCreatorConfig: CreatorConfig = {
  startingBalance: 10000,
  entryPrice: 83500,
  positionSize: 0.025,
  leverage: 10,
  side: 'long',
  takeProfit: 85000,
  stopLoss: 82000,
  speed: 1,
  profitScenario: true,
  volatility: 0.02,
  tradingFee: 0.04,
  fundingRate: 0.01,
  isRunning: false,
  isPaused: false,
};

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,

  login: (email, password) => {
    const users: User[] = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      set({ user, isAuthenticated: true });
      localStorage.setItem('nexus_session', JSON.stringify(user));
      get().loadState();
      return true;
    }
    return false;
  },

  signup: (email, username, password) => {
    const users: User[] = JSON.parse(localStorage.getItem('nexus_users') || '[]');
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: generateId(),
      email,
      username,
      password,
      createdAt: new Date().toISOString(),
      settings: defaultSettings,
    };
    users.push(newUser);
    localStorage.setItem('nexus_users', JSON.stringify(users));
    set({ user: newUser, isAuthenticated: true });
    localStorage.setItem('nexus_session', JSON.stringify(newUser));
    // Initialize with starting balance
    set({ balance: defaultCreatorConfig.startingBalance });
    get().saveState();
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('nexus_session');
  },

  updateSettings: (settings) => {
    const { user } = get();
    if (user) {
      const updated = { ...user, settings: { ...user.settings, ...settings } };
      set({ user: updated });
      localStorage.setItem('nexus_session', JSON.stringify(updated));
    }
  },

  // Trading
  selectedSymbol: 'BTCUSDT',
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  balance: 10000,
  positions: [],
  orders: [],
  trades: [],
  equityHistory: [],
  watchlist: [
    { symbol: 'BTCUSDT', addedAt: new Date().toISOString() },
    { symbol: 'ETHUSDT', addedAt: new Date().toISOString() },
    { symbol: 'SOLUSDT', addedAt: new Date().toISOString() },
  ],
  alerts: [],

  openPosition: (symbol, side, size, leverage, marginMode, tp, sl) => {
    const { balance, positions } = get();
    const price = priceEngine.getPrice(symbol);
    const notional = price * size;
    const margin = notional / leverage;
    const fee = notional * 0.0004; // 0.04% taker fee

    if (margin + fee > balance) {
      get().addNotification('error', 'Insufficient Margin', 'Not enough virtual balance to open this position.');
      return false;
    }

    const liquidationPrice = priceEngine.calculateLiquidationPrice(price, leverage, side, marginMode);

    const position: Position = {
      id: generateId(),
      symbol,
      side,
      size,
      entryPrice: price,
      markPrice: price,
      notional,
      margin,
      leverage,
      marginMode,
      unrealizedPnl: 0,
      roi: 0,
      liquidationPrice,
      takeProfit: tp,
      stopLoss: sl,
      openedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const trade: Trade = {
      id: generateId(),
      symbol,
      side,
      price,
      quantity: size,
      fee,
      realizedPnl: 0,
      orderId: '',
      positionId: position.id,
      timestamp: new Date().toISOString(),
    };

    set({
      balance: balance - margin - fee,
      positions: [...positions, position],
      trades: [...get().trades, trade],
    });

    get().addNotification('success', 'Position Opened', `${side.toUpperCase()} ${size} ${symbol} @ $${price.toFixed(2)}`);
    get().saveState();
    return true;
  },

  closePosition: (positionId) => {
    const { positions, balance, trades } = get();
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const currentPrice = priceEngine.getPrice(position.symbol);
    const pnl = priceEngine.calculatePnl(position.entryPrice, currentPrice, position.size, position.side);
    const fee = position.notional * 0.0004;
    const returnAmount = position.margin + pnl - fee;

    const trade: Trade = {
      id: generateId(),
      symbol: position.symbol,
      side: position.side === 'long' ? 'short' : 'long',
      price: currentPrice,
      quantity: position.size,
      fee,
      realizedPnl: pnl,
      orderId: '',
      positionId: position.id,
      timestamp: new Date().toISOString(),
    };

    set({
      positions: positions.filter(p => p.id !== positionId),
      balance: balance + Math.max(0, returnAmount),
      trades: [...trades, trade],
    });

    const pnlStr = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
    get().addNotification(pnl >= 0 ? 'success' : 'warning', 'Position Closed', `${position.symbol} ${pnlStr}`);
    get().saveState();
  },

  updatePositionTPSL: (positionId, tp, sl) => {
    const { positions } = get();
    set({
      positions: positions.map(p =>
        p.id === positionId ? { ...p, takeProfit: tp, stopLoss: sl, updatedAt: new Date().toISOString() } : p
      ),
    });
    get().addNotification('info', 'TP/SL Updated', 'Take profit and stop loss levels updated.');
    get().saveState();
  },

  addMargin: (positionId, amount) => {
    const { positions, balance } = get();
    if (amount > balance) {
      get().addNotification('error', 'Insufficient Balance', 'Not enough virtual balance.');
      return false;
    }
    set({
      positions: positions.map(p =>
        p.id === positionId ? { ...p, margin: p.margin + amount } : p
      ),
      balance: balance - amount,
    });
    get().addNotification('success', 'Margin Added', `$${amount.toFixed(2)} added to position.`);
    get().saveState();
    return true;
  },

  placeOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    set({ orders: [...get().orders, newOrder] });
    get().addNotification('info', 'Order Placed', `${order.side.toUpperCase()} ${order.type} order placed.`);
    get().saveState();
  },

  cancelOrder: (orderId) => {
    set({
      orders: get().orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o),
    });
    get().addNotification('info', 'Order Cancelled', 'Your order has been cancelled.');
    get().saveState();
  },

  getPortfolioStats: () => {
    const { balance, positions, trades } = get();
    const usedMargin = positions.reduce((sum, p) => sum + p.margin, 0);
    const unrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    const realizedPnl = trades.reduce((sum, t) => sum + t.realizedPnl, 0);
    const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);
    const totalEquity = balance + usedMargin + unrealizedPnl;
    const closedTrades = trades.filter(t => t.realizedPnl !== 0);
    const winningTrades = closedTrades.filter(t => t.realizedPnl > 0).length;
    const losingTrades = closedTrades.filter(t => t.realizedPnl < 0).length;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayPnl = trades.filter(t => new Date(t.timestamp).getTime() > todayStart).reduce((sum, t) => sum + t.realizedPnl, 0) + unrealizedPnl;
    const initialBalance = defaultCreatorConfig.startingBalance;
    const roi = ((totalEquity - initialBalance) / initialBalance) * 100;

    return {
      totalEquity,
      availableMargin: balance,
      usedMargin,
      unrealizedPnl,
      realizedPnl: realizedPnl - totalFees,
      todayPnl,
      roi,
      winRate: closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0,
      totalTrades: closedTrades.length,
      winningTrades,
      losingTrades,
    };
  },

  // Markets
  markets: [],
  updateMarkets: () => {
    set({ markets: priceEngine.getAllMarkets() });
  },

  // Notifications
  notifications: [],
  addNotification: (type, title, message) => {
    const notification: Notification = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set({ notifications: [notification, ...get().notifications].slice(0, 50) });
  },
  markNotificationRead: (id) => {
    set({ notifications: get().notifications.map(n => n.id === id ? { ...n, read: true } : n) });
  },
  clearNotifications: () => set({ notifications: [] }),

  // Creator
  creatorConfig: defaultCreatorConfig,
  updateCreatorConfig: (config) => {
    set({ creatorConfig: { ...get().creatorConfig, ...config } });
  },
  startSimulation: () => {
    const { creatorConfig } = get();
    set({
      creatorConfig: { ...creatorConfig, isRunning: true, isPaused: false },
      balance: creatorConfig.startingBalance,
      positions: [],
      trades: [],
      equityHistory: [{ time: Date.now(), equity: creatorConfig.startingBalance }],
    });
    priceEngine.setSpeed(creatorConfig.speed);
    priceEngine.setProfitScenario(creatorConfig.profitScenario, creatorConfig.takeProfit, creatorConfig.side);
    priceEngine.resetMarket('BTCUSDT', creatorConfig.entryPrice);
    get().saveState();
  },
  pauseSimulation: () => {
    set({ creatorConfig: { ...get().creatorConfig, isPaused: !get().creatorConfig.isPaused } });
  },
  resetSimulation: () => {
    set({
      creatorConfig: { ...get().creatorConfig, isRunning: false, isPaused: false },
      balance: defaultCreatorConfig.startingBalance,
      positions: [],
      trades: [],
      equityHistory: [],
    });
    priceEngine.setSpeed(1);
    priceEngine.setProfitScenario(false, 0, 'long');
    get().saveState();
  },

  // UI
  activeTab: 'trade',
  setActiveTab: (tab) => set({ activeTab: tab }),
  showMobileMenu: false,
  toggleMobileMenu: () => set({ showMobileMenu: !get().showMobileMenu }),

  // Persistence
  saveState: () => {
    const { balance, positions, orders, trades, equityHistory, watchlist, alerts, creatorConfig, user } = get();
    const state = { balance, positions, orders, trades, equityHistory, watchlist, alerts, creatorConfig };
    localStorage.setItem(`nexus_state_${user?.id || 'default'}`, JSON.stringify(state));
  },
  loadState: () => {
    const { user } = get();
    const saved = localStorage.getItem(`nexus_state_${user?.id || 'default'}`);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        set({
          balance: state.balance ?? 10000,
          positions: state.positions ?? [],
          orders: state.orders ?? [],
          trades: state.trades ?? [],
          equityHistory: state.equityHistory ?? [],
          watchlist: state.watchlist ?? [],
          alerts: state.alerts ?? [],
          creatorConfig: state.creatorConfig ?? defaultCreatorConfig,
        });
      } catch (e) { /* ignore */ }
    }
  },

  // Watchlist
  addToWatchlist: (symbol) => {
    const { watchlist } = get();
    if (!watchlist.find(w => w.symbol === symbol)) {
      set({ watchlist: [...watchlist, { symbol, addedAt: new Date().toISOString() }] });
      get().saveState();
    }
  },
  removeFromWatchlist: (symbol) => {
    set({ watchlist: get().watchlist.filter(w => w.symbol !== symbol) });
    get().saveState();
  },

  // Alerts
  addAlert: (symbol, price, direction) => {
    const alert: PriceAlert = {
      id: generateId(),
      symbol,
      price,
      direction,
      active: true,
      createdAt: new Date().toISOString(),
    };
    set({ alerts: [...get().alerts, alert] });
    get().saveState();
  },
  removeAlert: (id) => {
    set({ alerts: get().alerts.filter(a => a.id !== id) });
    get().saveState();
  },
}));
