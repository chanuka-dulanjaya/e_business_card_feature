import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';

function App() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<{ type: 'login' | 'dashboard' | 'profile'; id?: string }>({
    type: 'login',
  });

  useEffect(() => {
    const path = window.location.pathname;
    const profileMatch = path.match(/^\/profile\/([a-f0-9-]+)$/);

    if (profileMatch) {
      setRoute({ type: 'profile', id: profileMatch[1] });
    } else if (user) {
      setRoute({ type: 'dashboard' });
    } else {
      setRoute({ type: 'login' });
    }
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const profileMatch = path.match(/^\/profile\/([a-f0-9-]+)$/);

      if (profileMatch) {
        setRoute({ type: 'profile', id: profileMatch[1] });
      } else if (user) {
        setRoute({ type: 'dashboard' });
      } else {
        setRoute({ type: 'login' });
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

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
