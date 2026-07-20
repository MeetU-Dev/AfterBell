import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../context/ToastContext';

const TestConsumer: React.FC = () => {
  const { showToast, removeToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast('success', 'Success Title', 'Success Message')}>
        Show Success
      </button>
      <button onClick={() => showToast('error', 'Error Title')}>
        Show Error
      </button>
      <button onClick={() => removeToast('manual-remove')}>
        Remove
      </button>
    </div>
  );
};

describe('ToastContext', () => {
  it('should show a success toast with title and message', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success Message')).toBeInTheDocument();
  });

  it('should show a toast without message', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error Title')).toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getAllByRole('heading').length).toBeGreaterThanOrEqual(2);
  });
});
