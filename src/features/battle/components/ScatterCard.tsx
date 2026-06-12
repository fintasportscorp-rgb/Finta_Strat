import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import { usePrefersReducedMotion, useTheme } from '@/lib/theme';
import { seriesColor } from '../metrics';
import type { FormationMatchup } from '../types';

interface ScatterCardProps {
  comparison: FormationMatchup[];
}

interface ScatterPoint {
  x: number;
  y: number;
  formation: string;
}

/** Win rate vs sample size — reliability/performance trade-off. */
const ScatterCard: React.FC<ScatterCardProps> = ({ comparison }) => {
  const { t } = useI18n();
  const reducedMotion = usePrefersReducedMotion();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const axisTextColor = isDark ? '#93a8c7' : '#44587a';
  const labelColor = isDark ? '#e8f0fc' : '#0e1b2e';

  const points: ScatterPoint[] = useMemo(
    () =>
      comparison.map((m) => ({
        x: m.battle.battle_summary.total_matches,
        y: m.battle.battle_summary.win_rate,
        formation: m.formation,
      })),
    [comparison],
  );

  const [yMin, yMax] = useMemo(() => {
    const rates = points.map((p) => p.y);
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    return [
      Math.max(0, Math.floor((min * 0.7) / 5) * 5),
      Math.min(100, Math.ceil((max * 1.3) / 5) * 5),
    ];
  }, [points]);

  const axisStyle = {
    fill: axisTextColor,
    fontFamily: 'var(--font-stat)',
    fontSize: 12,
  };

  return (
    <section className="rounded-lg border border-edge bg-surface p-4 shadow-card md:p-5">
      <h3 className="display-caps text-sm font-bold text-ink">
        {t('setup.winRate')} × {t('setup.sampleSize')}
      </h3>
      <div className="mt-3 h-[300px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 24, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="2 2" />
            <XAxis
              type="number"
              dataKey="x"
              name={t('setup.sampleSize')}
              tick={axisStyle}
              stroke="var(--chart-grid)"
              label={{
                value: t('setup.sampleSize'),
                position: 'insideBottom',
                offset: -2,
                ...axisStyle,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={t('setup.winRate')}
              domain={[yMin, yMax]}
              tick={axisStyle}
              stroke="var(--chart-grid)"
              width={44}
              label={{
                value: `${t('setup.winRate')} %`,
                angle: -90,
                position: 'insideLeft',
                ...axisStyle,
              }}
            />
            {/* Confidence threshold + coin-flip reference lines */}
            <ReferenceLine x={30} stroke="var(--draw)" strokeDasharray="4 4" label={{ value: 'n=30', position: 'top', ...axisStyle, fill: 'var(--draw)' }} />
            <ReferenceLine y={50} stroke="var(--chart-axis-text)" strokeDasharray="4 4" />
            <RechartsTooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'var(--chart-axis-text)' }}
              formatter={(value: number, name: string) =>
                name === t('setup.winRate') ? [`${value.toFixed(1)}%`, name] : [value, name]
              }
              labelFormatter={() => ''}
              contentStyle={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-stat)',
                fontSize: 12,
              }}
            />
            <Scatter data={points} isAnimationActive={!reducedMotion}>
              <LabelList
                dataKey="formation"
                position="top"
                offset={10}
                style={{ ...axisStyle, fill: labelColor, fontWeight: 600 }}
              />
              {points.map((point, i) => (
                <Cell
                  key={point.formation}
                  fill={seriesColor(i)}
                  stroke="var(--surface)"
                  strokeWidth={1.5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default ScatterCard;
