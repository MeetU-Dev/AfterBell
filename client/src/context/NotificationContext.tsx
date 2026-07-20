import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../api/client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  metadata: any;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data: any = await apiRequest('/api/v1/notifications?limit=20');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data: any = await apiRequest('/api/v1/notifications/unread-count');
      if (data.success) setUnreadCount(data.count);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, refresh]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    if (!user) return;
    pollRef.current = setInterval(fetchUnreadCount, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, fetchUnreadCount]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiRequest('/api/v1/notifications/mark-all-read', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiRequest(`/api/v1/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => {
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.read) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
    } catch {}
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
