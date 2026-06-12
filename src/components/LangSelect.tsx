import React from 'react';
import { LANGUAGES, useI18n } from '@/lib/i18n';

const LangSelect: React.FC = () => {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="relative">
      <label htmlFor="lang-select" className="sr-only">
        {t('header.language')}
      </label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="min-h-11 appearance-none rounded-md border border-transparent bg-transparent px-2.5 font-stat text-sm font-semibold uppercase text-ink-muted transition-colors duration-200 hover:bg-raised hover:text-ink"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LangSelect;
