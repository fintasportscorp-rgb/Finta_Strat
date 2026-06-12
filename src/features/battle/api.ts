import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { OpponentData } from './types';

async function fetchOpponentIndex(): Promise<string[]> {
  const res = await fetch('/data/opponent/index.json');
  if (!res.ok) throw new Error('Error loading formation index');
  const json = await res.json() as { formations: string[] };
  return json.formations;
}

async function fetchOpponentData(oppFormation: string): Promise<OpponentData> {
  const filename = oppFormation.replace(/\//g, '_');
  const res = await fetch(`/data/opponent/${filename}.json`);
  if (!res.ok) throw new Error(`Error loading data for ${oppFormation}`);
  return res.json() as Promise<OpponentData>;
}

/** Tiny index file (~500 B) — suspends briefly then renders the full UI. */
export function useOpponentIndex(): string[] {
  const { data } = useSuspenseQuery({
    queryKey: ['opponent-index'],
    queryFn: fetchOpponentIndex,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data;
}

/** Lazy-loads the per-opponent file only when a formation is selected. */
export function useOpponentData(oppFormation: string) {
  return useQuery({
    queryKey: ['opponent', oppFormation],
    queryFn: () => fetchOpponentData(oppFormation),
    enabled: !!oppFormation,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
