import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingMetadataForm } from '@/components/meeting-capture-home/meeting-metadata-form';

describe('MeetingMetadataForm component', () => {
  it('should render all form fields', () => {
    render(<MeetingMetadataForm />);

    // Check for Meeting Title field
    expect(screen.getByLabelText(/meeting title/i)).toBeInTheDocument();

    // Check for Entity field
    expect(screen.getByLabelText(/entity/i)).toBeInTheDocument();

    // Check for Jurisdiction field
    expect(screen.getByLabelText(/jurisdiction/i)).toBeInTheDocument();

    // Check for Meeting Time field
    expect(screen.getByLabelText(/meeting time/i)).toBeInTheDocument();
  });

  it('should render meeting type buttons', () => {
    render(<MeetingMetadataForm />);

    expect(screen.getByRole('button', { name: /board meeting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /committee meeting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shareholder meeting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /special meeting/i })).toBeInTheDocument();
  });

  it('should call onSubmit when form values change', () => {
    const handleSubmit = vi.fn();
    render(<MeetingMetadataForm onSubmit={handleSubmit} />);

    // Change entity name
    const entityInput = screen.getByLabelText(/entity/i);
    fireEvent.change(entityInput, { target: { value: 'Test Corporation' } });

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'Test Corporation',
      })
    );
  });

  it('should initialize with provided initial data', () => {
    const initialData = {
      date: '2024-01-15',
      time: '10:00',
      entity: 'Initial Corp',
      jurisdiction: 'Delaware',
      meetingType: 'Committee Meeting',
      meetingTitle: 'Q1 Review',
    };

    render(<MeetingMetadataForm initialData={initialData} />);

    expect(screen.getByDisplayValue('Initial Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Delaware')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Q1 Review')).toBeInTheDocument();
  });

  it('should update meeting type when button is clicked', () => {
    const handleSubmit = vi.fn();
    render(<MeetingMetadataForm onSubmit={handleSubmit} />);

    // Click on Committee Meeting button
    const committeeMeetingBtn = screen.getByRole('button', { name: /committee meeting/i });
    fireEvent.click(committeeMeetingBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        meetingType: 'Committee Meeting',
      })
    );
  });

  it('should update time field correctly', () => {
    const handleSubmit = vi.fn();
    render(<MeetingMetadataForm onSubmit={handleSubmit} />);

    const timeInput = screen.getByLabelText(/meeting time/i);
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '14:30',
      })
    );
  });

  it('should update jurisdiction field correctly', () => {
    const handleSubmit = vi.fn();
    render(<MeetingMetadataForm onSubmit={handleSubmit} />);

    const jurisdictionInput = screen.getByLabelText(/jurisdiction/i);
    fireEvent.change(jurisdictionInput, { target: { value: 'California' } });

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        jurisdiction: 'California',
      })
    );
  });

  it('should have default meeting type as Board Meeting', () => {
    render(<MeetingMetadataForm />);

    // The Board Meeting button should have the active styling
    const boardMeetingBtn = screen.getByRole('button', { name: /^Board Meeting$/i });
    expect(boardMeetingBtn).toHaveClass('bg-white');
  });

  it('should render section title', () => {
    render(<MeetingMetadataForm />);

    expect(screen.getByText('Meeting Metadata')).toBeInTheDocument();
  });
});
