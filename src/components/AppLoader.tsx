import React from 'react';

interface AppLoaderProps {
  label?: string;
}

/** Full-area Suspense fallback: pitch-circle spinner + label. */
const AppLoader: React.FC<AppLoaderProps> = ({ label = 'Loading formation data…' }) => (
  <div
    className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 p-8"
    role="status"
    aria-live="polite"
  >
    <svg
      className="size-12 animate-spin motion-reduce:animate-none"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" stroke="var(--border)" strokeWidth="4" />
      <path
        d="M44 24a20 20 0 0 0-20-20"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
    <p className="font-stat text-sm text-ink-muted">{label}</p>
  </div>
);

export default AppLoader;
