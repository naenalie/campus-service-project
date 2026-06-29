// src/context/AuthContext.tsx
// Implementasi lengkap React Context untuk manajemen sesi autentikasi (CR-02)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PELAPOR' | 'ADMIN' | 'TEKNISI' | 'MANAJER';
  is_active: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Cek token di localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          // Set token ke state sementara untuk request header
          setToken(storedToken);
          // Verifikasi token ke backend API
          const userData = await api.getMe(storedToken);
          setUser(userData);
        } catch (error) {
          console.error('Gagal memulihkan sesi (token kedaluwarsa/invalid):', error);
          // Bersihkan sesi jika token invalid
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    restoreSession();
  }, []);

  // 2. Aksi Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Aksi Registrasi
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await api.register(name, email, password);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Aksi Logout
  const logout = async () => {
    setIsLoading(true);
    const currentToken = token || localStorage.getItem('auth_token');
    try {
      if (currentToken) {
        await api.logout(currentToken);
      }
    } catch (error) {
      console.warn('Gagal memproses logout di server, membersihkan sesi lokal saja:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook untuk menggunakan AuthContext dengan type-safety
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam komponen ber-AuthProvider');
  }
  return context;
};
