import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  karmaPoints: number;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('circlo_user');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('circlo_user');
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token for API calls
        localStorage.setItem('authToken', token);
        
        // Store user data
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          karmaPoints: 100, // Default karma points
          joinedDate: new Date().toISOString().split('T')[0]
        };
        
        setUser(userData);
        localStorage.setItem('circlo_user', JSON.stringify(userData));
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.register({ name, email, password, phone });
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token for API calls
        localStorage.setItem('authToken', token);
        
        // Store user data
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          karmaPoints: 100, // Default karma points for new users
          joinedDate: new Date().toISOString().split('T')[0]
        };
        
        setUser(userData);
        localStorage.setItem('circlo_user', JSON.stringify(userData));
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('circlo_user');
      localStorage.removeItem('authToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};