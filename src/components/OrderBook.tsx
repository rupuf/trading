import React, { useEffect, useState } from 'react';
import { priceEngine } from '../engine';
import { OrderBook as OrderBookType } from '../types';

interface OrderBookProps {
  symbol: string;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookType>({ asks: [], bids: [], spread: 0, spreadPercent: 0 });
  const [displayMode, setDisplayMode] = useState<'both' | 'asks' | 'bids'>('both');

  useEffect(() => {
    const update = () => {
      setOrderBook(priceEngine.generateOrderBook(symbol));
    };
    update();
    const interval = setInterval(update, 300);
    return () => clearInterval(interval);
  }, [symbol]);

  const maxTotal = Math.max(
    ...orderBook.asks.map(a => a.total),
    ...orderBook.bids.map(b => b.total),
    1
  );

  const formatPrice = (price: number) => {
    if (price > 100) return price.toFixed(2);
    if (price > 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const displayAsks = displayMode === 'bids' ? [] : orderBook.asks.slice(-12);
  const displayBids = displayMode === 'asks' ? [] : orderBook.bids.slice(0, 12);

  return (
    <div className="flex flex-col h-full bg-[#0b0e11]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a3040]">
        <span className="text-xs font-semibold text-[#eaecef]">Order Book</span>
        <div className="flex gap-1">
          <button onClick={() => setDisplayMode('both')} className={`p-1 rounded ${displayMode === 'both' ? 'bg-[#2a3040]' : ''}`}>
            <div className="w-3 h-3 flex flex-col gap-px">
              <div className="flex-1 bg-[#f6465d] rounded-sm" />
              <div className="flex-1 bg-[#0ecb81] rounded-sm" />
            </div>
          </button>
          <button onClick={() => setDisplayMode('asks')} className={`p-1 rounded ${displayMode === 'asks' ? 'bg-[#2a3040]' : ''}`}>
            <div className="w-3 h-3 bg-[#f6465d] rounded-sm" />
          </button>
          <button onClick={() => setDisplayMode('bids')} className={`p-1 rounded ${displayMode === 'bids' ? 'bg-[#2a3040]' : ''}`}>
            <div className="w-3 h-3 bg-[#0ecb81] rounded-sm" />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-[10px] text-[#5e6673] border-b border-[#2a3040]">
        <span>Price(USDT)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end">
        {displayAsks.map((ask, i) => (
          <div key={`ask-${i}`} className="relative grid grid-cols-3 px-3 py-[2px] text-[11px] font-mono orderbook-row hover:bg-[#1e2530]">
            <div className="absolute inset-0 depth-bar-ask" style={{ width: `${(ask.total / maxTotal) * 100}%`, marginLeft: 'auto' }} />
            <span className="text-[#f6465d] relative z-10">{formatPrice(ask.price)}</span>
            <span className="text-right text-[#eaecef] relative z-10">{ask.size.toFixed(4)}</span>
            <span className="text-right text-[#848e9c] relative z-10">{ask.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="px-3 py-1.5 border-y border-[#2a3040] bg-[#12161c] flex items-center justify-between">
        <span className="text-sm font-mono font-semibold text-[#0ecb81]">
          {formatPrice(priceEngine.getPrice(symbol))}
        </span>
        <span className="text-[10px] text-[#848e9c]">
          Spread: {orderBook.spread.toFixed(2)} ({orderBook.spreadPercent.toFixed(3)}%)
        </span>
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {displayBids.map((bid, i) => (
          <div key={`bid-${i}`} className="relative grid grid-cols-3 px-3 py-[2px] text-[11px] font-mono orderbook-row hover:bg-[#1e2530]">
            <div className="absolute inset-0 depth-bar-bid" style={{ width: `${(bid.total / maxTotal) * 100}%` }} />
            <span className="text-[#0ecb81] relative z-10">{formatPrice(bid.price)}</span>
            <span className="text-right text-[#eaecef] relative z-10">{bid.size.toFixed(4)}</span>
            <span className="text-right text-[#848e9c] relative z-10">{bid.total.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
