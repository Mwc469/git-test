'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Not logged in
        api.clearToken();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    api.setToken(response.accessToken);
    setUser(response.user);
    router.push('/dashboard');
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await api.register(email, password, name);
    api.setToken(response.accessToken);
    setUser(response.user);
    router.push('/dashboard');
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
