import { Candle, Market, OrderBook, OrderBookEntry, Position, Side } from '../types';

const TIMEFRAME_MS: Record<string, number> = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1H': 3600000,
  '4H': 14400000,
  '1D': 86400000,
  '1W': 604800000,
};

export class PriceEngine {
  private prices: Map<string, number> = new Map();
  private candles: Map<string, Candle[]> = new Map();
  private volatility: Map<string, number> = new Map();
  private trend: Map<string, number> = new Map();
  private lastTick: Map<string, number> = new Map();
  private speed: number = 1;
  private profitScenario: boolean = false;
  private targetPrice: number = 0;
  private targetDirection: Side = 'long';

  constructor() {
    this.initializeMarkets();
  }

  private initializeMarkets() {
    const markets: [string, number, number][] = [
      ['BTCUSDT', 83500, 0.02],
      ['ETHUSDT', 3450, 0.025],
      ['SOLUSDT', 178, 0.035],
      ['BNBUSDT', 605, 0.022],
      ['XRPUSDT', 0.62, 0.03],
      ['DOGEUSDT', 0.165, 0.04],
      ['ADAUSDT', 0.48, 0.032],
      ['AVAXUSDT', 38.5, 0.033],
      ['DOTUSDT', 7.2, 0.028],
      ['LINKUSDT', 14.8, 0.03],
    ];

    markets.forEach(([symbol, price, vol]) => {
      this.prices.set(symbol, price);
      this.volatility.set(symbol, vol);
      this.trend.set(symbol, 0);
      this.lastTick.set(symbol, Date.now());
      this.generateHistoricalCandles(symbol, price, vol);
    });
  }

  private generateHistoricalCandles(symbol: string, basePrice: number, vol: number) {
    const candles: Candle[] = [];
    let price = basePrice * (0.9 + Math.random() * 0.2);
    const now = Date.now();
    const interval = TIMEFRAME_MS['1m'];
    const count = 500;

    for (let i = count; i >= 0; i--) {
      const time = now - i * interval;
      const change = (Math.random() - 0.48) * vol * price;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.5;
      const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.5;
      const volume = (Math.random() * 1000 + 100) * (1 + Math.abs(change / price) * 10);

      candles.push({
        time: Math.floor(time / 1000),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(2)),
      });

      price = close;
    }

    // Ensure last candle matches current price
    if (candles.length > 0) {
      price = this.prices.get(symbol) || basePrice;
      candles[candles.length - 1].close = price;
    }

    this.candles.set(symbol, candles);
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setProfitScenario(enabled: boolean, targetPrice: number, direction: Side) {
    this.profitScenario = enabled;
    this.targetPrice = targetPrice;
    this.targetDirection = direction;
  }

  tick(symbol?: string): void {
    const symbols = symbol ? [symbol] : Array.from(this.prices.keys());

    symbols.forEach(sym => {
      const currentPrice = this.prices.get(sym)!;
      const vol = this.volatility.get(sym)!;
      let trendBias = this.trend.get(sym)!;

      // Random walk with mean reversion
      let change: number;
      if (this.profitScenario && this.targetPrice > 0) {
        const distance = this.targetPrice - currentPrice;
        const direction = this.targetDirection === 'long' ? 1 : -1;
        const progressNeeded = direction * distance;
        if (progressNeeded > 0) {
          // Move toward target
          change = (distance * 0.002 + (Math.random() - 0.3) * vol * currentPrice * 0.3) * this.speed;
        } else {
          change = (Math.random() - 0.5) * vol * currentPrice * 0.5 * this.speed;
        }
      } else {
        // Normal random walk
        trendBias += (Math.random() - 0.5) * 0.001;
        trendBias = Math.max(-0.005, Math.min(0.005, trendBias));
        this.trend.set(sym, trendBias);

        change = ((Math.random() - 0.5) * 2 * vol + trendBias) * currentPrice * 0.1 * this.speed;
      }

      const newPrice = Math.max(currentPrice * 0.5, currentPrice + change);
      this.prices.set(sym, parseFloat(newPrice.toFixed(8)));

      // Update current candle
      this.updateCandle(sym, newPrice);
      this.lastTick.set(sym, Date.now());
    });
  }

  private updateCandle(symbol: string, price: number) {
    const candles = this.candles.get(symbol);
    if (!candles || candles.length === 0) return;

    const lastCandle = candles[candles.length - 1];
    const now = Math.floor(Date.now() / 1000);
    const interval = TIMEFRAME_MS['1m'] / 1000;

    if (now - lastCandle.time >= interval) {
      // New candle
      candles.push({
        time: now,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: Math.random() * 100,
      });
      if (candles.length > 500) candles.shift();
    } else {
      // Update current candle
      lastCandle.close = price;
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.volume += Math.random() * 10 * this.speed;
    }
  }

