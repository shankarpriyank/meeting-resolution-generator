import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingCard, type Meeting } from '@/components/meeting-capture-home/meetings/cards';

const mockMeeting: Meeting = {
  id: 'meeting-123',
  title: 'Q4 2024 Board Meeting',
  status: 'drafting-complete',
  date: 'December 15, 2024',
  time: '10:00 AM',
  jurisdiction: 'Delaware',
  entity: 'Acme Corporation',
  duration: '45 minutes',
  resolutions: {
    count: 3,
    status: 'Detected',
  },
  signatures: {
    current: 2,
    total: 5,
  },
  actionButton: {
    text: 'Review Draft',
    variant: 'primary',
  },
};

describe('MeetingCard component', () => {
  it('should render meeting title', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('Q4 2024 Board Meeting')).toBeInTheDocument();
  });

  it('should render meeting date', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('December 15, 2024')).toBeInTheDocument();
  });

  it('should render meeting time', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('should render jurisdiction badge', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('Delaware')).toBeInTheDocument();
  });

  it('should render entity badge', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
  });

  it('should render meeting duration', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('45 minutes')).toBeInTheDocument();
  });

  it('should render status chip for drafting-complete', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText('Drafting Complete')).toBeInTheDocument();
  });

  it('should render status chip for signed-archived', () => {
    const archivedMeeting = {
      ...mockMeeting,
      status: 'signed-archived' as const,
    };

    render(<MeetingCard meeting={archivedMeeting} />);

    expect(screen.getByText('Signed & Archived')).toBeInTheDocument();
  });

  it('should render action button with correct text', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByRole('button', { name: /review draft/i })).toBeInTheDocument();
  });

  it('should call onActionClick with meeting id when button is clicked', () => {
    const handleActionClick = vi.fn();
    render(<MeetingCard meeting={mockMeeting} onActionClick={handleActionClick} />);

    const actionButton = screen.getByRole('button', { name: /review draft/i });
    fireEvent.click(actionButton);

    expect(handleActionClick).toHaveBeenCalledTimes(1);
    expect(handleActionClick).toHaveBeenCalledWith('meeting-123');
  });

  it('should render primary variant button with correct styling', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    const button = screen.getByRole('button', { name: /review draft/i });
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-[#1A1A1A]');
  });

  it('should render secondary variant button with correct styling', () => {
    const secondaryMeeting = {
      ...mockMeeting,
      actionButton: {
        text: 'View Archive',
        variant: 'secondary' as const,
      },
    };

    render(<MeetingCard meeting={secondaryMeeting} />);

    const button = screen.getByRole('button', { name: /view archive/i });
    expect(button).toHaveClass('bg-[#2A2A2A]');
  });

  it('should not throw when onActionClick is not provided', () => {
    render(<MeetingCard meeting={mockMeeting} />);

    const actionButton = screen.getByRole('button', { name: /review draft/i });

    // Should not throw
    expect(() => fireEvent.click(actionButton)).not.toThrow();
  });
});
