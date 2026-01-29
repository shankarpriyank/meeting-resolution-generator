import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusChip } from '@/components/shared/status-chip';

describe('StatusChip component', () => {
  it('should render with success status color', () => {
    render(<StatusChip text="Success Status" statusColor="success" />);

    const chip = screen.getByText('Success Status');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('text-[#22C55E]');
  });

  it('should render with info status color', () => {
    render(<StatusChip text="Info Status" statusColor="info" />);

    const chip = screen.getByText('Info Status');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('text-[#3B82F6]');
  });

  it('should render with warning status color', () => {
    render(<StatusChip text="Warning Status" statusColor="warning" />);

    const chip = screen.getByText('Warning Status');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('text-[#fbbf24]');
  });

  it('should render with error status color', () => {
    render(<StatusChip text="Error Status" statusColor="error" />);

    const chip = screen.getByText('Error Status');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('text-[#f87171]');
  });

  it('should apply custom className', () => {
    render(
      <StatusChip
        text="Custom Status"
        statusColor="success"
        className="custom-class"
      />
    );

    const chipContainer = screen.getByText('Custom Status').parentElement;
    expect(chipContainer).toHaveClass('custom-class');
  });

  it('should render with correct background color for success', () => {
    render(<StatusChip text="Success" statusColor="success" />);

    const chipContainer = screen.getByText('Success').parentElement;
    expect(chipContainer).toHaveClass('bg-[#22C55E1A]');
  });

  it('should render with correct background color for info', () => {
    render(<StatusChip text="Info" statusColor="info" />);

    const chipContainer = screen.getByText('Info').parentElement;
    expect(chipContainer).toHaveClass('bg-[#3B82F61A]');
  });

  it('should render with correct background color for warning', () => {
    render(<StatusChip text="Warning" statusColor="warning" />);

    const chipContainer = screen.getByText('Warning').parentElement;
    expect(chipContainer).toHaveClass('bg-[#5c4a1a]');
  });

  it('should render with correct background color for error', () => {
    render(<StatusChip text="Error" statusColor="error" />);

    const chipContainer = screen.getByText('Error').parentElement;
    expect(chipContainer).toHaveClass('bg-[#5c1a1a]');
  });

  it('should render a colored dot indicator', () => {
    const { container } = render(<StatusChip text="Status" statusColor="success" />);

    // Find the dot element (it's a sibling to the text span)
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('bg-[#22C55E]');
  });

  it('should render the text with correct styling', () => {
    render(<StatusChip text="Styled Text" statusColor="info" />);

    const text = screen.getByText('Styled Text');
    expect(text).toHaveClass('text-sm');
    expect(text).toHaveClass('font-medium');
  });
});
