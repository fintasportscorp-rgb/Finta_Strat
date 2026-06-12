import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import ErrorBoundary from '~components/ErrorBoundary';
import AppLoader from '~components/AppLoader';

const StratApp = React.lazy(() => import('~features/battle/StratApp'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ErrorBoundary>
        <Suspense fallback={<AppLoader />}>
          <I18nProvider>
            <StratApp />
          </I18nProvider>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
