import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('header.toggleTheme')}
      aria-pressed={theme === 'dark'}
      className="flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors duration-200 hover:bg-raised hover:text-ink"
    >
      {theme === 'dark' ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
