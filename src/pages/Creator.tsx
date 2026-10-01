import React, { useState } from 'react';
import { useStore } from '../store';
import { priceEngine } from '../engine';
import { ArrowLeft, Play, Pause, RotateCcw, Zap, TrendingUp, Settings, AlertTriangle, Gauge } from 'lucide-react';

interface CreatorProps {
  onNavigate: (page: string) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 5, 10];

export default function Creator({ onNavigate }: CreatorProps) {
  const { creatorConfig, updateCreatorConfig, startSimulation, pauseSimulation, resetSimulation, balance, positions, trades } = useStore();
  const [localConfig, setLocalConfig] = useState(creatorConfig);

  const updateLocal = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const applyAndStart = () => {
    updateCreatorConfig(localConfig);
    startSimulation();
  };

  const handlePause = () => {
    pauseSimulation();
  };

  const handleReset = () => {
    resetSimulation();
    setLocalConfig(creatorConfig);
  };

  const handleSpeedChange = (speed: number) => {
    updateLocal('speed', speed);
    updateCreatorConfig({ speed });
    priceEngine.setSpeed(speed);
  };

  const handleScenarioToggle = () => {
    const newVal = !localConfig.profitScenario;
    updateLocal('profitScenario', newVal);
    updateCreatorConfig({ profitScenario: newVal });
    priceEngine.setProfitScenario(newVal, localConfig.takeProfit, localConfig.side);
  };

  const formatPrice = (p: number) => p > 100 ? p.toFixed(2) : p > 1 ? p.toFixed(4) : p.toFixed(6);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#12161c] border-b border-[#2a3040] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('terminal')} className="p-1 text-[#848e9c] hover:text-white transition">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#f0b90b]" />
              <h1 className="text-lg font-bold">Creator Mode</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {creatorConfig.isRunning && (
              <span className={`text-xs px-2 py-1 rounded ${creatorConfig.isPaused ? 'bg-[#f0b90b]/10 text-[#f0b90b]' : 'bg-[#0ecb81]/10 text-[#0ecb81]'}`}>
                {creatorConfig.isPaused ? '⏸ Paused' : '● Running'}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status */}
        <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Gauge size={16} className="text-[#f0b90b]" /> Simulation Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0b0e11] rounded p-2">
              <div className="text-[10px] text-[#848e9c]">Balance</div>
              <div className="text-sm font-mono font-semibold text-[#f0b90b]">${balance.toFixed(2)}</div>
            </div>
            <div className="bg-[#0b0e11] rounded p-2">
              <div className="text-[10px] text-[#848e9c]">Open Positions</div>
              <div className="text-sm font-mono font-semibold">{positions.length}</div>
            </div>
            <div className="bg-[#0b0e11] rounded p-2">
              <div className="text-[10px] text-[#848e9c]">Total Trades</div>
              <div className="text-sm font-mono font-semibold">{trades.length}</div>
            </div>
            <div className="bg-[#0b0e11] rounded p-2">
              <div className="text-[10px] text-[#848e9c]">Speed</div>
              <div className="text-sm font-mono font-semibold">{creatorConfig.speed}x</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {!creatorConfig.isRunning ? (
            <button onClick={applyAndStart} className="btn-green px-4 py-2 rounded text-sm flex items-center gap-2">
              <Play size={14} /> Start Simulation
            </button>
          ) : (
            <button onClick={handlePause} className={`px-4 py-2 rounded text-sm flex items-center gap-2 ${creatorConfig.isPaused ? 'btn-green' : 'bg-[#f0b90b] text-black font-semibold'}`}>
              <Pause size={14} /> {creatorConfig.isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          <button onClick={handleReset} className="px-4 py-2 rounded text-sm border border-[#2a3040] text-[#848e9c] hover:text-white hover:border-[#f6465d] transition flex items-center gap-2">
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Basic Settings */}
          <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Settings size={16} className="text-[#848e9c]" /> Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Starting Balance (USDT)</label>
                <input type="number" value={localConfig.startingBalance} onChange={e => updateLocal('startingBalance', parseFloat(e.target.value) || 0)}
                  className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Entry Price (BTCUSDT)</label>
                <input type="number" value={localConfig.entryPrice} onChange={e => updateLocal('entryPrice', parseFloat(e.target.value) || 0)}
                  className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Position Size (BTC)</label>
                <input type="number" value={localConfig.positionSize} onChange={e => updateLocal('positionSize', parseFloat(e.target.value) || 0)}
                  step="0.001" className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Leverage</label>
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 5, 10, 20, 25, 50].map(lev => (
                    <button key={lev} onClick={() => updateLocal('leverage', lev)}
                      className={`px-2 py-1 text-xs rounded transition ${localConfig.leverage === lev ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c] hover:text-white'}`}>
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateLocal('side', 'long')}
                    className={`py-2 text-xs font-semibold rounded transition ${localConfig.side === 'long' ? 'bg-[#0ecb81] text-black' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c]'}`}>
                    LONG
                  </button>
                  <button onClick={() => updateLocal('side', 'short')}
                    className={`py-2 text-xs font-semibold rounded transition ${localConfig.side === 'short' ? 'bg-[#f6465d] text-white' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c]'}`}>
                    SHORT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TP/SL & Scenario */}
          <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#848e9c]" /> Targets & Scenario
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#0ecb81] mb-1 block">Take Profit Price</label>
                <input type="number" value={localConfig.takeProfit} onChange={e => updateLocal('takeProfit', parseFloat(e.target.value) || 0)}
                  className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#f6465d] mb-1 block">Stop Loss Price</label>
                <input type="number" value={localConfig.stopLoss} onChange={e => updateLocal('stopLoss', parseFloat(e.target.value) || 0)}
                  className="w-full text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Volatility</label>
                <input type="range" min="0.005" max="0.1" step="0.005" value={localConfig.volatility}
                  onChange={e => { updateLocal('volatility', parseFloat(e.target.value)); priceEngine.setVolatility('BTCUSDT', parseFloat(e.target.value)); }}
                  className="w-full" />
                <div className="text-[10px] text-[#848e9c] text-right">{(localConfig.volatility * 100).toFixed(1)}%</div>
              </div>

              {/* Profit Scenario Toggle */}
              <div className="bg-[#0b0e11] rounded p-3 border border-[#2a3040]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    <Zap size={12} className="text-[#f0b90b]" /> Profit Scenario
                  </span>
                  <button onClick={handleScenarioToggle}
                    className={`w-10 h-5 rounded-full transition ${localConfig.profitScenario ? 'bg-[#0ecb81]' : 'bg-[#2a3040]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${localConfig.profitScenario ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-[#848e9c]">
                  {localConfig.profitScenario
                    ? 'Price will gradually move toward TP. Simulates a winning trade scenario.'
                    : 'Price moves randomly. May trigger SL or liquidation.'}
                </p>
              </div>

              {/* Trading Fee */}
              <div>
                <label className="text-xs text-[#848e9c] mb-1 block">Trading Fee (%)</label>
                <input type="number" value={localConfig.tradingFee} onChange={e => updateLocal('tradingFee', parseFloat(e.target.value) || 0)}
                  step="0.01" className="w-full text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Speed Control */}
        <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Simulation Speed</h3>
          <div className="flex flex-wrap gap-2">
            {SPEED_OPTIONS.map(speed => (
              <button key={speed} onClick={() => handleSpeedChange(speed)}
                className={`px-4 py-2 text-xs rounded transition ${localConfig.speed === speed ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c] hover:text-white'}`}>
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => {
              const price = priceEngine.getPrice('BTCUSDT');
              useStore.getState().openPosition('BTCUSDT', localConfig.side, localConfig.positionSize, localConfig.leverage, 'isolated', localConfig.takeProfit, localConfig.stopLoss);
            }} className="px-3 py-2 text-xs rounded border border-[#2a3040] text-[#848e9c] hover:text-white hover:border-[#f0b90b] transition">
              Open Position at Current Price
            </button>
            <button onClick={() => {
              priceEngine.resetMarket('BTCUSDT', localConfig.entryPrice);
            }} className="px-3 py-2 text-xs rounded border border-[#2a3040] text-[#848e9c] hover:text-white hover:border-[#f0b90b] transition">
              Reset Price to Entry
            </button>
            <button onClick={() => {
              positions.forEach(p => useStore.getState().closePosition(p.id));
            }} className="px-3 py-2 text-xs rounded border border-[#f6465d]/30 text-[#f6465d] hover:bg-[#f6465d]/10 transition">
              Close All Positions
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#f0b90b]/5 border border-[#f0b90b]/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-[#f0b90b] shrink-0 mt-0.5" />
            <div className="text-xs text-[#848e9c]">
              <p className="font-semibold text-[#f0b90b] mb-1">Creator Mode Information</p>
              <p>This panel controls the simulation engine. All settings affect virtual trading only. No real money or real exchange connections are involved.</p>
              <p className="mt-1">The "Profit Scenario" mode biases price movement toward your configured TP, allowing you to script a winning trade. When disabled, price moves randomly and may hit SL or trigger liquidation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
