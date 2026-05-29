import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test/helpers';
import TaskCard from '../../features/task/components/TaskCard';
import { mockTask } from '../../test/helpers';

describe('TaskCard', () => {
  const mockOnClick = vi.fn();

  it('renders task title', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onClick={mockOnClick} />
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onClick={mockOnClick} />
    );
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('renders due date when present', () => {
    const taskWithDue = {
      ...mockTask,
      dueDate: '2026-05-24T00:00:00.000Z',
    };
    renderWithProviders(
      <TaskCard task={taskWithDue} onClick={mockOnClick} />
    );
    expect(screen.getByText('24/05/2026')).toBeInTheDocument();
  });

  it('does not render due date when null', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onClick={mockOnClick} />
    );
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onClick={mockOnClick} />
    );
    fireEvent.click(screen.getByText('Test Task'));
    expect(mockOnClick).toHaveBeenCalledWith(mockTask);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders high priority with correct style', () => {
    const highPriorityTask = { ...mockTask, priority: 'high' as const };
    renderWithProviders(
      <TaskCard task={highPriorityTask} onClick={mockOnClick} />
    );
    const badge = screen.getByText('high');
    expect(badge).toHaveClass('bg-red-50');
    expect(badge).toHaveClass('text-red-600');
  });

  it('renders description when present', () => {
    renderWithProviders(
      <TaskCard task={mockTask} onClick={mockOnClick} />
    );
    expect(
      screen.getByText('A test task description')
    ).toBeInTheDocument();
  });
});