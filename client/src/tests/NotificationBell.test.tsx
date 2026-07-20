import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [
      { _id: '1', title: 'Skill Completed!', message: 'You completed Cooking Basics', type: 'skill_completed', read: false, link: '/skills/1', createdAt: new Date().toISOString() },
      { _id: '2', title: 'Badge Unlocked!', message: 'You earned First Steps', type: 'badge_unlocked', read: true, link: '/badges', createdAt: new Date().toISOString() },
    ],
    unreadCount: 1,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    deleteNotification: mockDeleteNotification,
    refresh: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render bell icon with unread count badge', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show dropdown with notifications when bell is clicked', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Skill Completed!')).toBeInTheDocument();
    expect(screen.getByText('Badge Unlocked!')).toBeInTheDocument();
  });

  it('should call markAllAsRead when "Mark all read" is clicked', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Mark all read'));
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('should call deleteNotification when trash icon is clicked', () => {
    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button'));

    const deleteButtons = screen.getAllByRole('button').filter(b =>
      b.innerHTML.includes('svg')
    );
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    expect(mockDeleteNotification).toHaveBeenCalledWith('2');
  });
});
