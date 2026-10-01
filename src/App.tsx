import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Terminal from './pages/Terminal';
import Portfolio from './pages/Portfolio';
import Creator from './pages/Creator';
import Settings from './pages/Settings';

type Page = 'landing' | 'login' | 'signup' | 'forgot' | 'demo' | 'terminal' | 'portfolio' | 'creator' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, loadState, user } = useStore();

  // Check session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem('nexus_session');
      if (session) {
        const userData = JSON.parse(session);
        useStore.setState({ user: userData, isAuthenticated: true });
        loadState();
        setPage('terminal');
      }
    } catch (e) {
      console.error('Session load error:', e);
      localStorage.removeItem('nexus_session');
    }
  }, []);

  const navigate = (target: string) => {
    // Auth guards
    if (['terminal', 'portfolio', 'creator', 'settings'].includes(target) && !isAuthenticated) {
      if (target === 'demo') {
        setPage('demo');
        return;
      }
      setPage('login');
      return;
    }
    setPage(target as Page);
  };

  // Render current page
  switch (page) {
    case 'landing':
      return <Landing onNavigate={navigate} />;
    case 'login':
      return <Auth onNavigate={navigate} mode="login" />;
    case 'signup':
      return <Auth onNavigate={navigate} mode="signup" />;
    case 'forgot':
      return <Auth onNavigate={navigate} mode="forgot" />;
    case 'demo':
      return <Auth onNavigate={navigate} mode="demo" />;
    case 'terminal':
      return <Terminal onNavigate={navigate} />;
    case 'portfolio':
      return <Portfolio onNavigate={navigate} />;
    case 'creator':
      return <Creator onNavigate={navigate} />;
    case 'settings':
      return <Settings onNavigate={navigate} />;
    default:
      return <Landing onNavigate={navigate} />;
  }
}
