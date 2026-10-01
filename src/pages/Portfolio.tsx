import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PortfolioProps {
  onNavigate: (page: string) => void;
}

export default function Portfolio({ onNavigate }: PortfolioProps) {
  const { getPortfolioStats, positions, trades, equityHistory, balance } = useStore();
  const [stats, setStats] = useState(getPortfolioStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getPortfolioStats());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const chartData = equityHistory.length > 0 ? equityHistory.map(e => ({
    time: new Date(e.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    equity: e.equity,
  })) : [{ time: 'Now', equity: balance }];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#12161c] border-b border-[#2a3040] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('terminal')} className="p-1 text-[#848e9c] hover:text-white transition">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold">Portfolio</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#848e9c]">Virtual Balance</span>
            <span className="text-sm font-mono font-semibold text-[#f0b90b]">${balance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={DollarSign} label="Total Equity" value={`$${stats.totalEquity.toFixed(2)}`} color="text-[#f0b90b]" />
          <StatCard icon={TrendingUp} label="Unrealized PnL" value={`${stats.unrealizedPnl >= 0 ? '+' : ''}$${stats.unrealizedPnl.toFixed(2)}`} color={stats.unrealizedPnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'} />
          <StatCard icon={TrendingDown} label="Realized PnL" value={`${stats.realizedPnl >= 0 ? '+' : ''}$${stats.realizedPnl.toFixed(2)}`} color={stats.realizedPnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'} />
          <StatCard icon={BarChart3} label="Today's PnL" value={`${stats.todayPnl >= 0 ? '+' : ''}$${stats.todayPnl.toFixed(2)}`} color={stats.todayPnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'} />
        </div>

        {/* Equity Curve */}
        <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Equity Curve</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0b90b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f0b90b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#848e9c' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#848e9c' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #2a3040', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#848e9c' }}
                  itemStyle={{ color: '#f0b90b' }}
                />
                <Area type="monotone" dataKey="equity" stroke="#f0b90b" strokeWidth={2} fill="url(#equityGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Target} label="ROI" value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(2)}%`} color={stats.roi >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'} />
          <StatCard icon={Award} label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} color="text-[#1e88e5]" />
          <StatCard icon={BarChart3} label="Total Trades" value={stats.totalTrades.toString()} color="text-[#eaecef]" />
          <StatCard icon={DollarSign} label="Available Margin" value={`$${stats.availableMargin.toFixed(2)}`} color="text-[#848e9c]" />
        </div>

        {/* Margin Info */}
        <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Margin Overview</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#848e9c]">Used Margin</span>
              <span className="font-mono">${stats.usedMargin.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#848e9c]">Available Margin</span>
              <span className="font-mono">${stats.availableMargin.toFixed(2)}</span>
            </div>
            <div className="w-full bg-[#0b0e11] rounded-full h-2 mt-2">
              <div className="bg-[#f0b90b] h-2 rounded-full transition-all" style={{ width: `${stats.totalEquity > 0 ? (stats.usedMargin / stats.totalEquity) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#848e9c]">
              <span>Free: {stats.totalEquity > 0 ? ((stats.availableMargin / stats.totalEquity) * 100).toFixed(1) : 100}%</span>
              <span>Used: {stats.totalEquity > 0 ? ((stats.usedMargin / stats.totalEquity) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        {positions.length > 0 && (
          <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Open Positions ({positions.length})</h3>
            <div className="space-y-2">
              {positions.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-[#0b0e11] rounded text-xs">
                  <div>
                    <span className="font-semibold">{p.symbol}</span>
                    <span className={`ml-2 text-[10px] px-1 py-0.5 rounded ${p.side === 'long' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
                      {p.side.toUpperCase()} {p.leverage}x
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono ${p.unrealizedPnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                      {p.unrealizedPnl >= 0 ? '+' : ''}${p.unrealizedPnl.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#848e9c]">{p.roi >= 0 ? '+' : ''}{p.roi.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade History */}
        {trades.length > 0 && (
          <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="text-[#848e9c] border-b border-[#2a3040]">
                  <tr>
                    <th className="text-left py-2 font-normal">Pair</th>
                    <th className="text-left py-2 font-normal">Side</th>
                    <th className="text-right py-2 font-normal">Price</th>
                    <th className="text-right py-2 font-normal">Qty</th>
                    <th className="text-right py-2 font-normal">PnL</th>
                    <th className="text-right py-2 font-normal">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice().reverse().slice(0, 10).map(t => (
                    <tr key={t.id} className="border-b border-[#2a3040]">
                      <td className="py-1.5 font-medium">{t.symbol}</td>
                      <td className={`py-1.5 capitalize ${t.side === 'long' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{t.side}</td>
                      <td className="py-1.5 text-right font-mono">{t.price > 100 ? t.price.toFixed(2) : t.price.toFixed(4)}</td>
                      <td className="py-1.5 text-right font-mono">{t.quantity}</td>
                      <td className={`py-1.5 text-right font-mono ${t.realizedPnl > 0 ? 'text-[#0ecb81]' : t.realizedPnl < 0 ? 'text-[#f6465d]' : 'text-[#848e9c]'}`}>
                        {t.realizedPnl !== 0 ? `${t.realizedPnl >= 0 ? '+' : ''}$${t.realizedPnl.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-1.5 text-right text-[#848e9c]">{new Date(t.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Virtual Funds Notice */}
        <div className="bg-[#f0b90b]/5 border border-[#f0b90b]/20 rounded-lg p-4 text-center">
          <p className="text-xs text-[#f0b90b]">
            ⚠️ All balances and trades shown are virtual. This is a trading simulator with no real money involved.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-[#848e9c]" />
        <span className="text-[10px] text-[#848e9c]">{label}</span>
      </div>
      <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}
