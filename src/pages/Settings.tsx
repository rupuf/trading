import React, { useState } from 'react';
import { useStore } from '../store';
import { ArrowLeft, User, Palette, BarChart3, Bell, Shield, Settings as SettingsIcon, Info, LogOut } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const { user, updateSettings, logout } = useStore();
  const [activeSection, setActiveSection] = useState('profile');

  const settings = user?.settings || {
    theme: 'dark' as const,
    chartType: 'candles' as const,
    defaultLeverage: 10,
    defaultMarginMode: 'isolated' as const,
    notifications: true,
    sound: false,
    confirmOrders: true,
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'chart', label: 'Chart', icon: BarChart3 },
    { id: 'trading', label: 'Trading', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#12161c] border-b border-[#2a3040] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => onNavigate('terminal')} className="p-1 text-[#848e9c] hover:text-white transition">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid md:grid-cols-[200px_1fr] gap-4">
          {/* Sidebar */}
          <nav className="space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded transition ${activeSection === s.id ? 'bg-[#1e2530] text-[#f0b90b]' : 'text-[#848e9c] hover:text-white hover:bg-[#1e2530]'}`}>
                <s.icon size={14} /> {s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-4">
            {activeSection === 'profile' && (
              <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold">Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#848e9c] mb-1 block">Username</label>
                    <input type="text" defaultValue={user?.username || ''} className="w-full text-sm" readOnly />
                  </div>
                  <div>
                    <label className="text-xs text-[#848e9c] mb-1 block">Email</label>
                    <input type="email" defaultValue={user?.email || ''} className="w-full text-sm" readOnly />
                  </div>
                  <div>
                    <label className="text-xs text-[#848e9c] mb-1 block">Member Since</label>
                    <input type="text" defaultValue={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} className="w-full text-sm" readOnly />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold">Appearance</h3>
                <div>
                  <label className="text-xs text-[#848e9c] mb-2 block">Theme</label>
                  <div className="flex gap-2">
                    <button onClick={() => updateSettings({ theme: 'dark' })}
                      className={`px-4 py-2 text-xs rounded transition ${settings.theme === 'dark' ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c]'}`}>
                      Dark
                    </button>
                    <button className="px-4 py-2 text-xs rounded bg-[#0b0e11] border border-[#2a3040] text-[#848e9c] opacity-50 cursor-not-allowed">
                      Light (coming soon)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'chart' && (
              <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold">Chart Settings</h3>
                <div>
                  <label className="text-xs text-[#848e9c] mb-2 block">Default Chart Type</label>
                  <div className="flex gap-2">
                    {(['candles', 'line', 'bars'] as const).map(type => (
                      <button key={type} onClick={() => updateSettings({ chartType: type })}
                        className={`px-4 py-2 text-xs rounded capitalize transition ${settings.chartType === type ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c]'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'trading' && (
              <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold">Trading Preferences</h3>
                <div>
                  <label className="text-xs text-[#848e9c] mb-2 block">Default Leverage</label>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 5, 10, 20, 25, 50].map(lev => (
                      <button key={lev} onClick={() => updateSettings({ defaultLeverage: lev })}
                        className={`px-3 py-1.5 text-xs rounded transition ${settings.defaultLeverage === lev ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c] hover:text-white'}`}>
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#848e9c] mb-2 block">Default Margin Mode</label>
                  <div className="flex gap-2">
                    {(['isolated', 'cross'] as const).map(mode => (
                      <button key={mode} onClick={() => updateSettings({ defaultMarginMode: mode })}
                        className={`px-4 py-2 text-xs rounded capitalize transition ${settings.defaultMarginMode === mode ? 'bg-[#f0b90b] text-black font-semibold' : 'bg-[#0b0e11] border border-[#2a3040] text-[#848e9c]'}`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848e9c]">Confirm orders before submission</span>
                  <button onClick={() => updateSettings({ confirmOrders: !settings.confirmOrders })}
                    className={`w-10 h-5 rounded-full transition ${settings.confirmOrders ? 'bg-[#0ecb81]' : 'bg-[#2a3040]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.confirmOrders ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold">Notification Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#848e9c]">Push Notifications</span>
                    <button onClick={() => updateSettings({ notifications: !settings.notifications })}
                      className={`w-10 h-5 rounded-full transition ${settings.notifications ? 'bg-[#0ecb81]' : 'bg-[#2a3040]'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#848e9c]">Sound Alerts</span>
                    <button onClick={() => updateSettings({ sound: !settings.sound })}
                      className={`w-10 h-5 rounded-full transition ${settings.sound ? 'bg-[#0ecb81]' : 'bg-[#2a3040]'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.sound ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-4">
                <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4 space-y-4">
                  <h3 className="text-sm font-semibold">Account Information</h3>
                  <div className="bg-[#0b0e11] rounded p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#848e9c]">Account Type</span>
                      <span>Virtual Trading Account</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848e9c]">Balance Currency</span>
                      <span>USDT (Virtual)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#848e9c]">Data Storage</span>
                      <span>Local (localStorage)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f0b90b]/5 border border-[#f0b90b]/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-[#f0b90b] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#848e9c]">
                      <p className="font-semibold text-[#f0b90b] mb-1">Virtual Trading Simulator</p>
                      <p>NexusTrade is a trading simulator. All balances, positions, and trades use virtual funds with no real monetary value. No real deposits, withdrawals, or exchange connections exist.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-4">
                  <button onClick={() => { logout(); onNavigate('landing'); }}
                    className="flex items-center gap-2 text-sm text-[#f6465d] hover:text-[#ff5268] transition">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
