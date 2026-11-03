import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { defaultFilters, Filters } from '../types/filters';

interface Ctx { filters: Filters; setFilters: (f: Filters) => void; search: string; setSearch: (s: string) => void; reset: () => void }
const FiltersContext = createContext<Ctx | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [search, setSearch] = useState('');
  const value = useMemo<Ctx>(() => ({ filters, setFilters, search, setSearch, reset: () => { setFilters(defaultFilters()); setSearch(''); } }), [filters, search]);
  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): Ctx {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used inside FiltersProvider');
  return ctx;
}
