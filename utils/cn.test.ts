// FIX: This file contained placeholder text causing a syntax error. Replaced with a valid test suite for the cn utility.
import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('should concatenate strings with spaces', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should ignore falsy values', () => {
    expect(cn('class1', null, 'class2', undefined, false, 0, '')).toBe('class1 class2');
  });

  it('should handle objects with boolean values', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe('class1 class3');
  });

  it('should handle arrays of class names', () => {
    expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2');
  });

  it('should handle a mix of types', () => {
    expect(cn('base', { class1: true }, ['class2', null, { class3: true }])).toBe('base class1 class2 class3');
  });
});
