import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';

type RouteType = 'home' | 'login' | 'register' | 'dashboard' | 'profile';

function App() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<{ type: RouteType; id?: string }>({
    type: 'home',
  });

  const navigate = (page: RouteType) => {
    const pathMap: Record<RouteType, string> = {
      home: '/',
      login: '/login',
      register: '/register',
      dashboard: '/dashboard',
      profile: '/profile',
    };
    window.history.pushState({}, '', pathMap[page]);
    setRoute({ type: page });
  };

  useEffect(() => {
    const path = window.location.pathname;
    // Match both /card/:id and /profile/:id for public business card view
    const cardMatch = path.match(/^\/card\/([a-f0-9]+)$/);
    const profileMatch = path.match(/^\/profile\/([a-f0-9-]+)$/);

    if (cardMatch) {
      setRoute({ type: 'profile', id: cardMatch[1] });
    } else if (profileMatch) {
      setRoute({ type: 'profile', id: profileMatch[1] });
    } else if (path === '/login') {
      setRoute({ type: 'login' });
    } else if (path === '/register') {
      setRoute({ type: 'register' });
    } else if (path === '/dashboard' || user) {
      setRoute({ type: 'dashboard' });
    } else {
      setRoute({ type: 'home' });
    }
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cardMatch = path.match(/^\/card\/([a-f0-9]+)$/);
      const profileMatch = path.match(/^\/profile\/([a-f0-9-]+)$/);

      if (cardMatch) {
        setRoute({ type: 'profile', id: cardMatch[1] });
      } else if (profileMatch) {
        setRoute({ type: 'profile', id: profileMatch[1] });
      } else if (path === '/login') {
        setRoute({ type: 'login' });
      } else if (path === '/register') {
        setRoute({ type: 'register' });
      } else if (path === '/dashboard' || user) {
        setRoute({ type: 'dashboard' });
      } else {
        setRoute({ type: 'home' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (route.type === 'profile' && route.id) {
    return <PublicProfile employeeId={route.id} />;
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // Show appropriate page for non-authenticated users
  if (route.type === 'login') {
    return <Login initialMode="login" onNavigateHome={() => navigate('home')} />;
  }

  if (route.type === 'register') {
    return <Login initialMode="register" onNavigateHome={() => navigate('home')} />;
  }

  // Default: show home page
  return (
    <Home
      onNavigateToLogin={() => navigate('login')}
      onNavigateToRegister={() => navigate('register')}
    />
  );
}

export default App;
