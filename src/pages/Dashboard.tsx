import { useAuth } from '../contexts/AuthContext';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import UserDashboard from '../components/UserDashboard';
import TeamDashboard from '../components/TeamDashboard';
import OrganizationDashboard from '../components/OrganizationDashboard';
import { Logo } from '../components/Logo';
import { LogOut, Shield, User, Building2, Users } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut, isSuperAdmin } = useAuth();

  const getUserTypeIcon = () => {
    switch (user?.userType) {
      case 'organization':
        return <Building2 className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getDashboardTitle = () => {
    if (isSuperAdmin) return 'Super Admin Dashboard';
    switch (user?.userType) {
      case 'organization':
        return 'Organization Dashboard';
      case 'team':
        return 'Team Dashboard';
      default:
        return 'My Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo height={36} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {getDashboardTitle()}
                  </h1>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      <Shield className="w-3 h-3" />
                      Super Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <span>Welcome back, {user?.fullName}</span>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    {getUserTypeIcon()}
                    {user?.userType}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSuperAdmin ? (
          <SuperAdminDashboard />
        ) : user?.userType === 'organization' ? (
          <OrganizationDashboard />
        ) : user?.userType === 'team' ? (
          <TeamDashboard />
        ) : (
          <UserDashboard />
        )}
      </main>
    </div>
  );
}
