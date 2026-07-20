import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

const mockStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStore[key] || null,
  setItem: (key: string, value: string) => { mockStore[key] = value; },
  removeItem: (key: string) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); },
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

beforeEach(() => {
  mockLocalStorage.clear();
});

const TestComponent: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <div data-testid="user-name">{user?.name || 'no user'}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithProviders = (ui: React.ReactElement) =>
  render(<MemoryRouter><AuthProvider>{ui}</AuthProvider></MemoryRouter>);

describe('AuthContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('should show no user initially', async () => {
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId('user-name')).toHaveTextContent('no user');
  });

  it('should logout a user', async () => {
    mockLocalStorage.setItem('afterbell_token', 'fake');
    mockLocalStorage.setItem('afterbell_user', JSON.stringify({ id: '1', name: 'Test', email: 't@t.com', role: 'teen' }));

    renderWithProviders(<TestComponent />);

    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByTestId('user-name')).toHaveTextContent('no user');
  });
});
