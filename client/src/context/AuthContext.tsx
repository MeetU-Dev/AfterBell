import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl } from '../api/client';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'teen' | 'parent' | 'admin';
  verifiedByParent?: boolean;
  phoneVerified?: boolean;
}

interface OtpRequest {
  phone: string;
  countryCode: string;
  role: 'teen' | 'parent';
  intent: 'login' | 'signup';
  name?: string;
  email?: string;
  parentEmail?: string;
  parentPhone?: string;
}

interface VerifyOtpRequest {
  phone: string;
  countryCode: string;
  otp: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: 'teen' | 'parent' | 'admin' }>;
  sendOtp: (data: OtpRequest) => Promise<{ success: boolean; message?: string; devOtp?: string }>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<{ success: boolean; role?: 'teen' | 'parent' | 'admin'; message?: string; parentVerifyUrl?: string }>;
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

const parseJwt = (token: string): { id?: string } | null => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const toUser = (payload: any): User => ({
  id: String(payload?.id || payload?._id || ''),
  email: payload?.email || '',
  phone: payload?.phone || '',
  name: payload?.name || '',
  role: (payload?.role || 'teen') as 'teen' | 'parent' | 'admin',
  ...(payload?.verifiedByParent !== undefined && { verifiedByParent: !!payload.verifiedByParent }),
  ...(payload?.phoneVerified !== undefined && { phoneVerified: !!payload.phoneVerified }),
});

const postJson = async (path: string, body: Record<string, unknown>) => {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeSession = (token: string, payload: any) => {
    localStorage.setItem('afterbell_token', token);
    const userData = toUser(payload);
    if (userData.id) {
      setUser(userData);
      localStorage.setItem('afterbell_user', JSON.stringify(userData));
    }
    return userData;
  };
  const sendOtp = async (data: OtpRequest): Promise<{ success: boolean; message?: string; devOtp?: string }> => {
    try {
      setIsLoading(true);
      const { res, data: json } = await postJson('/api/v1/auth/send-otp', {
        ...data,
        phone: data.phone.trim(),
        countryCode: data.countryCode.trim(),
        name: data.name?.trim(),
        email: data.email?.trim().toLowerCase(),
        parentEmail: data.parentEmail?.trim().toLowerCase(),
        parentPhone: data.parentPhone?.trim(),
      });

      setIsLoading(false);
      return {
        success: !!res.ok,
        message: json.message,
        devOtp: json.devOtp,
      };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: (error as Error).message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (data: VerifyOtpRequest): Promise<{ success: boolean; role?: 'teen' | 'parent' | 'admin'; message?: string; parentVerifyUrl?: string }> => {
    try {
      setIsLoading(true);
      const { res, data: json } = await postJson('/api/v1/auth/verify-otp', {
        ...data,
        phone: data.phone.trim(),
        countryCode: data.countryCode.trim(),
        otp: data.otp.trim(),
      });

      if (!res.ok || !json.token) {
        setIsLoading(false);
        return { success: false, message: json.message || 'Invalid OTP' };
      }

      const storedUser = storeSession(json.token, json.user || parseJwt(json.token) || {});
      setIsLoading(false);
      return {
        success: true,
        role: storedUser.role,
        message: json.message,
        parentVerifyUrl: json.parentVerifyUrl,
      };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: (error as Error).message || 'Failed to verify OTP' };
    }
  };

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        const userData = toUser(data.user);
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false };
      const token = data.token;
      if (!token) return { success: false };
      const userData = storeSession(token, data.user || parseJwt(token) || {});
      const role = userData.role;
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
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, message: json.message || 'Registration failed' };
      if (json.token) {
        storeSession(json.token, json.user || parseJwt(json.token) || {});
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
    <AuthContext.Provider value={{ user, login, sendOtp, verifyOtp, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