  getPrice(symbol: string): number {
    return this.prices.get(symbol) || 0;
  }

  getCandles(symbol: string): Candle[] {
    return this.candles.get(symbol) || [];
  }

  getMarket(symbol: string): Market {
    const price = this.getPrice(symbol);
    const candles = this.getCandles(symbol);
    const dayCandles = candles.slice(-1440); // ~24h of 1m candles
    const high24h = Math.max(...dayCandles.map(c => c.high), price);
    const low24h = Math.min(...dayCandles.map(c => c.low), price);
    const volume24h = dayCandles.reduce((sum, c) => sum + c.volume, 0);
    const openPrice = dayCandles.length > 0 ? dayCandles[0].open : price;
    const change = price - openPrice;
    const changePercent = (change / openPrice) * 100;

    const parts = symbol.replace('USDT', '');
    return {
      symbol,
      baseAsset: parts,
      quoteAsset: 'USDT',
      lastPrice: price,
      priceChange24h: change,
      priceChangePercent24h: changePercent,
      high24h,
      low24h,
      volume24h,
      decimals: price > 100 ? 2 : price > 1 ? 4 : 6,
      priceDecimals: price > 100 ? 2 : price > 1 ? 4 : 6,
    };
  }

  getAllMarkets(): Market[] {
    return Array.from(this.prices.keys()).map(sym => this.getMarket(sym));
  }

  generateOrderBook(symbol: string): OrderBook {
    const price = this.getPrice(symbol);
    const vol = this.volatility.get(symbol)!;
    const tickSize = price > 100 ? 0.01 : price > 1 ? 0.001 : 0.00001;

    const asks: OrderBookEntry[] = [];
    const bids: OrderBookEntry[] = [];
    let askTotal = 0;
    let bidTotal = 0;

    for (let i = 0; i < 20; i++) {
      const askPrice = price + (i + 1) * tickSize * (1 + Math.random() * vol * 10);
      const askSize = Math.random() * 5 + 0.1;
      askTotal += askSize;
      asks.push({
        price: parseFloat(askPrice.toFixed(8)),
        size: parseFloat(askSize.toFixed(4)),
        total: parseFloat(askTotal.toFixed(4)),
      });

      const bidPrice = price - (i + 1) * tickSize * (1 + Math.random() * vol * 10);
      const bidSize = Math.random() * 5 + 0.1;
      bidTotal += bidSize;
      bids.push({
        price: parseFloat(bidPrice.toFixed(8)),
        size: parseFloat(bidSize.toFixed(4)),
        total: parseFloat(bidTotal.toFixed(4)),
      });
    }

    const spread = asks[0].price - bids[0].price;
    const spreadPercent = (spread / price) * 100;

    return { asks: asks.reverse(), bids, spread, spreadPercent };
  }

  calculateLiquidationPrice(entryPrice: number, leverage: number, side: Side, marginMode: string): number {
    const maintenanceMarginRate = 0.005; // 0.5%
    if (side === 'long') {
      return entryPrice * (1 - 1 / leverage + maintenanceMarginRate);
    } else {
      return entryPrice * (1 + 1 / leverage - maintenanceMarginRate);
    }
  }

  calculatePnl(entryPrice: number, currentPrice: number, size: number, side: Side): number {
    if (side === 'long') {
      return (currentPrice - entryPrice) * size;
    } else {
      return (entryPrice - currentPrice) * size;
    }
  }

  calculateRoi(pnl: number, margin: number): number {
    if (margin === 0) return 0;
    return (pnl / margin) * 100;
  }

  checkPositionRisk(position: Position, currentPrice: number): { liquidated: boolean; tpHit: boolean; slHit: boolean } {
    const liquidationPrice = this.calculateLiquidationPrice(
      position.entryPrice, position.leverage, position.side, position.marginMode
    );

    let liquidated = false;
    let tpHit = false;
    let slHit = false;

    if (position.side === 'long') {
      liquidated = currentPrice <= liquidationPrice;
      tpHit = position.takeProfit ? currentPrice >= position.takeProfit : false;
      slHit = position.stopLoss ? currentPrice <= position.stopLoss : false;
    } else {
      liquidated = currentPrice >= liquidationPrice;
      tpHit = position.takeProfit ? currentPrice <= position.takeProfit : false;
      slHit = position.stopLoss ? currentPrice >= position.stopLoss : false;
    }

    return { liquidated, tpHit, slHit };
  }

  getSymbols(): string[] {
    return Array.from(this.prices.keys());
  }

  setVolatility(symbol: string, vol: number) {
    this.volatility.set(symbol, vol);
  }

  resetMarket(symbol: string, price: number) {
    this.prices.set(symbol, price);
    this.trend.set(symbol, 0);
    this.generateHistoricalCandles(symbol, price, this.volatility.get(symbol)!);
  }
}

export const priceEngine = new PriceEngine();
