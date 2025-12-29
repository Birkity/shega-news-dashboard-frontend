/**
 * Utility Functions Tests
 * Tests for utility functions in lib/utils.ts
 */

import { cn } from '@/lib/utils';

describe('cn (classnames merge utility)', () => {
  it('merges single class', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('handles falsy conditional classes', () => {
    const isActive = false;
    expect(cn('base', isActive && 'active')).toBe('base');
  });

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('handles null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('handles empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('handles array of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('merges conflicting Tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-white', 'bg-black')).toBe('bg-black');
  });

  it('preserves non-conflicting Tailwind classes', () => {
    expect(cn('p-4', 'm-2')).toBe('p-4 m-2');
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('handles complex combinations', () => {
    const result = cn(
      'base-class',
      true && 'conditional-true',
      false && 'conditional-false',
      undefined,
      null,
      ['array-class-1', 'array-class-2'],
      { 'object-true': true, 'object-false': false }
    );

    expect(result).toContain('base-class');
    expect(result).toContain('conditional-true');
    expect(result).not.toContain('conditional-false');
    expect(result).toContain('array-class-1');
    expect(result).toContain('array-class-2');
    expect(result).toContain('object-true');
    expect(result).not.toContain('object-false');
  });

  it('handles responsive Tailwind modifiers', () => {
    expect(cn('md:p-4', 'lg:p-6')).toBe('md:p-4 lg:p-6');
    expect(cn('md:p-4', 'md:p-6')).toBe('md:p-6');
  });

  it('handles hover state modifiers', () => {
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
    expect(cn('hover:bg-red-500', 'focus:bg-blue-500')).toBe('hover:bg-red-500 focus:bg-blue-500');
  });
});
