import React, { useState } from 'react';
import { useStore } from '../store';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
  mode: 'login' | 'signup' | 'forgot' | 'demo';
}

export default function Auth({ onNavigate, mode }: AuthProps) {
  const { login, signup } = useStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }
    const ok = login(email, password);
    if (ok) {
      onNavigate('terminal');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !username || !password) { setError('Please fill all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    const ok = signup(email, username, password);
    if (ok) {
      onNavigate('terminal');
    } else {
      setError('Email already registered');
    }
  };

  const handleDemo = () => {
    const ok = signup('demo@nexustrade.io', 'DemoTrader', 'demo123456');
    if (ok) onNavigate('terminal');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Password reset link sent to your email (simulated).');
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-sm text-[#848e9c] hover:text-white mb-6 transition">
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="bg-[#12161c] border border-[#2a3040] rounded-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#f0b90b] to-[#f7931a] flex items-center justify-center">
              <span className="text-black font-bold text-sm">NX</span>
            </div>
            <span className="font-bold text-lg">NexusTrade</span>
          </div>

          {mode === 'login' && (
            <>
              <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
              <p className="text-sm text-[#848e9c] mb-6">Log in to your trading account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848e9c]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-xs text-[#f6465d]">{error}</p>}
                <button type="submit" className="w-full btn-green py-2.5 rounded text-sm">Log In</button>
              </form>
              <div className="mt-4 text-center text-sm text-[#848e9c]">
                <button onClick={() => onNavigate('forgot')} className="hover:text-[#f0b90b] transition">Forgot password?</button>
              </div>
              <div className="mt-4 pt-4 border-t border-[#2a3040] text-center text-sm text-[#848e9c]">
                Don't have an account?{' '}
                <button onClick={() => onNavigate('signup')} className="text-[#f0b90b] hover:underline">Sign Up</button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-xl font-bold mb-1">Create Account</h2>
              <p className="text-sm text-[#848e9c] mb-6">Start trading with $10,000 virtual balance</p>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10" />
                </div>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848e9c]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-10" />
                </div>
                {error && <p className="text-xs text-[#f6465d]">{error}</p>}
                <button type="submit" className="w-full btn-green py-2.5 rounded text-sm">Create Account</button>
              </form>
              <div className="mt-4 pt-4 border-t border-[#2a3040] text-center text-sm text-[#848e9c]">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="text-[#f0b90b] hover:underline">Log In</button>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-xl font-bold mb-1">Reset Password</h2>
              <p className="text-sm text-[#848e9c] mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]" />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10" />
                </div>
                {success && <p className="text-xs text-[#0ecb81]">{success}</p>}
                <button type="submit" className="w-full btn-green py-2.5 rounded text-sm">Send Reset Link</button>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => onNavigate('login')} className="text-sm text-[#848e9c] hover:text-[#f0b90b] transition">
                  Back to login
                </button>
              </div>
            </>
          )}

          {mode === 'demo' && (
            <>
              <h2 className="text-xl font-bold mb-1">Quick Demo</h2>
              <p className="text-sm text-[#848e9c] mb-6">Jump right in with a pre-configured demo account</p>
              <div className="bg-[#0b0e11] rounded p-4 mb-6 border border-[#2a3040]">
                <div className="text-xs text-[#848e9c] mb-2">Demo Account</div>
                <div className="text-sm">Email: demo@nexustrade.io</div>
                <div className="text-sm">Balance: $10,000 USDT (virtual)</div>
                <div className="text-xs text-[#f0b90b] mt-2">All funds are virtual</div>
              </div>
              <button onClick={handleDemo} className="w-full btn-green py-2.5 rounded text-sm">Enter Demo</button>
              <div className="mt-4 text-center text-sm text-[#848e9c]">
                Or{' '}
                <button onClick={() => onNavigate('signup')} className="text-[#f0b90b] hover:underline">create your own account</button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#5e6673] mt-4">
          NexusTrade is a virtual trading simulator. No real money involved.
        </p>
      </div>
    </div>
  );
}
