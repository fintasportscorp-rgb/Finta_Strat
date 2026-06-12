import { useSuspenseQuery } from '@tanstack/react-query';
import type { FormationData } from './types';

async function fetchFormationData(): Promise<FormationData> {
  const res = await fetch('/data/formation-battles.json');
  if (!res.ok) throw new Error('Error loading formation data');
  return res.json() as Promise<FormationData>;
}

/** The full battle dataset (~48 MB) — loaded once, cached for the session. */
export function useFormationData(): FormationData {
  const { data } = useSuspenseQuery({
    queryKey: ['formation-battles'],
    queryFn: fetchFormationData,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data;
}
