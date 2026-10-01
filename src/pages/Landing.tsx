import React, { useEffect, useRef } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight, ArrowUpRight, BarChart3, Layers, Lock, Smartphone } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let candles: { x: number; o: number; h: number; l: number; c: number; w: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const candleW = 8;
    const gap = 3;
    const count = Math.floor(w / (candleW + gap));

    let basePrice = h * 0.5;
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.47) * 20;
      const open = basePrice;
      const close = basePrice + change;
      const high = Math.min(open, close) - Math.random() * 15;
      const low = Math.max(open, close) + Math.random() * 15;
      candles.push({ x: i * (candleW + gap), o: open, h: high, l: low, c: close, w: candleW });
      basePrice = close;
    }

    let offset = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      offset += 0.3;

      candles.forEach((candle, i) => {
        const x = candle.x - (offset % (candleW + gap));
        const isGreen = candle.c < candle.o;
        const color = isGreen ? '#0ecb81' : '#f6465d';

        // Wick
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(x + candleW / 2, candle.h);
        ctx.lineTo(x + candleW / 2, candle.l);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const top = Math.min(candle.o, candle.c);
        const bodyH = Math.max(Math.abs(candle.c - candle.o), 1);
        ctx.fillRect(x, top, candleW, bodyH);
      });

      // Grid lines
      ctx.strokeStyle = 'rgba(42, 48, 64, 0.3)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] overflow-y-auto">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0b0e11]/90 backdrop-blur-md border-b border-[#2a3040]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#f0b90b] to-[#f7931a] flex items-center justify-center">
              <span className="text-black font-bold text-sm">NX</span>
            </div>
            <span className="font-bold text-lg tracking-tight">NexusTrade</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#848e9c]">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#markets" className="hover:text-white transition">Markets</a>
            <a href="#futures" className="hover:text-white transition">Futures</a>
            <a href="#security" className="hover:text-white transition">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('login')} className="text-sm text-[#848e9c] hover:text-white transition px-3 py-1.5">
              Log In
            </button>
            <button onClick={() => onNavigate('signup')} className="text-sm bg-[#f0b90b] text-black font-semibold px-4 py-1.5 rounded hover:bg-[#f7c948] transition">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0b90b]/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#f0b90b]/10 text-[#f0b90b] text-xs font-medium px-3 py-1 rounded-full mb-6">
                <Zap size={12} /> Virtual Trading Simulator
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Trade Smarter.<br />
                <span className="text-[#f0b90b]">Practice Risk-Free.</span>
              </h1>
              <p className="text-[#848e9c] text-lg mb-8 max-w-lg">
                Professional-grade futures trading terminal with real-time simulated markets. 
                Master leverage, risk management, and strategy execution — all with virtual funds.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => onNavigate('signup')} className="btn-green px-6 py-3 rounded text-sm flex items-center gap-2">
                  Start Trading <ChevronRight size={16} />
                </button>
                <button onClick={() => onNavigate('demo')} className="px-6 py-3 rounded text-sm border border-[#2a3040] hover:border-[#f0b90b] transition flex items-center gap-2">
                  Try Demo <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-8 mt-10 text-sm">
                <div>
                  <div className="text-2xl font-bold text-[#f0b90b]">10+</div>
                  <div className="text-[#848e9c]">Trading Pairs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">50x</div>
                  <div className="text-[#848e9c]">Max Leverage</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-[#848e9c]">Timeframes</div>
                </div>
              </div>
            </div>
            <div className="relative h-[350px] lg:h-[400px] rounded-lg overflow-hidden border border-[#2a3040] bg-[#12161c]">
              <canvas ref={canvasRef} className="w-full h-full" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-xs bg-[#1a1f27] px-2 py-1 rounded">BTCUSDT</span>
                <span className="text-xs text-[#0ecb81]">+2.34%</span>
              </div>
              <div className="absolute bottom-3 right-3 text-xs text-[#848e9c]">
                Simulated Chart
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-[#2a3040]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Built for Serious Traders</h2>
          <p className="text-[#848e9c] text-center mb-12 max-w-2xl mx-auto">
            Every tool you need to practice futures trading strategies in a realistic simulated environment.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Advanced Charts', desc: 'Professional candlestick charts with 8 timeframes, drawing tools, and 6 technical indicators.' },
              { icon: Layers, title: 'Order Book Depth', desc: 'Real-time simulated order book with depth visualization and continuous price updates.' },
              { icon: TrendingUp, title: 'Leverage Trading', desc: 'Trade with 1x to 50x leverage. Practice isolated and cross margin modes.' },
              { icon: Shield, title: 'Risk Management', desc: 'Set TP/SL, monitor liquidation prices, and track your P&L in real-time.' },
              { icon: Globe, title: 'Multiple Markets', desc: 'Trade BTC, ETH, SOL, BNB, XRP, DOGE, ADA and more simulated pairs.' },
              { icon: Zap, title: 'Creator Mode', desc: 'Configure scenarios, control simulation speed, and script winning/losing paths.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-lg bg-[#12161c] border border-[#2a3040] hover:border-[#f0b90b]/30 transition group">
                <f.icon size={24} className="text-[#f0b90b] mb-4 group-hover:scale-110 transition" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[#848e9c]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Preview */}
      <section id="markets" className="py-20 border-t border-[#2a3040] bg-[#12161c]/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Markets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { sym: 'BTCUSDT', price: '83,500', change: '+2.34%', up: true },
              { sym: 'ETHUSDT', price: '3,450', change: '+1.87%', up: true },
              { sym: 'SOLUSDT', price: '178.50', change: '-0.92%', up: false },
              { sym: 'BNBUSDT', price: '605.20', change: '+3.12%', up: true },
              { sym: 'XRPUSDT', price: '0.6234', change: '-1.45%', up: false },
              { sym: 'DOGEUSDT', price: '0.1650', change: '+5.67%', up: true },
              { sym: 'ADAUSDT', price: '0.4820', change: '+0.89%', up: true },
              { sym: 'AVAXUSDT', price: '38.50', change: '-2.10%', up: false },
            ].map((m, i) => (
              <div key={i} className="p-4 rounded-lg bg-[#161b22] border border-[#2a3040] hover:border-[#f0b90b]/30 transition cursor-pointer"
                onClick={() => onNavigate('signup')}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{m.sym}</span>
                  <span className={`text-xs font-medium ${m.up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{m.change}</span>
                </div>
                <div className="text-lg font-bold">${m.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Futures Section */}
      <section id="futures" className="py-20 border-t border-[#2a3040]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Futures Trading Terminal</h2>
              <p className="text-[#848e9c] mb-6">
                Experience a professional-grade trading interface designed for futures markets. 
                Execute long and short positions with configurable leverage, margin modes, and risk parameters.
              </p>
              <ul className="space-y-3">
                {[
                  'Market, Limit & Stop orders',
                  'Isolated & Cross margin modes',
                  'Dynamic liquidation price calculation',
                  'Real-time P&L tracking',
                  'Position management with TP/SL',
                  'Complete trade history & analytics',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#12161c] rounded-lg border border-[#2a3040] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">BTCUSDT Perpetual</span>
                <span className="text-xs text-[#0ecb81]">LONG 10x</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0b0e11] rounded p-2">
                  <div className="text-[#848e9c]">Entry Price</div>
                  <div className="font-mono">$83,411.00</div>
                </div>
                <div className="bg-[#0b0e11] rounded p-2">
                  <div className="text-[#848e9c]">Mark Price</div>
                  <div className="font-mono text-[#0ecb81]">$83,520.00</div>
                </div>
                <div className="bg-[#0b0e11] rounded p-2">
                  <div className="text-[#848e9c]">Unrealized PnL</div>
                  <div className="font-mono text-[#0ecb81]">+$2.72</div>
                </div>
                <div className="bg-[#0b0e11] rounded p-2">
                  <div className="text-[#848e9c]">ROI</div>
                  <div className="font-mono text-[#0ecb81]">+1.30%</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 text-xs py-2 rounded bg-[#0ecb81]/10 text-[#0ecb81] border border-[#0ecb81]/30">Edit TP/SL</button>
                <button className="flex-1 text-xs py-2 rounded bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/30">Close</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 border-t border-[#2a3040] bg-[#12161c]/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Lock size={40} className="mx-auto text-[#f0b90b] mb-6" />
          <h2 className="text-3xl font-bold mb-4">Virtual Funds Only</h2>
          <p className="text-[#848e9c] max-w-2xl mx-auto mb-8">
            NexusTrade is a trading simulator. All balances, positions, and trades use virtual funds. 
            No real money is involved. This platform is designed for educational and practice purposes only.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { title: 'No Real Deposits', desc: 'All funds are virtual and have no monetary value.' },
              { title: 'No Real Execution', desc: 'Orders are simulated against a local price engine.' },
              { title: 'No External Accounts', desc: 'No connection to real exchanges or brokerage services.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-[#161b22] border border-[#2a3040]">
                <h4 className="font-semibold text-sm mb-2">{item.title}</h4>
                <p className="text-xs text-[#848e9c]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Preview */}
      <section className="py-20 border-t border-[#2a3040]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Smartphone size={40} className="mx-auto text-[#f0b90b] mb-6" />
          <h2 className="text-3xl font-bold mb-4">Trade Anywhere</h2>
          <p className="text-[#848e9c] max-w-lg mx-auto mb-8">
            Full-featured mobile trading experience with touch-optimized controls and bottom navigation.
          </p>
          <div className="inline-block bg-[#12161c] rounded-2xl border border-[#2a3040] p-3 w-[260px]">
            <div className="bg-[#0b0e11] rounded-lg p-3 h-[380px] flex flex-col">
              <div className="text-xs font-semibold mb-2">BTCUSDT</div>
              <div className="flex-1 bg-[#12161c] rounded mb-2 flex items-center justify-center text-[#848e9c] text-xs">
                Chart Preview
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button className="btn-green text-xs py-1.5 rounded">Long</button>
                <button className="btn-red text-xs py-1.5 rounded">Short</button>
              </div>
              <div className="flex justify-around border-t border-[#2a3040] pt-2">
                {['Home', 'Markets', 'Trade', 'Positions', 'Portfolio'].map((t, i) => (
                  <span key={i} className={`text-[10px] ${i === 2 ? 'text-[#f0b90b]' : 'text-[#848e9c]'}`}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-[#2a3040]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this a real trading platform?', a: 'No. NexusTrade is a simulator that uses virtual funds. No real money is involved in any transactions.' },
              { q: 'Can I lose real money?', a: 'No. All trading activity uses virtual balance with no connection to real financial systems.' },
              { q: 'What markets are available?', a: 'The simulator includes BTC, ETH, SOL, BNB, XRP, DOGE, ADA, AVAX, DOT, and LINK perpetual pairs.' },
              { q: 'How does the price engine work?', a: 'Prices are generated locally using a realistic simulation engine with configurable volatility and trend modes.' },
              { q: 'Can I customize the simulation?', a: 'Yes. Creator Mode allows you to configure starting balance, leverage, TP/SL, speed, and scripted scenarios.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-[#12161c] border border-[#2a3040] rounded-lg">
                <summary className="p-4 cursor-pointer font-medium text-sm flex items-center justify-between hover:text-[#f0b90b] transition">
                  {faq.q}
                  <ChevronRight size={16} className="group-open:rotate-90 transition" />
                </summary>
                <div className="px-4 pb-4 text-sm text-[#848e9c]">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[#2a3040] bg-gradient-to-b from-[#f0b90b]/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-[#848e9c] mb-8">Start with $10,000 virtual balance. No deposits required.</p>
          <button onClick={() => onNavigate('signup')} className="btn-green px-8 py-3 rounded text-sm font-semibold">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a3040] py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#f0b90b] to-[#f7931a] flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">NX</span>
            </div>
            <span className="font-semibold text-sm">NexusTrade</span>
            <span className="text-xs text-[#848e9c] ml-2">Virtual Trading Simulator</span>
          </div>
          <div className="text-xs text-[#848e9c]">
            © 2026 NexusTrade. All trading is simulated with virtual funds. Not financial advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
