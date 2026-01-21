import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, tokenManager } from '../lib/api';

interface User {
  id: string;
  email: string;
}

interface Employee {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  mobileNumber: string | null;
  profilePicture: string | null;
  position: string | null;
  address: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
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
      setEmployee(data.employee);
    } catch (error) {
      console.error('Error fetching current user:', error);
      tokenManager.removeToken();
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      tokenManager.setToken(data.token);
      setUser(data.user);
      setEmployee(data.employee);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    tokenManager.removeToken();
    setUser(null);
    setEmployee(null);
  };

  const isAdmin = employee?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, employee, loading, signIn, signOut, isAdmin }}>
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

export type { Employee };
