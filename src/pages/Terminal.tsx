import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { priceEngine } from '../engine';
import TradingChart from '../components/TradingChart';
import OrderBook from '../components/OrderBook';
import OrderPanel from '../components/OrderPanel';
import PositionCard from '../components/PositionCard';
import { Search, Bell, User, ChevronDown, Star, ArrowUpDown, BarChart3, Clock, History, List, Settings, LogOut, Menu, X, TrendingUp, Briefcase, Eye } from 'lucide-react';

interface TerminalProps {
  onNavigate: (page: string) => void;
}

export default function Terminal({ onNavigate }: TerminalProps) {
  const {
    selectedSymbol, setSelectedSymbol, markets, updateMarkets, positions, balance,
    user, logout, notifications, activeTab, setActiveTab, watchlist,
    removeFromWatchlist, addToWatchlist, showMobileMenu, toggleMobileMenu, orders, trades,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('trade');
  const [positionsTab, setPositionsTab] = useState<'positions' | 'orders' | 'trades'>('positions');
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  // Price engine tick
  useEffect(() => {
    const tick = () => {
      priceEngine.tick();
      updateMarkets();
    };
    tickRef.current = setInterval(tick, 200);
    return () => clearInterval(tickRef.current);
  }, []);

  // Update positions with current prices
  useEffect(() => {
    const interval = setInterval(() => {
      const { positions: pos } = useStore.getState();
      if (pos.length === 0) return;

      const updatedPositions = pos.map(p => {
        const currentPrice = priceEngine.getPrice(p.symbol);
        const pnl = priceEngine.calculatePnl(p.entryPrice, currentPrice, p.size, p.side);
        const roi = priceEngine.calculateRoi(pnl, p.margin);
        const liquidationPrice = priceEngine.calculateLiquidationPrice(p.entryPrice, p.leverage, p.side, p.marginMode);
        const notional = currentPrice * p.size;

        // Check TP/SL/Liquidation
        const risk = priceEngine.checkPositionRisk(p, currentPrice);
        if (risk.liquidated) {
          useStore.getState().closePosition(p.id);
          useStore.getState().addNotification('error', 'Liquidation', `${p.symbol} position liquidated.`);
          return null;
        }
        if (risk.tpHit) {
          useStore.getState().closePosition(p.id);
          useStore.getState().addNotification('success', 'TP Reached', `${p.symbol} take profit hit!`);
          return null;
        }
        if (risk.slHit) {
          useStore.getState().closePosition(p.id);
          useStore.getState().addNotification('warning', 'SL Hit', `${p.symbol} stop loss triggered.`);
          return null;
        }

        return { ...p, markPrice: currentPrice, unrealizedPnl: pnl, roi, liquidationPrice, notional, updatedAt: new Date().toISOString() };
      }).filter(Boolean);

      useStore.setState({ positions: updatedPositions as any });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const selectedMarket = markets.find(m => m.symbol === selectedSymbol);
  const filteredMarkets = markets.filter(m =>
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (p: number, decimals?: number) => {
    const d = decimals || (p > 100 ? 2 : p > 1 ? 4 : 6);
    return p.toFixed(d);
  };

  const formatNumber = (n: number) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Desktop Layout
  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-[#2a3040] flex items-center px-3 bg-[#12161c] shrink-0">
        <div className="flex items-center gap-3 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#f0b90b] to-[#f7931a] flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">NX</span>
            </div>
            <span className="font-bold text-sm hidden md:block">NexusTrade</span>
          </div>

          {/* Symbol Selector */}
          <div className="relative">
            <button onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#1e2530] transition">
              <span className="font-semibold text-sm">{selectedSymbol}</span>
              <ChevronDown size={14} className="text-[#848e9c]" />
            </button>
            {showSearch && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-[#161b22] border border-[#2a3040] rounded-lg shadow-xl z-50 animate-fade-in">
                <div className="p-2 border-b border-[#2a3040]">
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                    <input type="text" placeholder="Search markets..." value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 text-xs" autoFocus />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredMarkets.map(m => (
                    <button key={m.symbol} onClick={() => { setSelectedSymbol(m.symbol); setShowSearch(false); setSearchQuery(''); }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1e2530] transition text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{m.symbol}</span>
                        <span className="text-[#848e9c]">Perpetual</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono">${formatPrice(m.lastPrice, m.priceDecimals)}</div>
                        <div className={`text-[10px] ${m.priceChangePercent24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                          {m.priceChangePercent24h >= 0 ? '+' : ''}{m.priceChangePercent24h.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Info */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div>
              <span className={`font-mono font-semibold ${selectedMarket && selectedMarket.priceChangePercent24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                ${selectedMarket ? formatPrice(selectedMarket.lastPrice, selectedMarket.priceDecimals) : '---'}
              </span>
            </div>
            <div>
              <span className="text-[#848e9c]">24h Change </span>
              <span className={selectedMarket && selectedMarket.priceChangePercent24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                {selectedMarket ? `${selectedMarket.priceChangePercent24h >= 0 ? '+' : ''}${selectedMarket.priceChangePercent24h.toFixed(2)}%` : '---'}
              </span>
            </div>
            <div>
              <span className="text-[#848e9c]">24h High </span>
              <span className="font-mono">{selectedMarket ? formatPrice(selectedMarket.high24h, selectedMarket.priceDecimals) : '---'}</span>
            </div>
            <div>
              <span className="text-[#848e9c]">24h Low </span>
              <span className="font-mono">{selectedMarket ? formatPrice(selectedMarket.low24h, selectedMarket.priceDecimals) : '---'}</span>
            </div>
            <div>
              <span className="text-[#848e9c]">24h Vol </span>
              <span className="font-mono">{selectedMarket ? formatNumber(selectedMarket.volume24h) : '---'}</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#0b0e11] rounded text-xs">
            <span className="text-[#848e9c] hidden sm:inline">Balance:</span>
            <span className="font-mono font-semibold text-[#f0b90b]">${balance.toFixed(2)}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-[#848e9c] hover:text-white transition relative">
              <Bell size={16} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#f6465d] rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {unreadNotifications}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-[#161b22] border border-[#2a3040] rounded-lg shadow-xl z-50 animate-fade-in">
                <div className="p-3 border-b border-[#2a3040] flex items-center justify-between">
                  <span className="text-xs font-semibold">Notifications</span>
                  <button onClick={() => useStore.getState().clearNotifications()} className="text-[10px] text-[#848e9c] hover:text-white">Clear all</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#848e9c]">No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div key={n.id} className={`px-3 py-2 border-b border-[#2a3040] text-xs ${!n.read ? 'bg-[#1a1f27]' : ''}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'success' ? 'bg-[#0ecb81]' : n.type === 'error' ? 'bg-[#f6465d]' : n.type === 'warning' ? 'bg-[#f0b90b]' : 'bg-[#1e88e5]'}`} />
                          <span className="font-medium">{n.title}</span>
                        </div>
                        <p className="text-[#848e9c] mt-0.5 ml-3.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-2 text-[#848e9c] hover:text-white transition">
              <User size={16} />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#161b22] border border-[#2a3040] rounded-lg shadow-xl z-50 animate-fade-in">
                <div className="p-3 border-b border-[#2a3040]">
                  <div className="text-xs font-semibold">{user?.username || 'Trader'}</div>
                  <div className="text-[10px] text-[#848e9c]">{user?.email}</div>
                </div>
                <button onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#848e9c] hover:bg-[#1e2530] hover:text-white transition">
                  <Settings size={14} /> Settings
                </button>
                <button onClick={() => { onNavigate('portfolio'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#848e9c] hover:bg-[#1e2530] hover:text-white transition">
                  <Briefcase size={14} /> Portfolio
                </button>
                <button onClick={() => { onNavigate('creator'); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#848e9c] hover:bg-[#1e2530] hover:text-white transition">
                  <Eye size={14} /> Creator Mode
                </button>
                <div className="border-t border-[#2a3040]">
                  <button onClick={() => { logout(); onNavigate('landing'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#f6465d] hover:bg-[#1e2530] transition">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <button onClick={toggleMobileMenu} className="md:hidden p-2 text-[#848e9c]">
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-12 border-r border-[#2a3040] bg-[#12161c] shrink-0">
          {[
            { id: 'trade', icon: BarChart3, label: 'Trade' },
            { id: 'markets', icon: ArrowUpDown, label: 'Markets' },
            { id: 'positions', icon: List, label: 'Positions' },
            { id: 'orders', icon: Clock, label: 'Orders' },
            { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'watchlist', icon: Star, label: 'Watchlist' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (['portfolio', 'settings'].includes(item.id)) onNavigate(item.id); }}
              className={`p-3 flex flex-col items-center gap-0.5 transition ${activeTab === item.id ? 'text-[#f0b90b] bg-[#1e2530]' : 'text-[#848e9c] hover:text-white hover:bg-[#1e2530]'}`}
              title={item.label}>
              <item.icon size={16} />
              <span className="text-[8px]">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Trading Area */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Chart Section */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 min-h-[250px] lg:min-h-0">
              <TradingChart symbol={selectedSymbol} />
            </div>

            {/* Bottom Panel - Positions/Orders */}
            <div className="h-48 lg:h-56 border-t border-[#2a3040] bg-[#0b0e11] overflow-hidden flex flex-col">
              <div className="flex border-b border-[#2a3040] shrink-0">
                {(['positions', 'orders', 'trades'] as const).map(tab => (
                  <button key={tab} onClick={() => setPositionsTab(tab)}
                    className={`px-4 py-2 text-xs font-medium capitalize transition ${positionsTab === tab ? 'text-[#eaecef] border-b-2 border-[#f0b90b]' : 'text-[#848e9c] hover:text-white'}`}>
                    {tab} {tab === 'positions' && `(${positions.length})`}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {positionsTab === 'positions' && (
                  positions.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-[#848e9c]">No open positions</div>
                  ) : (
                    <div className="p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                      {positions.map(p => <PositionCard key={p.id} position={p} />)}
                    </div>
                  )
                )}
                {positionsTab === 'orders' && (
                  orders.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-[#848e9c]">No open orders</div>
                  ) : (
                    <table className="w-full text-[11px]">
                      <thead className="text-[#848e9c] border-b border-[#2a3040]">
                        <tr>
                          <th className="text-left px-3 py-2 font-normal">Pair</th>
                          <th className="text-left px-3 py-2 font-normal">Side</th>
                          <th className="text-left px-3 py-2 font-normal">Type</th>
                          <th className="text-right px-3 py-2 font-normal">Price</th>
                          <th className="text-right px-3 py-2 font-normal">Qty</th>
                          <th className="text-center px-3 py-2 font-normal">Status</th>
                          <th className="text-right px-3 py-2 font-normal">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.status === 'open').map(o => (
                          <tr key={o.id} className="border-b border-[#2a3040] hover:bg-[#1e2530]">
                            <td className="px-3 py-1.5 font-medium">{o.symbol}</td>
                            <td className={`px-3 py-1.5 capitalize ${o.side === 'long' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{o.side}</td>
                            <td className="px-3 py-1.5 capitalize">{o.type}</td>
                            <td className="px-3 py-1.5 text-right font-mono">{formatPrice(o.price)}</td>
                            <td className="px-3 py-1.5 text-right font-mono">{o.quantity}</td>
                            <td className="px-3 py-1.5 text-center"><span className="px-1.5 py-0.5 rounded bg-[#2a3040] text-[10px]">{o.status}</span></td>
                            <td className="px-3 py-1.5 text-right">
                              <button onClick={() => useStore.getState().cancelOrder(o.id)} className="text-[#f6465d] hover:underline text-[10px]">Cancel</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
                {positionsTab === 'trades' && (
                  trades.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-[#848e9c]">No trade history</div>
                  ) : (
                    <table className="w-full text-[11px]">
                      <thead className="text-[#848e9c] border-b border-[#2a3040]">
                        <tr>
                          <th className="text-left px-3 py-2 font-normal">Pair</th>
                          <th className="text-left px-3 py-2 font-normal">Side</th>
                          <th className="text-right px-3 py-2 font-normal">Price</th>
                          <th className="text-right px-3 py-2 font-normal">Qty</th>
                          <th className="text-right px-3 py-2 font-normal">Fee</th>
                          <th className="text-right px-3 py-2 font-normal">Realized PnL</th>
                          <th className="text-right px-3 py-2 font-normal">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trades.slice().reverse().map(t => (
                          <tr key={t.id} className="border-b border-[#2a3040] hover:bg-[#1e2530]">
                            <td className="px-3 py-1.5 font-medium">{t.symbol}</td>
                            <td className={`px-3 py-1.5 capitalize ${t.side === 'long' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{t.side}</td>
                            <td className="px-3 py-1.5 text-right font-mono">{formatPrice(t.price)}</td>
                            <td className="px-3 py-1.5 text-right font-mono">{t.quantity}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-[#848e9c]">${t.fee.toFixed(2)}</td>
                            <td className={`px-3 py-1.5 text-right font-mono ${t.realizedPnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                              {t.realizedPnl !== 0 ? `${t.realizedPnl >= 0 ? '+' : ''}$${t.realizedPnl.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-3 py-1.5 text-right text-[#848e9c]">{new Date(t.timestamp).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Order Book & Order Entry */}
          <div className="hidden lg:flex flex-col w-[280px] border-l border-[#2a3040] shrink-0">
            <div className="flex-1 min-h-0 border-b border-[#2a3040]">
              <OrderBook symbol={selectedSymbol} />
            </div>
            <div className="h-[400px] relative overflow-y-auto">
              <OrderPanel symbol={selectedSymbol} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden flex items-center justify-around border-t border-[#2a3040] bg-[#12161c] h-14 shrink-0">
        {[
          { id: 'home', icon: TrendingUp, label: 'Chart' },
          { id: 'orderbook', icon: ArrowUpDown, label: 'Book' },
          { id: 'trade', icon: BarChart3, label: 'Trade' },
          { id: 'positions', icon: List, label: 'Positions' },
          { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
        ].map(item => (
          <button key={item.id} onClick={() => { setActiveBottomTab(item.id); if (item.id === 'portfolio') onNavigate('portfolio'); }}
            className={`flex flex-col items-center gap-0.5 p-2 ${activeBottomTab === item.id ? 'text-[#f0b90b]' : 'text-[#848e9c]'}`}>
            <item.icon size={18} />
            <span className="text-[9px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Panels */}
      {activeBottomTab === 'orderbook' && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0b0e11] pt-12 pb-14 overflow-y-auto">
          <OrderBook symbol={selectedSymbol} />
        </div>
      )}
      {activeBottomTab === 'trade' && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0b0e11] pt-12 pb-14 overflow-y-auto">
          <OrderPanel symbol={selectedSymbol} />
        </div>
      )}
      {activeBottomTab === 'positions' && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0b0e11] pt-12 pb-14 overflow-y-auto p-3">
          {positions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-[#848e9c]">No open positions</div>
          ) : (
            <div className="space-y-3">
              {positions.map(p => <PositionCard key={p.id} position={p} />)}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={toggleMobileMenu}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#12161c] border-l border-[#2a3040] p-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-sm">Menu</span>
              <button onClick={toggleMobileMenu}><X size={18} /></button>
            </div>
            <div className="space-y-1">
              {[
                { id: 'trade', label: 'Trading Terminal', icon: BarChart3 },
                { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'creator', label: 'Creator Mode', icon: Eye },
              ].map(item => (
                <button key={item.id} onClick={() => { onNavigate(item.id); toggleMobileMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#848e9c] hover:text-white hover:bg-[#1e2530] rounded transition">
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
              <div className="border-t border-[#2a3040] mt-3 pt-3">
                <button onClick={() => { logout(); onNavigate('landing'); toggleMobileMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#f6465d] hover:bg-[#1e2530] rounded transition">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-14 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.filter(n => !n.read).slice(0, 3).map(n => (
          <div key={n.id} className={`notification-toast pointer-events-auto px-4 py-2 rounded-lg border text-xs max-w-xs shadow-xl
            ${n.type === 'success' ? 'bg-[#0ecb81]/10 border-[#0ecb81]/30 text-[#0ecb81]' :
              n.type === 'error' ? 'bg-[#f6465d]/10 border-[#f6465d]/30 text-[#f6465d]' :
              n.type === 'warning' ? 'bg-[#f0b90b]/10 border-[#f0b90b]/30 text-[#f0b90b]' :
              'bg-[#1e88e5]/10 border-[#1e88e5]/30 text-[#1e88e5]'}`}>
            <div className="font-semibold">{n.title}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
