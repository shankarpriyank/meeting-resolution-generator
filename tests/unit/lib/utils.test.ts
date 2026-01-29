import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base-class', isActive && 'active', isDisabled && 'disabled');
    expect(result).toBe('base-class active');
  });

  it('should merge conflicting Tailwind classes correctly', () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class-1', 'class-2'], 'class-3');
    expect(result).toBe('class-1 class-2 class-3');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('valid-class', undefined, null, 'another-class');
    expect(result).toBe('valid-class another-class');
  });

  it('should handle object syntax', () => {
    const result = cn({
      'base-class': true,
      'active-class': true,
      'disabled-class': false,
    });
    expect(result).toBe('base-class active-class');
  });

  it('should merge padding classes correctly', () => {
    const result = cn('p-4', 'px-2');
    expect(result).toBe('p-4 px-2');
  });

  it('should merge margin classes correctly', () => {
    const result = cn('m-4', 'm-2');
    expect(result).toBe('m-2');
  });
});
