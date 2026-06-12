import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const ScrollTopButton: React.FC = () => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('scrollTop.title')}
      className="rise-in fixed bottom-20 right-4 z-40 flex size-12 items-center justify-center rounded-full border border-edge bg-raised text-ink shadow-raised transition-colors duration-200 hover:border-accent hover:text-accent lg:bottom-6 lg:right-6"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
};

export default ScrollTopButton;
