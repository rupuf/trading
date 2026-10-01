import React, { useState } from 'react';
import { useStore } from '../store';
import { Position } from '../types';
import { X, Edit2, Plus, Minus, AlertTriangle } from 'lucide-react';

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const { closePosition, updatePositionTPSL, addMargin } = useStore();
  const [showTPSL, setShowTPSL] = useState(false);
  const [showAddMargin, setShowAddMargin] = useState(false);
  const [tp, setTp] = useState(position.takeProfit?.toString() || '');
  const [sl, setSl] = useState(position.stopLoss?.toString() || '');
  const [marginAmount, setMarginAmount] = useState('');

  const formatPrice = (p: number) => {
    if (p > 100) return p.toFixed(2);
    if (p > 1) return p.toFixed(4);
    return p.toFixed(6);
  };

  const handleUpdateTPSL = () => {
    updatePositionTPSL(
      position.id,
      tp ? parseFloat(tp) : undefined,
      sl ? parseFloat(sl) : undefined,
    );
    setShowTPSL(false);
  };

  const handleAddMargin = () => {
    const amount = parseFloat(marginAmount);
    if (amount > 0) {
      addMargin(position.id, amount);
      setMarginAmount('');
      setShowAddMargin(false);
    }
  };

  const pnlColor = position.unrealizedPnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]';
  const roiColor = position.roi >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]';

  return (
    <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{position.symbol}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${position.side === 'long' ? 'bg-[#0ecb81]/10 text-[#0ecb81]' : 'bg-[#f6465d]/10 text-[#f6465d]'}`}>
            {position.side.toUpperCase()} {position.leverage}x
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a3040] text-[#848e9c] capitalize">
            {position.marginMode}
          </span>
        </div>
        <button onClick={() => closePosition(position.id)} className="p-1 text-[#848e9c] hover:text-[#f6465d] transition" title="Close Position">
          <X size={14} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] mb-2">
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Size</span>
          <span className="font-mono">{position.size.toFixed(4)} {position.symbol.replace('USDT', '')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Entry</span>
          <span className="font-mono">${formatPrice(position.entryPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Mark</span>
          <span className="font-mono">${formatPrice(position.markPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Notional</span>
          <span className="font-mono">${position.notional.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Margin</span>
          <span className="font-mono">${position.margin.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Liq. Price</span>
          <span className="font-mono text-[#f6465d]">${formatPrice(position.liquidationPrice)}</span>
        </div>
      </div>

      {/* PnL */}
      <div className="flex items-center justify-between py-2 border-t border-[#2a3040]">
        <div>
          <div className="text-[10px] text-[#848e9c]">Unrealized PnL</div>
          <div className={`text-sm font-semibold font-mono ${pnlColor}`}>
            {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[#848e9c]">ROI</div>
          <div className={`text-sm font-semibold font-mono ${roiColor}`}>
            {position.roi >= 0 ? '+' : ''}{position.roi.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* TP/SL */}
      {(position.takeProfit || position.stopLoss) && (
        <div className="flex gap-2 mt-2 text-[10px]">
          {position.takeProfit && (
            <span className="px-2 py-0.5 rounded bg-[#0ecb81]/10 text-[#0ecb81]">
              TP: ${formatPrice(position.takeProfit)}
            </span>
          )}
          {position.stopLoss && (
            <span className="px-2 py-0.5 rounded bg-[#f6465d]/10 text-[#f6465d]">
              SL: ${formatPrice(position.stopLoss)}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 mt-3">
        <button onClick={() => setShowTPSL(!showTPSL)}
          className="flex-1 py-1.5 text-[10px] rounded border border-[#2a3040] text-[#848e9c] hover:text-white hover:border-[#f0b90b] transition flex items-center justify-center gap-1">
          <Edit2 size={10} /> TP/SL
        </button>
        <button onClick={() => setShowAddMargin(!showAddMargin)}
          className="flex-1 py-1.5 text-[10px] rounded border border-[#2a3040] text-[#848e9c] hover:text-white hover:border-[#f0b90b] transition flex items-center justify-center gap-1">
          <Plus size={10} /> Margin
        </button>
        <button onClick={() => closePosition(position.id)}
          className="flex-1 py-1.5 text-[10px] rounded bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/30 hover:bg-[#f6465d]/20 transition">
          Close
        </button>
      </div>

      {/* TP/SL Edit */}
      {showTPSL && (
        <div className="mt-3 p-2 bg-[#0b0e11] rounded border border-[#2a3040] space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#0ecb81]">Take Profit</label>
              <input type="number" value={tp} onChange={e => setTp(e.target.value)}
                placeholder={formatPrice(position.markPrice * 1.02)} className="w-full text-xs mt-0.5" />
            </div>
            <div>
              <label className="text-[10px] text-[#f6465d]">Stop Loss</label>
              <input type="number" value={sl} onChange={e => setSl(e.target.value)}
                placeholder={formatPrice(position.markPrice * 0.98)} className="w-full text-xs mt-0.5" />
            </div>
          </div>
          <button onClick={handleUpdateTPSL} className="w-full py-1.5 text-[10px] rounded bg-[#f0b90b] text-black font-semibold">
            Update TP/SL
          </button>
        </div>
      )}

      {/* Add Margin */}
      {showAddMargin && (
        <div className="mt-3 p-2 bg-[#0b0e11] rounded border border-[#2a3040] space-y-2 animate-fade-in">
          <label className="text-[10px] text-[#848e9c]">Add Margin (USDT)</label>
          <input type="number" value={marginAmount} onChange={e => setMarginAmount(e.target.value)}
            placeholder="0.00" className="w-full text-xs" />
          <button onClick={handleAddMargin} className="w-full py-1.5 text-[10px] rounded bg-[#f0b90b] text-black font-semibold">
            Add Margin
          </button>
        </div>
      )}

      {/* Liquidation Warning */}
      {position.roi < -50 && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#f6465d] bg-[#f6465d]/10 rounded p-1.5">
          <AlertTriangle size={12} />
          High risk of liquidation
        </div>
      )}
    </div>
  );
}
