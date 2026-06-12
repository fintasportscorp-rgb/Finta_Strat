import React from 'react';
import { Lightbulb, Target, TriangleAlert } from 'lucide-react';
import Modal from '~components/Modal';
import RichText from '~components/RichText';
import { useI18n } from '@/lib/i18n';

interface PercentileModalProps {
  open: boolean;
  onClose: () => void;
}

const EXAMPLE_ROWS = [
  { formation: '3-4-3', value: 314, percentile: '63rd', highlight: false },
  { formation: '4-2-3-1', value: 319, percentile: '63rd', highlight: false },
  { formation: '3-5-2', value: 304, percentile: '68th', highlight: true },
];

const PercentileModal: React.FC<PercentileModalProps> = ({ open, onClose }) => {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onClose} title={t('percentileModal.title')}>
      <div className="flex flex-col gap-4 text-sm">
        <section className="flex gap-3 rounded-lg border border-accent/40 bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] p-4">
          <Lightbulb className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <h3 className="font-display font-bold text-ink">{t('percentileModal.keyInsight')}</h3>
            <RichText html={t('percentileModal.keyInsightText')} className="mt-1 leading-relaxed text-ink-muted" />
          </div>
        </section>

        <section className="flex gap-3 rounded-lg border border-edge bg-raised/50 p-4">
          <TriangleAlert className="size-5 shrink-0 text-draw" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-ink">
              {t('percentileModal.whyHigherLower')}
            </h3>
            <table className="mt-3 w-full border-collapse text-center font-stat">
              <thead>
                <tr className="border-b border-edge text-xs uppercase tracking-[0.05em] text-ink-muted">
                  <th className="p-2 font-semibold">{t('percentileModal.tableFormation')}</th>
                  <th className="p-2 font-semibold">{t('percentileModal.tableValue')}</th>
                  <th className="p-2 font-semibold">{t('percentileModal.tablePercentile')}</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLE_ROWS.map((row) => (
                  <tr
                    key={row.formation}
                    className={`border-b border-edge last:border-0 ${
                      row.highlight ? 'bg-[color-mix(in_oklch,var(--win)_12%,transparent)] font-bold text-win' : 'text-ink'
                    }`}
                  >
                    <td className="p-2">{row.formation}</td>
                    <td className="p-2">{row.value}</td>
                    <td className="p-2">{row.percentile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <RichText
              html={t('percentileModal.exampleNote')}
              className="mt-2 rounded-md bg-[color-mix(in_oklch,var(--draw)_12%,transparent)] p-2.5 text-xs leading-relaxed text-draw"
            />
          </div>
        </section>

        <section className="flex gap-3 rounded-lg border border-edge bg-raised/50 p-4">
          <Target className="size-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <h3 className="font-display font-bold text-ink">{t('percentileModal.whatTellsYou')}</h3>
            <p className="mt-2 text-ink-muted">
              <strong className="text-ink">{t('percentileModal.highPercentile')}</strong> ={' '}
              <span className="font-semibold text-win">{t('percentileModal.overperforming')}</span>
            </p>
            <p className="mt-1 text-ink-muted">
              <strong className="text-ink">{t('percentileModal.lowPercentile')}</strong> ={' '}
              <span className="font-semibold text-loss">{t('percentileModal.underperforming')}</span>
            </p>
            <p className="mt-2 text-xs text-ink-muted">{t('percentileModal.tacticalNote')}</p>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default PercentileModal;
