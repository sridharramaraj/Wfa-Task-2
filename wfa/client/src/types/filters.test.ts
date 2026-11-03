import { describe, expect, it } from 'vitest';
import { ALL, defaultFilters, toParams, validateFilters } from './filters';

describe('filters', () => {
  it('accepts the default range', () => expect(validateFilters(defaultFilters())).toBeNull());
  it('rejects an inverted range', () => expect(validateFilters({ from: '2026-03-02', to: '2026-03-01' })).not.toBeNull());
  it('rejects ranges over a year', () => expect(validateFilters({ from: '2024-01-01', to: '2026-01-01' })).not.toBeNull());
  it('omits "All" from API params', () => {
    const p = toParams({ ...defaultFilters(), department: ALL, location: 'Chennai' });
    expect(p.department).toBeUndefined();
    expect(p.location).toBe('Chennai');
  });
});
