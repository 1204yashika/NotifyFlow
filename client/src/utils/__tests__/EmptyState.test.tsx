import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import EmptyState from '../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title and icon', () => {
    renderWithProviders(
      <EmptyState icon="📋" title="No tasks yet" />
    );
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    renderWithProviders(
      <EmptyState
        title="No tasks"
        description="Create your first task"
      />
    );
    expect(screen.getByText('Create your first task')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    renderWithProviders(<EmptyState title="No tasks" />);
    expect(screen.queryByText('Create your first task')).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const mockAction = vi.fn();
    renderWithProviders(
      <EmptyState
        title="No tasks"
        action={{ label: '+ New task', onClick: mockAction }}
      />
    );
    expect(screen.getByRole('button', { name: '+ New task' })).toBeInTheDocument();
  });

  it('calls action onClick when button clicked', () => {
    const mockAction = vi.fn();
    renderWithProviders(
      <EmptyState
        title="No tasks"
        action={{ label: '+ New task', onClick: mockAction }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '+ New task' }));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('does not render button when no action provided', () => {
    renderWithProviders(<EmptyState title="No tasks" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses default icon when not provided', () => {
    renderWithProviders(<EmptyState title="No tasks" />);
    expect(screen.getByText('📭')).toBeInTheDocument();
  });
});