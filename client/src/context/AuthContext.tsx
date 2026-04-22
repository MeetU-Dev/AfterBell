import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl } from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'teen' | 'parent' | 'admin';
  verifiedByParent?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: 'teen' | 'parent' | 'admin' }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; parentVerifyUrl?: string }>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'teen' | 'parent';
  parentEmail?: string;
  parentPhone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const u = data.user;
        const userData = {
          id: String(u.id || u._id),
          email: u.email || '',
          name: u.name || '',
          role: (u.role || 'teen') as 'teen' | 'parent' | 'admin',
          ...(u.verifiedByParent !== undefined && { verifiedByParent: !!u.verifiedByParent }),
        };
        setUser(userData);
        localStorage.setItem('afterbell_user', JSON.stringify(userData));
      }
    } catch {
      // keep existing user from localStorage
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('afterbell_token');
    const savedUser = localStorage.getItem('afterbell_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        fetchMe(token).finally(() => setIsLoading(false));
      } catch {
        localStorage.removeItem('afterbell_token');
        localStorage.removeItem('afterbell_user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: 'teen' | 'parent' | 'admin' }> => {
    try {
      setIsLoading(true);
      const res = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false };
      const token = data.token;
      if (!token) return { success: false };
      localStorage.setItem('afterbell_token', token);
      const role = (data.user?.role || 'teen') as 'teen' | 'parent';
      const userData = {
        id: String(data.user?.id || data.user?._id || ''),
        email: data.user?.email || '',
        name: data.user?.name || '',
        role,
        ...(data.user?.verifiedByParent !== undefined && { verifiedByParent: !!data.user.verifiedByParent }),
      };
      if (userData.id && userData.email && userData.name) {
        setUser(userData as User);
        localStorage.setItem('afterbell_user', JSON.stringify(userData));
      }
      setIsLoading(false);
      return { success: true, role };
    } catch {
      setIsLoading(false);
      return { success: false };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string; parentVerifyUrl?: string }> => {
    try {
      const body: Record<string, string> = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      };
      if (data.role === 'teen' && data.parentEmail) {
        body.parentEmail = data.parentEmail.trim().toLowerCase();
        if (data.parentPhone) body.parentPhone = data.parentPhone.trim();
      }
      const res = await fetch(`${getApiUrl()}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.message || 'Registration failed' };
      if (json.token) {
        localStorage.setItem('afterbell_token', json.token);
        const id = json.user?.id || json.user?._id || parseJwt(json.token)?.id;
        const userData = {
          id: String(id || ''),
          email: json.user?.email ?? body.email,
          name: json.user?.name ?? body.name,
          role: (json.user?.role || body.role) as 'teen' | 'parent',
          ...(json.user?.verifiedByParent !== undefined && { verifiedByParent: !!json.user.verifiedByParent }),
        };
        setUser(userData as User);
        localStorage.setItem('afterbell_user', JSON.stringify(userData));
      }
      return {
        success: true,
        parentVerifyUrl: json.parentVerifyUrl,
        message: json.message,
      };
    } catch (e) {
      return { success: false, message: (e as Error).message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('afterbell_token');
    localStorage.removeItem('afterbell_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

function parseJwt(token: string): { id?: string } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
