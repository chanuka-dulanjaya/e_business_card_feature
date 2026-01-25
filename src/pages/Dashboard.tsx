import { useAuth } from '../contexts/AuthContext';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import UserDashboard from '../components/UserDashboard';
import TeamDashboard from '../components/TeamDashboard';
import OrganizationDashboard from '../components/OrganizationDashboard';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogOut, Shield, User, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-background">
      <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo height={36} />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                    {getDashboardTitle()}
                  </h1>
                  {isSuperAdmin && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Super Admin
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>Welcome back, {user?.fullName}</span>
                  <span className="text-border">|</span>
                  <span className="inline-flex items-center gap-1 capitalize">
                    {getUserTypeIcon()}
                    {user?.userType}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={signOut}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
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
