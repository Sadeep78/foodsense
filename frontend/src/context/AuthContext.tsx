import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  currency: string;
  setCurrency: (curr: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodsense_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('foodsense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currency, setCurrencyState] = useState<string>(() => {
    const saved = localStorage.getItem('foodsense_currency');
    return saved || 'LKR';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common['Authorization'];
    }
    setIsLoading(false);
  }, [token]);

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem('foodsense_currency', curr);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const data = response.data;
      const newToken = data.access_token;
      const userData: User = {
        email: data.email,
        user_name: data.user_name,
        business_type: data.business_type,
        currency: data.currency || 'LKR',
        role: data.role || 'Manager',
      };

      setToken(newToken);
      setUser(userData);
      setCurrency(userData.currency);

      localStorage.setItem('foodsense_token', newToken);
      localStorage.setItem('foodsense_user', JSON.stringify(userData));
      localStorage.setItem('foodsense_currency', userData.currency);

      client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('foodsense_token');
    localStorage.removeItem('foodsense_user');
    delete client.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currency,
        setCurrency,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
