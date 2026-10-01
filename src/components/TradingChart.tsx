import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { TimeFrame, Indicator } from '../types';
import { priceEngine } from '../engine';
import { Maximize2, Minimize2, TrendingUp, Minus, Square, Activity } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
}

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];

export default function TradingChart({ symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>('1m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0b0e11' },
        textColor: '#848e9c',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1e2530' },
        horzLines: { color: '#1e2530' },
      },
      crosshair: {
        vertLine: { color: '#f0b90b', width: 1, style: 2, labelBackgroundColor: '#f0b90b' },
        horzLine: { color: '#f0b90b', width: 1, style: 2, labelBackgroundColor: '#f0b90b' },
      },
      rightPriceScale: {
        borderColor: '#2a3040',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#2a3040',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderUpColor: '#0ecb81',
      borderDownColor: '#f6465d',
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Load data
    const candles = priceEngine.getCandles(symbol);
    const candleData = candles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    const volumeData = candles.map(c => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)',
    }));

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);
    chart.timeScale().fitContent();

    // Resize handler
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol]);

  // Update chart on price ticks
  useEffect(() => {
    const interval = setInterval(() => {
      const candles = priceEngine.getCandles(symbol);
      if (candles.length === 0 || !candleSeriesRef.current || !volumeSeriesRef.current) return;

      const lastCandle = candles[candles.length - 1];
      candleSeriesRef.current.update({
        time: lastCandle.time as Time,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
      });
      volumeSeriesRef.current.update({
        time: lastCandle.time as Time,
        value: lastCandle.volume,
        color: lastCandle.close >= lastCandle.open ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)',
      });
    }, 500);

    return () => clearInterval(interval);
  }, [symbol]);

  const toggleIndicator = (type: Indicator['type']) => {
    const existing = indicators.find(i => i.type === type);
    if (existing) {
      setIndicators(indicators.filter(i => i.type !== type));
      const series = indicatorSeriesRef.current.get(type);
      if (series && chartRef.current) {
        chartRef.current.removeSeries(series);
        indicatorSeriesRef.current.delete(type);
      }
    } else {
      const newIndicator: Indicator = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        params: type === 'EMA' ? { period: 20 } : type === 'SMA' ? { period: 20 } : type === 'RSI' ? { period: 14 } : type === 'MACD' ? { fast: 12, slow: 26, signal: 9 } : type === 'BB' ? { period: 20, stdDev: 2 } : {},
        visible: true,
      };
      setIndicators([...indicators, newIndicator]);

      // Add indicator line to chart
      if (chartRef.current && candleSeriesRef.current) {
        const candles = priceEngine.getCandles(symbol);
        const lineData: { time: Time; value: number }[] = [];

        if (type === 'EMA' || type === 'SMA') {
          const period = 20;
          const multiplier = 2 / (period + 1);
          let ema = candles[0]?.close || 0;
          candles.forEach((c, i) => {
            if (type === 'EMA') {
              ema = (c.close - ema) * multiplier + ema;
            } else {
              if (i >= period - 1) {
                const sum = candles.slice(i - period + 1, i + 1).reduce((s, cc) => s + cc.close, 0);
                ema = sum / period;
              }
            }
            if (i >= period - 1) {
              lineData.push({ time: c.time as Time, value: parseFloat(ema.toFixed(2)) });
            }
          });
        }

        if (lineData.length > 0) {
          const color = type === 'EMA' ? '#f0b90b' : '#1e88e5';
          const series = chartRef.current.addSeries(LineSeries, { color, lineWidth: 1, priceLineVisible: false });
          series.setData(lineData);
          indicatorSeriesRef.current.set(type, series);
        }
      }
    }
    setShowIndicatorMenu(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (chartContainerRef.current) {
      if (!isFullscreen) {
        chartContainerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#0b0e11] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#2a3040] bg-[#12161c]">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs rounded transition ${timeframe === tf ? 'bg-[#f0b90b] text-black font-semibold' : 'text-[#848e9c] hover:text-white hover:bg-[#1e2530]'}`}>
              {tf}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
              className="px-2 py-1 text-xs text-[#848e9c] hover:text-white hover:bg-[#1e2530] rounded transition flex items-center gap-1">
              <Activity size={12} /> Ind
            </button>
            {showIndicatorMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#161b22] border border-[#2a3040] rounded shadow-xl z-20 w-40">
                {(['EMA', 'SMA', 'RSI', 'MACD', 'BB', 'Volume'] as const).map(ind => (
                  <button key={ind} onClick={() => toggleIndicator(ind)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#1e2530] flex items-center justify-between ${indicators.find(i => i.type === ind) ? 'text-[#f0b90b]' : 'text-[#848e9c]'}`}>
                    {ind}
                    {indicators.find(i => i.type === ind) && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleFullscreen} className="p-1 text-[#848e9c] hover:text-white transition">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Drawing tools */}
      <div className="hidden md:flex items-center gap-1 px-2 py-1 border-b border-[#2a3040] bg-[#12161c]">
        <button className="p-1.5 text-[#848e9c] hover:text-white hover:bg-[#1e2530] rounded transition" title="Trend Line">
          <TrendingUp size={14} />
        </button>
        <button className="p-1.5 text-[#848e9c] hover:text-white hover:bg-[#1e2530] rounded transition" title="Horizontal Line">
          <Minus size={14} />
        </button>
        <button className="p-1.5 text-[#848e9c] hover:text-white hover:bg-[#1e2530] rounded transition" title="Rectangle">
          <Square size={14} />
        </button>
        <div className="w-px h-4 bg-[#2a3040] mx-1" />
        <span className="text-[10px] text-[#5e6673]">Drawings</span>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="flex-1 min-h-0" />
    </div>
  );
}
