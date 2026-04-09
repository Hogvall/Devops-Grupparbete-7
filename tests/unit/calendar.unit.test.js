import { describe, it, expect } from 'vitest';
import { formatDate } from '../../src/scripts/utils.js';

describe('formatDate', () => {
  it('ska formatera datum korrekt', () => {
    const rawDate = '2026-04-10T08:00:00Z';
    const formatted = formatDate(rawDate);
    expect(formatted).toContain('10'); 
  });
});