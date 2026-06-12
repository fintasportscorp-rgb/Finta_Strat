import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Modal from '~components/Modal';
import RichText from '~components/RichText';
import { useI18n, type Translate } from '@/lib/i18n';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

const TOTAL_SLIDES = 7;

const ListSlide: React.FC<{ t: Translate; intro: string; items: string[]; highlight?: string }> = ({
  t,
  intro,
  items,
  highlight,
}) => (
  <>
    <RichText html={t(intro)} className="leading-relaxed text-ink-muted" />
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((key) => (
        <li key={key} className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <RichText as="span" html={t(key)} />
        </li>
      ))}
    </ul>
    {highlight && (
      <RichText
        html={t(highlight)}
        className="mt-4 rounded-md border border-accent/40 bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] p-3 text-sm leading-relaxed text-ink"
      />
    )}
  </>
);

const SlideContent: React.FC<{ slide: number; t: Translate }> = ({ slide, t }) => {
  switch (slide) {
    case 0:
      return (
        <ListSlide
          t={t}
          intro="guideModal.slide0Intro"
          items={[
            'guideModal.slide0Item1',
            'guideModal.slide0Item2',
            'guideModal.slide0Item3',
            'guideModal.slide0Item4',
          ]}
          highlight="guideModal.slide0Highlight"
        />
      );
    case 1:
      return (
        <>
          <RichText html={t('guideModal.slide1Intro')} className="leading-relaxed text-ink-muted" />
          <div className="mt-3 grid grid-cols-2 gap-3 font-stat text-sm font-semibold text-ink">
            <div className="rounded-md border border-edge bg-raised/50 p-3 text-center">
              {t('guideModal.slide1Label1')}
            </div>
            <div className="rounded-md border border-accent bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] p-3 text-center">
              {t('guideModal.slide1Label2')}
            </div>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {['guideModal.slide1Stat1', 'guideModal.slide1Stat2', 'guideModal.slide1Stat3'].map(
              (key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-win" aria-hidden="true" />
                  {t(key)}
                </li>
              ),
            )}
          </ul>
        </>
      );
    case 2:
      return (
        <>
          <RichText html={t('guideModal.slide2Intro')} className="leading-relaxed text-ink-muted" />
          <div className="mt-3 grid grid-cols-2 gap-3 font-stat text-sm font-semibold text-ink">
            <div className="rounded-md border border-edge bg-raised/50 p-3 text-center">
              {t('guideModal.slide2Label1')}
            </div>
            <div className="rounded-md border border-accent bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] p-3 text-center">
              {t('guideModal.slide2Label2')}
            </div>
          </div>
          <p className="mt-4 text-sm text-ink">
            <strong className="text-accent">{t('guideModal.slide2Insight')}</strong>{' '}
            {t('guideModal.slide2InsightText')}
          </p>
        </>
      );
    case 3:
      return (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-md border border-edge border-l-4 border-l-win bg-raised/50 p-3">
              <h4 className="font-display font-bold text-win">
                {t('guideModal.slide3OverloadTitle')}
              </h4>
              <p className="mt-1 text-sm text-ink-muted">{t('guideModal.slide3OverloadDesc')}</p>
              <RichText
                html={t('guideModal.slide3OverloadExample')}
                className="mt-2 text-xs leading-relaxed text-ink"
              />
            </section>
            <section className="rounded-md border border-edge border-l-4 border-l-loss bg-raised/50 p-3">
              <h4 className="font-display font-bold text-loss">
                {t('guideModal.slide3UnderloadTitle')}
              </h4>
              <p className="mt-1 text-sm text-ink-muted">{t('guideModal.slide3UnderloadDesc')}</p>
              <RichText
                html={t('guideModal.slide3UnderloadExample')}
                className="mt-2 text-xs leading-relaxed text-ink"
              />
            </section>
          </div>
          <RichText
            html={t('guideModal.slide3Highlight')}
            className="mt-4 rounded-md border border-accent/40 bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] p-3 text-sm leading-relaxed text-ink"
          />
        </>
      );
    case 4:
      return (
        <>
          <RichText html={t('guideModal.slide4Intro')} className="leading-relaxed text-ink-muted" />
          <dl className="mt-3 flex flex-col gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex flex-col gap-0.5 rounded-md border border-edge bg-raised/50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="font-stat text-sm font-semibold text-accent">
                  {t(`guideModal.slide4Clue${n}Stat`)}
                </dt>
                <dd className="text-sm text-ink-muted">{t(`guideModal.slide4Clue${n}Meaning`)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-ink-muted">
            <strong className="text-draw">{t('guideModal.slide4Tip')}</strong>{' '}
            {t('guideModal.slide4TipText')}
          </p>
        </>
      );
    case 5:
      return (
        <ol className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent font-stat text-sm font-bold text-on-accent">
                {n}
              </span>
              <div>
                <h4 className="font-display font-semibold text-ink">
                  {t(`guideModal.slide5Step${n}Title`)}
                </h4>
                <p className="text-sm text-ink-muted">{t(`guideModal.slide5Step${n}Desc`)}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    default:
      return (
        <>
          <ul className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <RichText as="span" html={t(`guideModal.slide6Item${n}`)} />
              </li>
            ))}
          </ul>
          <RichText
            html={t('guideModal.slide6FinalNote')}
            className="mt-4 rounded-md border border-accent/40 bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] p-3 text-center text-sm leading-relaxed text-ink"
          />
        </>
      );
  }
};

const GuideModal: React.FC<GuideModalProps> = ({ open, onClose }) => {
  const { t } = useI18n();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (open) setSlide(0);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={t('guideModal.title')} wide>
      <h3 className="display-caps text-base font-bold text-accent">
        {t(`guideModal.slide${slide}Title`)}
      </h3>
      <div className="mt-3 min-h-64">
        <SlideContent slide={slide} t={t} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-edge pt-4">
        <button
          type="button"
          onClick={() => setSlide((s) => Math.max(0, s - 1))}
          disabled={slide === 0}
          className="flex min-h-11 items-center gap-1.5 rounded-md border border-edge px-4 font-stat text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted transition-colors duration-150 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('guideModal.prevBtn')}
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label={t('guideModal.title')}>
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={slide === i}
              aria-label={`${i + 1} / ${TOTAL_SLIDES}`}
              onClick={() => setSlide(i)}
              className={`size-2.5 rounded-full transition-colors duration-150 ${
                slide === i ? 'bg-accent' : 'bg-edge-strong hover:bg-accent/50'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSlide((s) => Math.min(TOTAL_SLIDES - 1, s + 1))}
          disabled={slide === TOTAL_SLIDES - 1}
          className="flex min-h-11 items-center gap-1.5 rounded-md border border-edge px-4 font-stat text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted transition-colors duration-150 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('guideModal.nextBtn')}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  );
};

export default GuideModal;
