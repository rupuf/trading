import React, { useState } from 'react';
import { useStore } from '../store';
import { priceEngine } from '../engine';
import { OrderType, Side, MarginMode } from '../types';
import { AlertTriangle } from 'lucide-react';

interface OrderPanelProps {
  symbol: string;
}

const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 20, 25, 50];

export default function OrderPanel({ symbol }: OrderPanelProps) {
  const { balance, openPosition, positions } = useStore();
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<Side>('long');
  const [marginMode, setMarginMode] = useState<MarginMode>('isolated');
  const [leverage, setLeverage] = useState(10);
  const [size, setSize] = useState('0.01');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentPrice = priceEngine.getPrice(symbol);
  const sizeNum = parseFloat(size) || 0;
  const entryPrice = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const notional = entryPrice * sizeNum;
  const margin = notional / leverage;
  const fee = notional * 0.0004;
  const liquidationPrice = priceEngine.calculateLiquidationPrice(entryPrice, leverage, side, marginMode);

  const hasExistingPosition = positions.some(p => p.symbol === symbol);

  const handleSubmit = () => {
    if (sizeNum <= 0) return;
    if (orderType === 'market') {
      const success = openPosition(
        symbol,
        side,
        sizeNum,
        leverage,
        marginMode,
        takeProfit ? parseFloat(takeProfit) : undefined,
        stopLoss ? parseFloat(stopLoss) : undefined,
      );
      if (success) {
        setSize('0.01');
        setTakeProfit('');
        setStopLoss('');
      }
    } else {
      setShowConfirm(true);
    }
  };

  const confirmOrder = () => {
    openPosition(
      symbol,
      side,
      sizeNum,
      leverage,
      marginMode,
      takeProfit ? parseFloat(takeProfit) : undefined,
      stopLoss ? parseFloat(stopLoss) : undefined,
    );
    setShowConfirm(false);
    setSize('0.01');
    setTakeProfit('');
    setStopLoss('');
  };

  const formatPrice = (p: number) => {
    if (p > 100) return p.toFixed(2);
    if (p > 1) return p.toFixed(4);
    return p.toFixed(6);
  };

  const percentButtons = [25, 50, 75, 100];
  const maxNotional = balance * leverage;
  const maxSize = maxNotional / currentPrice;

  return (
    <div className="flex flex-col h-full bg-[#0b0e11]">
      {/* Order Type Tabs */}
      <div className="flex border-b border-[#2a3040]">
        {(['market', 'limit', 'stop'] as OrderType[]).map(type => (
          <button key={type} onClick={() => setOrderType(type)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition ${orderType === type ? 'text-[#eaecef] border-b-2 border-[#f0b90b]' : 'text-[#848e9c] hover:text-white'}`}>
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Buy/Sell Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-[#12161c] rounded p-0.5">
          <button onClick={() => setSide('long')}
            className={`py-2 text-xs font-semibold rounded transition ${side === 'long' ? 'bg-[#0ecb81] text-black' : 'text-[#848e9c] hover:text-white'}`}>
            Long
          </button>
          <button onClick={() => setSide('short')}
            className={`py-2 text-xs font-semibold rounded transition ${side === 'short' ? 'bg-[#f6465d] text-white' : 'text-[#848e9c] hover:text-white'}`}>
            Short
          </button>
        </div>

        {/* Margin Mode */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#848e9c]">Margin</span>
          <div className="flex gap-1">
            {(['isolated', 'cross'] as MarginMode[]).map(mode => (
              <button key={mode} onClick={() => setMarginMode(mode)}
                className={`px-2 py-1 text-[10px] rounded capitalize transition ${marginMode === mode ? 'bg-[#2a3040] text-white' : 'text-[#848e9c] hover:text-white'}`}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Leverage */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#848e9c]">Leverage</span>
            <span className="text-xs font-semibold text-[#f0b90b]">{leverage}x</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {LEVERAGE_OPTIONS.map(lev => (
              <button key={lev} onClick={() => setLeverage(lev)}
                className={`px-2 py-1 text-[10px] rounded transition ${leverage === lev ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#12161c] text-[#848e9c] hover:text-white border border-[#2a3040]'}`}>
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* Price (for limit/stop) */}
        {orderType === 'limit' && (
          <div>
            <label className="text-xs text-[#848e9c] mb-1 block">Price (USDT)</label>
            <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              placeholder={formatPrice(currentPrice)} className="w-full text-sm" />
          </div>
        )}
        {orderType === 'stop' && (
          <div>
            <label className="text-xs text-[#848e9c] mb-1 block">Stop Price</label>
            <input type="number" value={stopPrice} onChange={e => setStopPrice(e.target.value)}
              placeholder={formatPrice(currentPrice)} className="w-full text-sm" />
          </div>
        )}

        {/* Size */}
        <div>
          <label className="text-xs text-[#848e9c] mb-1 block">Size ({symbol.replace('USDT', '')})</label>
          <input type="number" value={size} onChange={e => setSize(e.target.value)}
            step="0.001" className="w-full text-sm" />
          <div className="flex gap-1 mt-1">
            {percentButtons.map(pct => (
              <button key={pct} onClick={() => setSize((maxSize * pct / 100).toFixed(4))}
                className="flex-1 py-1 text-[10px] bg-[#12161c] border border-[#2a3040] rounded text-[#848e9c] hover:text-white transition">
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* TP/SL */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#848e9c] mb-1 block">TP</label>
            <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
              placeholder="Take Profit" className="w-full text-xs" />
          </div>
          <div>
            <label className="text-xs text-[#848e9c] mb-1 block">SL</label>
            <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
              placeholder="Stop Loss" className="w-full text-xs" />
          </div>
        </div>

        {/* Reduce Only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={reduceOnly} onChange={e => setReduceOnly(e.target.checked)}
            className="w-3 h-3 rounded border-[#2a3040]" />
          <span className="text-xs text-[#848e9c]">Reduce Only</span>
        </label>

        {/* Order Summary */}
        <div className="bg-[#12161c] rounded p-2 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#848e9c]">Entry Price</span>
            <span className="font-mono">${formatPrice(entryPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#848e9c]">Position Size</span>
            <span className="font-mono">${notional.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#848e9c]">Margin Required</span>
            <span className="font-mono">${margin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#848e9c]">Est. Fee</span>
            <span className="font-mono">${fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#848e9c]">Liq. Price</span>
            <span className="font-mono text-[#f6465d]">${formatPrice(liquidationPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#848e9c]">Available</span>
            <span className="font-mono">${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button onClick={handleSubmit}
          disabled={sizeNum <= 0 || margin + fee > balance || (reduceOnly && !hasExistingPosition)}
          className={`w-full py-2.5 rounded text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${side === 'long' ? 'btn-green' : 'btn-red'}`}>
          {side === 'long' ? `OPEN LONG` : `OPEN SHORT`}
        </button>

        {margin + fee > balance && (
          <div className="flex items-center gap-1 text-[10px] text-[#f6465d]">
            <AlertTriangle size={12} /> Insufficient margin
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30 p-4">
          <div className="bg-[#161b22] border border-[#2a3040] rounded-lg p-4 w-full max-w-xs animate-slide-up">
            <h3 className="font-semibold text-sm mb-3">Confirm Order</h3>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between"><span className="text-[#848e9c]">Pair</span><span>{symbol}</span></div>
              <div className="flex justify-between"><span className="text-[#848e9c]">Type</span><span className="capitalize">{orderType}</span></div>
              <div className="flex justify-between"><span className="text-[#848e9c]">Side</span><span className={side === 'long' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>{side.toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-[#848e9c]">Size</span><span>{sizeNum} {symbol.replace('USDT', '')}</span></div>
              <div className="flex justify-between"><span className="text-[#848e9c]">Leverage</span><span>{leverage}x</span></div>
              <div className="flex justify-between"><span className="text-[#848e9c]">Margin</span><span>${margin.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 text-xs border border-[#2a3040] rounded hover:bg-[#1e2530] transition">Cancel</button>
              <button onClick={confirmOrder} className={`flex-1 py-2 text-xs rounded font-semibold ${side === 'long' ? 'btn-green' : 'btn-red'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
