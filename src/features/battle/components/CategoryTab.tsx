import React, { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { categoryInsights } from '../analysis';
import { categoryLabelKeys, getSource, metricDefinitions, metricPercentile } from '../metrics';
import type { CategoryKey, FormationMatchup } from '../types';
import InsightsPanel from './InsightsPanel';
import GaugePanel from './GaugePanel';
import HeatmapTable from './HeatmapTable';

interface CategoryTabProps {
  comparison: FormationMatchup[];
  category: CategoryKey;
  onOpenPercentiles: () => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ comparison, category, onOpenPercentiles }) => {
  const { t } = useI18n();
  const def = metricDefinitions[category];

  /** Metrics that at least one formation actually has percentile data for. */
  const availableMetrics = useMemo(
    () =>
      def.metrics.filter((m) =>
        comparison.some((item) => metricPercentile(getSource(item.battle, category), m) !== undefined),
      ),
    [comparison, def],
  );

  const [selectedMetric, setSelectedMetric] = useState<string>(availableMetrics[0] ?? '');

  // Reset the gauge metric when switching category tabs
  const activeMetric = availableMetrics.includes(selectedMetric)
    ? selectedMetric
    : (availableMetrics[0] ?? '');

  const insights = useMemo(() => categoryInsights(comparison, category), [comparison, category]);

  if (availableMetrics.length === 0) {
    return <p className="py-12 text-center text-ink-muted">{t('errors.noData')}</p>;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h2 className="display-caps text-lg font-bold text-ink">{t(categoryLabelKeys[category])}</h2>
      <InsightsPanel insights={insights} category={category} />
      <GaugePanel
        comparison={comparison}
        category={category}
        availableMetrics={availableMetrics}
        metric={activeMetric}
        onMetricChange={setSelectedMetric}
      />
      <HeatmapTable
        comparison={comparison}
        category={category}
        availableMetrics={availableMetrics}
        onOpenPercentiles={onOpenPercentiles}
      />
    </div>
  );
};

export default CategoryTab;
