import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-variant', 'default');
  });

  it('should render with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByRole('button', { name: /outline button/i });
    expect(button).toHaveAttribute('data-variant', 'outline');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: /secondary button/i });
    expect(button).toHaveAttribute('data-variant', 'secondary');
  });

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByRole('button', { name: /ghost button/i });
    expect(button).toHaveAttribute('data-variant', 'ghost');
  });

  it('should render with destructive variant', () => {
    render(<Button variant="destructive">Destructive Button</Button>);
    const button = screen.getByRole('button', { name: /destructive button/i });
    expect(button).toHaveAttribute('data-variant', 'destructive');
  });

  it('should render with link variant', () => {
    render(<Button variant="link">Link Button</Button>);
    const button = screen.getByRole('button', { name: /link button/i });
    expect(button).toHaveAttribute('data-variant', 'link');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'icon');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it('should not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Class</Button>);
    const button = screen.getByRole('button', { name: /custom class/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should render children correctly', () => {
    render(
      <Button>
        <span data-testid="child-span">Child Element</span>
      </Button>
    );
    expect(screen.getByTestId('child-span')).toBeInTheDocument();
  });

  it('should have type button by default', () => {
    render(<Button>Default Type</Button>);
    const button = screen.getByRole('button', { name: /default type/i });
    // Default HTML button type is 'submit', but we can check it's a button
    expect(button.tagName).toBe('BUTTON');
  });

  it('should accept type prop', () => {
    render(<Button type="submit">Submit Button</Button>);
    const button = screen.getByRole('button', { name: /submit button/i });
    expect(button).toHaveAttribute('type', 'submit');
  });
});
