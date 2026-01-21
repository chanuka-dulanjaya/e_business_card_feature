import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, tokenManager } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  userType: 'individual' | 'team' | 'organization';
  role: 'user' | 'admin' | 'super_admin';
  profilePicture: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  organization?: { _id: string; name: string; logo?: string } | null;
  team?: { _id: string; name: string } | null;
  businessCardCount?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string; userType: 'individual' | 'team' | 'organization' }) => Promise<void>;
  signInWithGoogle: (data: { googleId: string; email: string; fullName: string; profilePicture?: string; userType?: 'individual' | 'team' | 'organization' }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const data = await authApi.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
      tokenManager.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      tokenManager.setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (data: { email: string; password: string; fullName: string; userType: 'individual' | 'team' | 'organization' }) => {
    try {
      const response = await authApi.signup(data);
      tokenManager.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (data: { googleId: string; email: string; fullName: string; profilePicture?: string; userType?: 'individual' | 'team' | 'organization' }) => {
    try {
      const response = await authApi.googleAuth(data);
      tokenManager.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    tokenManager.removeToken();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshUser,
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { User };
