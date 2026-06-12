export const TIERS = ['Elite_Tier', 'Strong_Tier', 'Mid_Tier', 'Struggling_Tier'] as const;

export type Tier = (typeof TIERS)[number];

export interface BattleSummary {
  team_formation: string;
  opponent_formation: string;
  formation_tier: string;
  opponent_tier: string;
  total_matches: number;
  wins: number;
  draws: number;
  losses: number;
  win_rate: number;
  draw_rate: number;
  loss_rate: number;
}

export interface BattleContext {
  avg_team_rank: number;
  avg_opponent_rank: number;
  avg_opponent_strength_percentile: number;
  unique_teams: number;
  unique_opponents: number;
  competitions: string;
}

/** Metric values keyed by stat name; `<stat>_formation_percentile` variants included. */
export type MetricSource = Record<string, number | undefined>;

export interface Battle {
  battle_summary: BattleSummary;
  context: BattleContext;
  shooting?: MetricSource;
  passing?: MetricSource;
  possession?: MetricSource;
  defensive?: MetricSource;
  goalkeeping?: MetricSource;
  creation?: MetricSource;
  pass_types?: MetricSource;
  miscellaneous?: MetricSource;
  other_stats?: MetricSource;
}

/** data[yourFormation][yourTier][opponentFormation][opponentTier] */
export type FormationData = Record<
  string,
  Partial<Record<Tier, Record<string, Partial<Record<Tier, Battle>>>>>
>;

export interface FormationMatchup {
  formation: string;
  battle: Battle;
}

export type SortMode = 'winRate' | 'matches' | 'name';

export type CategoryKey =
  | 'summary'
  | 'shooting'
  | 'passing'
  | 'possession'
  | 'defensive'
  | 'goalkeeping'
  | 'creation'
  | 'pass_types'
  | 'miscellaneous';

export type ParentTabKey = 'overview' | 'attack' | 'buildup' | 'defense';
